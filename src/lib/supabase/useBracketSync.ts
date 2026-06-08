'use client';
import { useEffect, useRef } from 'react';
import { createClient } from './client';
import { usePredictionStore } from '@/lib/store';
import { computeSpice } from '@/lib/spice';

const DEBOUNCE_MS = 2000;

export function useBracketSync(userId: string | null) {
  const bracket = usePredictionStore((s) => s.bracket);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId || !bracket) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const supabase = createClient();
      const spice = computeSpice(bracket);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('brackets').upsert(
        {
          user_id: userId,
          bracket_data: bracket,
          spice_score: spice.score,
          persona: spice.persona,
          persona_emoji: spice.personaEmoji,
          champion: spice.champion || null,
          runner_up: spice.runnerUp || null,
          dark_horse: spice.darkHorse || null,
          early_exit: spice.earlyExit || null,
          boldest_call: spice.boldestCall || null,
        },
        { onConflict: 'user_id' },
      );
    }, DEBOUNCE_MS);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [bracket, userId]);
}
