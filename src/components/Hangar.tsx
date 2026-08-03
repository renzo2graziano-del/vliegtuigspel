import React from 'react';
import { GameState, PlaneConfig, PlaneUpgrade } from '../types';
import { soundManager } from '../utils/sound';
import { ArrowLeft, Check, Lock, Zap, Shield, Magnet, Gauge, Plus } from 'lucide-react';

interface HangarProps {
  planes: PlaneConfig[];
  activePlaneId: string;
  onSelectPlane: (id: string) => void;
  onUnlockPlane: (id: string, price: number) => boolean;
  upgrades: PlaneUpgrade;
  onUpgradeStat: (stat: keyof PlaneUpgrade, cost: number) => boolean;
  coins: number;
  setGameState: (state: GameState) => void;
}

export const Hangar: React.FC<HangarProps> = ({
  planes,
  activePlaneId,
  onSelectPlane,
  onUnlockPlane,
  upgrades,
  onUpgradeStat,
  coins,
  setGameState,
}) => {
  const selectedPlane = planes.find((p) => p.id === activePlaneId) || planes[0];

  const getUpgradeCost = (currentLevel: number) => (currentLevel + 1) * 75;

  const handleUpgrade = (stat: keyof PlaneUpgrade, currentLevel: number) => {
    if (currentLevel >= 5) return;
    const cost = getUpgradeCost(currentLevel);
    if (onUpgradeStat(stat, cost)) {
      soundManager.playPowerup();
    } else {
      soundManager.playDamage();
    }
  };

  const handleUnlock = (plane: PlaneConfig) => {
    if (onUnlockPlane(plane.id, plane.price)) {
      soundManager.playPowerup();
    } else {
      soundManager.playDamage();
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <button
          onClick={() => {
            soundManager.playClick();
            setGameState('MENU');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar Menu
        </button>

        <h2 className="text-2xl sm:text-3xl font-black text-amber-400">Vliegtuig Hangar</h2>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
          <span className="text-xl">🪙</span>
          <span className="text-lg font-bold text-amber-400 font-mono">{coins}</span>
        </div>
      </div>

      {/* Planes Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {planes.map((plane) => {
          const isSelected = plane.id === activePlaneId;
          return (
            <div
              key={plane.id}
              className={`relative rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div>
                <div
                  className="w-full h-32 rounded-xl flex items-center justify-center text-5xl mb-4 border border-white/10 shadow-inner"
                  style={{ backgroundColor: plane.color }}
                >
                  ✈️
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{plane.name}</h3>
                <p className="text-slate-400 text-xs mb-4 min-h-[36px]">{plane.description}</p>

                {/* Base Stats */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Snelheid</span>
                    <span className="font-bold text-amber-400">{plane.speed}/10</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${plane.speed * 10}%` }} />
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Besturing</span>
                    <span className="font-bold text-blue-400">{plane.handling}/10</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${plane.handling * 10}%` }} />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {plane.unlocked ? (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onSelectPlane(plane.id);
                  }}
                  disabled={isSelected}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 cursor-default'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" /> Geselecteerd
                    </>
                  ) : (
                    'Selecteren'
                  )}
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock(plane)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Lock className="w-4 h-4" /> Ontgrendel ({plane.price} 🪙)
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrades Section for Selected Plane */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Vliegtuig Modificaties & Tuning</h3>
            <p className="text-slate-400 text-xs mt-1">Upgrade je hele vloot met universele verbeteringen.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
            {selectedPlane.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Speed Upgrade */}
          <UpgradeCard
            icon={<Gauge className="w-5 h-5 text-amber-400" />}
            title="Motor Turbo"
            level={upgrades.speedLevel}
            cost={getUpgradeCost(upgrades.speedLevel)}
            onUpgrade={() => handleUpgrade('speedLevel', upgrades.speedLevel)}
            coins={coins}
          />

          {/* Handling Upgrade */}
          <UpgradeCard
            icon={<Zap className="w-5 h-5 text-blue-400" />}
            title="Wendbaarheid"
            level={upgrades.handlingLevel}
            cost={getUpgradeCost(upgrades.handlingLevel)}
            onUpgrade={() => handleUpgrade('handlingLevel', upgrades.handlingLevel)}
            coins={coins}
          />

          {/* Shield Upgrade */}
          <UpgradeCard
            icon={<Shield className="w-5 h-5 text-emerald-400" />}
            title="Romp Schild"
            level={upgrades.shieldLevel}
            cost={getUpgradeCost(upgrades.shieldLevel)}
            onUpgrade={() => handleUpgrade('shieldLevel', upgrades.shieldLevel)}
            coins={coins}
          />

          {/* Magnet Upgrade */}
          <UpgradeCard
            icon={<Magnet className="w-5 h-5 text-purple-400" />}
            title="Magneet Straal"
            level={upgrades.magnetLevel}
            cost={getUpgradeCost(upgrades.magnetLevel)}
            onUpgrade={() => handleUpgrade('magnetLevel', upgrades.magnetLevel)}
            coins={coins}
          />
        </div>
      </div>
    </div>
  );
};

interface UpgradeCardProps {
  icon: React.ReactNode;
  title: string;
  level: number;
  cost: number;
  onUpgrade: () => void;
  coins: number;
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ icon, title, level, cost, onUpgrade, coins }) => {
  const isMax = level >= 5;
  const canAfford = coins >= cost;

  return (
    <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-bold text-sm text-slate-200">{title}</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">Lvl {level}/5</span>
        </div>

        {/* Level Pips */}
        <div className="flex gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i <= level ? 'bg-amber-400' : 'bg-slate-800 border border-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onUpgrade}
        disabled={isMax || !canAfford}
        className={`w-full py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
          isMax
            ? 'bg-slate-800 text-slate-500 cursor-default'
            : canAfford
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
        }`}
      >
        {isMax ? (
          'MAX LEVEL'
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" /> Upgrade ({cost} 🪙)
          </>
        )}
      </button>
    </div>
  );
};
