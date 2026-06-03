'use client';
import { useState } from 'react';
import { Users, Trophy, Calendar, Settings, BarChart3, Bell, Plus, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { TEAMS, PLAYERS } from '@/lib/data';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'teams', label: 'Teams', icon: <Trophy className="w-4 h-4" /> },
  { id: 'fixtures', label: 'Fixtures', icon: <Calendar className="w-4 h-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
];

const STATS = [
  { label: 'Total Users', value: '94,382', change: '+12.4%', icon: '👥', color: 'from-blue-500/20 to-blue-600/20' },
  { label: 'Predictions Made', value: '2.1M', change: '+34.1%', icon: '🎯', color: 'from-emerald-500/20 to-emerald-600/20' },
  { label: 'Active Leagues', value: '8,423', change: '+8.7%', icon: '🏆', color: 'from-yellow-500/20 to-yellow-600/20' },
  { label: 'Daily Active', value: '31,200', change: '+21.3%', icon: '⚡', color: 'from-purple-500/20 to-purple-600/20' },
];

export default function AdminPage() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full uppercase tracking-wider">Admin Panel</span>
            </div>
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
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

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map(s => (
                <Card key={s.label} className={`p-5 bg-gradient-to-br ${s.color} border-white/10`}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-xs text-gray-300 mt-0.5">{s.label}</div>
                  <div className="text-xs text-emerald-400 mt-1 font-semibold">{s.change} this week</div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card glass className="p-5">
                <h3 className="font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { text: '342 new users registered', time: '5 min ago', type: 'user' },
                    { text: 'Match result updated: BRA 2-0 SRB', time: '1h ago', type: 'match' },
                    { text: 'Leaderboard recalculated', time: '1h ago', type: 'system' },
                    { text: '14 new leagues created', time: '3h ago', type: 'league' },
                    { text: 'Notification sent to 50K users', time: '5h ago', type: 'notif' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{item.text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card glass className="p-5">
                <h3 className="font-bold text-white mb-4">Tournament Progress</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Group Stage', done: 0, total: 48 },
                    { label: 'Round of 16', done: 0, total: 8 },
                    { label: 'Quarter Finals', done: 0, total: 4 },
                    { label: 'Semi Finals', done: 0, total: 2 },
                    { label: 'Final', done: 0, total: 1 },
                  ].map(stage => (
                    <div key={stage.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-300">{stage.label}</span>
                        <span className="text-gray-400">{stage.done}/{stage.total}</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                          style={{ width: `${(stage.done / stage.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === 'teams' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white">Teams ({TEAMS.length})</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/30 transition-all">
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {TEAMS.slice(0, 32).map(team => (
                <Card key={team.id} className="p-4 flex items-center gap-3 hover:border-emerald-500/20 transition-all group">
                  <span className="text-3xl">{team.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{team.name}</p>
                    <p className="text-xs text-gray-400">{team.code} · Group {team.group}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-white"><Edit className="w-3 h-3" /></button>
                    <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <h2 className="text-lg font-bold text-white mb-5">User Management</h2>
            <Card glass className="overflow-hidden">
              <div className="grid grid-cols-[1fr_100px_80px_80px_100px] gap-2 px-5 py-3 border-b border-white/10 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <span>User</span>
                <span>Country</span>
                <span className="text-right">Points</span>
                <span className="text-right">Rank</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y divide-white/5">
                {Array.from({ length: 10 }, (_, i) => ({
                  name: ['Chukwuemeka A.', 'Carlos M.', 'Pierre D.', 'James W.', 'Ana S.', 'Mohammed K.', 'Yuki T.', 'Ivan P.', 'Sarah L.', 'David O.'][i],
                  email: `user${i + 1}@example.com`,
                  country: ['🇳🇬', '🇦🇷', '🇫🇷', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇧🇷', '🇲🇦', '🇯🇵', '🇭🇷', '🇺🇸', '🇩🇪'][i],
                  points: 2840 - i * 45,
                  rank: i + 1,
                })).map((user, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_80px_80px_100px] gap-2 items-center px-5 py-3 hover:bg-white/5 transition-all">
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-sm">{user.country}</span>
                    <span className="text-sm font-bold text-white text-right">{user.points}</span>
                    <span className="text-sm text-gray-400 text-right">#{user.rank}</span>
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-white transition-all"><Edit className="w-3 h-3" /></button>
                      <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Send Notification</h2>
            </div>
            <Card glass className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                  <input type="text" placeholder="Notification title" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Message</label>
                  <textarea rows={3} placeholder="Notification message..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Target</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50">
                      <option>All Users</option>
                      <option>Active Users</option>
                      <option>Specific Country</option>
                      <option>League Members</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50">
                      <option>Push Notification</option>
                      <option>Email</option>
                      <option>In-App</option>
                    </select>
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/25">
                  <Bell className="w-4 h-4" /> Send Notification
                </button>
              </div>
            </Card>
          </div>
        )}

        {tab === 'fixtures' && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Fixture Management</h3>
            <p className="text-gray-400 mb-6">Upload and manage tournament fixtures, update results, and set match times.</p>
            <button className="flex items-center gap-2 mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all">
              <Plus className="w-4 h-4" /> Upload Fixtures
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
