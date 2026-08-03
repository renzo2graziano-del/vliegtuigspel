import React from 'react';
import { Mission, Achievement } from '../types';
import { soundManager } from '../utils/sound';
import { X, Target, Award, CheckCircle2 } from 'lucide-react';

interface MissionsModalProps {
  missions: Mission[];
  achievements: Achievement[];
  onClaimReward: (missionId: string, rewardCoins: number) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  achievements,
  onClaimReward,
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<'missions' | 'achievements'>('missions');

  const handleClaim = (m: Mission) => {
    soundManager.playCoin();
    onClaimReward(m.id, m.rewardCoins);
  };

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
          <h2 className="text-2xl font-black text-amber-400 mb-4">Piloot Missies & Prestakties</h2>

          <div className="flex gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700/80 w-fit">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('missions');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'missions'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" /> Dagelijkse Missies
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('achievements');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                activeTab === 'achievements'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" /> Prestaties
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
          {activeTab === 'missions' ? (
            missions.map((m) => {
              const isReadyToClaim = m.currentCount >= m.targetCount && !m.completed;
              const progressPct = Math.min(100, Math.floor((m.currentCount / m.targetCount) * 100));

              return (
                <div
                  key={m.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white">{m.title}</h4>
                      {m.completed && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Voltooid
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mb-3">{m.description}</p>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/50">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-400 h-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {m.currentCount}/{m.targetCount}
                      </span>
                    </div>
                  </div>

                  {/* Reward Action */}
                  {isReadyToClaim ? (
                    <button
                      onClick={() => handleClaim(m)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 animate-bounce"
                    >
                      Claim Beloning ({m.rewardCoins} 🪙)
                    </button>
                  ) : (
                    <div className="text-xs font-semibold text-amber-400/80 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                      Beloning: {m.rewardCoins} 🪙
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            achievements.map((ach) => (
              <div
                key={ach.id}
                className={`border rounded-2xl p-4 flex items-center gap-4 ${
                  ach.unlocked
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-slate-800/40 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${
                    ach.unlocked
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  🏆
                </div>
                <div>
                  <h4 className="font-bold text-sm">{ach.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
