// eslint-disable-next-line max-classes-per-file
import { ExtendedObject3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';
import Base3DObject from './base';

/**
 * Represents the properties of a tree object.
 */
class TreeProperties {
  /**
   * The style of the tree.
   * @type {string}
   */
  style = '01';

  /**
   * The type of tree.
   * @type {"Round"|"Tall"|"Thin"|"Blob"}
   */
  type: 'Round' | 'Tall' | 'Thin' | 'Blob' = 'Round';

  /**
   * The texture of the tree.
   * @type {"Top"|"Snow"|null}
   */
  texture: 'Top' | 'Snow' = null;
}

/**
 * A 3D object representing a tree.
 * @class TreeObject
 * @extends {Base3DObject}
 */
export default class TreeObject extends Base3DObject {
  properties: TreeProperties;

  spawnObject() {
    this.mesh = new ExtendedObject3D();
    this.scene.third.load.fbx(`forest_tree${this.properties.type}${this.properties.style}`).then((object) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // apply texture
          const wantedtexture = this.properties.texture ? this.properties.texture : this.properties.type;
          this.scene.third.load.texture(`tree${wantedtexture}`).then((texture) => {
            texture.wrapS = 1000;
            texture.wrapT = 1000;
            texture.offset.set(0, 0);
            child.material.map = texture;
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.needsUpdate = true;
          });
        }
      });
      this.mesh.add(object);
      const scale = 400;
      this.mesh.scale.set(1 / scale, 1 / scale, 1 / scale);
      this.scene.third.add.existing(this.mesh);
    });
  }
}
