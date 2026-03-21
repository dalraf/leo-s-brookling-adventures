import { BaseRenderer } from './BaseRenderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, STREET_TOP, STREET_BOTTOM } from '../constants';

export class WorldRenderer extends BaseRenderer {
  private graffiti: { x: number, y: number, color: string, text: string, rotation: number, drips: { offset: number, length: number }[] }[] = [];
  private cachedWall: HTMLCanvasElement | null = null;
  private cachedStreet: HTMLCanvasElement | null = null;
  private cachedParallax: HTMLCanvasElement | null = null;
  private cachedWindows: HTMLCanvasElement | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
    this.generateGraffiti();
    this.preRenderStaticElements();
  }

  private preRenderStaticElements() {
    // 1. Pre-render Brick Wall with Graffiti
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

    // Pre-render Graffiti onto Wall
    wallCtx.font = 'bold 28px "Courier New"';
    this.graffiti.forEach((g) => {
      wallCtx.save();
      wallCtx.translate(g.x, g.y);
      wallCtx.rotate(g.rotation);
      wallCtx.fillStyle = 'rgba(0,0,0,0.4)';
      wallCtx.globalAlpha = 0.5;
      wallCtx.fillText(g.text, 2, 2);
      wallCtx.fillStyle = g.color;
      wallCtx.globalAlpha = 0.7;
      wallCtx.fillText(g.text, 0, 0);
      wallCtx.beginPath();
      const textWidth = wallCtx.measureText(g.text).width;
      g.drips.forEach(drip => {
        const dripX = (drip.offset / 60) * textWidth;
        wallCtx.moveTo(dripX, 5);
        wallCtx.lineTo(dripX, 5 + drip.length);
      });
      wallCtx.strokeStyle = g.color;
      wallCtx.lineWidth = 2;
      wallCtx.stroke();
      wallCtx.restore();

      // Repeat for the second half of the cache
      wallCtx.save();
      wallCtx.translate(g.x + CANVAS_WIDTH, g.y);
      wallCtx.rotate(g.rotation);
      wallCtx.fillStyle = 'rgba(0,0,0,0.4)';
      wallCtx.globalAlpha = 0.5;
      wallCtx.fillText(g.text, 2, 2);
      wallCtx.fillStyle = g.color;
      wallCtx.globalAlpha = 0.7;
      wallCtx.fillText(g.text, 0, 0);
      wallCtx.beginPath();
      g.drips.forEach(drip => {
        const dripX = (drip.offset / 60) * textWidth;
        wallCtx.moveTo(dripX, 5);
        wallCtx.lineTo(dripX, 5 + drip.length);
      });
      wallCtx.strokeStyle = g.color;
      wallCtx.lineWidth = 2;
      wallCtx.stroke();
      wallCtx.restore();
    });

    // 2. Pre-render Windows & Building Props
    this.cachedWindows = document.createElement('canvas');
    this.cachedWindows.width = 1200; // Match spacing in drawWindows
    this.cachedWindows.height = STREET_TOP;
    const winCtx = this.cachedWindows.getContext('2d')!;

    // Windows
    const spacingX = 200;
    const spacingY = 100;
    const winW = 80;
    const winH = 60;
    for (let x = 0; x < 1200; x += spacingX) {
      const relX = x % 1200;
      if (relX > 350 && relX < 650) continue;
      if (relX >= 0 && relX <= 250) continue;
      for (let y = 40; y < STREET_TOP - 80; y += spacingY) {
        // Window Sill (Bottom)
        winCtx.fillStyle = '#404040';
        winCtx.fillRect(x + 15, y + winH, winW + 10, 6);
        
        // Lintel (Top)
        winCtx.fillRect(x + 18, y - 6, winW + 4, 6);

        // Outer Frame
        winCtx.fillStyle = '#262626';
        winCtx.fillRect(x + 20, y, winW, winH);
        
        // Glass Area
        winCtx.fillStyle = '#171717';
        winCtx.fillRect(x + 25, y + 5, winW - 10, winH - 10);
        
        // Muntins (Crossbars)
        winCtx.strokeStyle = '#262626';
        winCtx.lineWidth = 3;
        winCtx.beginPath();
        // Vertical
        winCtx.moveTo(x + 20 + winW/2, y + 5);
        winCtx.lineTo(x + 20 + winW/2, y + winH - 5);
        // Horizontal
        winCtx.moveTo(x + 25, y + winH/2);
        winCtx.lineTo(x + 15 + winW, y + winH/2);
        winCtx.stroke();
        
        // Subtle highlight/reflection
        winCtx.strokeStyle = 'rgba(255,255,255,0.05)';
        winCtx.lineWidth = 1;
        winCtx.beginPath();
        winCtx.moveTo(x + 25, y + 10);
        winCtx.lineTo(x + 20 + winW - 10, y + 10);
        winCtx.stroke();
      }
    }

    // Building Props (Fire Escapes)
    const propSpacing = 600;
    for (let x = 0; x < 1200; x += propSpacing) {
      const seed = Math.abs(Math.sin(x * 0.05)) * 10;
      if (seed > 6 && (x % 1200) < 350 || (x % 1200) > 600) {
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

    // 3. Pre-render Street & Sidewalk
    this.cachedStreet = document.createElement('canvas');
    this.cachedStreet.width = CANVAS_WIDTH;
    this.cachedStreet.height = STREET_BOTTOM - STREET_TOP;
    const streetCtx = this.cachedStreet.getContext('2d')!;

    streetCtx.fillStyle = COLORS.SIDEWALK;
    streetCtx.fillRect(0, 0, CANVAS_WIDTH, 30);
    streetCtx.strokeStyle = 'rgba(0,0,0,0.2)';
    streetCtx.lineWidth = 1;
    for (let sx = 0; sx < CANVAS_WIDTH; sx += 50) {
      streetCtx.strokeRect(sx, 0, 50, 30);
    }

    streetCtx.fillStyle = COLORS.STREET;
    streetCtx.fillRect(0, 30, CANVAS_WIDTH, STREET_BOTTOM - (STREET_TOP + 30));
    streetCtx.strokeStyle = '#fde047';
    streetCtx.lineWidth = 2;
    streetCtx.setLineDash([30, 30]);
    streetCtx.beginPath();
    streetCtx.moveTo(0, (30 + (STREET_BOTTOM - STREET_TOP)) / 2 + 10 - 30);
    streetCtx.lineTo(CANVAS_WIDTH, (30 + (STREET_BOTTOM - STREET_TOP)) / 2 + 10 - 30);
    streetCtx.stroke();
    streetCtx.setLineDash([]);

    // 4. Pre-render Parallax Buildings
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

  private generateGraffiti() {
    const texts = ['BKLYN', 'NYC', '718', 'DOPE', 'STREET', 'VANDAL', 'KING', 'QUEENS'];
    for (let i = 0; i < 15; i++) {
      const drips = [];
      const numDrips = Math.floor(Math.random() * 4);
      for (let d = 0; d < numDrips; d++) {
        drips.push({
          offset: 5 + Math.random() * 50,
          length: 10 + Math.random() * 25
        });
      }

      this.graffiti.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 40 + Math.random() * (STREET_TOP - 120),
        color: COLORS.GRAFFITI[Math.floor(Math.random() * COLORS.GRAFFITI.length)],
        text: texts[Math.floor(Math.random() * texts.length)],
        rotation: (Math.random() - 0.5) * 0.3,
        drips: drips
      });
    }
  }

  drawParallaxBackground(cameraX: number) {
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

  drawBackground(cameraX: number) {
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

  drawGraffiti(cameraX: number) {
    // Already pre-rendered onto cachedWall
  }

  drawStreet(cameraX: number) {
    if (this.cachedStreet) {
      const streetStart = Math.floor(cameraX / CANVAS_WIDTH) * CANVAS_WIDTH;
      for (let xOffset = streetStart; xOffset < cameraX + CANVAS_WIDTH + CANVAS_WIDTH; xOffset += CANVAS_WIDTH) {
        this.ctx.drawImage(this.cachedStreet, xOffset, STREET_TOP);
        
        // Zebra crossing (still dynamic based on position)
        if ((xOffset % 1000) === 0) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.2)';
          for (let cx = 0; cx < 150; cx += 30) {
            this.ctx.fillRect(xOffset + 400 + cx, STREET_TOP + 30, 20, STREET_BOTTOM - (STREET_TOP + 30));
          }
        }
      }
    }
  }

  drawAlleys(cameraX: number) {
    const spacing = 1200;
    const startX = Math.floor(cameraX / spacing) * spacing;
    const pOffset = 15;
    for (let x = startX; x < cameraX + CANVAS_WIDTH + spacing; x += spacing) {
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
      this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      this.ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const lx = alleyX + (alleyW / 4) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(lx, STREET_TOP);
        this.ctx.lineTo(alleyX + pOffset + (alleyW - pOffset * 2) / 4 * i, alleyFloorY);
        this.ctx.stroke();
      }
      this.ctx.fillStyle = '#2a2a2a';
      this.ctx.beginPath();
      this.ctx.moveTo(alleyX, -5);
      this.ctx.lineTo(alleyX + pOffset, -5);
      this.ctx.lineTo(alleyX + pOffset, alleyFloorY);
      this.ctx.lineTo(alleyX, STREET_TOP);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.moveTo(alleyX + alleyW, -5);
      this.ctx.lineTo(alleyX + alleyW - pOffset, -5);
      this.ctx.lineTo(alleyX + alleyW - pOffset, alleyFloorY);
      this.ctx.lineTo(alleyX + alleyW, STREET_TOP);
      this.ctx.fill();
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
        const litSeed = Math.sin(x * 0.5 + i);
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
      const drawTrashCan = (tx: number, ty: number) => {
        // Shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(tx + 15, ty + 33, 18, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Main body (corrugated metal)
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

        // Rim and Lid
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillRect(tx - 3, ty - 3, 36, 6);
        this.ctx.fillRect(tx + 12, ty - 8, 6, 5); // Handle

        // Trash overflowing
        this.ctx.fillStyle = '#1f2937'; // Dark bag
        this.ctx.beginPath();
        this.ctx.arc(tx + 9, ty - 6, 9, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(tx + 21, ty - 4, 7, 0, Math.PI * 2);
        this.ctx.fill();
      };
      drawTrashCan(alleyX + 30, STREET_TOP - 35);
      drawTrashCan(alleyX + alleyW - 75, STREET_TOP - 38);
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(alleyX, 0, 5, STREET_TOP);
      this.ctx.fillRect(alleyX + alleyW - 5, 0, 5, STREET_TOP);
    }
  }

  drawEntrances(cameraX: number) {
    const spacing = 1200;
    const startX = Math.floor(cameraX / spacing) * spacing;
    for (let x = startX; x < cameraX + CANVAS_WIDTH + spacing; x += spacing) {
      const relativeX = x % 800;
      if (relativeX > 300 && relativeX < 650) continue;
      
      // Brooklyn Stoop Design
      const stoopX = x + 100;
      const stoopW = 120;
      const doorHeight = 140;
      const landingY = STREET_TOP - 60; // Door is higher up
      
      // Main Stoop Structure (The block the door sits on)
      this.ctx.fillStyle = '#333333';
      this.ctx.fillRect(stoopX, landingY, stoopW, 60);
      
      // Stone block details on the stoop base
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(stoopX + stoopW/2, landingY);
      this.ctx.lineTo(stoopX + stoopW/2, STREET_TOP);
      this.ctx.moveTo(stoopX, landingY + 30);
      this.ctx.lineTo(stoopX + stoopW, landingY + 30);
      this.ctx.stroke();

      this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      this.ctx.strokeRect(stoopX, landingY, stoopW, 60);

      // The Door (Higher up)
      this.ctx.fillStyle = '#1a1a1a'; // Door frame
      this.ctx.fillRect(stoopX + 20, landingY - doorHeight, 80, doorHeight);
      this.ctx.fillStyle = '#450a0a'; // Door wood
      this.ctx.fillRect(stoopX + 25, landingY - doorHeight + 5, 70, doorHeight - 5);
      
      // Door details
      this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(stoopX + 35, landingY - doorHeight + 15, 50, 50);
      this.ctx.strokeRect(stoopX + 35, landingY - 70, 50, 60);
      this.ctx.fillStyle = '#fbbf24'; // Brass handle
      this.ctx.beginPath();
      this.ctx.arc(stoopX + 85, landingY - 75, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Lateral Stairs (Stoop style - Stepped Profile / Serrilhado)
      const numSteps = 6;
      const stepH = 10;
      const stepW = 12;
      const totalWidth = numSteps * stepW;
      const startX = stoopX - totalWidth;
      
      this.ctx.fillStyle = COLORS.SIDEWALK;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, STREET_TOP);
      
      for (let i = 0; i < numSteps; i++) {
        // Horizontal tread (right)
        this.ctx.lineTo(startX + (i * stepW) + stepW, STREET_TOP - (i * stepH));
        // Vertical riser (up)
        this.ctx.lineTo(startX + (i * stepW) + stepW, STREET_TOP - (i + 1) * stepH);
      }
      
      // Close the polygon back to ground
      this.ctx.lineTo(stoopX, STREET_TOP);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Serrilhado (Zigzag) outline for the steps
      this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Decorative Railing for the stairs (Lifted up)
      const railHeight = 25;
      this.ctx.strokeStyle = '#171717';
      this.ctx.lineWidth = 3;
      
      // Handrail
      this.ctx.beginPath();
      this.ctx.moveTo(startX, STREET_TOP - railHeight);
      this.ctx.lineTo(stoopX, landingY - railHeight);
      this.ctx.stroke();

      // Vertical posts for the railing
      this.ctx.lineWidth = 2;
      for (let i = 0; i <= numSteps; i += 2) {
        const px = startX + i * stepW;
        const py = STREET_TOP - i * stepH;
        this.ctx.beginPath();
        this.ctx.moveTo(px, py);
        this.ctx.lineTo(px, py - railHeight);
        this.ctx.stroke();
      }

      // Railing for the stoop landing
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(stoopX, landingY - railHeight);
      this.ctx.lineTo(stoopX + stoopW, landingY - railHeight);
      this.ctx.stroke();
      
      // Landing posts
      this.ctx.beginPath();
      this.ctx.moveTo(stoopX, landingY);
      this.ctx.lineTo(stoopX, landingY - railHeight);
      this.ctx.moveTo(stoopX + stoopW, landingY);
      this.ctx.lineTo(stoopX + stoopW, landingY - railHeight);
      this.ctx.stroke();
    }
  }

  drawWindows(cameraX: number) {
    if (this.cachedWindows) {
      const spacing = 1200;
      const startX = Math.floor(cameraX / spacing) * spacing;
      for (let x = startX; x < cameraX + CANVAS_WIDTH + spacing; x += spacing) {
        this.ctx.drawImage(this.cachedWindows, x, 0);
        
        // Add dynamic lit windows (low cost since it's just a few rects)
        const spacingX = 200;
        const spacingY = 100;
        const winW = 80;
        const winH = 60;
        for (let wx = 0; wx < 1200; wx += spacingX) {
          const relX = wx % 1200;
          if (relX > 350 && relX < 650) continue;
          if (relX >= 0 && relX <= 250) continue;
          for (let wy = 40; wy < STREET_TOP - 80; wy += spacingY) {
            // Use a simpler check for lit windows
            const seed = Math.sin((x + wx) * 0.1 + wy * 0.5);
            if (seed > 0.7) {
              this.ctx.fillStyle = '#fef08a';
              this.ctx.globalAlpha = 0.2;
              this.ctx.fillRect(x + wx + 25, wy + 5, winW - 10, winH - 10);
              
              // Light glow detail
              this.ctx.fillStyle = 'rgba(254, 240, 138, 0.1)';
              this.ctx.fillRect(x + wx + 30, wy + 10, winW - 20, 5);
              
              this.ctx.globalAlpha = 1.0;
            }
          }
        }
      }
    }
  }

  drawBuildingProps(cameraX: number) {
    // Already pre-rendered onto cachedWindows
  }

  getSidewalkProps(cameraX: number, animationTime: number): { yBase: number, draw: () => void }[] {
    const spacing = 250; 
    const startX = Math.floor(cameraX / spacing) * spacing;
    const time = animationTime / 100;
    const groundY = STREET_TOP;
    
    const drawables: { yBase: number, draw: () => void }[] = [];

    for (let x = startX; x < cameraX + CANVAS_WIDTH + spacing; x += spacing) {
      const seed = (Math.abs(Math.sin(x * 0.567)) * 100);
      const alleySpacing = 800;
      const relativeX = x % alleySpacing;
      const isNearAlley = (relativeX > 280 && relativeX < 340) || (relativeX > 610 && relativeX < 670);
      
      if (isNearAlley) {
        // Fire Hydrant
        const hX = x;
        const hY = groundY - 15;
        const hW = 24;
        const hH = 40;
        drawables.push({
          yBase: hY + hH,
          draw: () => {
            // Shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(hX + 12, hY + hH + 5, 15, 4, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillRect(hX - 4, hY + hH - 5, hW + 8, 10); // Base
            this.ctx.fillRect(hX, hY, hW, hH); // Body
            
            // Side caps
            this.ctx.fillStyle = '#991b1b';
            this.ctx.fillRect(hX - 6, hY + 12, 6, 10);
            this.ctx.fillRect(hX + hW, hY + 12, 6, 10);
            
            // Chains (details)
            this.ctx.strokeStyle = '#4b5563';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(hX - 3, hY + 22);
            this.ctx.lineTo(hX + 5, hY + 30);
            this.ctx.moveTo(hX + hW + 3, hY + 22);
            this.ctx.lineTo(hX + hW - 5, hY + 30);
            this.ctx.stroke();

            // Top dome
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(hX + hW/2, hY, hW/2, Math.PI, 0);
            this.ctx.fill();
            
            // Top nut
            this.ctx.fillStyle = '#991b1b';
            this.ctx.fillRect(hX + hW/2 - 4, hY - 14, 8, 6);
            
            this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(hX, hY, hW, hH);
          }
        });
      } else if (seed < 15) {
        // Trash Can
        const tx = x + 40;
        const ty = groundY - 10;
        drawables.push({
          yBase: ty + 48,
          draw: () => {
            // Shadow
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
        });
      } else if (seed < 30) {
        // Cardboard Boxes
        const bx = x + 30;
        const by = groundY + 5;
        const bW = 65;
        const bH = 45;
        drawables.push({
          yBase: by + bH,
          draw: () => {
            this.ctx.fillStyle = '#92400e'; // Brown
            this.ctx.fillRect(bx, by, bW, bH);
            this.ctx.strokeStyle = '#78350f';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(bx, by, bW, bH);
            
            // Flaps and Tape
            this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(bx, by + bH/2);
            this.ctx.lineTo(bx + bW, by + bH/2); // Center seam
            this.ctx.stroke();
            
            this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
            this.ctx.fillRect(bx + 10, by + bH/2 - 3, bW - 20, 6); // Packing tape
            
            // Shipping Label
            this.ctx.fillStyle = '#f3f4f6';
            this.ctx.fillRect(bx + bW - 20, by + 8, 12, 10);
            this.ctx.fillStyle = '#374151';
            this.ctx.fillRect(bx + bW - 18, by + 10, 8, 1);
            this.ctx.fillRect(bx + bW - 18, by + 13, 6, 1);
          }
        });
      } else if (seed < 45) {
        // Newspaper Stacks
        const nx = x + 50;
        const ny = groundY + 10;
        drawables.push({
          yBase: ny + 22,
          draw: () => {
            this.ctx.fillStyle = '#f3f4f6'; // Brighter paper
            this.ctx.fillRect(nx, ny, 45, 22);
            
            // Masthead/Headline area
            this.ctx.fillStyle = '#1f2937';
            this.ctx.fillRect(nx + 4, ny + 3, 37, 4); // Masthead
            
            // Text lines
            this.ctx.strokeStyle = '#9ca3af';
            this.ctx.lineWidth = 1;
            for(let i=9; i<20; i+=3) {
              this.ctx.beginPath();
              this.ctx.moveTo(nx + 4, ny + i);
              this.ctx.lineTo(nx + 41, ny + i);
              this.ctx.stroke();
            }

            // Photo area
            this.ctx.fillStyle = '#6b7280';
            this.ctx.fillRect(nx + 25, ny + 9, 12, 8);

            // String/Binding
            this.ctx.strokeStyle = '#374151';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(nx + 18, ny - 2, 9, 26);
          }
        });
      } else if (seed < 60) {
        // Puddles
        const px = x + 20;
        const py = groundY + 20;
        const pWidth = 90 + (seed % 30);
        const pHeight = 22 + (seed % 15);
        drawables.push({
          yBase: py + pHeight,
          draw: () => {
            const grad = this.ctx.createRadialGradient(px + pWidth/2, py + pHeight/2, 0, px + pWidth/2, py + pHeight/2, pWidth/2);
            grad.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
            grad.addColorStop(1, 'rgba(30, 58, 138, 0.1)');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.ellipse(px + pWidth/2, py + pHeight/2, pWidth/2, pHeight/2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            // Reflection highlight
            this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
            this.ctx.fillRect(px + pWidth/3, py + pHeight/3, pWidth/4, 3);
          }
        });
      } else if (seed < 75) {
        // Milk Crates
        const cx = x + 10;
        const cy = groundY + 5;
        const cS = 40; // Size
        drawables.push({
          yBase: cy + cS,
          draw: () => {
            this.ctx.fillStyle = seed % 2 > 1 ? '#1e40af' : '#991b1b'; // Blue or Red
            this.ctx.fillRect(cx, cy, cS, cS);
            
            // Grid pattern (holes)
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            const holeSize = 6;
            const gap = 4;
            for(let row=0; row<3; row++) {
              for(let col=0; col<3; col++) {
                this.ctx.fillRect(
                  cx + gap + col * (holeSize + gap),
                  cy + gap + row * (holeSize + gap),
                  holeSize,
                  holeSize
                );
              }
            }
            
            this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(cx, cy, cS, cS);
            
            // Handle cutout
            this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
            this.ctx.fillRect(cx + 8, cy + cS - 12, cS - 16, 6);
          }
        });
      } else if (seed < 90) {
        // Street Lamp
        const lx = x + 10;
        const ly = groundY + 10;
        drawables.push({
          yBase: ly,
          draw: () => {
            this.ctx.fillStyle = '#171717';
            this.ctx.fillRect(lx, ly - 220, 12, 220); // Pole
            this.ctx.fillRect(lx - 6, ly - 8, 24, 8); // Base
            
            // Lamp head
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
            
            // Light glow
            const glow = this.ctx.createRadialGradient(0, 8, 0, 0, 8, 60);
            glow.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
            glow.addColorStop(1, 'rgba(254, 240, 138, 0)');
            this.ctx.fillStyle = glow;
            this.ctx.beginPath();
            this.ctx.arc(0, 8, 60, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
          }
        });
      } else if (seed < 95) {
        // Traffic Cone
        const cx = x + 60;
        const cy = groundY - 10;
        const coneWidth = 24;
        const coneHeight = 60;
        drawables.push({
          yBase: cy + coneHeight,
          draw: () => {
            this.ctx.fillStyle = '#f97316'; // Orange
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cy + coneHeight);
            this.ctx.lineTo(cx + coneWidth, cy + coneHeight);
            this.ctx.lineTo(cx + (coneWidth / 2) + 3, cy);
            this.ctx.lineTo(cx + (coneWidth / 2) - 3, cy);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Reflective bands (two bands)
            this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
            // Upper band
            this.ctx.fillRect(cx + (coneWidth / 2) - 4, cy + 12, 8, 10);
            // Lower band
            this.ctx.fillRect(cx + (coneWidth / 2) - 7, cy + 32, 14, 12);
            
            // Base
            this.ctx.fillStyle = '#ea580c';
            this.ctx.fillRect(cx - 6, cy + coneHeight - 4, coneWidth + 12, 6);
          }
        });
      }
    }

    return drawables;
  }
}
