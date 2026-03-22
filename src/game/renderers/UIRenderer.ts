import { BaseRenderer } from './BaseRenderer';
import { GameState } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COMBO_TIMEOUT } from '../constants';

export class UIRenderer extends BaseRenderer {
  drawHUD(state: GameState) {
    const { player } = state;
    const x = 20;
    const y = 20;
    const barW = 240;
    const mainBarH = 22;
    const subBarH = 8;
    
    // Background glass effect for the whole HUD block
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.roundRect(x - 5, y - 5, barW + 10, 130, 8);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.stroke();

    // 1. HEALTH (HP)
    this.ctx.fillStyle = COLORS.HEALTH_BAR_BG;
    this.ctx.fillRect(x, y, barW, mainBarH);
    const healthPercent = Math.max(0, player.health / player.maxHealth);
    this.ctx.fillStyle = COLORS.HEALTH_BAR;
    this.ctx.fillRect(x, y, barW * healthPercent, mainBarH);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, barW, mainBarH);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 12px "Courier New"';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('HP', x + 5, y + 16);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${Math.ceil(player.health)}/${player.maxHealth}`, x + barW - 5, y + 16);

    // 2. STAMINA (STAM)
    const staminaY = y + mainBarH + 15;
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(x, staminaY, barW, subBarH);
    const staminaPercent = Math.max(0, player.stamina / player.maxStamina);
    this.ctx.fillStyle = player.isExhausted ? '#ef4444' : '#3b82f6';
    this.ctx.fillRect(x, staminaY, barW * staminaPercent, subBarH);
    this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, staminaY, barW, subBarH);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'italic bold 9px "Courier New"';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('STAMINA', x + 2, staminaY - 2);

    // 3. XP BAR (Integrated below Stamina)
    const xpY = staminaY + subBarH + 12;
    const killsToNextLevel = 10;
    const progressPercent = (state.kills % killsToNextLevel) / killsToNextLevel;
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(x, xpY, barW, 4);
    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.fillRect(x, xpY, barW * progressPercent, 4);
    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.font = 'bold 9px "Courier New"';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('PROGRESSO XP', x, xpY - 3);

    // 4. STATS (Score, Level, Kills)
    const statsY = xpY + 18;
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 16px "Courier New"';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${state.score.toString().padStart(6, '0')}`, x, statsY + 15);
    
    this.ctx.font = 'bold 13px "Courier New"';
    this.ctx.fillStyle = COLORS.ACCENT;
    this.ctx.fillText(`LVL: ${state.level}`, x, statsY + 35);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillText(`KILLS: ${state.kills}`, x + 80, statsY + 35);

    // Inventory HUD (Right of Stats)
    if (player.inventory) {
      if (player.inventory.rocks > 0) {
        this.ctx.fillStyle = '#64748b';
        this.ctx.fillText(`● ROCHAS: ${player.inventory.rocks}`, x + 160, statsY + 15);
      }
      if (player.inventory.ironBarHits > 0) {
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fillText(`| BARRA: ${player.inventory.ironBarHits}`, x + 160, statsY + 35);
      }
    }

    // Combo UI (Remains unchanged in logic, just slightly adjusted position if needed)
    if (state.combo > 1) {
      this.ctx.save();
      this.ctx.translate(CANVAS_WIDTH - 60, 60);
      const scale = 1 + Math.sin(state.animationTime / 100) * 0.1;
      this.ctx.scale(scale, scale);
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.font = 'bold 36px "Courier New"';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${state.combo}x`, 0, 0);
      this.ctx.font = 'bold 12px "Courier New"';
      this.ctx.fillText('COMBO', 0, 15);
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
