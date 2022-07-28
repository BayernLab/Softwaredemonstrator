import { THREE, ExtendedObject3D } from '@enable3d/phaser-extension';
import { initializeLevel } from '../levels/config';
import { AnimationKey } from '../utils/animate';
import GameScene from '../utils/game.scene';
import { Setting } from '../utils/settings';
import MainGameScene from './game';

/**
 * A scene that displays a teaser screen for the game.
 * @class PreGameScene
 * @extends {GameScene}
 */
export default class PreGameScene extends GameScene {
  static sceneName = 'PreGame';

  preview: any;

  create() {
    setTimeout(() => this.initialize());
  }

  initialize() {
    this.addText(this.cameras.main.centerX, this.cameras.main.centerY * 0.5 - 50, 'Hilf Robo und lerne Programmieren!', { fontSize: Setting.fonttitle });
    this.addPlayerPreview();
    this.showLevelMap();

    this.input.once('pointerup', () => {
      setTimeout(() => this.scene.start(MainGameScene.sceneName), 1000);
    });
  }

  private showLevelMap(index = 1) {
    const levels = 9;
    if (index === 0 || index >= levels) {
      index = 1;
    } else if (index === 7) {
      index += 1;
    }
    const level = initializeLevel(this, index, [], null, null, null, false, false, false);
    level.createGroundBlocks();
    level.initEntities();
    this.time.delayedCall(5000, () => {
      level.destroy(() => this.showLevelMap(index + 1));
    });
  }

  async addPlayerPreview() {
    const mesh = new ExtendedObject3D();
    const colors = this.getSetting(Setting.playerColors);
    await this.third.load.gltf('robot').then((gltf) => {
      mesh.add(gltf.scene);

      mesh.traverse((child) => {
        if (child.isMesh) {
          if (child.name.toLowerCase().indexOf('head_3') >= 0) {
            child.material = new THREE.MeshLambertMaterial({ color: Phaser.Utils.Array.GetRandom(colors) });
            this.time.addEvent({
              delay: 500,
              repeat: -1,
              callback: () => {
                (child.material as THREE.MeshLambertMaterial).color.set(Phaser.Utils.Array.GetRandom(colors));
              },
            });
          } else if (
            child.name.toLowerCase().indexOf('torso_3') >= 0 ||
            child.name.toLowerCase().indexOf('lowerlegr_1') >= 0 ||
            child.name.toLowerCase().indexOf('lowerlegl_1') >= 0 ||
            child.name.toLowerCase().indexOf('shoulderl_1') >= 0 ||
            child.name.toLowerCase().indexOf('shoulderr_1') >= 0 ||
            child.name.toLowerCase().indexOf('armr') >= 0 ||
            child.name.toLowerCase().indexOf('arml') >= 0 ||
            child.name.toLowerCase().indexOf('handr_1') >= 0 ||
            child.name.toLowerCase().indexOf('handl_1') >= 0 ||
            child.name.toLowerCase().indexOf('_') < 0
          ) {
            child.material = new THREE.MeshLambertMaterial({ color: this.getSetting(Setting.bodyColor) });
          }
        }
      });

      // animations
      this.third.animationMixers.add(mesh.anims.mixer);
      gltf.animations.forEach((animation) => {
        mesh.anims.add(animation.name, animation);
      });
      this.time.delayedCall(Math.random() * 1000, () => mesh.anims.play(AnimationKey.WAVE));
      return mesh;
    });
    this.preview = mesh;
    this.third.add.existing(this.preview);
    const dx = (this.cameras.main.width / 2 / this.cameras.main.width) * 2 - 1;
    const dy = -((this.cameras.main.height + 60) / this.cameras.main.height) * 2 + 1;
    const position: THREE.Vector3 = this.third.transform.from2dto3d(dx, dy, 10);
    this.preview.position.set(position.x, position.y, position.z);
    this.preview.rotation.y = Math.PI / 4;
  }
}
