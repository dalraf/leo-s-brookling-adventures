import { BaseRenderer } from '../BaseRenderer';
import { CANVAS_WIDTH, COLORS, STREET_TOP, STREET_BOTTOM } from '../../constants';

export class StreetRenderer extends BaseRenderer {
  private cachedStreet: HTMLCanvasElement | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
    this.preRenderStreet();
  }

  private preRenderStreet() {
    this.cachedStreet = document.createElement('canvas');
    this.cachedStreet.width = CANVAS_WIDTH;
    this.cachedStreet.height = STREET_BOTTOM - STREET_TOP;
    const streetCtx = this.cachedStreet.getContext('2d')!;

    // Sidewalk
    streetCtx.fillStyle = COLORS.SIDEWALK;
    streetCtx.fillRect(0, 0, CANVAS_WIDTH, 30);
    streetCtx.strokeStyle = 'rgba(0,0,0,0.2)';
    streetCtx.lineWidth = 1;
    for (let sx = 0; sx < CANVAS_WIDTH; sx += 50) {
      streetCtx.strokeRect(sx, 0, 50, 30);
    }

    // Street Asphalt
    streetCtx.fillStyle = COLORS.STREET;
    streetCtx.fillRect(0, 30, CANVAS_WIDTH, STREET_BOTTOM - (STREET_TOP + 30));

    // Dividing Yellow Dashed Line
    streetCtx.strokeStyle = '#fde047';
    streetCtx.lineWidth = 2;
    streetCtx.setLineDash([30, 30]);
    streetCtx.beginPath();
    streetCtx.moveTo(0, (30 + (STREET_BOTTOM - STREET_TOP)) / 2 + 10 - 30);
    streetCtx.lineTo(CANVAS_WIDTH, (30 + (STREET_BOTTOM - STREET_TOP)) / 2 + 10 - 30);
    streetCtx.stroke();
    streetCtx.setLineDash([]);
  }

  draw(cameraX: number) {
    if (!this.cachedStreet) return;

    // Draw repeating cached street floor
    const streetStart = Math.floor(cameraX / CANVAS_WIDTH) * CANVAS_WIDTH;
    for (let xOffset = streetStart; xOffset < cameraX + CANVAS_WIDTH * 2; xOffset += CANVAS_WIDTH) {
      this.ctx.drawImage(this.cachedStreet, xOffset, STREET_TOP);
    }

    // Draw proper classic zebra crossings (Horizontal thick white rectangles)
    this.drawZebraCrossings(cameraX);
  }

  private drawZebraCrossings(cameraX: number) {
    const spacing = 1600; // Place a crosswalk every 1600 pixels
    const crosswalkWidth = 200;
    const startX = Math.floor(cameraX / spacing) * spacing;

    // Draw crosswalks currently visible on screen
    for (let x = startX; x < cameraX + CANVAS_WIDTH + spacing; x += spacing) {
      this.ctx.fillStyle = '#FFFFFF';

      const relativeX = x + 350; // Use a more consistent offset
      const crosswalkWidth = 250; // Make them wider so they are clearly "bands"
      const streetHeight = STREET_BOTTOM - (STREET_TOP + 35);

      const stripeHeight = 15; // Thicker stripes
      const stripeGap = 35;
      for (let cy = 0; cy < streetHeight; cy += stripeGap) {
        this.ctx.fillRect(relativeX, STREET_TOP + 40 + cy, crosswalkWidth, stripeHeight);
      }
    }
  }
}
