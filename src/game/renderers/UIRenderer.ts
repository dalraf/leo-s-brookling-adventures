import { BaseRenderer } from './BaseRenderer';
import { GameState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COMBO_TIMEOUT } from '../constants';

export class UIRenderer extends BaseRenderer {
  drawHUD(state: GameState) {
    const { player } = state;
    const barW = 200;
    const barH = 20;
    const x = 20;
    const y = 20;

    this.ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    this.ctx.fillRect(x, y, barW, barH);
    const healthPercent = Math.max(0, player.health / player.maxHealth);
    this.ctx.fillStyle = COLORS.HEALTH_BAR;
    this.ctx.fillRect(x, y, barW * healthPercent, barH);
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, barW, barH);

    // Stamina Bar
    const staminaW = 120; // Smaller bar
    const staminaY = y + barH + 5;
    const staminaH = 8;
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(x, staminaY, staminaW, staminaH);
    const staminaPercent = Math.max(0, player.stamina / player.maxStamina);
    this.ctx.fillStyle = player.isExhausted ? '#ef4444' : '#3b82f6';
    this.ctx.fillRect(x, staminaY, staminaW * staminaPercent, staminaH);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, staminaY, staminaW, staminaH);
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 20px "Courier New"';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`PONTOS: ${state.score.toString().padStart(6, '0')}`, x, y + barH + 25);
    this.ctx.font = 'bold 14px "Courier New"';
    this.ctx.fillText(`NÍVEL: ${state.level}`, x, y + barH + 45);
    this.ctx.fillText(`ABATES: ${state.kills}`, x, y + barH + 60);

    // Inventory HUD
    if (player.inventory) {
      this.ctx.fillStyle = player.inventory.rocks > 0 ? '#64748b' : 'rgba(255,255,255,0.2)';
      this.ctx.fillText(`PEDRAS: ${player.inventory.rocks}`, x + 120, y + barH + 45);
      
      if (player.inventory.ironBarHits > 0) {
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fillText(`BARRA: ${player.inventory.ironBarHits} USOS`, x + 120, y + barH + 60);
      }
    }

    const killsToNextLevel = 10;
    const progressPercent = (state.kills % killsToNextLevel) / killsToNextLevel;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(x, y + barH + 70, 100, 4);
    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.fillRect(x, y + barH + 70, 100 * progressPercent, 4);

    if (state.combo > 1) {
      this.ctx.save();
      this.ctx.translate(CANVAS_WIDTH - 100, 80);
      const scale = 1 + Math.sin(state.animationTime / 50) * 0.1;
      this.ctx.scale(scale, scale);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.font = 'bold 40px "Courier New"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${state.combo}x`, 0, 0);
      this.ctx.font = 'bold 16px "Courier New"';
      this.ctx.fillText('COMBO', 0, 20);
      const timerW = 80;
      const timerPercent = state.comboTimer / COMBO_TIMEOUT;
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(-timerW/2, 30, timerW * timerPercent, 4);
      this.ctx.restore();
    }

    const boss = state.enemies.find(e => e.isBoss && e.state !== 'dead');
    if (boss) {
      const bW = CANVAS_WIDTH - 100;
      const bH = 15;
      const bX = 50;
      const bY = CANVAS_HEIGHT - 40;
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(bX, bY, bW, bH);
      const bHealthPercent = Math.max(0, boss.health / boss.maxHealth);
      this.ctx.fillStyle = '#7f1d1d';
      this.ctx.fillRect(bX, bY, bW * bHealthPercent, bH);
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(bX, bY, bW, bH);
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 12px "Courier New"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('BOSS', CANVAS_WIDTH / 2, bY - 5);
    }
  }

  drawGameOver(score: number, kills: number, level: number) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.font = 'bold 64px "Courier New"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FIM DE JOGO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 24px "Courier New"';
    this.ctx.fillText(`PONTUAÇÃO FINAL: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    this.ctx.font = '18px "Courier New"';
    this.ctx.fillText(`TOTAL DE ABATES: ${kills}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    this.ctx.fillText(`NÍVEL ALCANÇADO: ${level}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
  }

  drawPaused() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 48px "Courier New"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSADO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  drawLevelUp(level: number) {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = 'bold 60px "Courier New"';
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = '#f59e0b';
    this.ctx.shadowBlur = 20;
    this.ctx.fillText(`NÍVEL ${level}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.ctx.font = 'bold 20px "Courier New"';
    this.ctx.fillText('AS RUAS ESTÃO FICANDO DIFÍCEIS', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
    this.ctx.restore();
  }
}
