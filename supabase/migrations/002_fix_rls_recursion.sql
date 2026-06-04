-- Fix infinite recursion: leagues ↔ league_members circular RLS policies.
-- The leagues select policy queries league_members, and league_members select
-- policy queries leagues — causing infinite recursion.
--
-- Fix: league_members select policy only checks user_id = auth.uid().
-- Owners are auto-joined as members, so they can still see their memberships.

drop policy if exists "lm_select_member" on public.league_members;

create policy "lm_select_member" on public.league_members
  for select using (user_id = auth.uid());
