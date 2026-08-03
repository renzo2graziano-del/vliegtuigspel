export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'HANGAR' | 'MISSIONS' | 'LEADERBOARD';

export type WeatherType = 'CLEAR' | 'CLOUDY' | 'SUNSET' | 'NIGHT' | 'RAIN';

export interface PlaneConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  unlocked: boolean;
  speed: number;        // 1 to 10
  handling: number;     // 1 to 10
  durability: number;   // 1 to 10
  magnetRadius: number; // in pixels
  color: string;
  secondaryColor: string;
  accentColor: string;
  wingspan: number;
  bodyLength: number;
  specialSkill: string;
}

export interface PlaneUpgrade {
  speedLevel: number;
  handlingLevel: number;
  shieldLevel: number;
  magnetLevel: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
  type?: 'SMOKE' | 'FIRE' | 'SPARK' | 'CLOUD' | 'RAIN' | 'STAR';
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
}

export interface Obstacle extends GameObject {
  type: 'CLOUD' | 'STORM' | 'BALLOON' | 'BIRD' | 'RIVAL_PLANE' | 'BLIMP' | 'MOUNTAIN_PEAK';
  damage: number;
  rotation?: number;
  rotSpeed?: number;
}

export interface Collectible extends GameObject {
  type: 'COIN' | 'SHIELD' | 'TURBO' | 'MAGNET' | 'FUEL' | 'DOUBLE_COIN';
  value?: number;
  rotation?: number;
  pulse?: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  rewardCoins: number;
  completed: boolean;
  type: 'DISTANCE' | 'COINS' | 'DODGE' | 'POWERUPS' | 'SPEED';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  distance: number;
  coins: number;
  planeName: string;
  date: string;
}

export interface FlightStats {
  totalFlights: number;
  totalDistance: number;
  totalCoins: number;
  highestScore: number;
  obstaclesDodged: number;
  powerupsCollected: number;
}
