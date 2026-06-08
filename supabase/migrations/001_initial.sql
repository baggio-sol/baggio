-- profiles: one row per auth user, created on first sign-in
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

-- auto-create profile on new user sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- brackets: one per user (upsert pattern)
create table if not exists public.brackets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  bracket_data  jsonb not null default '{}',
  spice_score   int,
  persona       text,
  persona_emoji text,
  champion      text,
  runner_up     text,
  dark_horse    text,
  early_exit    text,
  boldest_call  text,
  is_public     boolean not null default true,
  points        int,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null,
  unique (user_id)
);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_brackets_updated_at on public.brackets;
create trigger set_brackets_updated_at
  before update on public.brackets
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- leagues
create table if not exists public.leagues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique default upper(substring(gen_random_uuid()::text, 1, 8)),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz default now() not null
);

-- league members
create table if not exists public.league_members (
  league_id uuid not null references public.leagues(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz default now() not null,
  primary key (league_id, user_id)
);

-- match results (written by cron job)
create table if not exists public.results (
  match_id   text primary key,
  home_score int not null,
  away_score int not null,
  winner     text,
  played_at  timestamptz not null,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.profiles       enable row level security;
alter table public.brackets        enable row level security;
alter table public.leagues         enable row level security;
alter table public.league_members  enable row level security;
alter table public.results         enable row level security;

-- profiles: users read/write own row
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- brackets: owner can do anything; anyone can read public brackets
create policy "brackets_select_public" on public.brackets for select using (is_public or auth.uid() = user_id);
create policy "brackets_insert_own"    on public.brackets for insert with check (auth.uid() = user_id);
create policy "brackets_update_own"    on public.brackets for update using (auth.uid() = user_id);
create policy "brackets_delete_own"    on public.brackets for delete using (auth.uid() = user_id);

-- leagues: members can read; owner can insert/update/delete
create policy "leagues_select_member" on public.leagues for select
  using (exists (select 1 from public.league_members lm where lm.league_id = id and lm.user_id = auth.uid())
         or owner_id = auth.uid());
create policy "leagues_insert_own"    on public.leagues for insert with check (auth.uid() = owner_id);
create policy "leagues_update_own"    on public.leagues for update using (auth.uid() = owner_id);
create policy "leagues_delete_own"    on public.leagues for delete using (auth.uid() = owner_id);

-- league_members
create policy "lm_select_member" on public.league_members for select
  using (user_id = auth.uid() or
         exists (select 1 from public.leagues l where l.id = league_id and l.owner_id = auth.uid()));
create policy "lm_insert_self"   on public.league_members for insert with check (auth.uid() = user_id);
create policy "lm_delete_self"   on public.league_members for delete using (auth.uid() = user_id);

-- results: public read, no client writes
create policy "results_select_all" on public.results for select using (true);
