import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin';
import { Scene3D, THREE } from '@enable3d/phaser-extension';
import { MapControls, OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GameSettings, { Setting } from './settings';
import { parseColor } from './color';
import TextStyle from './game.text';

/**
 * Generates random particle positions.
 *
 * @param {number} particleCount - The number of particles for which to generate positions.
 * @returns {Float32Array} An array of random positions, with three elements for each particle (x, y, z).
 */
const getRandomParticelPositions = (particleCount: number): Float32Array => {
  const arr = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    arr[i] = (Math.random() - 0.5) * 25;
  }
  return arr;
};

/**
 * Generates a THREE.Points object with random positions.
 *
 * @param {number} particleCount - The number of particles for which to generate positions.
 * @returns {THREE.Points} A THREE.Points object with ``particleCount`` particles.
 */
const getBackgroundPoints = (particleCount = 1000): THREE.Points => {
  const material = new THREE.PointsMaterial({
    size: 1.5,
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(getRandomParticelPositions(particleCount), 3));
  return new THREE.Points(geometry, material);
};

const backgroundPoints: THREE.Points = getBackgroundPoints();

/**
 * Abstract base class for game scenes.
 * @class GameScene
 * @extends {Scene3D}
 * @abstract
 */
export default abstract class GameScene extends Scene3D {
  static sceneName: string;

  rexUI: UIPlugin;

  rexGesture: GesturesPlugin;

  gameSettings: GameSettings;

  thirdPostRenders: ((renderer: THREE.WebGLRenderer) => void)[] = [];

  thirdPreRenders: ((renderer: THREE.WebGLRenderer) => void)[] = [];

  orbitControls: MapControls;

  private viewport: THREE.Vector4;

  private shouldSetCameraTo3D = false;

  private shouldSetCameraTo2D = false;

  private readonly viewVector3D: THREE.Vector3 = new THREE.Vector3(50, 50, 50);

  private readonly viewVector2D: THREE.Vector3 = new THREE.Vector3(0, 50, 0);

  /*
   * Initializes the scene.
   * Setup third dimension with a custom camera. See https://threejs.org/docs/#api/en/cameras/OrthographicCamera
   * Setup background with star particles.
   * Setup input, renderers and physics.
   */
  async preload() {
    this.gameSettings = new GameSettings();
    const frustumSize = 10;
    const aspect = this.cameras.main.width / this.cameras.main.height;
    const camera = new THREE.OrthographicCamera((frustumSize * aspect) / -2, (frustumSize * aspect) / 2, frustumSize / 2, frustumSize / -2);
    camera.up.set(0, 1, 0);
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);
    camera.zoom = 0.7;
    this.accessThirdDimension({
      camera,
      antialias: true,
      usePhysics: false,
    });
    await this.third.warpSpeed('-ground', '-fog', '-orbitControls', '-sky', '-camera');
    this.third.scene.background = new THREE.Color(this.getSetting(Setting.backgroundColor));
    this.setupBackground();

    this.viewport = new THREE.Vector4();
    this.third.renderer.getViewport(this.viewport);

    this.third.preRender = () => {
      this.third.renderer.setViewport(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
      this.thirdPreRenders.forEach((render) => render(this.third.renderer));
    };
    this.third.postRender = () => {
      this.thirdPostRenders.forEach((render) => render(this.third.renderer));
    };

    this.input.addPointer(9);
    this.game.input.pointers.forEach((pointer) => {
      pointer.motionFactor = 0.4;
    });

    this.matter.world.setBounds();
    this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
      bodyA.isMoving = true;
      bodyB.isMoving = true;
    });
  }

  update(time, delta) {
    if (this.shouldSetCameraTo2D || this.shouldSetCameraTo3D) {
      const positionVector = this.shouldSetCameraTo2D ? this.viewVector2D : this.viewVector3D;
      this.third.camera.position.lerp(positionVector.clone(), 0.08);
      if (this.orbitControls) {
        this.orbitControls.update();
      }
    }
  }

  /**
   * Sets the camera to 3D position.
   */
  setCameraTo3D() {
    this.shouldSetCameraTo2D = false;
    this.shouldSetCameraTo3D = true;
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        this.shouldSetCameraTo3D = false;
        this.shouldSetCameraTo2D = false;
      },
    });
  }

  /**
   * Sets the camera to 2D position.
   */
  setCameraTo2D() {
    this.shouldSetCameraTo3D = false;
    this.shouldSetCameraTo2D = true;
    this.time.addEvent({
      delay: 1500,
      callback: () => {
        this.shouldSetCameraTo3D = false;
        this.shouldSetCameraTo2D = false;
      },
    });
  }

  protected initOrbitControls() {
    this.orbitControls?.dispose();
    this.orbitControls = new OrbitControls(this.third.camera, document.getElementById('enable3d-phaser-canvas'));
    this.orbitControls.maxPolarAngle = 1;
    this.orbitControls.enablePan = false;
    this.orbitControls.enableRotate = true;
    this.orbitControls.enableZoom = true;
    this.orbitControls.maxZoom = 1.3;
    this.orbitControls.minZoom = 0.5;
    this.orbitControls.screenSpacePanning = true;
  }

  getSetting(key: Setting): any {
    return this.gameSettings.get(key);
  }

  private setupBackground() {
    this.third.add.existing(backgroundPoints);
  }

  addText(x: number, y: number, text: string, style?: Partial<TextStyle>): Phaser.GameObjects.Text {
    style = new TextStyle(style);
    const textGameObject = this.add
      .text(x, y, text)
      .setOrigin(0.5, 0.5)
      .setFontFamily(this.getSetting(style.fontFamily))
      .setFontSize(this.getSetting(style.fontSize))
      .setFill(parseColor(this.getSetting(style.fontColor)));
    return textGameObject;
  }

  showToast(message: string, duration = 5000) {
    const toast = this.rexUI.add
      .toast({
        x: this.cameras.main.centerX,
        y: this.cameras.main.centerY,

        background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, this.getSetting(Setting.baseColorDark)),
        text: this.addText(0, 0, ''),
        space: {
          left: 20,
          right: 20,
          top: 20,
          bottom: 20,
        },
      })
      .showMessage(message);
    setTimeout(() => toast.destroy(), duration);
  }

  clearThirdDimension() {
    super.clearThirdDimension();
    this.thirdPreRenders = [];
    this.thirdPostRenders = [];
  }
}
