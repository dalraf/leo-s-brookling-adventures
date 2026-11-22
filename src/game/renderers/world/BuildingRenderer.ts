import { BaseRenderer } from '../BaseRenderer';
import { CANVAS_WIDTH, COLORS, STREET_TOP } from '../../constants';

export class BuildingRenderer extends BaseRenderer {
  private cachedWindows: HTMLCanvasElement | null = null;
  private cachedAlley: HTMLCanvasElement | null = null;
  private cachedEntrance: HTMLCanvasElement | null = null;
  private spacing = 1200;

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
    this.preRenderWindows();
    this.preRenderAlley();
    this.preRenderEntrance();
  }

  private preRenderWindows() {
    this.cachedWindows = document.createElement('canvas');
    this.cachedWindows.width = this.spacing;
    this.cachedWindows.height = STREET_TOP;
    const winCtx = this.cachedWindows.getContext('2d')!;

    const winW = 80;
    const winH = 60;
    for (let x = 0; x < this.spacing; x += 200) {
      const relX = x % this.spacing;
      if (relX > 350 && relX < 650) continue; // Gap for alleys/doors
      if (relX >= 0 && relX <= 250) continue; // Gap
      
      for (let y = 40; y < STREET_TOP - 80; y += 100) {
        winCtx.fillStyle = '#404040';
        winCtx.fillRect(x + 15, y + winH, winW + 10, 6); // Sill
        winCtx.fillRect(x + 18, y - 6, winW + 4, 6); // Lintel
        winCtx.fillStyle = '#262626';
        winCtx.fillRect(x + 20, y, winW, winH); // Frame
        winCtx.fillStyle = '#171717';
        winCtx.fillRect(x + 25, y + 5, winW - 10, winH - 10); // Glass
        
        // Muntins
        winCtx.strokeStyle = '#262626';
        winCtx.lineWidth = 3;
        winCtx.beginPath();
        winCtx.moveTo(x + 20 + winW / 2, y + 5);
        winCtx.lineTo(x + 20 + winW / 2, y + winH - 5);
        winCtx.moveTo(x + 25, y + winH / 2);
        winCtx.lineTo(x + 15 + winW, y + winH / 2);
        winCtx.stroke();
        
        winCtx.strokeStyle = 'rgba(255,255,255,0.05)';
        winCtx.lineWidth = 1;
        winCtx.beginPath();
        winCtx.moveTo(x + 25, y + 10);
        winCtx.lineTo(x + 20 + winW - 10, y + 10);
        winCtx.stroke();
      }
    }

    // Fire Escapes
    for (let x = 0; x < this.spacing; x += 600) {
      const seed = Math.abs(Math.sin(x * 0.05)) * 10;
      if ((seed > 6 && (x % this.spacing) < 350) || (x % this.spacing) > 600) {
        winCtx.strokeStyle = '#1a1a1a';
        winCtx.lineWidth = 3;
        winCtx.beginPath();
        winCtx.moveTo(x + 20, 0);
        winCtx.lineTo(x + 20, STREET_TOP - 20);
        winCtx.moveTo(x + 70, 0);
        winCtx.lineTo(x + 70, STREET_TOP - 20);
        winCtx.stroke();
        for (let y = 30; y < STREET_TOP - 40; y += 70) {
          winCtx.fillStyle = '#1a1a1a';
          winCtx.fillRect(x + 10, y, 70, 6);
          winCtx.strokeRect(x + 10, y - 15, 70, 15);
        }
      }
    }
  }

  private preRenderAlley() {
    const alleyW = 150;
    const pOffset = 15;
    const alleyFloorDepth = 25;
    const alleyFloorY = STREET_TOP - alleyFloorDepth;

    this.cachedAlley = document.createElement('canvas');
    this.cachedAlley.width = alleyW;
    this.cachedAlley.height = STREET_TOP;
    const aCtx = this.cachedAlley.getContext('2d')!;

    const grad = aCtx.createLinearGradient(0, 0, 0, STREET_TOP);
    grad.addColorStop(0, '#1a1a1a');
    grad.addColorStop(0.8, '#252525');
    grad.addColorStop(1, '#333333');
    aCtx.fillStyle = grad;
    aCtx.fillRect(0, 0, alleyW, STREET_TOP);

    aCtx.fillStyle = '#1a1a1a';
    aCtx.beginPath();
    aCtx.moveTo(0, STREET_TOP);
    aCtx.lineTo(pOffset, alleyFloorY);
    aCtx.lineTo(alleyW - pOffset, alleyFloorY);
    aCtx.lineTo(alleyW, STREET_TOP);
    aCtx.fill();

    // Alley Window Frames (unlit base)
    for (let i = 0; i < 2; i++) {
      const winY = 40 + i * 85;
      const winW = 40;
      const winH = 50;
      const backWallW = alleyW - pOffset * 2;
      const winX = pOffset + (backWallW - winW) / 2;

      aCtx.fillStyle = '#151515';
      aCtx.fillRect(winX - 2, winY - 2, winW + 4, winH + 4);
      aCtx.fillStyle = '#2a2a2a';
      aCtx.fillRect(winX - 5, winY + winH, winW + 10, 4);

      aCtx.fillStyle = '#1a1a1a';
      aCtx.fillRect(winX, winY, winW, winH);

      aCtx.strokeStyle = 'rgba(0,0,0,0.8)';
      aCtx.lineWidth = 2;
      aCtx.strokeRect(winX, winY, winW, winH);
      aCtx.beginPath();
      aCtx.moveTo(winX + winW / 2, winY);
      aCtx.lineTo(winX + winW / 2, winY + winH);
      aCtx.moveTo(winX, winY + winH / 2);
      aCtx.lineTo(winX + winW, winY + winH / 2);
      aCtx.stroke();
    }

    // Alley Trash Cans
    this.drawAlleyTrashCanToCtx(aCtx, 30, STREET_TOP - 35);
    this.drawAlleyTrashCanToCtx(aCtx, alleyW - 75, STREET_TOP - 38);

    // Shadow covers
    aCtx.fillStyle = 'rgba(0,0,0,0.6)';
    aCtx.fillRect(0, 0, 5, STREET_TOP);
    aCtx.fillRect(alleyW - 5, 0, 5, STREET_TOP);
  }

  private drawAlleyTrashCanToCtx(ctx: CanvasRenderingContext2D, tx: number, ty: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(tx + 15, ty + 33, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createLinearGradient(tx, ty, tx + 30, ty);
    grad.addColorStop(0, '#4b5563');
    grad.addColorStop(0.5, '#9ca3af');
    grad.addColorStop(1, '#4b5563');
    ctx.fillStyle = grad;
    ctx.fillRect(tx, ty, 30, 36);

    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    for (let j = 1; j < 6; j++) {
      ctx.beginPath();
      ctx.moveTo(tx + j * 5, ty);
      ctx.lineTo(tx + j * 5, ty + 36);
      ctx.stroke();
    }

    ctx.fillStyle = '#6b7280';
    ctx.fillRect(tx - 3, ty - 3, 36, 6);
    ctx.fillRect(tx + 12, ty - 8, 6, 5);

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(tx + 9, ty - 6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.arc(tx + 21, ty - 4, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  private preRenderEntrance() {
    // Entrances span from x+28 (stairs start) to x+220 (stoop end)
    this.cachedEntrance = document.createElement('canvas');
    this.cachedEntrance.width = 200;
    this.cachedEntrance.height = STREET_TOP;
    const eCtx = this.cachedEntrance.getContext('2d')!;

    const stoopX = 72; // relative to x + 28 => x + 100
    const stoopW = 120;
    const landingY = STREET_TOP - 60;

    eCtx.fillStyle = '#333333';
    eCtx.fillRect(stoopX, landingY, stoopW, 60);
    eCtx.strokeStyle = 'rgba(0,0,0,0.2)';
    eCtx.lineWidth = 1;
    eCtx.beginPath();
    eCtx.moveTo(stoopX + stoopW / 2, landingY);
    eCtx.lineTo(stoopX + stoopW / 2, STREET_TOP);
    eCtx.moveTo(stoopX, landingY + 30);
    eCtx.lineTo(stoopX + stoopW, landingY + 30);
    eCtx.stroke();

    const doorHeight = 140;
    eCtx.fillStyle = '#1a1a1a';
    eCtx.fillRect(stoopX + 20, landingY - doorHeight, 80, doorHeight);
    eCtx.fillStyle = '#450a0a';
    eCtx.fillRect(stoopX + 25, landingY - doorHeight + 5, 70, doorHeight - 5);

    eCtx.strokeStyle = 'rgba(0,0,0,0.4)';
    eCtx.lineWidth = 2;
    eCtx.strokeRect(stoopX + 35, landingY - doorHeight + 15, 50, 50);
    eCtx.strokeRect(stoopX + 35, landingY - 70, 50, 60);
    eCtx.fillStyle = '#fbbf24';
    eCtx.beginPath();
    eCtx.arc(stoopX + 85, landingY - 75, 3, 0, Math.PI * 2);
    eCtx.fill();

    // Stoop stairs
    const numSteps = 6;
    const stepH = 10;
    const stepW = 12;
    const startX = stoopX - numSteps * stepW;

    eCtx.fillStyle = COLORS.SIDEWALK;
    eCtx.beginPath();
    eCtx.moveTo(startX, STREET_TOP);

    for (let i = 0; i < numSteps; i++) {
      eCtx.lineTo(startX + i * stepW + stepW, STREET_TOP - i * stepH);
      eCtx.lineTo(startX + i * stepW + stepW, STREET_TOP - (i + 1) * stepH);
    }
    eCtx.lineTo(stoopX, STREET_TOP);
    eCtx.closePath();
    eCtx.fill();

    eCtx.strokeStyle = 'rgba(0,0,0,0.5)';
    eCtx.lineWidth = 1.5;
    eCtx.stroke();

    const railHeight = 25;
    eCtx.strokeStyle = '#171717';
    eCtx.lineWidth = 3;

    eCtx.beginPath();
    eCtx.moveTo(startX, STREET_TOP - railHeight);
    eCtx.lineTo(stoopX, landingY - railHeight);
    eCtx.stroke();

    eCtx.lineWidth = 2;
    for (let i = 0; i <= numSteps; i += 2) {
      const px = startX + i * stepW;
      const py = STREET_TOP - i * stepH;
      eCtx.beginPath();
      eCtx.moveTo(px, py);
      eCtx.lineTo(px, py - railHeight);
      eCtx.stroke();
    }
  }

  drawWindows(cameraX: number) {
    if (!this.cachedWindows) return;
    
    const startX = Math.floor(cameraX / this.spacing) * this.spacing;
    for (let x = startX; x < cameraX + CANVAS_WIDTH + this.spacing; x += this.spacing) {
      this.ctx.drawImage(this.cachedWindows, x, 0);
      
      // Dynamic lighting for windows (without toggling globalAlpha)
      const winW = 80;
      const winH = 60;
      for (let wx = 0; wx < this.spacing; wx += 200) {
        const relX = wx % this.spacing;
        if (relX > 350 && relX < 650) continue;
        if (relX >= 0 && relX <= 250) continue;

        for (let wy = 40; wy < STREET_TOP - 80; wy += 100) {
          const seed = Math.sin((x + wx) * 0.1 + wy * 0.5);
          if (seed > 0.7) {
            this.ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
            this.ctx.fillRect(x + wx + 25, wy + 5, winW - 10, winH - 10);
            
            this.ctx.fillStyle = 'rgba(254, 240, 138, 0.1)';
            this.ctx.fillRect(x + wx + 30, wy + 10, winW - 20, 5);
          }
        }
      }
    }
  }

  drawEntrances(cameraX: number) {
    if (!this.cachedEntrance) return;
    const startX = Math.floor(cameraX / this.spacing) * this.spacing;
    for (let x = startX; x < cameraX + CANVAS_WIDTH + this.spacing; x += this.spacing) {
      const mod = ((x % 800) + 800) % 800;
      if (mod > 300 && mod < 650) continue;
      this.ctx.drawImage(this.cachedEntrance, x + 28, 0);
    }
  }

  drawAlleys(cameraX: number) {
    if (!this.cachedAlley) return;
    const startX = Math.floor(cameraX / this.spacing) * this.spacing;
    const alleyW = 150;
    const pOffset = 15;
    const backWallW = alleyW - pOffset * 2;
    const winW = 40;
    const winH = 50;

    for (let x = startX; x < cameraX + CANVAS_WIDTH + this.spacing; x += this.spacing) {
      const alleyX = x + 400;
      this.ctx.drawImage(this.cachedAlley, alleyX, 0);

      for (let i = 0; i < 2; i++) {
        if (Math.sin(x * 0.5 + i) > 0.8) {
          const winY = 40 + i * 85;
          const winX = alleyX + pOffset + (backWallW - winW) / 2;
          this.ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
          this.ctx.fillRect(winX, winY, winW, winH);
        }
      }
    }
  }
}
