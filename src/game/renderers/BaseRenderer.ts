import { COLORS } from '../constants';

export class BaseRenderer {
  private static colorCache = new Map<string, string>();
  ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  darkenColor(hex: string): string {
    if (!hex.startsWith('#')) return hex;
    let cached = BaseRenderer.colorCache.get(hex);
    if (cached) return cached;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    cached = `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
    BaseRenderer.colorCache.set(hex, cached);
    return cached;
  }

  setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
}
