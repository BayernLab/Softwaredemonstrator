import { ExtendedObject3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';
import { AnimationKey } from '../../utils/animate';
import { Setting } from '../../utils/settings';
import Base3DObject from './base';

/**
 * A 3D object representing a robot.
 * @class RobotObject
 * @extends {Base3DObject}
 */
export default class RobotObject extends Base3DObject {
  spawnObject() {
    this.mesh = new ExtendedObject3D();
    this.scene.third.load.gltf('robot').then((gltf) => {
      this.mesh.add(gltf.scene);
      const scale = this.blockSegments === 1 ? 0.15 : 0.08;
      this.mesh.scale.set(scale, scale, scale);

      this.mesh.traverse((child) => {
        if (child.isMesh) {
          if (child.name.toLowerCase().indexOf('head_3') >= 0) {
            child.material = new THREE.MeshLambertMaterial({ color: this.properties.color });
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
            child.material = new THREE.MeshLambertMaterial({ color: this.scene.getSetting(Setting.bodyColor) });
          }
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // animations
      this.scene.third.animationMixers.add(this.getAnimationManager().mixer);
      gltf.animations.forEach((animation) => {
        this.addAnimation(animation.name, animation);
      });
      this.scene.time.delayedCall(Math.random() * 500, () => this?.getAnimationManager()?.play(AnimationKey.IDLE));
    });
    this.scene.third.add.existing(this.mesh);
  }
}
