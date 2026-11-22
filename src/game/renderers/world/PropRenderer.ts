import { BaseRenderer } from '../BaseRenderer';
import { CANVAS_WIDTH, STREET_TOP } from '../../constants';

interface CachedSprite {
  canvas: HTMLCanvasElement;
  offsetX: number;
  offsetY: number;
  yBaseOffset: number;
}

export class PropRenderer extends BaseRenderer {
  private sprites: Record<string, CachedSprite> = {};

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
    this.preRenderProps();
  }

  private createOffscreen(width: number, height: number, drawFn: (c: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    drawFn(canvas.getContext('2d')!);
    return canvas;
  }

  private preRenderProps() {
    // 1. Hydrant (x-6..x+30, groundY-29..groundY+34)
    this.sprites.hydrant = {
      offsetX: -6,
      offsetY: -29,
      yBaseOffset: 25,
      canvas: this.createOffscreen(38, 66, (c) => {
        const hX = 6;
        const hY = 14;
        const hW = 24;
        const hH = 40;

        c.fillStyle = 'rgba(0,0,0,0.3)';
        c.beginPath();
        c.ellipse(hX + 12, hY + hH + 5, 15, 4, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#ef4444';
        c.fillRect(hX - 4, hY + hH - 5, hW + 8, 10);
        c.fillRect(hX, hY, hW, hH);

        c.fillStyle = '#991b1b';
        c.fillRect(hX - 6, hY + 12, 6, 10);
        c.fillRect(hX + hW, hY + 12, 6, 10);

        c.strokeStyle = '#4b5563';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(hX - 3, hY + 22);
        c.lineTo(hX + 5, hY + 30);
        c.moveTo(hX + hW + 3, hY + 22);
        c.lineTo(hX + hW - 5, hY + 30);
        c.stroke();

        c.fillStyle = '#ef4444';
        c.beginPath();
        c.arc(hX + hW / 2, hY, hW / 2, Math.PI, 0);
        c.fill();

        c.fillStyle = '#991b1b';
        c.fillRect(hX + hW / 2 - 4, hY - 14, 8, 6);

        c.strokeStyle = 'rgba(0,0,0,0.4)';
        c.lineWidth = 1.5;
        c.strokeRect(hX, hY, hW, hH);
      }),
    };

    // 2. Trash Can (tx=x+40, ty=groundY-10)
    this.sprites.trashCan = {
      offsetX: 36,
      offsetY: -24,
      yBaseOffset: 38,
      canvas: this.createOffscreen(46, 68, (c) => {
        const tx = 4;
        const ty = 14;

        c.fillStyle = 'rgba(0,0,0,0.3)';
        c.beginPath();
        c.ellipse(tx + 18, ty + 45, 22, 7, 0, 0, Math.PI * 2);
        c.fill();

        c.fillStyle = '#4b5563';
        c.fillRect(tx, ty, 36, 48);
        c.strokeStyle = '#374151';
        c.lineWidth = 2.5;
        for (let i = 6; i < 36; i += 9) {
          c.beginPath();
          c.moveTo(tx + i, ty);
          c.lineTo(tx + i, ty + 48);
          c.stroke();
        }
        c.fillStyle = '#374151';
        c.fillRect(tx - 4, ty - 8, 45, 9);
        c.fillRect(tx + 13, ty - 14, 9, 6);
      }),
    };

    // 3. Cardboard Box (bx=x+30, by=groundY+5)
    this.sprites.cardboardBox = {
      offsetX: 28,
      offsetY: 3,
      yBaseOffset: 50,
      canvas: this.createOffscreen(70, 50, (c) => {
        const bx = 2;
        const by = 2;
        const bW = 65;
        const bH = 45;

        c.fillStyle = '#92400e';
        c.fillRect(bx, by, bW, bH);
        c.strokeStyle = '#78350f';
        c.lineWidth = 2;
        c.strokeRect(bx, by, bW, bH);

        c.strokeStyle = 'rgba(0,0,0,0.2)';
        c.beginPath();
        c.moveTo(bx, by + bH / 2);
        c.lineTo(bx + bW, by + bH / 2);
        c.stroke();

        c.fillStyle = 'rgba(0,0,0,0.15)';
        c.fillRect(bx + 10, by + bH / 2 - 3, bW - 20, 6);

        c.fillStyle = '#f3f4f6';
        c.fillRect(bx + bW - 20, by + 8, 12, 10);
        c.fillStyle = '#374151';
        c.fillRect(bx + bW - 18, by + 10, 8, 1);
        c.fillRect(bx + bW - 18, by + 13, 6, 1);
      }),
    };

    // 4. Newspaper Stack (nx=x+50, ny=groundY+10)
    this.sprites.newspaperStack = {
      offsetX: 50,
      offsetY: 7,
      yBaseOffset: 32,
      canvas: this.createOffscreen(46, 30, (c) => {
        const nx = 0;
        const ny = 3;

        c.fillStyle = '#f3f4f6';
        c.fillRect(nx, ny, 45, 22);

        c.fillStyle = '#1f2937';
        c.fillRect(nx + 4, ny + 3, 37, 4);

        c.strokeStyle = '#9ca3af';
        c.lineWidth = 1;
        for (let i = 9; i < 20; i += 3) {
          c.beginPath();
          c.moveTo(nx + 4, ny + i);
          c.lineTo(nx + 41, ny + i);
          c.stroke();
        }

        c.fillStyle = '#6b7280';
        c.fillRect(nx + 25, ny + 9, 12, 8);
        c.strokeStyle = '#374151';
        c.lineWidth = 1.5;
        c.strokeRect(nx + 18, ny - 2, 9, 26);
      }),
    };

    // 5. Milk Crates (cx=x+10, cy=groundY+5)
    const createCrate = (color: string): CachedSprite => ({
      offsetX: 8,
      offsetY: 3,
      yBaseOffset: 45,
      canvas: this.createOffscreen(44, 44, (c) => {
        const cx = 2;
        const cy = 2;
        const cS = 40;
        c.fillStyle = color;
        c.fillRect(cx, cy, cS, cS);

        c.fillStyle = 'rgba(0,0,0,0.3)';
        const holeSize = 6;
        const gap = 4;
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            c.fillRect(cx + gap + col * (holeSize + gap), cy + gap + row * (holeSize + gap), holeSize, holeSize);
          }
        }

        c.strokeStyle = 'rgba(0,0,0,0.5)';
        c.lineWidth = 2;
        c.strokeRect(cx, cy, cS, cS);
        c.fillStyle = 'rgba(0,0,0,0.4)';
        c.fillRect(cx + 8, cy + cS - 12, cS - 16, 6);
      }),
    });
    this.sprites.milkCrateBlue = createCrate('#1e40af');
    this.sprites.milkCrateRed = createCrate('#991b1b');

    // 6. Street Lamp (lx=x+10, ly=groundY+10) - pre-renders the radial gradient glow!
    this.sprites.streetLamp = {
      offsetX: -44,
      offsetY: -270,
      yBaseOffset: 10,
      canvas: this.createOffscreen(120, 280, (c) => {
        const lx = 54;
        const ly = 280;

        c.fillStyle = '#171717';
        c.fillRect(lx, ly - 220, 12, 220);
        c.fillRect(lx - 6, ly - 8, 24, 8);

        c.save();
        c.translate(lx + 6, ly - 220);
        c.fillStyle = '#262626';
        c.beginPath();
        c.moveTo(-22, 0);
        c.lineTo(22, 0);
        c.lineTo(15, -22);
        c.lineTo(-15, -22);
        c.closePath();
        c.fill();

        const glow = c.createRadialGradient(0, 8, 0, 0, 8, 60);
        glow.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
        glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
        c.fillStyle = glow;
        c.beginPath();
        c.arc(0, 8, 60, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }),
    };

    // 7. Traffic Cone (cx=x+60, cy=groundY-10)
    this.sprites.trafficCone = {
      offsetX: 54,
      offsetY: -10,
      yBaseOffset: 50,
      canvas: this.createOffscreen(38, 64, (c) => {
        const cx = 6;
        const cy = 0;
        const cW = 24;
        const cH = 60;

        c.fillStyle = '#f97316';
        c.beginPath();
        c.moveTo(cx, cy + cH);
        c.lineTo(cx + cW, cy + cH);
        c.lineTo(cx + cW / 2 + 3, cy);
        c.lineTo(cx + cW / 2 - 3, cy);
        c.closePath();
        c.fill();

        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.fillRect(cx + cW / 2 - 4, cy + 12, 8, 10);
        c.fillRect(cx + cW / 2 - 7, cy + 32, 14, 12);
        c.fillStyle = '#ea580c';
        c.fillRect(cx - 6, cy + cH - 4, cW + 12, 6);
      }),
    };
  }

  getProps(cameraX: number, _animationTime: number): { yBase: number; draw: () => void }[] {
    const spacing = 250;
    const startX = Math.floor(cameraX / spacing) * spacing;
    const groundY = STREET_TOP;
    const drawables: { yBase: number; draw: () => void }[] = [];

    for (let x = startX; x < cameraX + CANVAS_WIDTH + spacing; x += spacing) {
      const seed = Math.abs(Math.sin(x * 0.567)) * 100;
      const alleySpacing = 800;
      const relativeX = ((x % alleySpacing) + alleySpacing) % alleySpacing;
      const isNearAlley = (relativeX > 280 && relativeX < 340) || (relativeX > 610 && relativeX < 670);

      let sprite: CachedSprite | null = null;
      if (isNearAlley) {
        sprite = this.sprites.hydrant;
      } else if (seed < 15) {
        sprite = this.sprites.trashCan;
      } else if (seed < 30) {
        sprite = this.sprites.cardboardBox;
      } else if (seed < 45) {
        sprite = this.sprites.newspaperStack;
      } else if (seed < 75) {
        sprite = seed % 2 > 1 ? this.sprites.milkCrateBlue : this.sprites.milkCrateRed;
      } else if (seed < 90) {
        sprite = this.sprites.streetLamp;
      } else if (seed < 95) {
        sprite = this.sprites.trafficCone;
      }

      if (sprite) {
        const s = sprite;
        const drawX = x + s.offsetX;
        const drawY = groundY + s.offsetY;
        drawables.push({
          yBase: groundY + s.yBaseOffset,
          draw: () => this.ctx.drawImage(s.canvas, drawX, drawY),
        });
      }
    }

    return drawables;
  }
}
