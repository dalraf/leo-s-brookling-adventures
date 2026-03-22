import { GameState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from './constants';
import { WorldRenderer } from './renderers/WorldRenderer';
import { EntityRenderer } from './renderers/EntityRenderer';
import { UIRenderer } from './renderers/UIRenderer';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private worldRenderer: WorldRenderer;
  private entityRenderer: EntityRenderer;
  private uiRenderer: UIRenderer;
  private shadowCanvas: HTMLCanvasElement;
  private shadowCtx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.worldRenderer = new WorldRenderer(ctx);
    this.entityRenderer = new EntityRenderer(ctx);
    this.uiRenderer = new UIRenderer(ctx);
    this.shadowCanvas = document.createElement('canvas');
    this.shadowCanvas.width = CANVAS_WIDTH;
    this.shadowCanvas.height = CANVAS_HEIGHT;
    this.shadowCtx = this.shadowCanvas.getContext('2d')!;
  }

  render(state: GameState) {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.save();
    if (state.screenShake > 0) {
      const dx = (Math.random() - 0.5) * state.screenShake;
      const dy = (Math.random() - 0.5) * state.screenShake;
      this.ctx.translate(dx, dy);
    }

    const cameraX = state.cameraX;

    // 1. Background & Environment
    this.worldRenderer.drawParallaxBackground(cameraX);
    
    this.ctx.save();
    this.ctx.translate(-state.cameraX, 0);
    
    this.worldRenderer.drawBackground(cameraX);
    this.worldRenderer.drawAlleys(cameraX);
    this.worldRenderer.drawEntrances(cameraX);
    this.worldRenderer.drawWindows(cameraX);
    this.worldRenderer.drawBuildingProps(cameraX);
    this.worldRenderer.drawGraffiti(cameraX);
    this.worldRenderer.drawStreet(cameraX);
    
    // 2. Shadows (Using an offscreen canvas to prevent overlaps and use accurate shapes)
    this.shadowCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.shadowCtx.save();
    this.shadowCtx.translate(-cameraX, 0);
    this.shadowCtx.filter = 'brightness(0)';
    
    this.entityRenderer.setContext(this.shadowCtx);

    // Enemies
    state.enemies.forEach(enemy => {
      if (enemy.state !== 'dead') {
        this.entityRenderer.drawEntity(enemy, COLORS.ENEMY, state.animationTime, true);
      }
    });

    // Player
    this.entityRenderer.drawEntity(state.player, COLORS.PLAYER, state.animationTime, true);

    // Dogs
    state.dogs.forEach(dog => {
      this.entityRenderer.drawDog(dog, state.animationTime, true);
    });

    // Taxis
    state.taxis.forEach(taxi => {
      this.entityRenderer.drawTaxi(taxi, true);
    });

    // Items
    state.items.forEach(item => {
      this.entityRenderer.drawItem(item, true);
    });

    this.shadowCtx.restore();
    this.entityRenderer.setContext(this.ctx);

    // Draw shadow canvas into main canvas
    this.ctx.save();
    this.ctx.globalAlpha = 0.35; // Fine-tuned opacity for concrete/asphalt
    this.ctx.drawImage(this.shadowCanvas, cameraX, 0);
    this.ctx.restore();

    // 3. Dynamic Objects (Sorted by Z/yBase for depth)
    // This includes props, items, player, and enemies
    const dynamicObjects: { z: number, draw: () => void }[] = [];

    // Add Sidewalk Props
    const props = this.worldRenderer.getSidewalkProps(cameraX, state.animationTime);
    props.forEach(p => {
      dynamicObjects.push({ z: p.yBase, draw: p.draw });
    });

    // Add Items
    state.items.forEach(item => {
      dynamicObjects.push({ 
        z: item.position.z + 10, // Adjust base line for items
        draw: () => this.entityRenderer.drawItem(item) 
      });
    });

    // Add Entities (Player and Enemies)
    const entities = [state.player, ...state.enemies.filter(e => e.state !== 'dead')];
    entities.forEach(entity => {
      dynamicObjects.push({
        z: entity.position.z,
        draw: () => {
          const color = entity === state.player ? COLORS.PLAYER : (entity.isBoss ? COLORS.BOSS : COLORS.ENEMY);
          this.entityRenderer.drawEntity(entity, color, state.animationTime);
        }
      });
    });

    // Add Dogs
    state.dogs.forEach(dog => {
      dynamicObjects.push({
        z: dog.position.z,
        draw: () => this.entityRenderer.drawDog(dog, state.animationTime)
      });
    });

    // Add Taxis
    state.taxis.forEach(taxi => {
      dynamicObjects.push({
        z: taxi.position.z,
        draw: () => this.entityRenderer.drawTaxi(taxi)
      });
    });

    // Sort all dynamic objects by their Z/yBase coordinate
    dynamicObjects.sort((a, b) => a.z - b.z);

    // Draw all dynamic objects in sorted order
    dynamicObjects.forEach(obj => obj.draw());

    // 4. Projectiles & Particles (Usually drawn on top)
    state.projectiles.forEach(p => this.entityRenderer.drawProjectile(p));
    state.particles.forEach(p => this.entityRenderer.drawParticle(p));

    this.ctx.restore(); // Close camera translate
    
    // Draw Game Over within the shake context if required
    if (state.isGameOver) {
      this.uiRenderer.drawGameOver(state.score, state.kills, state.level);
    }

    this.ctx.restore(); // Close screen shake

    // 5. UI - Stable (Drawn after all restores)
    this.uiRenderer.drawHUD(state);

    if (state.isPaused) {
      this.uiRenderer.drawPaused();
    }

    if (state.levelUpTimer > 0) {
      this.uiRenderer.drawLevelUp(state.level);
    }
  }
}
