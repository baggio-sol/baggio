'use client';
import { useState } from 'react';
import { Users, Plus, Search, Trophy, Lock, Globe, Copy, Check, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { generateInviteCode } from '@/lib/utils';

const MOCK_LEAGUES = [
  { id: '1', name: 'Crypto Football League', code: 'CFL2026', members: 142, rank: 7, points: 1850, type: 'public', emoji: '₿' },
  { id: '2', name: 'Office Champions', code: 'OFC2026', members: 18, rank: 3, points: 2100, type: 'private', emoji: '💼' },
  { id: '3', name: 'Nigeria Fans League', code: 'NGA2026', members: 2840, rank: 234, points: 1420, type: 'public', emoji: '🇳🇬' },
];

type ModalType = 'create' | 'join' | null;

export default function LeaguesPage() {
  const [modal, setModal] = useState<ModalType>(null);
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [createdLeague, setCreatedLeague] = useState<{ name: string; code: string } | null>(null);

  const handleCreate = () => {
    if (!newLeagueName.trim()) return;
    const code = generateInviteCode();
    setCreatedLeague({ name: newLeagueName, code });
    setNewLeagueName('');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">Private Leagues</h1>
            <p className="text-gray-400 mt-1">Create or join leagues to compete with friends</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setModal('join')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/15 text-sm font-semibold transition-all"
            >
              <Search className="w-4 h-4" /> Join
            </button>
            <button
              onClick={() => setModal('create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> Create League
            </button>
          </div>
        </div>

        {/* My Leagues */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-white mb-4">My Leagues</h2>
          <div className="space-y-4">
            {MOCK_LEAGUES.map(league => (
              <Card key={league.id} className="p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {league.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{league.name}</h3>
                    {league.type === 'private' ? (
                      <Lock className="w-3 h-3 text-gray-400" />
                    ) : (
                      <Globe className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Users className="w-3 h-3" /> {league.members} members</span>
                    <span className="text-xs text-emerald-400 font-medium">Rank #{league.rank}</span>
                    <span className="text-xs text-gray-400">{league.points} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(league.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-medium transition-all"
                  >
                    {copied === league.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {league.code}
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Discover Leagues */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Discover Public Leagues</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'World Fans League', members: 45200, emoji: '🌍', category: 'Global' },
              { name: 'Africa Cup League', members: 8900, emoji: '🌍', category: 'Regional' },
              { name: 'Crypto & Football', members: 3200, emoji: '₿', category: 'Community' },
              { name: 'Premier League Fans', members: 12400, emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', category: 'National' },
            ].map(league => (
              <Card key={league.name} className="p-5 hover:border-emerald-500/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{league.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{league.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{league.members.toLocaleString()} members · {league.category}</p>
                    <button className="mt-3 text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                      Join League →
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setModal(null); setCreatedLeague(null); }}>
          <Card glass className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-5">Create a League</h2>

            {createdLeague ? (
              <div className="text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-lg font-bold text-white mb-2">&ldquo;{createdLeague.name}&rdquo; created!</h3>
                <p className="text-gray-400 text-sm mb-4">Share this invite code with your friends:</p>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 mb-5">
                  <span className="font-black text-2xl text-emerald-400 flex-1 tracking-widest text-center">{createdLeague.code}</span>
                  <button onClick={() => copyCode(createdLeague.code)} className="p-2 rounded-lg bg-white/10 text-gray-400 hover:text-white transition-all">
                    {copied === createdLeague.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={() => { setModal(null); setCreatedLeague(null); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:from-emerald-600 hover:to-cyan-600 transition-all">
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">League Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Office Champions League"
                      value={newLeagueName}
                      onChange={e => setNewLeagueName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    {['private', 'public'].map(type => (
                      <label key={type} className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-all">
                        <input type="radio" name="type" value={type} defaultChecked={type === 'private'} className="accent-emerald-500" />
                        <span className="text-sm text-white capitalize">{type}</span>
                        {type === 'private' ? <Lock className="w-3 h-3 text-gray-400" /> : <Globe className="w-3 h-3 text-gray-400" />}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl bg-white/10 border border-white/10 text-gray-300 font-medium hover:text-white transition-all">
                    Cancel
                  </button>
                  <button onClick={handleCreate} disabled={!newLeagueName.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Create League
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Join Modal */}
      {modal === 'join' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <Card glass className="w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-5">Join a League</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Invite Code</label>
                <input
                  type="text"
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-center text-xl tracking-widest uppercase"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl bg-white/10 border border-white/10 text-gray-300 font-medium hover:text-white transition-all">
                Cancel
              </button>
              <button disabled={joinCode.length < 4} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Join League
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
