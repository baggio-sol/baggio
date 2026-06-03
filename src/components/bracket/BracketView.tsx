'use client';
import { useState } from 'react';
import { usePredictionStore } from '@/lib/store';
import { Team, BracketMatch } from '@/lib/types';
import TeamFlag from '@/components/ui/TeamFlag';
import { cn } from '@/lib/utils';
import { Trophy, ChevronRight } from 'lucide-react';

interface BracketMatchCardProps {
  match: BracketMatch;
  stage: string;
  onSelectWinner: (stage: string, position: number, winner: Team, homeScore: number, awayScore: number) => void;
}

function BracketMatchCard({ match, stage, onSelectWinner }: BracketMatchCardProps) {
  const [showScorePicker, setShowScorePicker] = useState(false);
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 1);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);

  const handleTeamClick = (team: Team) => {
    if (!match.homeTeam || !match.awayTeam) return;
    setShowScorePicker(true);
  };

  const confirmPrediction = (winner: Team) => {
    onSelectWinner(stage, match.position, winner, homeScore, awayScore);
    setShowScorePicker(false);
  };

  return (
    <div className={cn(
      'w-48 rounded-xl border overflow-hidden transition-all',
      match.winner ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-gray-800/60'
    )}>
      {[match.homeTeam, match.awayTeam].map((team, idx) => {
        const isWinner = match.winner?.id === team?.id;
        return (
          <button
            key={idx}
            onClick={() => team && match.awayTeam && match.homeTeam && handleTeamClick(team)}
            disabled={!team || !match.homeTeam || !match.awayTeam}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all',
              idx === 0 ? 'border-b border-white/10' : '',
              isWinner ? 'bg-emerald-500/20' : 'hover:bg-white/10',
              !team ? 'opacity-40 cursor-default' : '',
            )}
          >
            {team ? (
              <>
                <span className="text-lg">{team.flag}</span>
                <span className={cn('text-xs font-semibold flex-1', isWinner ? 'text-emerald-300' : 'text-gray-300')}>
                  {team.code}
                </span>
                {match.winner && (
                  <span className="text-xs font-bold text-white">
                    {idx === 0 ? match.homeScore : match.awayScore}
                  </span>
                )}
                {isWinner && <ChevronRight className="w-3 h-3 text-emerald-400" />}
              </>
            ) : (
              <span className="text-xs text-gray-600">TBD</span>
            )}
          </button>
        );
      })}

      {showScorePicker && match.homeTeam && match.awayTeam && (
        <div className="absolute z-50 mt-1 bg-gray-800 border border-gray-600 rounded-xl p-4 shadow-2xl w-64">
          <p className="text-xs text-gray-400 mb-3 text-center font-medium">Predict score & winner</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs text-gray-400">{match.homeTeam.code}</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setHomeScore(n)}
                    className={cn('w-8 h-8 rounded-lg text-sm font-bold', homeScore === n ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-gray-500">–</span>
            <div className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs text-gray-400">{match.awayTeam.code}</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => setAwayScore(n)}
                    className={cn('w-8 h-8 rounded-lg text-sm font-bold', awayScore === n ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20')}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => confirmPrediction(match.homeTeam!)}
              className="flex-1 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 flex items-center justify-center gap-1">
              <span>{match.homeTeam.flag}</span> {match.homeTeam.code} wins
            </button>
            <button onClick={() => confirmPrediction(match.awayTeam!)}
              className="flex-1 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/30 flex items-center justify-center gap-1">
              <span>{match.awayTeam.flag}</span> {match.awayTeam.code} wins
            </button>
          </div>
          <button onClick={() => setShowScorePicker(false)} className="w-full mt-2 text-xs text-gray-500 hover:text-gray-300">Cancel</button>
        </div>
      )}
    </div>
  );
}

interface RoundProps {
  title: string;
  matches: BracketMatch[];
  stage: string;
  onSelectWinner: (stage: string, position: number, winner: Team, homeScore: number, awayScore: number) => void;
}

function BracketRound({ title, matches, stage, onSelectWinner }: RoundProps) {
  return (
    <div className="flex flex-col">
      <div className="text-center mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-4 justify-around flex-1">
        {matches.map(match => (
          <div key={match.id} className="relative">
            <BracketMatchCard match={match} stage={stage} onSelectWinner={onSelectWinner} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BracketView() {
  const { knockoutBracket, setKnockoutPrediction } = usePredictionStore();

  const rounds = [
    { title: 'Round of 16', matches: knockoutBracket.r16, stage: 'r16' },
    { title: 'Quarter Finals', matches: knockoutBracket.qf, stage: 'qf' },
    { title: 'Semi Finals', matches: knockoutBracket.sf, stage: 'sf' },
  ];

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-[900px] flex gap-8 items-start">
        {rounds.map(round => (
          <BracketRound
            key={round.stage}
            title={round.title}
            matches={round.matches}
            stage={round.stage}
            onSelectWinner={(stage, pos, winner, hs, as) => setKnockoutPrediction(stage, pos, winner, hs, as)}
          />
        ))}

        {/* Final column */}
        <div className="flex flex-col">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full">
              Final
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {/* Third place */}
            {knockoutBracket.third && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5 text-center">3rd Place</p>
                <BracketMatchCard
                  match={knockoutBracket.third}
                  stage="3rd"
                  onSelectWinner={(stage, pos, winner, hs, as) => setKnockoutPrediction(stage, pos, winner, hs, as)}
                />
              </div>
            )}
            {/* Final */}
            {knockoutBracket.final && (
              <div>
                <p className="text-xs text-emerald-400 mb-1.5 text-center font-semibold">🏆 Grand Final</p>
                <BracketMatchCard
                  match={knockoutBracket.final}
                  stage="final"
                  onSelectWinner={(stage, pos, winner, hs, as) => setKnockoutPrediction(stage, pos, winner, hs, as)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Champion */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-full">
              Champion
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 min-w-[120px]">
            <Trophy className="w-10 h-10 text-yellow-400" />
            {knockoutBracket.winner ? (
              <>
                <span className="text-4xl">{knockoutBracket.winner.flag}</span>
                <span className="text-white font-bold text-center text-sm">{knockoutBracket.winner.name}</span>
                <span className="text-xs text-yellow-400 font-semibold">World Champions</span>
              </>
            ) : (
              <span className="text-gray-500 text-sm text-center">Complete bracket to reveal champion</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
