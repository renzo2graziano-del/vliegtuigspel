import React from 'react';
import { HighScore, FlightStats } from '../types';
import { soundManager } from '../utils/sound';
import { X, Trophy, BarChart2 } from 'lucide-react';

interface LeaderboardModalProps {
  highScores: HighScore[];
  stats: FlightStats;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ highScores, stats, onClose }) => {
  const [tab, setTab] = React.useState<'leaderboard' | 'stats'>('leaderboard');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-white relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Tabs */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-amber-400 mb-4">Erelijst & Statistieken</h2>

          <div className="flex gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700/80 w-fit">
            <button
              onClick={() => {
                soundManager.playClick();
                setTab('leaderboard');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                tab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" /> Top Piloten
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setTab('stats');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                tab === 'stats'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" /> Jouw Vliegstatistieken
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pr-2 flex-1">
          {tab === 'leaderboard' ? (
            <div className="space-y-3">
              {highScores
                .sort((a, b) => b.score - a.score)
                .map((score, index) => (
                  <div
                    key={score.id}
                    className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                          index === 0
                            ? 'bg-amber-500 text-slate-950'
                            : index === 1
                            ? 'bg-slate-300 text-slate-950'
                            : index === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">{score.playerName}</div>
                        <div className="text-xs text-slate-400">
                          {score.planeName} • {score.distance} m • {score.coins} 🪙
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-amber-400 font-mono">{score.score}</div>
                      <div className="text-[10px] text-slate-500">{score.date}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Totaal Aantal Vluchten" value={stats.totalFlights} icon="✈️" />
              <StatBox label="Totale Afstand Geflogen" value={`${stats.totalDistance} m`} icon="📏" />
              <StatBox label="Totaal Verzamelde Munten" value={`${stats.totalCoins} 🪙`} icon="🪙" />
              <StatBox label="Hoogste Score Behaald" value={stats.highestScore} icon="🏆" />
              <StatBox label="Obstakels Ontweken" value={stats.obstaclesDodged} icon="☁️" />
              <StatBox label="Power-ups Opgepakt" value={stats.powerupsCollected} icon="⚡" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
    <div className="text-xl font-black text-amber-400 font-mono mt-1">{value}</div>
  </div>
);
