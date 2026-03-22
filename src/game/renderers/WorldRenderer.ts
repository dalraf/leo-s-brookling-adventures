import { BaseRenderer } from './BaseRenderer';
import { BackgroundRenderer } from './world/BackgroundRenderer';
import { StreetRenderer } from './world/StreetRenderer';
import { BuildingRenderer } from './world/BuildingRenderer';
import { PropRenderer } from './world/PropRenderer';

export class WorldRenderer extends BaseRenderer {
  private backgroundRenderer: BackgroundRenderer;
  private streetRenderer: StreetRenderer;
  private buildingRenderer: BuildingRenderer;
  private propRenderer: PropRenderer;

  constructor(ctx: CanvasRenderingContext2D) {
    super(ctx);
    this.backgroundRenderer = new BackgroundRenderer(ctx);
    this.streetRenderer = new StreetRenderer(ctx);
    this.buildingRenderer = new BuildingRenderer(ctx);
    this.propRenderer = new PropRenderer(ctx);
  }

  drawParallaxBackground(cameraX: number) {
    this.backgroundRenderer.drawParallax(cameraX);
  }

  drawBackground(cameraX: number) {
    this.backgroundRenderer.drawWall(cameraX);
  }

  drawAlleys(cameraX: number) {
    this.buildingRenderer.drawAlleys(cameraX);
  }

  drawEntrances(cameraX: number) {
    this.buildingRenderer.drawEntrances(cameraX);
  }

  drawWindows(cameraX: number) {
    this.buildingRenderer.drawWindows(cameraX);
  }

  drawBuildingProps(_cameraX: number) {
    // Props are rendered directly onto the wall/windows caches in BuildingRenderer
  }

  drawGraffiti(_cameraX: number) {
    // Graffiti is rendered directly onto the wall cache in BackgroundRenderer
  }

  drawStreet(cameraX: number) {
    this.streetRenderer.draw(cameraX);
  }

  getSidewalkProps(cameraX: number, animationTime: number) {
    return this.propRenderer.getProps(cameraX, animationTime);
  }
}
