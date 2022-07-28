// eslint-disable-next-line max-classes-per-file
import { ExtendedObject3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';
import Base3DObject from './base';

/**
 * Represents the properties of a fence object.
 */
class FenceProperties {
  /**
   * The type of fence.
   * @type {string}
   */
  type = '01';

  /**
   * The style of the fence.
   * @type {string}
   */
  style = '01';

  /**
   * The direction of the fence.
   * @type {"up"|"down"}
   */
  direction: 'up' | 'down' = 'up';
}

/**
 * A 3D object representing a fence.
 * @class FenceObject
 * @extends {Base3DObject}
 */
export default class FenceObject extends Base3DObject {
  properties: FenceProperties;

  spawnObject() {
    const mesh = new ExtendedObject3D();
    this.scene.third.load.fbx(`forest_fence${this.properties.type}`).then((object) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // apply texture
          this.scene.third.load.texture(`fence${this.properties.style}`).then((texture) => {
            texture.wrapS = 1000;
            texture.wrapT = 1000;
            texture.offset.set(0, 0);
            child.material = new THREE.MeshLambertMaterial({ color: 0x4e342e });
            child.material.map = texture;
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.needsUpdate = true;
          });
        }
      });
      mesh.add(object);
    });
    mesh.scale.set(1 / 130, 1 / 200, 1 / 200);
    this.mesh = new THREE.Group();
    this.mesh.add(mesh);
    this.properties.direction = this.properties.direction ?? 'up';
    if (this.properties.direction === 'up') {
      mesh.position.set(0.3, 0.1, -0.5);
    } else if (this.properties.direction === 'down') {
      mesh.position.set(0.3, 0.1, 0.5);
    }
    this.scene.third.add.existing(this.mesh);
  }
}
