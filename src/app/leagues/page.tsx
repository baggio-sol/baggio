'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Plus, Search, Copy, Check, ArrowRight, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type League = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  member_count: number;
  my_rank?: number;
  my_points?: number;
};

type LeagueMember = {
  user_id: string;
  display_name: string | null;
  points: number | null;
  spice_score: number | null;
  persona: string | null;
};

type ModalType = 'create' | 'join' | 'detail' | null;

const supabase = createClient();

export default function LeaguesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);

  // Create state
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdLeague, setCreatedLeague] = useState<{ name: string; code: string } | null>(null);
  const [createError, setCreateError] = useState('');

  // Join state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Detail state
  const [activeLeague, setActiveLeague] = useState<League | null>(null);
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const fetchLeagues = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data: memberships } = await (supabase as any)
      .from('league_members')
      .select('league_id')
      .eq('user_id', userId);

    if (!memberships?.length) { setLeagues([]); setLoading(false); return; }

    const leagueIds = memberships.map((m: any) => m.league_id);
    const { data: leagueRows } = await (supabase as any)
      .from('leagues')
      .select('id, name, invite_code, owner_id')
      .in('id', leagueIds);

    if (!leagueRows) { setLeagues([]); setLoading(false); return; }

    // For each league, get member count + user bracket points
    const enriched: League[] = await Promise.all(
      leagueRows.map(async (l: any) => {
        const { count } = await (supabase as any)
          .from('league_members')
          .select('*', { count: 'exact', head: true })
          .eq('league_id', l.id);

        const { data: bracket } = await (supabase as any)
          .from('brackets')
          .select('points')
          .eq('user_id', userId)
          .single();

        return {
          id: l.id,
          name: l.name,
          invite_code: l.invite_code,
          owner_id: l.owner_id,
          member_count: count ?? 0,
          my_points: bracket?.points ?? null,
        };
      })
    );

    setLeagues(enriched);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchLeagues(); }, [fetchLeagues]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError('');

    // Always get fresh user to ensure session is valid
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCreateError('You must be signed in to create a league.');
      setCreating(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from('leagues')
      .insert({ name: newName.trim(), owner_id: user.id })
      .select('id, name, invite_code')
      .single();

    if (error || !data) {
      setCreateError(error?.message ?? 'Could not create league. Try again.');
      setCreating(false);
      return;
    }

    // Auto-join as member
    await (supabase as any)
      .from('league_members')
      .insert({ league_id: data.id, user_id: user.id });

    setCreatedLeague({ name: data.name, code: data.invite_code });
    setNewName('');
    setCreating(false);
    fetchLeagues();
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setJoinError('You must be signed in to join a league.');
      setJoining(false);
      return;
    }

    const { data: league } = await (supabase as any)
      .from('leagues')
      .select('id, name')
      .eq('invite_code', joinCode.trim().toUpperCase())
      .single();

    if (!league) {
      setJoinError('League not found. Check the invite code.');
      setJoining(false);
      return;
    }

    const { error } = await (supabase as any)
      .from('league_members')
      .insert({ league_id: league.id, user_id: user.id });

    if (error?.code === '23505') {
      setJoinError('You are already in this league.');
      setJoining(false);
      return;
    }
    if (error) {
      setJoinError(error.message ?? 'Could not join league. Try again.');
      setJoining(false);
      return;
    }

    setJoinCode('');
    setJoining(false);
    setModal(null);
    fetchLeagues();
  };

  const fetchMembers = useCallback(async (leagueId: string) => {
    const { data: memberRows } = await (supabase as any)
      .from('league_members')
      .select('user_id')
      .eq('league_id', leagueId);

    if (!memberRows?.length) { setMembers([]); setLoadingMembers(false); return; }

    const memberIds = memberRows.map((m: any) => m.user_id);

    const [{ data: profiles }, { data: brackets }] = await Promise.all([
      (supabase as any).from('profiles').select('id, display_name').in('id', memberIds),
      (supabase as any).from('brackets').select('user_id, points, spice_score, persona').in('user_id', memberIds),
    ]);

    const profileMap: Record<string, string> = {};
    profiles?.forEach((p: any) => { profileMap[p.id] = p.display_name; });
    const bracketMap: Record<string, any> = {};
    brackets?.forEach((b: any) => { bracketMap[b.user_id] = b; });

    const result: LeagueMember[] = memberIds.map((id: string) => ({
      user_id: id,
      display_name: profileMap[id] ?? 'Anonymous',
      points: bracketMap[id]?.points ?? null,
      spice_score: bracketMap[id]?.spice_score ?? null,
      persona: bracketMap[id]?.persona ?? null,
    }));

    result.sort((a, b) => (b.points ?? -1) - (a.points ?? -1));
    setMembers(result);
    setLoadingMembers(false);
  }, []);

  const openDetail = (league: League) => {
    // Unsubscribe from any previous channel
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    setActiveLeague(league);
    setModal('detail');
    setLoadingMembers(true);
    fetchMembers(league.id);

    // Subscribe to bracket point changes for live leaderboard updates
    const channel = supabase
      .channel(`league-${league.id}-brackets`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'brackets' }, () => {
        fetchMembers(league.id);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'league_members', filter: `league_id=eq.${league.id}` }, () => {
        fetchMembers(league.id);
      })
      .subscribe();

    realtimeChannelRef.current = channel;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const closeModal = () => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    setModal(null);
    setCreatedLeague(null);
    setCreateError('');
    setJoinError('');
    setJoinCode('');
    setNewName('');
    setActiveLeague(null);
    setMembers([]);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl" style={{ color: '#f5f3ff' }}>
              Leagues
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#c4bdec' }}>
              Compete with friends in private leagues
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal('join')}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#c4bdec' }}
            >
              <Search className="w-4 h-4" /> Join
            </button>
            <button
              onClick={() => setModal('create')}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
            >
              <Plus className="w-4 h-4" /> Create
            </button>
          </div>
        </div>

        {/* League list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#8b5cf6' }} />
          </div>
        ) : leagues.length === 0 ? (
          <div
            className="rounded-3xl p-12 border text-center"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="text-5xl mb-4">🏆</div>
            <p className="font-display font-extrabold text-xl mb-2" style={{ color: '#f5f3ff' }}>
              No leagues yet
            </p>
            <p className="text-sm mb-6" style={{ color: '#c4bdec' }}>
              Create a league and invite friends, or join one with an invite code.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setModal('join')}
                className="rounded-xl px-5 py-2.5 text-sm font-bold border transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#c4bdec' }}
              >
                Join with code
              </button>
              <button
                onClick={() => setModal('create')}
                className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
              >
                Create league
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {leagues.map(league => (
              <div
                key={league.id}
                className="rounded-2xl border p-5 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                onClick={() => openDetail(league)}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-extrabold text-lg"
                  style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.25))', color: '#a78bfa' }}
                >
                  {league.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-extrabold truncate" style={{ color: '#f5f3ff' }}>
                    {league.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#c4bdec' }}>
                    <Users className="w-3 h-3 inline mr-1" />
                    {league.member_count} {league.member_count === 1 ? 'member' : 'members'}
                    {league.my_points != null && (
                      <span className="ml-3">{league.my_points} pts</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); copyCode(league.invite_code); }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.10)', color: '#c4bdec' }}
                  >
                    {copied === league.invite_code ? <Check className="w-3 h-3" style={{ color: '#8b5cf6' }} /> : <Copy className="w-3 h-3" />}
                    {league.invite_code}
                  </button>
                  <ArrowRight className="w-4 h-4" style={{ color: '#6f6796' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backdrop */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-3xl border p-6 relative"
            style={{ background: '#1a0d36', borderColor: 'rgba(139,92,246,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-opacity hover:opacity-60"
              style={{ color: '#6f6796' }}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Create modal */}
            {modal === 'create' && (
              <>
                <h2 className="font-display font-extrabold text-xl mb-6" style={{ color: '#f5f3ff' }}>
                  Create a League
                </h2>

                {createdLeague ? (
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <p className="font-display font-extrabold text-lg mb-1" style={{ color: '#f5f3ff' }}>
                      &ldquo;{createdLeague.name}&rdquo; created!
                    </p>
                    <p className="text-sm mb-5" style={{ color: '#c4bdec' }}>
                      Share this invite code with friends:
                    </p>
                    <div
                      className="flex items-center justify-center gap-3 rounded-2xl px-5 py-4 mb-6 border"
                      style={{ background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.30)' }}
                    >
                      <span
                        className="font-display font-extrabold text-3xl tracking-widest"
                        style={{ color: '#a78bfa' }}
                      >
                        {createdLeague.code}
                      </span>
                      <button
                        onClick={() => copyCode(createdLeague.code)}
                        className="p-2 rounded-lg transition-opacity hover:opacity-70"
                        style={{ color: '#c4bdec' }}
                      >
                        {copied === createdLeague.code ? <Check className="w-4 h-4" style={{ color: '#8b5cf6' }} /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={closeModal}
                      className="w-full rounded-2xl py-3 font-display font-extrabold transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {createError && (
                      <div
                        className="mb-4 rounded-xl px-4 py-3 text-sm text-center"
                        style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}
                      >
                        {createError}
                      </div>
                    )}
                    <label className="block text-sm font-bold mb-2" style={{ color: '#c4bdec' }}>
                      League Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Office Champions"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreate()}
                      className="w-full rounded-xl px-4 py-3 mb-5 text-sm outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1.5px solid rgba(255,255,255,0.10)',
                        color: '#f5f3ff',
                      }}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        className="flex-1 rounded-2xl py-3 text-sm font-bold border transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#c4bdec' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={!newName.trim() || creating}
                        className="flex-1 rounded-2xl py-3 text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
                      >
                        {creating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create'}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Join modal */}
            {modal === 'join' && (
              <>
                <h2 className="font-display font-extrabold text-xl mb-6" style={{ color: '#f5f3ff' }}>
                  Join a League
                </h2>
                {joinError && (
                  <div
                    className="mb-4 rounded-xl px-4 py-3 text-sm text-center"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}
                  >
                    {joinError}
                  </div>
                )}
                <label className="block text-sm font-bold mb-2" style={{ color: '#c4bdec' }}>
                  Invite Code
                </label>
                <input
                  type="text"
                  placeholder="XXXXXXXX"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="w-full rounded-xl px-4 py-3 mb-5 text-center text-xl font-mono font-extrabold tracking-widest outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.10)',
                    color: '#f5f3ff',
                  }}
                />
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 rounded-2xl py-3 text-sm font-bold border transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#c4bdec' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoin}
                    disabled={joinCode.length < 4 || joining}
                    className="flex-1 rounded-2xl py-3 text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: '#fff' }}
                  >
                    {joining ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Join'}
                  </button>
                </div>
              </>
            )}

            {/* Detail / leaderboard modal */}
            {modal === 'detail' && activeLeague && (
              <>
                <div className="flex items-center justify-between mb-6 pr-6">
                  <div>
                    <h2 className="font-display font-extrabold text-xl" style={{ color: '#f5f3ff' }}>
                      {activeLeague.name}
                    </h2>
                    <button
                      onClick={() => copyCode(activeLeague.invite_code)}
                      className="flex items-center gap-1.5 mt-1 text-xs font-bold transition-opacity hover:opacity-70"
                      style={{ color: '#8b5cf6' }}
                    >
                      {copied === activeLeague.invite_code ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {activeLeague.invite_code}
                    </button>
                  </div>
                </div>

                {loadingMembers ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#8b5cf6' }} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                    {members.map((m, i) => (
                      <div
                        key={m.user_id}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                        style={{
                          background: m.user_id === userId ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                          borderColor: m.user_id === userId ? 'rgba(139,92,246,0.30)' : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <span
                          className="font-display font-extrabold text-sm w-5 text-right flex-shrink-0"
                          style={{ color: i === 0 ? '#fbbf24' : i === 1 ? '#c4bdec' : i === 2 ? '#f472b6' : '#6f6796' }}
                        >
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-bold truncate" style={{ color: '#f5f3ff' }}>
                          {m.display_name ?? 'Anonymous'}
                          {m.user_id === userId && (
                            <span className="ml-2 text-xs font-normal" style={{ color: '#8b5cf6' }}>you</span>
                          )}
                        </span>
                        {m.persona && (
                          <span className="text-xs hidden sm:block" style={{ color: '#c4bdec' }}>
                            {m.persona}
                          </span>
                        )}
                        <span className="font-display font-extrabold text-sm tabular-nums" style={{ color: '#f5f3ff' }}>
                          {m.points != null ? `${m.points} pts` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
