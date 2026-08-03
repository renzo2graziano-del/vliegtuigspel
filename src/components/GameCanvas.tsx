import React, { useEffect, useRef, useState } from 'react';
import { GameState, PlaneConfig, PlaneUpgrade, Obstacle, Collectible, Particle, WeatherType } from '../types';
import { soundManager } from '../utils/sound';
import { Pause, Play, Shield, Zap, Magnet, Fuel, Volume2, VolumeX } from 'lucide-react';

interface GameCanvasProps {
  plane: PlaneConfig;
  upgrades: PlaneUpgrade;
  weather: WeatherType;
  onGameOver: (score: number, distance: number, coins: number) => void;
  onUpdateStats: (distance: number, coins: number, dodged: number, powerups: number) => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  plane,
  upgrades,
  weather,
  onGameOver,
  onUpdateStats,
  gameState,
  setGameState,
  soundMuted,
  setSoundMuted
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game stats state for UI overlay
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [activeShield, setActiveShield] = useState(false);
  const [activeTurbo, setActiveTurbo] = useState(false);
  const [activeMagnet, setActiveMagnet] = useState(false);
  const [doubleCoins, setDoubleCoins] = useState(false);

  // Refs for animation & mutable physics state
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Player state
  const playerRef = useRef({
    x: 100,
    y: 250,
    targetY: 250,
    vy: 0,
    angle: 0,
    width: plane.wingspan,
    height: plane.bodyLength,
    health: 100 + upgrades.shieldLevel * 25,
    maxHealth: 100 + upgrades.shieldLevel * 25,
    shieldTimer: 0,
    turboTimer: 0,
    magnetTimer: 0,
    doubleCoinTimer: 0,
  });

  // Track key presses
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchYRef = useRef<number | null>(null);

  // Game objects refs
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bgCloudsRef = useRef<{ x: number; y: number; scale: number; speed: number }[]>([]);

  // Totals for this run
  const runCoinsRef = useRef(0);
  const runDistanceRef = useRef(0);
  const runDodgedRef = useRef(0);
  const runPowerupsRef = useRef(0);

  // Initialize Background Clouds
  useEffect(() => {
    const clouds = [];
    for (let i = 0; i < 15; i++) {
      clouds.push({
        x: Math.random() * 1200,
        y: Math.random() * 500,
        scale: 0.5 + Math.random() * 1.2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    bgCloudsRef.current = clouds;
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING') setGameState('PAUSED');
        else if (gameState === 'PAUSED') setGameState('PLAYING');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, setGameState]);

  // Touch / Pointer controls
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      touchYRef.current = e.clientY - rect.top;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING' || touchYRef.current === null) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      touchYRef.current = e.clientY - rect.top;
    }
  };

  const handlePointerUp = () => {
    touchYRef.current = null;
  };

  // Reset Game State when starting new flight
  useEffect(() => {
    if (gameState === 'PLAYING') {
      playerRef.current = {
        x: 120,
        y: 250,
        targetY: 250,
        vy: 0,
        angle: 0,
        width: plane.wingspan,
        height: plane.bodyLength,
        health: 100 + upgrades.shieldLevel * 25,
        maxHealth: 100 + upgrades.shieldLevel * 25,
        shieldTimer: 0,
        turboTimer: 0,
        magnetTimer: 0,
        doubleCoinTimer: 0,
      };
      obstaclesRef.current = [];
      collectiblesRef.current = [];
      particlesRef.current = [];
      runCoinsRef.current = 0;
      runDistanceRef.current = 0;
      runDodgedRef.current = 0;
      runPowerupsRef.current = 0;
      setFuel(100);
      setScore(0);
      setDistance(0);
      setCoins(0);
      soundManager.startEngine();
    } else {
      soundManager.stopEngine();
    }
  }, [gameState, plane, upgrades]);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let obstacleSpawnTimer = 0;
    let collectibleSpawnTimer = 0;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      const p = playerRef.current;

      if (gameState === 'PLAYING') {
        // --- 1. UPDATE LOGIC ---
        const baseSpeed = (plane.speed + upgrades.speedLevel) * 0.8 + 4;
        const currentSpeed = p.turboTimer > 0 ? baseSpeed * 1.8 : baseSpeed;

        // Sound engine pitch
        soundManager.updateEnginePitch(currentSpeed / 12, p.turboTimer > 0);

        // Distance & Fuel updates
        runDistanceRef.current += currentSpeed * deltaTime * 5;
        const distMeters = Math.floor(runDistanceRef.current);
        setDistance(distMeters);

        // Deplete fuel slowly
        setFuel((prevFuel) => {
          const fuelLoss = (p.turboTimer > 0 ? 3.5 : 1.5) * deltaTime;
          const nextFuel = Math.max(0, prevFuel - fuelLoss);
          if (nextFuel <= 0 && p.health > 0) {
            // Out of fuel crash
            p.health = 0;
          }
          return nextFuel;
        });

        // Timers update
        if (p.shieldTimer > 0) p.shieldTimer -= deltaTime;
        if (p.turboTimer > 0) p.turboTimer -= deltaTime;
        if (p.magnetTimer > 0) p.magnetTimer -= deltaTime;
        if (p.doubleCoinTimer > 0) p.doubleCoinTimer -= deltaTime;

        setActiveShield(p.shieldTimer > 0);
        setActiveTurbo(p.turboTimer > 0);
        setActiveMagnet(p.magnetTimer > 0);
        setDoubleCoins(p.doubleCoinTimer > 0);

        // Controls input processing (Handling factor)
        const handlingSpeed = (plane.handling + upgrades.handlingLevel) * 350 * deltaTime;

        if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
          p.targetY -= handlingSpeed;
        }
        if (keysRef.current['ArrowDown'] || keysRef.current['KeyS']) {
          p.targetY += handlingSpeed;
        }

        // Pointer/touch tracking
        if (touchYRef.current !== null) {
          const diffY = touchYRef.current - p.y;
          p.targetY += Math.sign(diffY) * Math.min(Math.abs(diffY), handlingSpeed * 1.5);
        }

        // Keep player in canvas bounds
        p.targetY = Math.max(40, Math.min(canvas.height - 40, p.targetY));

        // Smooth Y movement & tilting angle
        const dy = p.targetY - p.y;
        p.vy = dy * 6 * deltaTime;
        p.y += p.vy;
        p.angle = Math.max(-0.4, Math.min(0.4, p.vy * 0.05));

        // Smoke particles behind plane
        if (Math.random() < 0.6) {
          particlesRef.current.push({
            x: p.x - p.width / 2,
            y: p.y + (Math.random() - 0.5) * 8,
            vx: -currentSpeed * 2 - Math.random() * 2,
            vy: (Math.random() - 0.5) * 1.5,
            size: p.turboTimer > 0 ? 6 + Math.random() * 4 : 3 + Math.random() * 3,
            color: p.turboTimer > 0 ? '#3B82F6' : '#9CA3AF',
            life: 0,
            maxLife: p.turboTimer > 0 ? 0.3 : 0.6,
            alpha: 0.7,
            type: p.turboTimer > 0 ? 'FIRE' : 'SMOKE'
          });
        }

        // --- 2. SPAWN OBSTACLES & COLLECTIBLES ---
        obstacleSpawnTimer += deltaTime;
        if (obstacleSpawnTimer > Math.max(0.7, 2.2 - currentSpeed * 0.1)) {
          obstacleSpawnTimer = 0;
          const obsTypes: Obstacle['type'][] = ['CLOUD', 'BALLOON', 'BIRD', 'STORM', 'RIVAL_PLANE'];
          const chosenType = obsTypes[Math.floor(Math.random() * obsTypes.length)];

          let obsWidth = 40;
          let obsHeight = 40;
          let obsSpeed = currentSpeed + (Math.random() * 2);

          if (chosenType === 'CLOUD') { obsWidth = 70; obsHeight = 45; }
          else if (chosenType === 'STORM') { obsWidth = 85; obsHeight = 55; }
          else if (chosenType === 'BALLOON') { obsWidth = 35; obsHeight = 50; }
          else if (chosenType === 'RIVAL_PLANE') { obsWidth = 45; obsHeight = 25; obsSpeed = currentSpeed + 4; }

          obstaclesRef.current.push({
            id: Math.random().toString(),
            x: canvas.width + 50,
            y: Math.random() * (canvas.height - 120) + 60,
            width: obsWidth,
            height: obsHeight,
            vx: -obsSpeed,
            vy: (Math.random() - 0.5) * 0.8,
            type: chosenType,
            damage: chosenType === 'STORM' ? 35 : chosenType === 'RIVAL_PLANE' ? 30 : 20,
            rotation: 0,
            rotSpeed: (Math.random() - 0.5) * 0.05
          });
        }

        collectibleSpawnTimer += deltaTime;
        if (collectibleSpawnTimer > 1.2) {
          collectibleSpawnTimer = 0;
          const rand = Math.random();
          let itemType: Collectible['type'] = 'COIN';

          if (rand < 0.65) itemType = 'COIN';
          else if (rand < 0.75) itemType = 'FUEL';
          else if (rand < 0.84) itemType = 'SHIELD';
          else if (rand < 0.91) itemType = 'TURBO';
          else if (rand < 0.96) itemType = 'MAGNET';
          else itemType = 'DOUBLE_COIN';

          collectiblesRef.current.push({
            id: Math.random().toString(),
            x: canvas.width + 30,
            y: Math.random() * (canvas.height - 100) + 50,
            width: 24,
            height: 24,
            vx: -currentSpeed * 0.9,
            vy: 0,
            type: itemType,
            value: itemType === 'COIN' ? 1 : 0
          });
        }

        // --- 3. MOVE & COLLISION: OBSTACLES ---
        obstaclesRef.current.forEach((obs) => {
          obs.x += obs.vx;
          obs.y += obs.vy;
          if (obs.rotation !== undefined && obs.rotSpeed) obs.rotation += obs.rotSpeed;

          // Check if dodged past player
          if (obs.x + obs.width < p.x && !obs.id.includes('dodged')) {
            obs.id += '_dodged';
            runDodgedRef.current += 1;
          }

          // AABB Collision check
          const px = p.x - p.width / 2;
          const py = p.y - p.height / 2;
          if (
            px < obs.x + obs.width &&
            px + p.width > obs.x &&
            py < obs.y + obs.height &&
            py + p.height > obs.y
          ) {
            // Collision occurred!
            if (p.shieldTimer > 0) {
              soundManager.playShieldBlock();
              p.shieldTimer = 0; // Consume shield
              // Add explosion sparks
              for (let i = 0; i < 12; i++) {
                particlesRef.current.push({
                  x: obs.x + obs.width / 2,
                  y: obs.y + obs.height / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  size: 4 + Math.random() * 4,
                  color: '#60A5FA',
                  life: 0,
                  maxLife: 0.4,
                  alpha: 1,
                  type: 'SPARK'
                });
              }
            } else {
              soundManager.playDamage();
              p.health -= obs.damage;
              for (let i = 0; i < 15; i++) {
                particlesRef.current.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  size: 3 + Math.random() * 5,
                  color: '#EF4444',
                  life: 0,
                  maxLife: 0.5,
                  alpha: 1,
                  type: 'FIRE'
                });
              }
            }
            // Remove obstacle on hit
            obs.x = -999;
          }
        });

        // Filter out offscreen obstacles
        obstaclesRef.current = obstaclesRef.current.filter((obs) => obs.x > -100);

        // --- 4. MOVE & COLLISION: COLLECTIBLES ---
        collectiblesRef.current.forEach((item) => {
          // Magnet attraction effect
          const magnetEffective = p.magnetTimer > 0 || (plane.id === 'stealth' || plane.id === 'ufo');
          const magnetRadius = magnetEffective ? plane.magnetRadius * (1 + upgrades.magnetLevel * 0.2) + 100 : 0;

          const dx = p.x - item.x;
          const dy = p.y - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (magnetEffective && dist < magnetRadius) {
            const pullForce = (1 - dist / magnetRadius) * 12;
            item.x += (dx / dist) * pullForce;
            item.y += (dy / dist) * pullForce;
          } else {
            item.x += item.vx;
          }

          // Collision check
          if (dist < 32) {
            // Collect item
            if (item.type === 'COIN') {
              soundManager.playCoin();
              const earnedCoins = p.doubleCoinTimer > 0 ? 2 : 1;
              runCoinsRef.current += earnedCoins;
              setCoins(runCoinsRef.current);
            } else if (item.type === 'FUEL') {
              soundManager.playPowerup();
              setFuel((f) => Math.min(100, f + 35));
              runPowerupsRef.current += 1;
            } else if (item.type === 'SHIELD') {
              soundManager.playPowerup();
              p.shieldTimer = 8 + upgrades.shieldLevel * 2;
              runPowerupsRef.current += 1;
            } else if (item.type === 'TURBO') {
              soundManager.playPowerup();
              p.turboTimer = 5;
              runPowerupsRef.current += 1;
            } else if (item.type === 'MAGNET') {
              soundManager.playPowerup();
              p.magnetTimer = 8;
              runPowerupsRef.current += 1;
            } else if (item.type === 'DOUBLE_COIN') {
              soundManager.playPowerup();
              p.doubleCoinTimer = 10;
              runPowerupsRef.current += 1;
            }

            // Particle sparkles
            for (let i = 0; i < 8; i++) {
              particlesRef.current.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: 3 + Math.random() * 3,
                color: item.type === 'COIN' ? '#F59E0B' : '#10B981',
                life: 0,
                maxLife: 0.3,
                alpha: 1,
                type: 'SPARK'
              });
            }

            item.x = -999; // Remove
          }
        });

        collectiblesRef.current = collectiblesRef.current.filter((item) => item.x > -50);

        // Calculate score
        const totalScore = Math.floor(distMeters + runCoinsRef.current * 10);
        setScore(totalScore);

        // --- Check Game Over ---
        if (p.health <= 0) {
          soundManager.playExplosion();
          onUpdateStats(
            distMeters,
            runCoinsRef.current,
            runDodgedRef.current,
            runPowerupsRef.current
          );
          onGameOver(totalScore, distMeters, runCoinsRef.current);
          setGameState('GAMEOVER');
        }
      }

      // --- 5. RENDER GAME CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Sky Background based on Weather
      drawBackground(ctx, canvas.width, canvas.height, weather, bgCloudsRef.current);

      // Draw Collectibles
      collectiblesRef.current.forEach((item) => {
        drawCollectible(ctx, item);
      });

      // Draw Obstacles
      obstaclesRef.current.forEach((obs) => {
        drawObstacle(ctx, obs);
      });

      // Draw Particles
      particlesRef.current.forEach((pt) => {
        pt.life += deltaTime;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha = 1 - pt.life / pt.maxLife;

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter((pt) => pt.life < pt.maxLife);

      // Draw Player Plane
      if (p.health > 0) {
        drawPlane(ctx, p.x, p.y, p.angle, plane, p.shieldTimer > 0, p.turboTimer > 0);
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, plane, upgrades, weather, onGameOver, onUpdateStats]);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 select-none">
      {/* HUD Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between text-white">
        {/* Score & Distance */}
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{score}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Afstand</div>
            <div className="text-xl font-bold font-mono">{distance} m</div>
          </div>
          <div className="flex items-center space-x-1.5 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
            <span className="text-amber-400 text-lg">🪙</span>
            <span className="text-lg font-bold text-amber-300 font-mono">{coins}</span>
          </div>
        </div>

        {/* Active Powerups Indicators */}
        <div className="hidden sm:flex items-center space-x-2">
          {activeShield && (
            <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>Schild</span>
            </div>
          )}
          {activeTurbo && (
            <div className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
              <Zap className="w-3.5 h-3.5" />
              <span>Turbo Boost</span>
            </div>
          )}
          {activeMagnet && (
            <div className="flex items-center space-x-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
              <Magnet className="w-3.5 h-3.5" />
              <span>Magneet</span>
            </div>
          )}
          {doubleCoins && (
            <div className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-semibold animate-pulse">
              <span>2x Munten</span>
            </div>
          )}
        </div>

        {/* Control buttons & Sound */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const muted = !soundMuted;
              setSoundMuted(muted);
              soundManager.setSoundEnabled(!muted);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={soundMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {gameState === 'PLAYING' && (
            <button
              onClick={() => setGameState('PAUSED')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Pauzeren (Esc)"
            >
              <Pause className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Fuel Gauge Bar */}
      <div className="absolute top-[68px] left-0 right-0 z-10 px-6">
        <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-slate-700/60 flex items-center p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              fuel > 40
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : fuel > 20
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
            }`}
            style={{ width: `${fuel}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-1 px-1">
          <span className="flex items-center gap-1">
            <Fuel className="w-3 h-3 text-amber-400" /> Brandstof Meter
          </span>
          <span>{Math.round(fuel)}%</span>
        </div>
      </div>

      {/* Main Game Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-[540px] block cursor-pointer touch-none"
      />

      {/* Pause Menu Overlay */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-3xl font-extrabold text-amber-400 mb-2">Spel Gepauzeerd</h2>
            <p className="text-slate-400 text-sm mb-6">Neem even rust! Druk op hervatten om verder te vliegen.</p>

            <div className="space-y-3">
              <button
                onClick={() => setGameState('PLAYING')}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" /> Hervatten
              </button>
              <button
                onClick={() => setGameState('MENU')}
                className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors"
              >
                Hoofdmenu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- RENDER HELPERS ---

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather: WeatherType,
  clouds: { x: number; y: number; scale: number; speed: number }[]
) {
  // Gradient Sky
  const grad = ctx.createLinearGradient(0, 0, 0, height);

  if (weather === 'SUNSET') {
    grad.addColorStop(0, '#1E1B4B');
    grad.addColorStop(0.4, '#831843');
    grad.addColorStop(0.8, '#F97316');
    grad.addColorStop(1, '#FEF08A');
  } else if (weather === 'NIGHT') {
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.7, '#0F172A');
    grad.addColorStop(1, '#1E293B');
  } else if (weather === 'RAIN' || weather === 'CLOUDY') {
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.6, '#475569');
    grad.addColorStop(1, '#64748B');
  } else {
    // CLEAR
    grad.addColorStop(0, '#0284C7');
    grad.addColorStop(0.5, '#38BDF8');
    grad.addColorStop(1, '#BAE6FD');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Background Clouds
  clouds.forEach((cloud) => {
    cloud.x -= cloud.speed;
    if (cloud.x < -150) cloud.x = width + 100;

    ctx.save();
    ctx.fillStyle = weather === 'NIGHT' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, 25 * cloud.scale, 0, Math.PI * 2);
    ctx.arc(cloud.x + 20 * cloud.scale, cloud.y - 10 * cloud.scale, 30 * cloud.scale, 0, Math.PI * 2);
    ctx.arc(cloud.x + 45 * cloud.scale, cloud.y, 22 * cloud.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  plane: PlaneConfig,
  shielded: boolean,
  turbo: boolean
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Shield aura
  if (shielded) {
    ctx.beginPath();
    ctx.arc(0, 0, plane.wingspan * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
  }

  // Turbo flames behind
  if (turbo) {
    ctx.beginPath();
    ctx.moveTo(-plane.bodyLength / 2, -6);
    ctx.lineTo(-plane.bodyLength / 2 - 25, 0);
    ctx.lineTo(-plane.bodyLength / 2, 6);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
  }

  // Fuselage (Body)
  ctx.beginPath();
  ctx.ellipse(0, 0, plane.bodyLength / 2, 9, 0, 0, Math.PI * 2);
  ctx.fillStyle = plane.color;
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Wings
  ctx.beginPath();
  ctx.moveTo(-6, -plane.wingspan / 2);
  ctx.lineTo(8, 0);
  ctx.lineTo(-6, plane.wingspan / 2);
  ctx.closePath();
  ctx.fillStyle = plane.secondaryColor;
  ctx.fill();
  ctx.stroke();

  // Cockpit / Canopy
  ctx.beginPath();
  ctx.ellipse(6, -2, 8, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E0F2FE';
  ctx.fill();

  // Tail Fin
  ctx.beginPath();
  ctx.moveTo(-plane.bodyLength / 2 + 4, 0);
  ctx.lineTo(-plane.bodyLength / 2 - 4, -14);
  ctx.lineTo(-plane.bodyLength / 2 + 8, 0);
  ctx.closePath();
  ctx.fillStyle = plane.accentColor;
  ctx.fill();

  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.save();
  ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
  if (obs.rotation) ctx.rotate(obs.rotation);

  if (obs.type === 'CLOUD' || obs.type === 'STORM') {
    const isStorm = obs.type === 'STORM';
    ctx.fillStyle = isStorm ? '#334155' : '#F1F5F9';
    ctx.beginPath();
    ctx.arc(-10, 0, obs.height / 2, 0, Math.PI * 2);
    ctx.arc(10, -5, obs.height / 1.8, 0, Math.PI * 2);
    ctx.arc(15, 5, obs.height / 2.2, 0, Math.PI * 2);
    ctx.fill();
    if (isStorm) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  } else if (obs.type === 'BALLOON') {
    // Hot Air Balloon
    ctx.beginPath();
    ctx.arc(0, -10, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-6, 12, 12, 10);
  } else if (obs.type === 'BIRD') {
    // Flying Bird
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.quadraticCurveTo(-5, -12, 0, 0);
    ctx.quadraticCurveTo(5, -12, 15, 0);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (obs.type === 'RIVAL_PLANE') {
    // Enemy plane coming leftwards
    ctx.beginPath();
    ctx.ellipse(0, 0, obs.width / 2, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
  }

  ctx.restore();
}

function drawCollectible(ctx: CanvasRenderingContext2D, item: Collectible) {
  ctx.save();
  ctx.translate(item.x + item.width / 2, item.y + item.height / 2);

  if (item.type === 'COIN') {
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('€', 0, 1);
  } else if (item.type === 'FUEL') {
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-8, -10, 16, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F', 0, 3);
  } else if (item.type === 'SHIELD') {
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#3B82F6';
    ctx.fill();
    ctx.strokeStyle = '#93C5FD';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (item.type === 'TURBO') {
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#10B981';
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#8B5CF6';
    ctx.fill();
  }

  ctx.restore();
}
