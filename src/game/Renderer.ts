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
  private dynamicObjects: { z: number; draw: () => void }[] = [];

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
    this.ctx.save();
    if (state.screenShake > 0) {
      const dx = (Math.random() - 0.5) * state.screenShake;
      const dy = (Math.random() - 0.5) * state.screenShake;
      this.ctx.translate(dx, dy);
    }

    const cameraX = state.cameraX;
    const minVisibleX = cameraX - 250;
    const maxVisibleX = cameraX + CANVAS_WIDTH + 250;

    // 1. Background & Environment (drawParallaxBackground fills the whole canvas)
    this.worldRenderer.drawParallaxBackground(cameraX);
    
    this.ctx.save();
    this.ctx.translate(-cameraX, 0);
    
    this.worldRenderer.drawBackground(cameraX);
    this.worldRenderer.drawAlleys(cameraX);
    this.worldRenderer.drawEntrances(cameraX);
    this.worldRenderer.drawWindows(cameraX);
    this.worldRenderer.drawBuildingProps(cameraX);
    this.worldRenderer.drawGraffiti(cameraX);
    this.worldRenderer.drawStreet(cameraX);
    
    // 2. Shadows (Using an offscreen canvas + source-in tinting instead of slow ctx.filter)
    this.shadowCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.shadowCtx.save();
    this.shadowCtx.translate(-cameraX, 0);
    
    this.entityRenderer.setContext(this.shadowCtx);

    const { enemies, player, dogs, taxis, items, projectiles, particles, animationTime } = state;

    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (enemy.state !== 'dead' && enemy.position.x >= minVisibleX && enemy.position.x <= maxVisibleX) {
        this.entityRenderer.drawEntity(enemy, COLORS.ENEMY, animationTime, true);
      }
    }

    this.entityRenderer.drawEntity(player, COLORS.PLAYER, animationTime, true);

    for (let i = 0; i < dogs.length; i++) {
      const dog = dogs[i];
      if (dog.position.x >= minVisibleX && dog.position.x <= maxVisibleX) {
        this.entityRenderer.drawDog(dog, animationTime, true);
      }
    }

    for (let i = 0; i < taxis.length; i++) {
      const taxi = taxis[i];
      if (taxi.position.x >= minVisibleX - 200 && taxi.position.x <= maxVisibleX + 200) {
        this.entityRenderer.drawTaxi(taxi, true);
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.position.x >= minVisibleX && item.position.x <= maxVisibleX) {
        this.entityRenderer.drawItem(item, true);
      }
    }

    this.shadowCtx.restore();

    // Tint all drawn shadow silhouettes solid black in one fast composite pass
    this.shadowCtx.globalCompositeOperation = 'source-in';
    this.shadowCtx.fillStyle = '#000';
    this.shadowCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.shadowCtx.globalCompositeOperation = 'source-over';

    this.entityRenderer.setContext(this.ctx);

    // Draw shadow canvas into main canvas
    this.ctx.save();
    this.ctx.globalAlpha = 0.35;
    this.ctx.drawImage(this.shadowCanvas, cameraX, 0);
    this.ctx.restore();

    // 3. Dynamic Objects (Sorted by Z/yBase for depth)
    const dynamicObjects = this.dynamicObjects;
    dynamicObjects.length = 0;

    // Add Sidewalk Props
    const props = this.worldRenderer.getSidewalkProps(cameraX, animationTime);
    for (let i = 0; i < props.length; i++) {
      const p = props[i];
      dynamicObjects.push({ z: p.yBase, draw: p.draw });
    }

    // Add Items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.position.x >= minVisibleX && item.position.x <= maxVisibleX) {
        dynamicObjects.push({
          z: item.position.z + 10,
          draw: () => this.entityRenderer.drawItem(item)
        });
      }
    }

    // Add Player
    dynamicObjects.push({
      z: player.position.z,
      draw: () => this.entityRenderer.drawEntity(player, COLORS.PLAYER, animationTime)
    });

    // Add Enemies
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (enemy.state !== 'dead' && enemy.position.x >= minVisibleX && enemy.position.x <= maxVisibleX) {
        const color = enemy.isBoss ? COLORS.BOSS : COLORS.ENEMY;
        dynamicObjects.push({
          z: enemy.position.z,
          draw: () => this.entityRenderer.drawEntity(enemy, color, animationTime)
        });
      }
    }

    // Add Dogs
    for (let i = 0; i < dogs.length; i++) {
      const dog = dogs[i];
      if (dog.position.x >= minVisibleX && dog.position.x <= maxVisibleX) {
        dynamicObjects.push({
          z: dog.position.z,
          draw: () => this.entityRenderer.drawDog(dog, animationTime)
        });
      }
    }

    // Add Taxis
    for (let i = 0; i < taxis.length; i++) {
      const taxi = taxis[i];
      if (taxi.position.x >= minVisibleX - 200 && taxi.position.x <= maxVisibleX + 200) {
        dynamicObjects.push({
          z: taxi.position.z,
          draw: () => this.entityRenderer.drawTaxi(taxi)
        });
      }
    }

    // Sort all dynamic objects by their Z/yBase coordinate
    dynamicObjects.sort((a, b) => a.z - b.z);

    // Draw all dynamic objects in sorted order
    for (let i = 0; i < dynamicObjects.length; i++) {
      dynamicObjects[i].draw();
    }

    // 4. Projectiles & Particles (Drawn on top)
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i];
      if (p.position.x >= minVisibleX && p.position.x <= maxVisibleX) {
        this.entityRenderer.drawProjectile(p);
      }
    }
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.position.x >= minVisibleX && p.position.x <= maxVisibleX) {
        this.entityRenderer.drawParticle(p);
      }
    }

    this.ctx.restore(); // Close camera translate
    this.ctx.restore(); // Close screen shake

    // 5. UI - Stable (Drawn after all restores)
    if (!state.isGameOver) {
      this.uiRenderer.drawHUD(state);
      
      if (state.isPaused) {
        this.uiRenderer.drawPaused();
      }

      if (state.levelUpTimer > 0) {
        this.uiRenderer.drawLevelUp(state.level);
      }
    } else {
      this.uiRenderer.drawGameOver(state.score, state.kills, state.level);
    }
  }
}
