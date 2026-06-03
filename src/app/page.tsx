'use client';
import Link from 'next/link';
import { Trophy, ArrowRight, Globe, ChevronRight, Target, Zap, Star } from 'lucide-react';
import CountdownTimer from '@/components/ui/CountdownTimer';
import Card from '@/components/ui/Card';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Chukwuemeka A.', country: '🇳🇬', points: 2840, avatar: 'C' },
  { rank: 2, name: 'Carlos M.', country: '🇦🇷', points: 2715, avatar: 'C' },
  { rank: 3, name: 'Pierre D.', country: '🇫🇷', points: 2690, avatar: 'P' },
  { rank: 4, name: 'James W.', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', points: 2655, avatar: 'J' },
  { rank: 5, name: 'Ana S.', country: '🇧🇷', points: 2580, avatar: 'A' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Predict Group Stage', desc: 'Pick scores for all 48 group matches and watch standings update in real-time.', icon: <Target className="w-6 h-6" /> },
  { step: '02', title: 'Build Your Bracket', desc: 'Your group predictions automatically populate the knockout bracket. Click to advance teams.', icon: <Zap className="w-6 h-6" /> },
  { step: '03', title: 'Pick Award Winners', desc: 'Predict Golden Boot, Golden Ball, and other individual awards for bonus points.', icon: <Star className="w-6 h-6" /> },
  { step: '04', title: 'Compete & Win', desc: 'Earn points as matches play out. Top the leaderboard and claim prizes.', icon: <Trophy className="w-6 h-6" /> },
];

const FEATURES = [
  { icon: '🏆', title: 'Full Tournament Bracket', desc: 'Predict every match from group stage to final' },
  { icon: '🌍', title: 'Global Leaderboards', desc: 'Compete with fans worldwide and by country' },
  { icon: '👥', title: 'Private Leagues', desc: 'Create leagues for friends, office or community' },
  { icon: '⚡', title: 'Live Score Updates', desc: 'Points update in real-time as matches finish' },
  { icon: '🎯', title: 'Award Predictions', desc: 'Predict Golden Boot, Ball, Glove and more' },
  { icon: '📱', title: 'Share Your Bracket', desc: 'Share predictions as image cards to social media' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">FIFA World Cup 2026 · USA · Canada · Mexico</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Predict the<br />
            <span className="gradient-text">World Cup</span><br />
            2026
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Pick every score, build your bracket, and compete against millions of fans worldwide. The ultimate football prediction challenge.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/predict" className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-2xl shadow-emerald-500/30 text-lg active:scale-95">
              Start Predicting <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/leaderboard" className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/15 transition-all text-lg backdrop-blur-sm">
              View Leaderboard
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[['100K+', 'Active Players'], ['48', 'Group Matches'], ['64', 'Total Fixtures'], ['7', 'Award Categories']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-black text-white">{num}</div>
                <div className="text-sm text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-16 border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-6">Tournament Kicks Off In</p>
          <div className="flex justify-center mb-4"><CountdownTimer /></div>
          <p className="text-gray-500 text-sm">June 11, 2026 · Opening Match</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Get started in minutes. No football expertise required.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(item => (
            <Card key={item.step} glass className="p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
              <div className="absolute top-4 right-4 text-6xl font-black text-white/5 group-hover:text-white/10 transition-all">{item.step}</div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">{item.icon}</div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white/5 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg">The most complete World Cup prediction experience</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <Card key={f.title} className="p-5 flex gap-4 items-start hover:border-emerald-500/30 transition-all">
                <div className="text-3xl">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 mb-6">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Global Leaderboard</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Compete Globally</h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Rank against fans from every corner of the world. Filter by country, create private leagues for your friends, and track your rise to the top.
            </p>
            <Link href="/leaderboard" className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              View Full Leaderboard <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <Card glass className="overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> Top Predictors</h3>
              <span className="text-xs text-gray-400">Live Rankings</span>
            </div>
            <div className="divide-y divide-white/5">
              {MOCK_LEADERBOARD.map(user => (
                <div key={user.rank} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`w-7 font-black text-sm ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : user.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>#{user.rank}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">{user.avatar}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.country}</p>
                  </div>
                  <span className="font-black text-white">{user.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10 text-center">
              <Link href="/leaderboard" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">See all rankings →</Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Points System */}
      <section className="py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Points System</h2>
            <p className="text-gray-400 text-lg">Every correct prediction earns you points</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Correct Result', points: 3, icon: '✅' },
              { label: 'Exact Score', points: 5, icon: '🎯' },
              { label: 'Team Qualifies', points: 5, icon: '🎟️' },
              { label: 'Quarter Finalist', points: 8, icon: '⚡' },
              { label: 'Semi Finalist', points: 10, icon: '🔥' },
              { label: 'Finalist', points: 15, icon: '🌟' },
              { label: 'Champion', points: 25, icon: '🏆' },
              { label: 'Golden Boot', points: 15, icon: '👟' },
            ].map(item => (
              <Card key={item.label} className="p-4 text-center hover:border-emerald-500/30 transition-all">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-2xl font-black text-emerald-400 mb-1">+{item.points}</div>
                <div className="text-xs text-gray-400">{item.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4">
          <div className="text-6xl mb-6 animate-float">🏆</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Become a<br /><span className="gradient-text">Prediction Champion?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">Join thousands of fans. Submit your predictions before the tournament starts.</p>
          <Link href="/predict" className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black px-10 py-5 rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-2xl shadow-emerald-500/30 text-xl active:scale-95">
            Start Predicting Now <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
