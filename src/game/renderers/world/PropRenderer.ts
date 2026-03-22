import { BaseRenderer } from '../BaseRenderer';
import { CANVAS_WIDTH, STREET_TOP } from '../../constants';

export class PropRenderer extends BaseRenderer {
  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
  }

  getProps(cameraX: number, animationTime: number): { yBase: number; draw: () => void }[] {
    const spacing = 250;
    const startX = Math.floor(cameraX / spacing) * spacing;
    const groundY = STREET_TOP;
    
    const drawables: { yBase: number; draw: () => void }[] = [];

    for (let x = startX; x < cameraX + CANVAS_WIDTH + spacing; x += spacing) {
      const seed = Math.abs(Math.sin(x * 0.567)) * 100;
      const alleySpacing = 800;
      const relativeX = x % alleySpacing;
      const isNearAlley = (relativeX > 280 && relativeX < 340) || (relativeX > 610 && relativeX < 670);

      if (isNearAlley) {
        drawables.push(this.createHydrant(x, groundY));
      } else if (seed < 15) {
        drawables.push(this.createTrashCan(x, groundY));
      } else if (seed < 30) {
        drawables.push(this.createCardboardBox(x, groundY));
      } else if (seed < 45) {
        drawables.push(this.createNewspaperStack(x, groundY));
      } else if (seed < 75) {
        drawables.push(this.createMilkCrate(x, groundY, seed));
      } else if (seed < 90) {
        drawables.push(this.createStreetLamp(x, groundY));
      } else if (seed < 95) {
        drawables.push(this.createTrafficCone(x, groundY));
      }
    }

    return drawables;
  }

  private createHydrant(x: number, groundY: number) {
    const hX = x;
    const hY = groundY - 15;
    const hW = 24;
    const hH = 40;
    
    return {
      yBase: hY + hH,
      draw: () => {
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(hX + 12, hY + hH + 5, 15, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(hX - 4, hY + hH - 5, hW + 8, 10);
        this.ctx.fillRect(hX, hY, hW, hH);
        
        this.ctx.fillStyle = '#991b1b';
        this.ctx.fillRect(hX - 6, hY + 12, 6, 10);
        this.ctx.fillRect(hX + hW, hY + 12, 6, 10);
        
        this.ctx.strokeStyle = '#4b5563';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(hX - 3, hY + 22);
        this.ctx.lineTo(hX + 5, hY + 30);
        this.ctx.moveTo(hX + hW + 3, hY + 22);
        this.ctx.lineTo(hX + hW - 5, hY + 30);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(hX + hW/2, hY, hW/2, Math.PI, 0);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#991b1b';
        this.ctx.fillRect(hX + hW/2 - 4, hY - 14, 8, 6);
        
        this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(hX, hY, hW, hH);
      }
    };
  }

  private createTrashCan(x: number, groundY: number) {
    const tx = x + 40;
    const ty = groundY - 10;
    return {
      yBase: ty + 48,
      draw: () => {
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(tx + 18, ty + 45, 22, 7, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(tx, ty, 36, 48);
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 2.5;
        for (let i = 6; i < 36; i += 9) {
          this.ctx.beginPath();
          this.ctx.moveTo(tx + i, ty);
          this.ctx.lineTo(tx + i, ty + 48);
          this.ctx.stroke();
        }
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(tx - 4, ty - 8, 45, 9);
        this.ctx.fillRect(tx + 13, ty - 14, 9, 6);
      }
    };
  }

  private createCardboardBox(x: number, groundY: number) {
    const bx = x + 30;
    const by = groundY + 5;
    const bW = 65;
    const bH = 45;
    return {
      yBase: by + bH,
      draw: () => {
        this.ctx.fillStyle = '#92400e';
        this.ctx.fillRect(bx, by, bW, bH);
        this.ctx.strokeStyle = '#78350f';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(bx, by, bW, bH);
        
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by + bH/2);
        this.ctx.lineTo(bx + bW, by + bH/2);
        this.ctx.stroke();
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
        this.ctx.fillRect(bx + 10, by + bH/2 - 3, bW - 20, 6);
        
        this.ctx.fillStyle = '#f3f4f6';
        this.ctx.fillRect(bx + bW - 20, by + 8, 12, 10);
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(bx + bW - 18, by + 10, 8, 1);
        this.ctx.fillRect(bx + bW - 18, by + 13, 6, 1);
      }
    };
  }

  private createNewspaperStack(x: number, groundY: number) {
    const nx = x + 50;
    const ny = groundY + 10;
    return {
      yBase: ny + 22,
      draw: () => {
        this.ctx.fillStyle = '#f3f4f6';
        this.ctx.fillRect(nx, ny, 45, 22);
        
        this.ctx.fillStyle = '#1f2937';
        this.ctx.fillRect(nx + 4, ny + 3, 37, 4);
        
        this.ctx.strokeStyle = '#9ca3af';
        this.ctx.lineWidth = 1;
        for(let i=9; i<20; i+=3) {
          this.ctx.beginPath();
          this.ctx.moveTo(nx + 4, ny + i);
          this.ctx.lineTo(nx + 41, ny + i);
          this.ctx.stroke();
        }

        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(nx + 25, ny + 9, 12, 8);
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(nx + 18, ny - 2, 9, 26);
      }
    };
  }

  private createPuddle(x: number, groundY: number, seed: number) {
    const px = x + 20;
    const py = groundY + 20;
    const pW = 90 + (seed % 30);
    const pH = 22 + (seed % 15);
    return {
      yBase: py + pH,
      draw: () => {
        const grad = this.ctx.createRadialGradient(px + pW/2, py + pH/2, 0, px + pW/2, py + pH/2, pW/2);
        grad.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        grad.addColorStop(1, 'rgba(30, 58, 138, 0.1)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.ellipse(px + pW/2, py + pH/2, pW/2, pH/2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
        this.ctx.fillRect(px + pW/3, py + pH/3, pW/4, 3);
      }
    };
  }

  private createMilkCrate(x: number, groundY: number, seed: number) {
    const cx = x + 10;
    const cy = groundY + 5;
    const cS = 40;
    return {
      yBase: cy + cS,
      draw: () => {
        this.ctx.fillStyle = seed % 2 > 1 ? '#1e40af' : '#991b1b';
        this.ctx.fillRect(cx, cy, cS, cS);
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        const holeSize = 6;
        const gap = 4;
        for(let row=0; row<3; row++) {
          for(let col=0; col<3; col++) {
            this.ctx.fillRect(cx + gap + col * (holeSize + gap), cy + gap + row * (holeSize + gap), holeSize, holeSize);
          }
        }
        
        this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cx, cy, cS, cS);
        this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this.ctx.fillRect(cx + 8, cy + cS - 12, cS - 16, 6);
      }
    };
  }

  private createStreetLamp(x: number, groundY: number) {
    const lx = x + 10;
    const ly = groundY + 10;
    return {
      yBase: ly,
      draw: () => {
        this.ctx.fillStyle = '#171717';
        this.ctx.fillRect(lx, ly - 220, 12, 220); // Pole
        this.ctx.fillRect(lx - 6, ly - 8, 24, 8); // Base
        
        this.ctx.save();
        this.ctx.translate(lx + 6, ly - 220);
        this.ctx.fillStyle = '#262626';
        this.ctx.beginPath();
        this.ctx.moveTo(-22, 0);
        this.ctx.lineTo(22, 0);
        this.ctx.lineTo(15, -22);
        this.ctx.lineTo(-15, -22);
        this.ctx.closePath();
        this.ctx.fill();
        
        const glow = this.ctx.createRadialGradient(0, 8, 0, 0, 8, 60);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.arc(0, 8, 60, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    };
  }

  private createTrafficCone(x: number, groundY: number) {
    const cx = x + 60;
    const cy = groundY - 10;
    const cW = 24;
    const cH = 60;
    return {
      yBase: cy + cH,
      draw: () => {
        this.ctx.fillStyle = '#f97316';
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy + cH);
        this.ctx.lineTo(cx + cW, cy + cH);
        this.ctx.lineTo(cx + (cW / 2) + 3, cy);
        this.ctx.lineTo(cx + (cW / 2) - 3, cy);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
        this.ctx.fillRect(cx + (cW / 2) - 4, cy + 12, 8, 10);
        this.ctx.fillRect(cx + (cW / 2) - 7, cy + 32, 14, 12);
        this.ctx.fillStyle = '#ea580c';
        this.ctx.fillRect(cx - 6, cy + cH - 4, cW + 12, 6);
      }
    };
  }
}
