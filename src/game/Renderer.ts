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

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.worldRenderer = new WorldRenderer(ctx);
    this.entityRenderer = new EntityRenderer(ctx);
    this.uiRenderer = new UIRenderer(ctx);
  }

  render(state: GameState) {
    this.ctx.save();
    if (state.screenShake > 0) {
      const dx = (Math.random() - 0.5) * state.screenShake;
      const dy = (Math.random() - 0.5) * state.screenShake;
      this.ctx.translate(dx, dy);
    }

    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
    
    // 2. Shadows (Drawn before all dynamic objects)
    state.enemies.forEach(enemy => {
      if (enemy.state !== 'dead') {
        this.entityRenderer.drawShadow(enemy.position.x, enemy.position.z, enemy.width);
      }
    });
    this.entityRenderer.drawShadow(state.player.position.x, state.player.position.z, state.player.width);

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

    this.ctx.restore();

    // 5. UI
    this.uiRenderer.drawHUD(state);

    if (state.isPaused) {
      this.uiRenderer.drawPaused();
    }

    if (state.isGameOver) {
      this.uiRenderer.drawGameOver(state.score, state.kills, state.level);
    }

    if (state.levelUpTimer > 0) {
      this.uiRenderer.drawLevelUp(state.level);
    }

    this.ctx.restore();
  }
}
