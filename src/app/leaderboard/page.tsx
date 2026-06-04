'use client';
import { useState, useEffect, useCallback } from 'react';
import { Trophy, Search, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Entry = {
  user_id: string;
  display_name: string;
  points: number | null;
  spice_score: number | null;
  persona: string | null;
  champion: string | null;
};

const supabase = createClient();

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setMyUserId(user.id);
    });
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    const { data: brackets } = await (supabase as any)
      .from('brackets')
      .select('user_id, points, spice_score, persona, champion')
      .eq('is_public', true)
      .order('points', { ascending: false, nullsLast: true });

    if (!brackets?.length) { setEntries([]); setLoading(false); return; }

    const userIds = brackets.map((b: any) => b.user_id);
    const { data: profiles } = await (supabase as any)
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);

    const profileMap: Record<string, string> = {};
    profiles?.forEach((p: any) => { profileMap[p.id] = p.display_name; });

    const result: Entry[] = brackets.map((b: any) => ({
      user_id: b.user_id,
      display_name: profileMap[b.user_id] ?? 'Anonymous',
      points: b.points,
      spice_score: b.spice_score,
      persona: b.persona,
      champion: b.champion,
    }));

    setEntries(result);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  useEffect(() => {
    const channel = supabase
      .channel('global-leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'brackets' }, () => {
        fetchLeaderboard();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchLeaderboard]);

  const filtered = entries.filter(e =>
    e.display_name.toLowerCase().includes(search.toLowerCase()) ||
    (e.persona ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filtered.slice(0, 3);
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const myRank = entries.findIndex(e => e.user_id === myUserId) + 1;
  const myEntry = entries.find(e => e.user_id === myUserId);

  const rankColor = (i: number) =>
    i === 0 ? '#fbbf24' : i === 1 ? '#c4bdec' : i === 2 ? '#f472b6' : '#6f6796';

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumRanks = [2, 1, 3];
  const podiumMedals = ['🥈', '🥇', '🥉'];
  const podiumHeights = ['h-20', 'h-28', 'h-16'];

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 border"
            style={{ background: 'rgba(251,191,36,0.10)', borderColor: 'rgba(251,191,36,0.25)', color: '#fbbf24' }}
          >
            <Trophy className="w-3.5 h-3.5" /> Global Rankings
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl mb-2" style={{ color: '#f5f3ff' }}>
            Leaderboard
          </h1>
          <p className="text-sm" style={{ color: '#c4bdec' }}>
            Updates live as matches are played
          </p>
        </div>

        {myEntry && myRank > 0 && (
          <div
            className="rounded-2xl border px-5 py-4 mb-8 flex items-center justify-between"
            style={{ background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.30)' }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#a78bfa' }}>Your rank</p>
              <p className="font-display font-extrabold text-2xl" style={{ color: '#f5f3ff' }}>#{myRank}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#c4bdec' }}>Points</p>
              <p className="font-display font-extrabold text-2xl" style={{ color: '#f5f3ff' }}>
                {myEntry.points ?? '—'}
              </p>
            </div>
            {myEntry.persona && (
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#c4bdec' }}>Persona</p>
                <p className="text-sm font-bold" style={{ color: '#f5f3ff' }}>{myEntry.persona}</p>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8b5cf6' }} />
          </div>
        ) : entries.length === 0 ? (
          <div
            className="rounded-3xl border p-16 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="text-5xl mb-4">🏆</div>
            <p className="font-display font-extrabold text-xl mb-2" style={{ color: '#f5f3ff' }}>
              No brackets yet
            </p>
            <p className="text-sm" style={{ color: '#c4bdec' }}>
              Be the first to submit your predictions — the leaderboard fills up once the tournament starts.
            </p>
          </div>
        ) : (
          <>
            {filtered.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-10">
                {podiumOrder.map((entry, i) => (
                  <div key={entry.user_id} className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-display font-extrabold text-lg mb-1 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.4),rgba(59,130,246,0.4))', color: rankColor(podiumRanks[i] - 1) }}
                    >
                      {entry.display_name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-xs font-bold text-center truncate w-full px-1" style={{ color: '#f5f3ff' }}>
                      {entry.display_name.split(' ')[0]}
                    </p>
                    <p className="text-lg mb-1">{podiumMedals[i]}</p>
                    <div
                      className={`w-full rounded-t-xl flex flex-col items-center justify-end pb-3 ${podiumHeights[i]}`}
                      style={{ background: i === 1 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: i === 1 ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)' }}
                    >
                      <span className="font-display font-extrabold text-sm" style={{ color: '#f5f3ff' }}>
                        {entry.points ?? '—'}
                      </span>
                      <span className="text-xs" style={{ color: '#c4bdec' }}>pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6f6796' }} />
              <input
                type="text"
                placeholder="Search by name or persona..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.10)',
                  color: '#f5f3ff',
                }}
              />
            </div>

            <div
              className="rounded-3xl border overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="grid grid-cols-[44px_1fr_80px_70px] gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest border-b"
                style={{ color: '#6f6796', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span>#</span>
                <span>Player</span>
                <span className="text-right hidden sm:block">Persona</span>
                <span className="text-right">Points</span>
              </div>

              {paginated.map((entry) => {
                const globalRank = filtered.indexOf(entry) + 1;
                const isMe = entry.user_id === myUserId;
                return (
                  <div
                    key={entry.user_id}
                    className="grid grid-cols-[44px_1fr_80px_70px] gap-2 items-center px-5 py-3.5 border-b transition-all"
                    style={{
                      borderColor: 'rgba(255,255,255,0.05)',
                      background: isMe ? 'rgba(139,92,246,0.08)' : 'transparent',
                    }}
                  >
                    <span
                      className="font-display font-extrabold text-sm"
                      style={{ color: rankColor(globalRank - 1) }}
                    >
                      {globalRank <= 3
                        ? ['🥇', '🥈', '🥉'][globalRank - 1]
                        : `#${globalRank}`}
                    </span>

                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-display font-extrabold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.35),rgba(59,130,246,0.35))', color: '#a78bfa' }}
                      >
                        {entry.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#f5f3ff' }}>
                          {entry.display_name}
                          {isMe && <span className="ml-2 text-xs font-normal" style={{ color: '#8b5cf6' }}>you</span>}
                        </p>
                        {entry.champion && (
                          <p className="text-xs truncate" style={{ color: '#6f6796' }}>
                            🏆 {entry.champion}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-right hidden sm:block truncate" style={{ color: '#c4bdec' }}>
                      {entry.persona ?? '—'}
                    </span>

                    <span className="font-display font-extrabold text-sm text-right tabular-nums" style={{ color: '#f5f3ff' }}>
                      {entry.points ?? '—'}
                    </span>
                  </div>
                );
              })}

              {paginated.length < filtered.length && (
                <div className="p-4 text-center">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="text-sm font-bold transition-opacity hover:opacity-70"
                    style={{ color: '#8b5cf6' }}
                  >
                    Load more ({filtered.length - paginated.length} remaining)
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
