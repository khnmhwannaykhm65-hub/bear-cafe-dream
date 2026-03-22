// Building types and game constants

export type BuildingType = 'cafe' | 'bakery' | 'house' | 'park' | 'tree' | 'shop' | 'fountain';

export interface BuildingDef {
  type: BuildingType;
  name: string;
  nameTh: string;
  icon: string;
  baseIncome: number;
  cost: number;
  description: string;
  maxLevel: number;
  hasShop: boolean;
}

export const BUILDINGS: Record<BuildingType, BuildingDef> = {
  cafe: { type: 'cafe', name: 'Café', nameTh: 'คาเฟ่', icon: '☕', baseIncome: 50, cost: 200, description: 'ร้านกาแฟสุดชิค', maxLevel: 5, hasShop: true },
  bakery: { type: 'bakery', name: 'Bakery', nameTh: 'เบเกอรี่', icon: '🧁', baseIncome: 40, cost: 180, description: 'ร้านขนมหอมอร่อย', maxLevel: 5, hasShop: true },
  house: { type: 'house', name: 'House', nameTh: 'บ้าน', icon: '🏠', baseIncome: 20, cost: 100, description: 'บ้านพักอาศัย', maxLevel: 3, hasShop: false },
  park: { type: 'park', name: 'Park', nameTh: 'สวนสาธารณะ', icon: '🌳', baseIncome: 10, cost: 80, description: 'สวนพักผ่อน', maxLevel: 3, hasShop: false },
  tree: { type: 'tree', name: 'Tree', nameTh: 'ต้นไม้', icon: '🌲', baseIncome: 5, cost: 30, description: 'ต้นไม้ให้ร่มเงา', maxLevel: 2, hasShop: false },
  shop: { type: 'shop', name: 'Shop', nameTh: 'ร้านค้า', icon: '🏪', baseIncome: 35, cost: 150, description: 'ร้านขายของทั่วไป', maxLevel: 4, hasShop: true },
  fountain: { type: 'fountain', name: 'Fountain', nameTh: 'น้ำพุ', icon: '⛲', baseIncome: 15, cost: 120, description: 'น้ำพุตกแต่งเมือง', maxLevel: 2, hasShop: false },
};

export interface PlacedBuilding {
  type: BuildingType;
  level: number;
  row: number;
  col: number;
}

export interface BonusRule {
  source: BuildingType;
  neighbor: BuildingType;
  multiplier: number;
  label: string;
  condition?: 'count2'; // requires at least 2 neighbors of that type
}

export const BONUS_RULES: BonusRule[] = [
  { source: 'cafe', neighbor: 'park', multiplier: 1.10, label: 'Café × Park +10%' },
  { source: 'cafe', neighbor: 'bakery', multiplier: 1.15, label: 'Café × Bakery +15%' },
  { source: 'cafe', neighbor: 'tree', multiplier: 1.05, label: 'Café ใกล้ Tree ×2 +5%', condition: 'count2' },
  { source: 'house', neighbor: 'cafe', multiplier: 1.05, label: 'House × Café +5%' },
  { source: 'house', neighbor: 'park', multiplier: 1.05, label: 'House × Park +5%' },
  { source: 'bakery', neighbor: 'cafe', multiplier: 1.08, label: 'Bakery × Café +8%' },
  { source: 'shop', neighbor: 'house', multiplier: 1.10, label: 'Shop × House +10%' },
  { source: 'fountain', neighbor: 'park', multiplier: 1.12, label: 'Fountain × Park +12%' },
];

export const GRID_SIZE = 5;

export function getNeighbors(r: number, c: number, grid: (PlacedBuilding | null)[][]): PlacedBuilding[] {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  const neighbors: PlacedBuilding[] = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && grid[nr][nc]) {
      neighbors.push(grid[nr][nc]!);
    }
  }
  return neighbors;
}

export function calcBuildingIncome(building: PlacedBuilding, grid: (PlacedBuilding | null)[][]): { base: number; bonus: number; total: number; activeRules: BonusRule[] } {
  const def = BUILDINGS[building.type];
  const base = def.baseIncome * building.level;
  const neighbors = getNeighbors(building.row, building.col, grid);
  let multiplier = 1;
  const activeRules: BonusRule[] = [];

  for (const rule of BONUS_RULES) {
    if (rule.source !== building.type) continue;
    if (rule.condition === 'count2') {
      const count = neighbors.filter(n => n.type === rule.neighbor).length;
      if (count >= 2) {
        multiplier *= rule.multiplier;
        activeRules.push(rule);
      }
    } else {
      if (neighbors.some(n => n.type === rule.neighbor)) {
        multiplier *= rule.multiplier;
        activeRules.push(rule);
      }
    }
  }

  const total = Math.round(base * multiplier);
  return { base, bonus: total - base, total, activeRules };
}

export function calcTotalCityIncome(grid: (PlacedBuilding | null)[][]): number {
  let total = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) {
        total += calcBuildingIncome(grid[r][c]!, grid).total;
      }
    }
  }
  return total;
}

export function getActiveBonuses(grid: (PlacedBuilding | null)[][]): { rule: BonusRule; active: boolean }[] {
  const activeSet = new Set<string>();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) {
        const { activeRules } = calcBuildingIncome(grid[r][c]!, grid);
        activeRules.forEach(rule => activeSet.add(rule.label));
      }
    }
  }
  return BONUS_RULES.map(rule => ({ rule, active: activeSet.has(rule.label) }));
}

export function createEmptyGrid(): (PlacedBuilding | null)[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

// Player data
export interface PlayerStats {
  money: number;
  exp: number;
  level: number;
  prestige: number;
  buildingCount: number;
  totalIncome: number;
}

export function getExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// Market items
export interface MarketItem {
  id: string;
  icon: string;
  name: string;
  shop: string;
  city: string;
  price: number;
  sold: number;
  cat: 'drink' | 'food' | 'deco' | 'boost';
  owner: string;
  mine?: boolean;
}

export const MARKET_CATEGORIES = [
  { key: 'all', label: 'ทั้งหมด', icon: '🏪' },
  { key: 'drink', label: 'เครื่องดื่ม', icon: '🥤' },
  { key: 'food', label: 'อาหาร', icon: '🍰' },
  { key: 'deco', label: 'ของตกแต่ง', icon: '🎀' },
  { key: 'boost', label: 'บูสต์', icon: '⚡' },
] as const;

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  name: string;
  cityName: string;
  score: number;
  me?: boolean;
}

export const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'CaféKing', cityName: 'Mocha Valley', score: 128500 },
  { rank: 2, name: 'MintCity', cityName: 'Mint Garden', score: 98200 },
  { rank: 3, name: 'BeanBuilder', cityName: 'Bean Town', score: 75400, me: true },
  { rank: 4, name: 'SugarRush', cityName: 'Sweet Haven', score: 62100 },
  { rank: 5, name: 'BrewMaster', cityName: 'Brew City', score: 54800 },
  { rank: 6, name: 'PastryQueen', cityName: 'Pastry Land', score: 43200 },
  { rank: 7, name: 'TeaLover', cityName: 'Tea Village', score: 38900 },
  { rank: 8, name: 'CocoaKid', cityName: 'Cocoa Town', score: 31500 },
];

export const SAMPLE_MARKET: MarketItem[] = [
  { id: '1', icon: '🍵', name: 'ชาเขียวมัทฉะ', shop: 'Matcha House', city: 'Mocha Valley', price: 45, sold: 234, cat: 'drink', owner: 'CaféKing' },
  { id: '2', icon: '🍰', name: 'ชีสเค้กสตรอว์เบอร์รี่', shop: 'Sweet Corner', city: 'Mint Garden', price: 65, sold: 189, cat: 'food', owner: 'MintCity' },
  { id: '3', icon: '⚡', name: 'EXP Boost x2', shop: 'Power Shop', city: 'Bean Town', price: 120, sold: 56, cat: 'boost', owner: 'BeanBuilder', mine: true },
  { id: '4', icon: '🎀', name: 'ป้ายไฟนีออน', shop: 'Deco World', city: 'Sweet Haven', price: 200, sold: 42, cat: 'deco', owner: 'SugarRush' },
  { id: '5', icon: '☕', name: 'ลาเต้อาร์ต', shop: 'Art Café', city: 'Brew City', price: 55, sold: 312, cat: 'drink', owner: 'BrewMaster' },
  { id: '6', icon: '🥐', name: 'ครัวซองต์เนย', shop: 'French Bakery', city: 'Pastry Land', price: 35, sold: 445, cat: 'food', owner: 'PastryQueen' },
  { id: '7', icon: '🧋', name: 'ชานมไข่มุก', shop: 'Boba Lab', city: 'Tea Village', price: 40, sold: 567, cat: 'drink', owner: 'TeaLover' },
  { id: '8', icon: '⚡', name: 'Income Boost x1.5', shop: 'Power Shop', city: 'Cocoa Town', price: 80, sold: 98, cat: 'boost', owner: 'CocoaKid' },
];
