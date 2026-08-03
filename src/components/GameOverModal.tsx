import React, { useState } from 'react';
import { soundManager } from '../utils/sound';
import { RotateCcw, Home, Trophy } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  distance: number;
  coins: number;
  planeName: string;
  onRestart: () => void;
  onHome: () => void;
  onSaveScore: (playerName: string) => void;
  isHighScore: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  distance,
  coins,
  planeName,
  onRestart,
  onHome,
  onSaveScore,
  isHighScore,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    soundManager.playCoin();
    onSaveScore(playerName.trim());
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-white text-center relative animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-3xl mx-auto mb-4">
          💥
        </div>

        <h2 className="text-3xl font-black text-white mb-1">Vlucht Geëindigd!</h2>
        <p className="text-slate-400 text-sm mb-6">Je vliegtuig heeft het einde van deze testvlucht bereikt.</p>

        {/* Flight Stats Breakdown */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Totale Afstand:</span>
            <span className="font-bold font-mono text-white">{distance} meter</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Munten Verzameld:</span>
            <span className="font-bold font-mono text-amber-400">+{coins} 🪙</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Gebruikt Vliegtuig:</span>
            <span className="font-semibold text-slate-200">{planeName}</span>
          </div>

          <div className="pt-3 border-t border-slate-700/60 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-300">Eind Score:</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{score}</span>
          </div>
        </div>

        {/* High Score Save Prompt */}
        {isHighScore && !saved && (
          <form onSubmit={handleSave} className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <Trophy className="w-4 h-4" /> Nieuwe Highscore Behaald!
            </div>
            <p className="text-slate-300 text-xs mb-3">Vul je naam in voor de erelijst:</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Jouw Naam"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                Opslaan
              </button>
            </div>
          </form>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Opnieuw Vliegen
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onHome();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" /> Hoofdmenu
          </button>
        </div>
      </div>
    </div>
  );
};
