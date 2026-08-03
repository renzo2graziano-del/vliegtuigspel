import { useState, useEffect } from 'react';
import { GameState, PlaneConfig, PlaneUpgrade, WeatherType, Mission, Achievement, HighScore, FlightStats } from './types';
import { INITIAL_PLANES, INITIAL_MISSIONS, INITIAL_ACHIEVEMENTS, INITIAL_HIGH_SCORES, INITIAL_STATS } from './data/gameData';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { Hangar } from './components/Hangar';
import { MissionsModal } from './components/MissionsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [weather, setWeather] = useState<WeatherType>('CLEAR');
  const [soundMuted, setSoundMuted] = useState(false);

  // Persistent user progress stored in LocalStorage
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('vg_coins');
    return saved !== null ? JSON.parse(saved) : 150;
  });

  const [planes, setPlanes] = useState<PlaneConfig[]>(() => {
    const saved = localStorage.getItem('vg_planes');
    return saved !== null ? JSON.parse(saved) : INITIAL_PLANES;
  });

  const [activePlaneId, setActivePlaneId] = useState<string>(() => {
    const saved = localStorage.getItem('vg_activePlane');
    return saved !== null ? JSON.parse(saved) : 'propeller';
  });

  const [upgrades, setUpgrades] = useState<PlaneUpgrade>(() => {
    const saved = localStorage.getItem('vg_upgrades');
    return saved !== null ? JSON.parse(saved) : { speedLevel: 0, handlingLevel: 0, shieldLevel: 0, magnetLevel: 0 };
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('vg_missions');
    return saved !== null ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('vg_achievements');
    return saved !== null ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    const saved = localStorage.getItem('vg_highscores');
    return saved !== null ? JSON.parse(saved) : INITIAL_HIGH_SCORES;
  });

  const [stats, setStats] = useState<FlightStats>(() => {
    const saved = localStorage.getItem('vg_stats');
    return saved !== null ? JSON.parse(saved) : INITIAL_STATS;
  });

  // Modal Visibility
  const [showMissions, setShowMissions] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Game over temporary run result
  const [lastRun, setLastRun] = useState<{ score: number; distance: number; coins: number } | null>(null);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('vg_coins', JSON.stringify(coins)); }, [coins]);
  useEffect(() => { localStorage.setItem('vg_planes', JSON.stringify(planes)); }, [planes]);
  useEffect(() => { localStorage.setItem('vg_activePlane', JSON.stringify(activePlaneId)); }, [activePlaneId]);
  useEffect(() => { localStorage.setItem('vg_upgrades', JSON.stringify(upgrades)); }, [upgrades]);
  useEffect(() => { localStorage.setItem('vg_missions', JSON.stringify(missions)); }, [missions]);
  useEffect(() => { localStorage.setItem('vg_achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('vg_highscores', JSON.stringify(highScores)); }, [highScores]);
  useEffect(() => { localStorage.setItem('vg_stats', JSON.stringify(stats)); }, [stats]);

  const activePlane = planes.find((p) => p.id === activePlaneId) || planes[0];

  // Actions
  const handleSelectPlane = (id: string) => {
    setActivePlaneId(id);
  };

  const handleUnlockPlane = (id: string, price: number): boolean => {
    if (coins >= price) {
      setCoins((c) => c - price);
      setPlanes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, unlocked: true } : p))
      );
      setActivePlaneId(id);
      return true;
    }
    return false;
  };

  const handleUpgradeStat = (stat: keyof PlaneUpgrade, cost: number): boolean => {
    if (coins >= cost) {
      setCoins((c) => c - cost);
      setUpgrades((prev) => ({ ...prev, [stat]: prev[stat] + 1 }));
      return true;
    }
    return false;
  };

  const handleClaimReward = (missionId: string, rewardCoins: number) => {
    setCoins((c) => c + rewardCoins);
    setMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );
  };

  const handleUpdateStats = (dist: number, earnedCoins: number, dodged: number, powerups: number) => {
    setCoins((c) => c + earnedCoins);

    setStats((prev) => {
      const nextStats = {
        totalFlights: prev.totalFlights + 1,
        totalDistance: prev.totalDistance + dist,
        totalCoins: prev.totalCoins + earnedCoins,
        highestScore: Math.max(prev.highestScore, dist + earnedCoins * 10),
        obstaclesDodged: prev.obstaclesDodged + dodged,
        powerupsCollected: prev.powerupsCollected + powerups,
      };

      // Update missions progress
      setMissions((prevMissions) =>
        prevMissions.map((m) => {
          if (m.completed) return m;
          let added = 0;
          if (m.type === 'DISTANCE') added = dist;
          else if (m.type === 'COINS') added = earnedCoins;
          else if (m.type === 'DODGE') added = dodged;
          else if (m.type === 'POWERUPS') added = powerups;

          return { ...m, currentCount: m.currentCount + added };
        })
      );

      // Check achievements
      setAchievements((prevAch) =>
        prevAch.map((a) => {
          if (a.unlocked) return a;
          if (a.id === 'a1') return { ...a, unlocked: true };
          if (a.id === 'a2' && nextStats.totalCoins >= 100) return { ...a, unlocked: true };
          if (a.id === 'a3' && nextStats.highestScore >= 1000) return { ...a, unlocked: true };
          return a;
        })
      );

      return nextStats;
    });
  };

  const handleGameOver = (score: number, distance: number, earnedCoins: number) => {
    setLastRun({ score, distance, coins: earnedCoins });
  };

  const handleSaveScore = (playerName: string) => {
    if (!lastRun) return;
    const newEntry: HighScore = {
      id: Math.random().toString(),
      playerName,
      score: lastRun.score,
      distance: lastRun.distance,
      coins: lastRun.coins,
      planeName: activePlane.name,
      date: new Date().toISOString().split('T')[0],
    };
    setHighScores((prev) => [...prev, newEntry]);
  };

  const isHighScore = lastRun ? highScores.every((hs) => lastRun.score > hs.score) || highScores.length < 5 : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-amber-500 selection:text-slate-950">
      <main className="w-full max-w-6xl">
        {gameState === 'MENU' && (
          <MainMenu
            setGameState={setGameState}
            activePlane={activePlane}
            coins={coins}
            weather={weather}
            setWeather={setWeather}
            onOpenMissions={() => setShowMissions(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            soundMuted={soundMuted}
            setSoundMuted={setSoundMuted}
          />
        )}

        {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
          <GameCanvas
            plane={activePlane}
            upgrades={upgrades}
            weather={weather}
            onGameOver={handleGameOver}
            onUpdateStats={handleUpdateStats}
            gameState={gameState}
            setGameState={setGameState}
            soundMuted={soundMuted}
            setSoundMuted={setSoundMuted}
          />
        )}

        {gameState === 'HANGAR' && (
          <Hangar
            planes={planes}
            activePlaneId={activePlaneId}
            onSelectPlane={handleSelectPlane}
            onUnlockPlane={handleUnlockPlane}
            upgrades={upgrades}
            onUpgradeStat={handleUpgradeStat}
            coins={coins}
            setGameState={setGameState}
          />
        )}

        {gameState === 'GAMEOVER' && lastRun && (
          <GameOverModal
            score={lastRun.score}
            distance={lastRun.distance}
            coins={lastRun.coins}
            planeName={activePlane.name}
            onRestart={() => setGameState('PLAYING')}
            onHome={() => setGameState('MENU')}
            onSaveScore={handleSaveScore}
            isHighScore={isHighScore}
          />
        )}

        {/* Modals */}
        {showMissions && (
          <MissionsModal
            missions={missions}
            achievements={achievements}
            onClaimReward={handleClaimReward}
            onClose={() => setShowMissions(false)}
          />
        )}

        {showLeaderboard && (
          <LeaderboardModal
            highScores={highScores}
            stats={stats}
            onClose={() => setShowLeaderboard(false)}
          />
        )}
      </main>
    </div>
  );
}
