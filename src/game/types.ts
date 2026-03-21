export interface Vector3D {
  x: number;
  y: number; // Altitude (jumping)
  z: number; // Depth (isometric)
}

export type EntityState = 'idle' | 'walking' | 'jumping' | 'attacking' | 'throwing' | 'hit' | 'dead' | 'knockdown' | 'sleeping' | 'waking' | 'running';

export interface Dog {
  id: string;
  position: Vector3D;
  velocity: Vector3D;
  state: 'sleeping' | 'waking' | 'running' | 'chasing' | 'gone';
  color: string;
  direction: 'left' | 'right';
  wakeTimer: number;
  width: number;
  height: number;
  variant?: 'pitbull' | 'shepherd' | 'mutt';
  collarColor?: string;
  targetId?: string;
}

export interface EntityVisuals {
  skinColor: string;
  clothingColor: string;
  sleeveColor: string; // Added for multi-toned clothes
  pantsColor: string;
  hairColor: string;
  hatType: 'none' | 'beanie' | 'cap' | 'bandana' | 'hoodie' | 'beret' | 'headphones' | 'mohawk'; // Added mohawk, beret, headphones
  vestColor?: string;
  hatColor?: string; // Added hat color
}

export interface Entity {
  id: string;
  position: Vector3D;
  velocity: Vector3D;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  state: EntityState;
  direction: 'left' | 'right';
  lastAttackTime: number;
  comboCount: number;
  hitTimer: number; // Time spent in 'hit' state
  invulnerableTimer: number;
  isBoss?: boolean;
  inventory?: {
    rocks: number;
    ironBarHits: number;
  };
  visuals: EntityVisuals;
}

export type ItemType = 'iron_bar' | 'rock' | 'beer';

export interface Item {
  id: string;
  type: ItemType;
  position: Vector3D;
  collected: boolean;
}

export interface Projectile {
  id: string;
  position: Vector3D;
  velocity: Vector3D;
  damage: number;
  owner: 'player' | 'enemy';
  life: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

export interface GameState {
  player: Entity;
  enemies: Entity[];
  items: Item[];
  projectiles: Projectile[];
  dogs: Dog[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  score: number;
  combo: number;
  comboTimer: number;
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  levelUpTimer: number;
  flashTimer: number;
  bloodSplatter: { x: number, y: number, size: number, life: number }[];
  kills: number;
  maxCombo: number;
  cameraX: number;
  screenShake: number;
  frameFreeze: number; // For hit-stop effect
  animationTime: number;
}

export interface Particle {
  position: Vector3D;
  velocity: Vector3D;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'blood' | 'spark' | 'smoke';
}
