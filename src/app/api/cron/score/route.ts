// POST /api/cron/score — called by Vercel Cron every 30 min during the tournament.
// 1. Fetch all WC2026 match results from football-data.org
// 2. Write finished matches to the `results` table
// 3. Re-score every bracket and update points in the `brackets` table

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchAllMatches, processGroupStandings, processKnockoutResults } from '@/lib/data/footballData';
import { scoreBracket } from '@/lib/scoring';
import type { Bracket, GroupId } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: Request) {
  // Verify cron secret so only Vercel (or us) can trigger it
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // 1. Fetch results from football-data.org
    const matches = await fetchAllMatches();
    const { standings, thirdPlaceQualifiers } = processGroupStandings(matches);
    const knockoutWinners = processKnockoutResults(matches);

    // 2. Write finished group matches to results table
    const finishedMatches = matches.filter(m => m.status === 'FINISHED');
    if (finishedMatches.length > 0) {
      const rows = finishedMatches.map(m => ({
        match_id: `FD:${m.id}`,
        home_score: m.score.fullTime.home ?? 0,
        away_score: m.score.fullTime.away ?? 0,
        winner: m.score.winner === 'HOME_TEAM'
          ? m.homeTeam.tla
          : m.score.winner === 'AWAY_TEAM'
            ? m.awayTeam.tla
            : null,
        played_at: new Date().toISOString(),
      }));

      await (supabase as any)
        .from('results')
        .upsert(rows, { onConflict: 'match_id' });
    }

    // 3. Re-score all brackets
    const { data: brackets } = await (supabase as any)
      .from('brackets')
      .select('id, user_id, bracket_data');

    if (!brackets?.length) {
      return NextResponse.json({ ok: true, scored: 0, matches: finishedMatches.length });
    }

    const updates = brackets.map((row: any) => {
      const bracket: Bracket = row.bracket_data;
      if (!bracket?.groupPredictions) return null;

      const { points } = scoreBracket(
        bracket,
        standings as Partial<Record<GroupId, [string, string, string, string]>>,
        thirdPlaceQualifiers,
        knockoutWinners,
      );

      return { id: row.id, points };
    }).filter(Boolean);

    if (updates.length > 0) {
      await Promise.all(
        updates.map((u: any) =>
          (supabase as any)
            .from('brackets')
            .update({ points: u.points })
            .eq('id', u.id)
        )
      );
    }

    return NextResponse.json({
      ok: true,
      scored: updates.length,
      matches: finishedMatches.length,
      groupsComplete: Object.keys(standings).length,
      thirdPlaceQualifiers,
    });

  } catch (err: any) {
    console.error('[cron/score]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
