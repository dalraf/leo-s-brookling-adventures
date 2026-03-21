import { Entity, GameState } from './types';
import { 
  PLAYER_ATTACK_RANGE, 
  ENEMY_ATTACK_RANGE, 
  HIT_STOP_DURATION, 
  SCREEN_SHAKE_INTENSITY, 
  COMBO_TIMEOUT, 
  COLORS 
} from './constants';
import { audioManager } from './AudioManager';

export class CombatSystem {
  static performPlayerAttack(state: GameState, createParticles: (x: number, z: number, color: string, type: 'blood' | 'spark' | 'smoke') => void, createFloatingText: (x: number, y: number, text: string, color: string) => void) {
    const { player, enemies } = state;
    const hasIronBar = player.inventory && player.inventory.ironBarHits > 0;
    const attackRange = hasIronBar ? PLAYER_ATTACK_RANGE * 1.5 : PLAYER_ATTACK_RANGE;
    const zTolerance = 35;
    let hitSomething = false;

    enemies.forEach(enemy => {
      if (enemy.state === 'dead') return;

      const dx = Math.abs((player.position.x + (player.direction === 'right' ? player.width/2 : -player.width/2)) - enemy.position.x);
      const dz = Math.abs(player.position.z - enemy.position.z);
      
      const isInFront = player.direction === 'right' 
        ? enemy.position.x > player.position.x - 10
        : enemy.position.x < player.position.x + 10;

      if (isInFront && dx < attackRange && dz < zTolerance) {
        // Hit!
        hitSomething = true;
        const baseDamage = 20 + (state.level - 1) * 5;
        const damage = hasIronBar ? Math.floor(baseDamage * 1.8) : baseDamage;
        enemy.health -= damage;
        enemy.state = 'hit';
        enemy.hitTimer = 300;
        enemy.velocity.x = player.direction === 'right' ? 5 : -5;
        
        // Juice
        state.frameFreeze = HIT_STOP_DURATION;
        state.screenShake = SCREEN_SHAKE_INTENSITY;
        state.combo++;
        state.comboTimer = COMBO_TIMEOUT;
        if (state.combo > state.maxCombo) {
          state.maxCombo = state.combo;
        }
        
        createFloatingText(enemy.position.x, enemy.position.z + enemy.position.y - 40, `-${damage}`, hasIronBar ? '#94a3b8' : '#fff');
        createParticles(enemy.position.x + enemy.width/2, enemy.position.z, COLORS.ENEMY, 'blood');
        
        if (enemy.health <= 0) {
          enemy.state = 'dead';
          enemy.velocity.y = -5;
          state.score += 100 * state.combo;
          state.kills++;
          
          // Level up every 10 kills
          if (state.kills % 10 === 0) {
            state.level++;
            state.levelUpTimer = 2000;
            state.flashTimer = 500;
            // Heal player on level up
            player.health = Math.min(player.maxHealth, player.health + 20);
            createFloatingText(player.position.x, player.position.z + player.position.y - 60, 'LEVEL UP! +HP', '#22c55e');
            audioManager.playSFX('levelUp');
          }
        }
      }
    });

    if (hitSomething && hasIronBar && player.inventory) {
      player.inventory.ironBarHits--;
      if (player.inventory.ironBarHits === 0) {
        createFloatingText(player.position.x, player.position.z - 80, 'IRON BAR BROKE!', '#ef4444');
      }
    }
  }

  static performEnemyAttack(state: GameState, enemy: Entity, createParticles: (x: number, z: number, color: string, type: 'blood' | 'spark' | 'smoke') => void) {
    const { player } = state;
    const hasIronBar = enemy.inventory && enemy.inventory.ironBarHits > 0;
    const attackRange = hasIronBar ? ENEMY_ATTACK_RANGE * 1.5 : ENEMY_ATTACK_RANGE;
    const zTolerance = 30;

    if (player.invulnerableTimer > 0) return;

    const dx = Math.abs((enemy.position.x + (enemy.direction === 'right' ? enemy.width/2 : -enemy.width/2)) - player.position.x);
    const dz = Math.abs(enemy.position.z - player.position.z);
    
    const isInFront = enemy.direction === 'right' 
      ? player.position.x > enemy.position.x - 10
      : player.position.x < enemy.position.x + 10;

    if (isInFront && dx < attackRange && dz < zTolerance) {
      // Enemy miss chance: base 30% + level bonus (up to 60%)
      const missChance = Math.min(0.6, 0.3 + (state.level * 0.02));
      if (Math.random() < missChance) {
        state.floatingTexts.push({
          id: `ft-miss-${Date.now()}`,
          text: 'MISS!',
          x: player.position.x,
          y: player.position.z + player.position.y - 40,
          life: 1.0,
          color: '#aaa'
        });
        return;
      }

      const baseDamage = 10 + (state.level - 1) * 2;
      const damage = hasIronBar ? Math.floor(baseDamage * 1.8) : baseDamage;
      player.health -= damage;
      player.state = 'hit';
      player.hitTimer = 400;
      player.invulnerableTimer = 1000;
      player.velocity.x = enemy.direction === 'right' ? 8 : -8;
      
      audioManager.playSFX('hit');
      state.flashTimer = 200;
      state.screenShake = SCREEN_SHAKE_INTENSITY * 1.5;
      state.combo = 0;
      
      if (hasIronBar && enemy.inventory) {
        enemy.inventory.ironBarHits--;
      }

      // Add screen blood splatter
      for (let i = 0; i < 3; i++) {
        state.bloodSplatter.push({
          x: Math.random() * 800, // CANVAS_WIDTH
          y: Math.random() * 600, // CANVAS_HEIGHT
          size: 20 + Math.random() * 40,
          life: 1.0
        });
      }
      
      createParticles(player.position.x + player.width/2, player.position.z, COLORS.PLAYER, 'blood');
      
      if (player.health <= 0) {
        state.isGameOver = true;
        state.screenShake = 25; // Massive shake for game over
        audioManager.playSFX('death');
        audioManager.stopMusic();
      }
    }
  }
}
