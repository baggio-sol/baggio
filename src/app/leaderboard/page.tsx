'use client';
import { useState } from 'react';
import { Trophy, Search, Globe, Users, Medal } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const MOCK_DATA = Array.from({ length: 50 }, (_, i) => ({
  rank: i + 1,
  username: ['Chukwuemeka', 'Carlos', 'Pierre', 'James', 'Ana', 'Mohammed', 'Yuki', 'Ivan', 'Sarah', 'David'][i % 10] + ' ' + String.fromCharCode(65 + (i % 26)) + '.',
  country: ['🇳🇬', '🇦🇷', '🇫🇷', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇧🇷', '🇲🇦', '🇯🇵', '🇭🇷', '🇺🇸', '🇩🇪'][i % 10],
  countryName: ['Nigeria', 'Argentina', 'France', 'England', 'Brazil', 'Morocco', 'Japan', 'Croatia', 'USA', 'Germany'][i % 10],
  points: Math.max(100, 2840 - i * 45 + Math.floor(Math.random() * 30)),
  correctScores: Math.floor(Math.random() * 20),
  correctResults: Math.floor(Math.random() * 30) + 10,
  avatar: ['C', 'C', 'P', 'J', 'A', 'M', 'Y', 'I', 'S', 'D'][i % 10],
  streak: Math.floor(Math.random() * 10),
  change: ['+2', '-1', '0', '+5', '-3'][i % 5],
}));

const TABS = [
  { id: 'global', label: 'Global', icon: <Globe className="w-4 h-4" /> },
  { id: 'country', label: 'By Country', icon: <Medal className="w-4 h-4" /> },
  { id: 'friends', label: 'Friends', icon: <Users className="w-4 h-4" /> },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState('global');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = MOCK_DATA.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.countryName.toLowerCase().includes(search.toLowerCase())
  );

  const pageSize = 20;
  const paginated = filtered.slice(0, page * pageSize);
  const top3 = MOCK_DATA.slice(0, 3);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">World Cup 2026 Leaderboard</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">Global Rankings</h1>
          <p className="text-gray-400">Updated in real-time as matches are played</p>
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[top3[1], top3[0], top3[2]].map((user, podiumIdx) => {
            const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
            const heights = ['h-24', 'h-32', 'h-20'];
            const colors = ['from-gray-500 to-gray-600', 'from-yellow-500 to-amber-500', 'from-amber-700 to-amber-800'];
            const medals = ['🥈', '🥇', '🥉'];
            return (
              <div key={user.rank} className="flex flex-col items-center">
                <div className={cn('w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-black text-lg mb-2 shadow-xl', colors[podiumIdx])}>
                  {user.avatar}
                </div>
                <p className="text-xs md:text-sm font-semibold text-white text-center truncate max-w-full px-1">{user.username}</p>
                <p className="text-lg">{user.country}</p>
                <div className={cn('w-full rounded-t-xl flex flex-col items-center justify-end pb-3 mt-2 bg-gradient-to-t', colors[podiumIdx], heights[podiumIdx])}>
                  <span className="text-2xl">{medals[podiumIdx]}</span>
                  <span className="text-white font-black text-sm">{user.points.toLocaleString()}</span>
                  <span className="text-white/60 text-xs">pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                tab === t.id
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search players or countries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-800/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>

        {tab === 'friends' ? (
          <Card glass className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Friends Leaderboard</h3>
            <p className="text-gray-400 mb-6">Sign in to see how you rank against your friends</p>
            <a href="/auth" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all">
              Sign In
            </a>
          </Card>
        ) : (
          <Card glass className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_1fr_80px_80px_60px] gap-2 px-5 py-3 border-b border-white/10 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Correct</span>
              <span className="text-right">Points</span>
              <span className="text-right">Change</span>
            </div>

            <div className="divide-y divide-white/5">
              {paginated.map((user, idx) => (
                <div
                  key={user.rank}
                  className={cn(
                    'grid grid-cols-[40px_1fr_80px_80px_60px] gap-2 items-center px-5 py-3.5 transition-all hover:bg-white/5',
                    user.rank <= 3 && 'bg-yellow-500/5'
                  )}
                >
                  <span className={cn('font-black text-sm', {
                    'text-yellow-400': user.rank === 1,
                    'text-gray-300': user.rank === 2,
                    'text-amber-600': user.rank === 3,
                    'text-gray-500': user.rank > 3,
                  })}>
                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                  </span>

                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 bg-gradient-to-br', {
                      'from-yellow-500 to-amber-500': user.rank === 1,
                      'from-gray-400 to-gray-600': user.rank === 2,
                      'from-amber-600 to-amber-800': user.rank === 3,
                      'from-emerald-600 to-cyan-600': user.rank > 3,
                    })}>
                      {user.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.country} {user.countryName}</p>
                    </div>
                  </div>

                  <span className="text-sm font-medium text-gray-300 text-right">{user.correctResults}</span>
                  <span className="text-sm font-black text-white text-right">{user.points.toLocaleString()}</span>
                  <span className={cn('text-xs font-bold text-right', {
                    'text-emerald-400': user.change.startsWith('+'),
                    'text-red-400': user.change.startsWith('-'),
                    'text-gray-500': user.change === '0',
                  })}>
                    {user.change === '0' ? '–' : user.change}
                  </span>
                </div>
              ))}
            </div>

            {paginated.length < filtered.length && (
              <div className="p-4 border-t border-white/10 text-center">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Load more ({filtered.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
