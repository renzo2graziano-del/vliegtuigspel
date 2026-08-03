import React from 'react';
import { GameState, PlaneConfig, WeatherType } from '../types';
import { Play, Wrench, Trophy, Target, Settings, CloudSun, Moon, CloudRain, Sun } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface MainMenuProps {
  setGameState: (state: GameState) => void;
  activePlane: PlaneConfig;
  coins: number;
  weather: WeatherType;
  setWeather: (weather: WeatherType) => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  setGameState,
  activePlane,
  coins,
  weather,
  setWeather,
  onOpenMissions,
  onOpenLeaderboard,
  soundMuted,
  setSoundMuted,
}) => {
  const handleStart = () => {
    soundManager.playClick();
    setGameState('PLAYING');
  };

  const handleHangar = () => {
    soundManager.playClick();
    setGameState('HANGAR');
  };

  const weatherOptions: { type: WeatherType; label: string; icon: React.ReactNode }[] = [
    { type: 'CLEAR', label: 'Helder', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { type: 'SUNSET', label: 'Zonsondergang', icon: <CloudSun className="w-4 h-4 text-orange-400" /> },
    { type: 'NIGHT', label: 'Nacht', icon: <Moon className="w-4 h-4 text-indigo-300" /> },
    { type: 'RAIN', label: 'Regen', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase">
            ✈️ Antigravity Vliegtuig Spel
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight mt-1">
            Vliegtuig <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Spel</span>
          </h1>
        </div>

        {/* Coins Badge */}
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-inner">
          <span className="text-2xl">🪙</span>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Jouw Munten</div>
            <div className="text-xl font-black text-amber-400 font-mono">{coins}</div>
          </div>
        </div>
      </div>

      {/* Active Plane Card */}
      <div className="relative z-10 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-white/10"
            style={{ backgroundColor: activePlane.color }}
          >
            ✈️
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">Geselecteerd Vliegtuig</div>
            <h3 className="text-2xl font-bold text-white">{activePlane.name}</h3>
            <p className="text-slate-400 text-sm mt-0.5">{activePlane.description}</p>
          </div>
        </div>

        <button
          onClick={handleHangar}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-600 transition-all flex items-center justify-center gap-2"
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          Hangar & Upgrades
        </button>
      </div>

      {/* Weather Selector */}
      <div className="relative z-10 mb-8">
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Kies Weer & Sfeer:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {weatherOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                soundManager.playClick();
                setWeather(opt.type);
              }}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm border transition-all ${
                weather === opt.type
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Play Button */}
        <button
          onClick={handleStart}
          className="sm:col-span-3 py-5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group"
        >
          <Play className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" />
          START TESTVLUCHT
        </button>

        {/* Missions Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenMissions();
          }}
          className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Target className="w-5 h-5 text-emerald-400" />
          Missies
        </button>

        {/* Highscores Button */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenLeaderboard();
          }}
          className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          Highscores
        </button>

        {/* Settings / Sound Button */}
        <button
          onClick={() => {
            const nextMuted = !soundMuted;
            setSoundMuted(nextMuted);
            soundManager.setSoundEnabled(!nextMuted);
          }}
          className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Settings className="w-5 h-5 text-blue-400" />
          Geluid: {soundMuted ? 'Uit' : 'Aan'}
        </button>
      </div>
    </div>
  );
};
