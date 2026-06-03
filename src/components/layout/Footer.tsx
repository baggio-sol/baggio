import Link from 'next/link';
import { Trophy, Mail, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-900/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-lg text-white">BAGGIO<span className="text-emerald-400">26</span></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              The ultimate tournament prediction platform for FIFA World Cup 2026. Predict, compete, and win with friends worldwide.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <span className="text-sm font-bold">𝕏</span>
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              {[['Predict', '/predict'], ['Bracket', '/bracket'], ['Leaderboard', '/leaderboard'], ['Leagues', '/leagues'], ['Matches', '/matches']].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {[['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#'], ['Contact Us', '#']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© 2026 Baggio26. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Built for football fans worldwide 🌍</p>
        </div>
      </div>
    </footer>
  );
}
