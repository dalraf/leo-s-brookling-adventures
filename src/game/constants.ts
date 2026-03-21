export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;
export const GRAVITY = 0.5;
export const PLAYER_SPEED = 4;
export const PLAYER_JUMP_FORCE = -10;
export const PLAYER_ATTACK_COOLDOWN = 300;
export const PLAYER_ATTACK_RANGE = 70;
export const ENEMY_SPEED = 1.8;
export const ENEMY_ATTACK_RANGE = 45;
export const ENEMY_SPAWN_INTERVAL = 4000;

// Isometric Street Boundaries
export const STREET_TOP = 250;
export const STREET_BOTTOM = 430;
export const STREET_HEIGHT = STREET_BOTTOM - STREET_TOP;

export const HIT_STOP_DURATION = 5; // Frames to freeze on hit
export const SCREEN_SHAKE_INTENSITY = 8;
export const COMBO_TIMEOUT = 2000;

export const COLORS = {
  BRICK: '#7c2d12',
  GRAFFITI: ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'],
  PLAYER: '#3b82f6',
  ENEMY: '#ef4444',
  GROUND: '#1f2937',
  SKY: '#0f172a',
  STREET: '#334155',
  SIDEWALK: '#475569',
  HUD_BG: 'rgba(0, 0, 0, 0.6)',
  HEALTH_BAR: '#22c55e',
  HEALTH_BAR_BG: '#991b1b',
  ACCENT: '#f59e0b',
  BOSS: '#7f1d1d',
};
