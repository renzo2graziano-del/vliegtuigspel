import { PlaneConfig, Mission, Achievement, HighScore, FlightStats } from '../types';

export const INITIAL_PLANES: PlaneConfig[] = [
  {
    id: 'propeller',
    name: 'Klassieke Propeller',
    description: 'De betrouwbare starter. Wendbaar, gebalanceerd en perfect voor beginner piloten.',
    price: 0,
    unlocked: true,
    speed: 5,
    handling: 6,
    durability: 5,
    magnetRadius: 80,
    color: '#EF4444', // Red
    secondaryColor: '#FFFFFF',
    accentColor: '#F59E0B',
    wingspan: 36,
    bodyLength: 42,
    specialSkill: 'Gebalanceerde besturing'
  },
  {
    id: 'jet',
    name: 'Sky Rocket Jet',
    description: 'Supersnelle Straaljager. Uitstekend om snel grote afstanden af te leggen!',
    price: 250,
    unlocked: false,
    speed: 9,
    handling: 7,
    durability: 4,
    magnetRadius: 90,
    color: '#3B82F6', // Blue
    secondaryColor: '#1E40AF',
    accentColor: '#60A5FA',
    wingspan: 32,
    bodyLength: 48,
    specialSkill: '+20% Extra Snelheidsbonus'
  },
  {
    id: 'biplane',
    name: 'Gouden Dubbeldekker',
    description: 'Een klassieke houten dubbeldekker. Vliegt extra stabiel en vangt eenvoudig brandstof op.',
    price: 500,
    unlocked: false,
    speed: 4,
    handling: 9,
    durability: 7,
    magnetRadius: 110,
    color: '#F59E0B', // Amber
    secondaryColor: '#78350F',
    accentColor: '#FEF08A',
    wingspan: 44,
    bodyLength: 40,
    specialSkill: 'Magneet + Extra Schild Tijd'
  },
  {
    id: 'stealth',
    name: 'Schaduw Stealth',
    description: 'Een futuristisch stealth vliegtuig dat soepel door zware stormwolken snijdt.',
    price: 1000,
    unlocked: false,
    speed: 8,
    handling: 8,
    durability: 8,
    magnetRadius: 140,
    color: '#1F2937', // Dark Gray
    secondaryColor: '#111827',
    accentColor: '#10B981',
    wingspan: 38,
    bodyLength: 46,
    specialSkill: 'Sterke Krachtmagneet'
  },
  {
    id: 'ufo',
    name: 'Aero-Future 3000',
    description: 'Een geavanceerd conceptvliegtuig met zwaartekracht-Aandrijving.',
    price: 2000,
    unlocked: false,
    speed: 10,
    handling: 10,
    durability: 10,
    magnetRadius: 180,
    color: '#8B5CF6', // Purple
    secondaryColor: '#4C1D95',
    accentColor: '#EC4899',
    wingspan: 40,
    bodyLength: 40,
    specialSkill: 'Dubbele Punten & Schild'
  }
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Eerste Opstijging',
    description: 'Vlieg een totale afstand van minstens 300 meter.',
    targetCount: 300,
    currentCount: 0,
    rewardCoins: 50,
    completed: false,
    type: 'DISTANCE'
  },
  {
    id: 'm2',
    title: 'Goudzoeker',
    description: 'Verzamel in totaal 25 gouden munten.',
    targetCount: 25,
    currentCount: 0,
    rewardCoins: 75,
    completed: false,
    type: 'COINS'
  },
  {
    id: 'm3',
    title: 'Wolkendanser',
    description: 'Ontwijk 15 obstakels (wolken, ballonnen of vogels).',
    targetCount: 15,
    currentCount: 0,
    rewardCoins: 100,
    completed: false,
    type: 'DODGE'
  },
  {
    id: 'm4',
    title: 'Power-up Jager',
    description: 'Pak 5 power-ups op tijdens je vluchten.',
    targetCount: 5,
    currentCount: 0,
    rewardCoins: 120,
    completed: false,
    type: 'POWERUPS'
  },
  {
    id: 'm5',
    title: 'Luchtacrobaat',
    description: 'Bereik een afstand van 1000 meter in één enkele vlucht.',
    targetCount: 1000,
    currentCount: 0,
    rewardCoins: 250,
    completed: false,
    type: 'DISTANCE'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: 'Eerste Vlucht',
    description: 'Maak je allereerste testvlucht.',
    iconName: 'Plane',
    unlocked: false
  },
  {
    id: 'a2',
    title: 'Muntverzamelaar',
    description: 'Verzamel meer dan 100 munten in totaal.',
    iconName: 'Coins',
    unlocked: false
  },
  {
    id: 'a3',
    title: 'Luchtheld',
    description: 'Bereik een score van meer dan 1.000 punten.',
    iconName: 'Trophy',
    unlocked: false
  },
  {
    id: 'a4',
    title: 'Onbreekbaar',
    description: 'Vang een schild op en overleef een botsing.',
    iconName: 'Shield',
    unlocked: false
  },
  {
    id: 'a5',
    title: 'Vloot Eigenaar',
    description: 'Ontgrendel minstens 3 verschillende vliegtuigen.',
    iconName: 'Award',
    unlocked: false
  }
];

export const INITIAL_HIGH_SCORES: HighScore[] = [
  {
    id: 'hs1',
    playerName: 'Kapitein Lucas',
    score: 1850,
    distance: 1420,
    coins: 43,
    planeName: 'Sky Rocket Jet',
    date: '2026-08-01'
  },
  {
    id: 'hs2',
    playerName: 'Sanne Sky',
    score: 1420,
    distance: 1100,
    coins: 32,
    planeName: 'Klassieke Propeller',
    date: '2026-08-01'
  },
  {
    id: 'hs3',
    playerName: 'Pilot Milan',
    score: 980,
    distance: 820,
    coins: 16,
    planeName: 'Gouden Dubbeldekker',
    date: '2026-08-02'
  }
];

export const INITIAL_STATS: FlightStats = {
  totalFlights: 0,
  totalDistance: 0,
  totalCoins: 0,
  highestScore: 0,
  obstaclesDodged: 0,
  powerupsCollected: 0
};
