import { BaseRenderer } from '../BaseRenderer';
import { CANVAS_WIDTH, COLORS, STREET_TOP } from '../../constants';

export class BuildingRenderer extends BaseRenderer {
  private cachedWindows: HTMLCanvasElement | null = null;
  private spacing = 1200;

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
    this.preRenderWindows();
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
        winCtx.moveTo(x + 20 + winW/2, y + 5);
        winCtx.lineTo(x + 20 + winW/2, y + winH - 5);
        winCtx.moveTo(x + 25, y + winH/2);
        winCtx.lineTo(x + 15 + winW, y + winH/2);
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
      if (seed > 6 && (x % this.spacing) < 350 || (x % this.spacing) > 600) {
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

  drawWindows(cameraX: number) {
    if (!this.cachedWindows) return;
    
    const startX = Math.floor(cameraX / this.spacing) * this.spacing;
    for (let x = startX; x < cameraX + CANVAS_WIDTH + this.spacing; x += this.spacing) {
      this.ctx.drawImage(this.cachedWindows, x, 0);
      
      // Dynamic lighting for windows
      const winW = 80;
      const winH = 60;
      for (let wx = 0; wx < this.spacing; wx += 200) {
        const relX = wx % this.spacing;
        if (relX > 350 && relX < 650) continue;
        if (relX >= 0 && relX <= 250) continue;

        for (let wy = 40; wy < STREET_TOP - 80; wy += 100) {
          const seed = Math.sin((x + wx) * 0.1 + wy * 0.5);
          if (seed > 0.7) {
            this.ctx.fillStyle = '#fef08a';
            this.ctx.globalAlpha = 0.2;
            this.ctx.fillRect(x + wx + 25, wy + 5, winW - 10, winH - 10);
            
            this.ctx.fillStyle = 'rgba(254, 240, 138, 0.1)';
            this.ctx.fillRect(x + wx + 30, wy + 10, winW - 20, 5);
            this.ctx.globalAlpha = 1.0;
          }
        }
      }
    }
  }

  drawEntrances(cameraX: number) {
    const startX = Math.floor(cameraX / this.spacing) * this.spacing;
    for (let x = startX; x < cameraX + CANVAS_WIDTH + this.spacing; x += this.spacing) {
      if ((x % 800) > 300 && (x % 800) < 650) continue;

      const stoopX = x + 100;
      const stoopW = 120;
      const landingY = STREET_TOP - 60;
      
      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(stoopX, landingY, stoopW, 60);
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(stoopX + stoopW/2, landingY);
      this.ctx.lineTo(stoopX + stoopW/2, STREET_TOP);
      this.ctx.moveTo(stoopX, landingY + 30);
      this.ctx.lineTo(stoopX + stoopW, landingY + 30);
      this.ctx.stroke();

      const doorHeight = 140;
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(stoopX + 20, landingY - doorHeight, 80, doorHeight);
      this.ctx.fillStyle = '#450a0a';
      this.ctx.fillRect(stoopX + 25, landingY - doorHeight + 5, 70, doorHeight - 5);
      
      this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(stoopX + 35, landingY - doorHeight + 15, 50, 50);
      this.ctx.strokeRect(stoopX + 35, landingY - 70, 50, 60);
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(stoopX + 85, landingY - 75, 3, 0, Math.PI * 2);
      this.ctx.fill();

      this.drawStoopStairs(stoopX, landingY);
    }
  }

  private drawStoopStairs(stoopX: number, landingY: number) {
    const numSteps = 6;
    const stepH = 10;
    const stepW = 12;
    const startX = stoopX - (numSteps * stepW);
    
    this.ctx.fillStyle = COLORS.SIDEWALK;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, STREET_TOP);
    
    for (let i = 0; i < numSteps; i++) {
      this.ctx.lineTo(startX + (i * stepW) + stepW, STREET_TOP - (i * stepH));
      this.ctx.lineTo(startX + (i * stepW) + stepW, STREET_TOP - (i + 1) * stepH);
    }
    this.ctx.lineTo(stoopX, STREET_TOP);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    const railHeight = 25;
    this.ctx.strokeStyle = '#171717';
    this.ctx.lineWidth = 3;
    
    this.ctx.beginPath();
    this.ctx.moveTo(startX, STREET_TOP - railHeight);
    this.ctx.lineTo(stoopX, landingY - railHeight);
    this.ctx.stroke();

    this.ctx.lineWidth = 2;
    for (let i = 0; i <= numSteps; i += 2) {
      const px = startX + i * stepW;
      const py = STREET_TOP - i * stepH;
      this.ctx.beginPath();
      this.ctx.moveTo(px, py);
      this.ctx.lineTo(px, py - railHeight);
      this.ctx.stroke();
    }
  }

  drawAlleys(cameraX: number) {
    const startX = Math.floor(cameraX / this.spacing) * this.spacing;
    const pOffset = 15;
    for (let x = startX; x < cameraX + CANVAS_WIDTH + this.spacing; x += this.spacing) {
      const alleyX = x + 400;
      const alleyW = 150;
      const alleyFloorDepth = 25;
      const alleyFloorY = STREET_TOP - alleyFloorDepth;
      
      const grad = this.ctx.createLinearGradient(alleyX, 0, alleyX, STREET_TOP);
      grad.addColorStop(0, '#1a1a1a');
      grad.addColorStop(0.8, '#252525');
      grad.addColorStop(1, '#333333');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(alleyX, 0, alleyW, STREET_TOP);

      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.beginPath();
      this.ctx.moveTo(alleyX, STREET_TOP);
      this.ctx.lineTo(alleyX + pOffset, alleyFloorY);
      this.ctx.lineTo(alleyX + alleyW - pOffset, alleyFloorY);
      this.ctx.lineTo(alleyX + alleyW, STREET_TOP);
      this.ctx.fill();

      this.drawAlleyWindows(alleyX, alleyW, pOffset, x);
      this.drawAlleyTrashCan(alleyX + 30, STREET_TOP - 35);
      this.drawAlleyTrashCan(alleyX + alleyW - 75, STREET_TOP - 38);
      
      // Shadow covers
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(alleyX, 0, 5, STREET_TOP);
      this.ctx.fillRect(alleyX + alleyW - 5, 0, 5, STREET_TOP);
    }
  }

  private drawAlleyWindows(alleyX: number, alleyW: number, pOffset: number, noiseX: number) {
    for (let i = 0; i < 2; i++) {
      const winY = 40 + i * 85;
      const winW = 40;
      const winH = 50;
      const backWallW = alleyW - pOffset * 2;
      const winX = alleyX + pOffset + (backWallW - winW) / 2;
      
      this.ctx.fillStyle = '#151515';
      this.ctx.fillRect(winX - 2, winY - 2, winW + 4, winH + 4);
      this.ctx.fillStyle = '#2a2a2a';
      this.ctx.fillRect(winX - 5, winY + winH, winW + 10, 4);
      
      const litSeed = Math.sin(noiseX * 0.5 + i);
      this.ctx.fillStyle = litSeed > 0.8 ? 'rgba(254, 240, 138, 0.25)' : '#1a1a1a';
      this.ctx.fillRect(winX, winY, winW, winH);
      
      this.ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(winX, winY, winW, winH);
      this.ctx.beginPath();
      this.ctx.moveTo(winX + winW/2, winY);
      this.ctx.lineTo(winX + winW/2, winY + winH);
      this.ctx.moveTo(winX, winY + winH/2);
      this.ctx.lineTo(winX + winW, winY + winH/2);
      this.ctx.stroke();
    }
  }

  private drawAlleyTrashCan(tx: number, ty: number) {
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(tx + 15, ty + 33, 18, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const grad = this.ctx.createLinearGradient(tx, ty, tx + 30, ty);
    grad.addColorStop(0, '#4b5563');
    grad.addColorStop(0.5, '#9ca3af');
    grad.addColorStop(1, '#4b5563');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(tx, ty, 30, 36);
    
    this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    this.ctx.lineWidth = 1.5;
    for(let j=1; j<6; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(tx + j*5, ty);
      this.ctx.lineTo(tx + j*5, ty + 36);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#6b7280';
    this.ctx.fillRect(tx - 3, ty - 3, 36, 6);
    this.ctx.fillRect(tx + 12, ty - 8, 6, 5);

    this.ctx.fillStyle = '#1f2937';
    this.ctx.beginPath();
    this.ctx.arc(tx + 9, ty - 6, 9, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#374151';
    this.ctx.beginPath();
    this.ctx.arc(tx + 21, ty - 4, 7, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
