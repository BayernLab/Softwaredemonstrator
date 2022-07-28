import { THREE } from '@enable3d/phaser-extension';
import type GameScene from './utils/game.scene';
import type LevelBase from './levels/base';

/**
* The MiniMap class is responsible for rendering a minimap in the game.
* It provides functions for setting the visibility, size, and orientation of the minimap, as well as zooming in and out of the minimap.
* @class MiniMap
*/
export default class MiniMap {
  scene: GameScene;

  mapWidth: number;

  mapHeight: number;

  private minimapX: number;

  private minimapY: number;

  private minimapSize: number;

  private minimapRect;

  private readonly padding;

  private camera: THREE.OrthographicCamera;

  private isZoomed = false;

  private visible = true;

  private minimapOrientation;

  minimapViewPort: THREE.Vector4;

  private readonly zoomFactor = 1.5;

  mapOffset: THREE.Vector3;

  constructor(level: LevelBase, x: number, y: number, minimapSize: number, padding: number, mapWidth: number, mapHeight: number, orientation: 'top' | 'bottom' | 'left' | 'right' = 'top') {
    this.scene = level.scene;
    this.mapOffset = level.mapOffset;
    this.padding = padding;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.minimapX = x;
    this.minimapY = y;
    this.minimapSize = minimapSize;
    this.setOrientation(orientation);
    this.updateMiniMapViewport();

    this.scene.thirdPostRenders.push((renderer: THREE.WebGLRenderer) => {
      if (this.camera != null && this.visible) {
        renderer.clearDepth();
        renderer.setScissorTest(true);
        renderer.setScissor(this.minimapViewPort);
        renderer.setViewport(this.minimapViewPort);
        renderer.render(this.scene.third.scene, this.camera);
        renderer.setScissorTest(false);
      }
    });
  }

  updateMiniMapViewport() {
    if (this.minimapRect) {
      this.minimapRect.destroy();
      this.minimapRect = null;
    }
    this.minimapViewPort = new THREE.Vector4(this.getMinimapX(), window.innerHeight - this.getMinimapY() - this.getMinimapHeight(), this.getMinimapWidth(), this.getMinimapHeight());
    this.minimapRect = this.scene.rexUI.add.roundRectangle(this.getMinimapX(), this.getMinimapY(), this.getMinimapWidth(), this.getMinimapHeight(), 0, 0, 0).setOrigin(0);
    this.minimapRect.setInteractive();
    this.minimapRect.on('pointerup', () => {
      if (this.isZoomed) {
        this.setSize(this.minimapSize / this.zoomFactor);
      } else {
        this.setSize(this.minimapSize * this.zoomFactor);
      }
      this.isZoomed = !this.isZoomed;
    });
  }

  setVisible(visible: boolean) {
    this.visible = visible;
  }

  setOrientation(orientation: 'top' | 'bottom' | 'left' | 'right') {
    this.minimapOrientation = orientation;
    if (this.camera != null) {
      this.scene.third.scene.remove(this.camera);
    }
    if (this.minimapOrientation === 'top') {
      this.camera = new THREE.OrthographicCamera(this.mapOffset.x - 0.5, this.mapWidth + this.mapOffset.x - 0.5, -this.mapOffset.z + 0.5, -this.mapHeight - this.mapOffset.z + 0.5);
      this.camera.up.set(0, 1, 0);
    } else if (this.minimapOrientation === 'bottom') {
      this.camera = new THREE.OrthographicCamera(-this.mapWidth - this.mapOffset.x + 0.5, -this.mapOffset.x + 0.5, this.mapHeight + this.mapOffset.z - 0.5, this.mapOffset.z - 0.5);
      this.camera.up.set(0, -1, 0);
    } else if (this.minimapOrientation === 'left') {
      this.camera = new THREE.OrthographicCamera(this.mapOffset.z - 0.5, this.mapHeight + this.mapOffset.z - 0.5, this.mapWidth + this.mapOffset.x - 0.5, this.mapOffset.x - 0.5);
      this.camera.up.set(1, 0, 0);
    } else if (this.minimapOrientation === 'right') {
      this.camera = new THREE.OrthographicCamera(-this.mapHeight - this.mapOffset.z + 0.5, -this.mapOffset.z + 0.5, -this.mapOffset.x + 0.5, -this.mapWidth - this.mapOffset.x + 0.5);
      this.camera.up.set(-1, 0, 0);
    } else {
      throw new Error('Orientation does not exist');
    }
    this.scene.third.scene.add(this.camera);
    this.camera.position.set(0, 5, 0);
    this.camera.lookAt(0, 0, 0);
    this.updateMiniMapViewport();
  }

  setPosition(x: number, y: number): void {
    this.minimapX = x;
    this.minimapY = y;
    this.updateMiniMapViewport();
  }

  setSize(size: number): void {
    this.minimapSize = size;
    this.updateMiniMapViewport();
  }

  destroy() {
    this.setVisible(false);
    if (this.camera != null) {
      this.scene.third.scene.remove(this.camera);
      this.camera = null;
    }
  }

  private getAspectRatio() {
    return this.mapHeight / this.mapWidth;
  }

  private getMinimapHeight() {
    if (this.minimapOrientation === 'top' || this.minimapOrientation === 'bottom') {
      return this.minimapSize * this.getAspectRatio();
    }
    return this.minimapSize;
  }

  private getMinimapWidth() {
    if (this.minimapOrientation === 'top' || this.minimapOrientation === 'bottom') {
      return this.minimapSize;
    }
    return this.minimapSize * this.getAspectRatio();
  }

  private getMinimapX() {
    return window.innerWidth > this.minimapX + this.getMinimapWidth() ? this.minimapX + this.padding : window.innerWidth - this.getMinimapWidth() - this.padding;
  }

  private getMinimapY() {
    return window.innerHeight > this.minimapY + this.getMinimapHeight() ? this.minimapY + this.padding : window.innerHeight - this.getMinimapHeight() - this.padding;
  }
}
