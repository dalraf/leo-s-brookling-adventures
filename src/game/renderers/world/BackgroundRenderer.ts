import { BaseRenderer } from '../BaseRenderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, STREET_TOP } from '../../constants';

export class BackgroundRenderer extends BaseRenderer {
  private graffiti: { x: number, y: number, color: string, text: string, rotation: number, drips: { offset: number, length: number }[] }[] = [];
  private cachedWall: HTMLCanvasElement | null = null;
  private cachedParallax: HTMLCanvasElement | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
    this.generateGraffiti();
    this.preRenderStaticElements();
  }

  private generateGraffiti() {
    const texts = ['BKLYN', 'NYC', '718', 'DOPE', 'STREET', 'VANDAL', 'KING', 'QUEENS'];
    for (let i = 0; i < 15; i++) {
      const drips = [];
      const numDrips = Math.floor(Math.random() * 4);
      for (let d = 0; d < numDrips; d++) {
        drips.push({ offset: 5 + Math.random() * 50, length: 10 + Math.random() * 25 });
      }

      this.graffiti.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 40 + Math.random() * (STREET_TOP - 120),
        color: COLORS.GRAFFITI[Math.floor(Math.random() * COLORS.GRAFFITI.length)],
        text: texts[Math.floor(Math.random() * texts.length)],
        rotation: (Math.random() - 0.5) * 0.3,
        drips
      });
    }
  }

  private preRenderStaticElements() {
    this.preRenderWall();
    this.preRenderParallax();
  }

  private preRenderWall() {
    this.cachedWall = document.createElement('canvas');
    this.cachedWall.width = CANVAS_WIDTH * 2;
    this.cachedWall.height = STREET_TOP;
    const wallCtx = this.cachedWall.getContext('2d')!;
    
    wallCtx.fillStyle = COLORS.BRICK;
    wallCtx.fillRect(0, 0, CANVAS_WIDTH * 2, STREET_TOP);
    wallCtx.strokeStyle = 'rgba(0,0,0,0.15)';
    wallCtx.lineWidth = 1;
    
    for (let y = 0; y < STREET_TOP; y += 10) {
      wallCtx.beginPath();
      wallCtx.moveTo(0, y);
      wallCtx.lineTo(CANVAS_WIDTH * 2, y);
      wallCtx.stroke();
      const offset = (y / 10) % 2 === 0 ? 0 : 10;
      for (let x = offset; x < CANVAS_WIDTH * 2; x += 20) {
        wallCtx.beginPath();
        wallCtx.moveTo(x, y);
        wallCtx.lineTo(x, y + 10);
        wallCtx.stroke();
      }
    }

    wallCtx.font = 'bold 28px "Courier New"';
    this.graffiti.forEach((g) => {
      this.drawGraffitiOntoContext(wallCtx, g, 0);
      this.drawGraffitiOntoContext(wallCtx, g, CANVAS_WIDTH);
    });
  }

  private drawGraffitiOntoContext(ctx: CanvasRenderingContext2D, g: any, offsetX: number) {
    ctx.save();
    ctx.translate(g.x + offsetX, g.y);
    ctx.rotate(g.rotation);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.globalAlpha = 0.5;
    ctx.fillText(g.text, 2, 2);
    ctx.fillStyle = g.color;
    ctx.globalAlpha = 0.7;
    ctx.fillText(g.text, 0, 0);
    ctx.beginPath();
    const textWidth = ctx.measureText(g.text).width;
    g.drips.forEach((drip: any) => {
      const dripX = (drip.offset / 60) * textWidth;
      ctx.moveTo(dripX, 5);
      ctx.lineTo(dripX, 5 + drip.length);
    });
    ctx.strokeStyle = g.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  private preRenderParallax() {
    this.cachedParallax = document.createElement('canvas');
    this.cachedParallax.width = CANVAS_WIDTH * 3;
    this.cachedParallax.height = CANVAS_HEIGHT;
    const pCtx = this.cachedParallax.getContext('2d')!;

    pCtx.fillStyle = '#1e1b4b';
    for (let i = 0; i < 3; i++) {
      const xOffset = i * CANVAS_WIDTH;
      for (let bx = 0; bx < CANVAS_WIDTH; bx += 40) {
        const h = 100 + Math.abs(Math.sin(bx * 0.01 + i)) * 150;
        pCtx.fillRect(xOffset + bx, STREET_TOP - h, 35, h);
        pCtx.fillStyle = 'rgba(254, 240, 138, 0.1)';
        for (let wy = STREET_TOP - h + 10; wy < STREET_TOP - 20; wy += 20) {
          pCtx.fillRect(xOffset + bx + 5, wy, 5, 5);
          pCtx.fillRect(xOffset + bx + 25, wy, 5, 5);
        }
        pCtx.fillStyle = '#1e1b4b';
      }
    }
  }

  drawParallax(cameraX: number) {
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.cachedParallax) {
      const pX = -(cameraX * 0.2) % (CANVAS_WIDTH * 3);
      this.ctx.drawImage(this.cachedParallax, pX, 0);
      if (pX < 0) {
        this.ctx.drawImage(this.cachedParallax, pX + CANVAS_WIDTH * 3, 0);
      }
    }
  }

  drawWall(cameraX: number) {
    this.ctx.fillStyle = COLORS.SKY;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.cachedWall) {
      const repeatWidth = CANVAS_WIDTH * 2;
      const wallStart = Math.floor(cameraX / repeatWidth) * repeatWidth;
      for (let xOffset = wallStart; xOffset < cameraX + CANVAS_WIDTH + repeatWidth; xOffset += repeatWidth) {
        this.ctx.drawImage(this.cachedWall, xOffset, 0);
      }
    }
  }
}
