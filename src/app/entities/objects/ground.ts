import { ExtendedObject3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';
import { BlockType } from '../../utils/block';
import Base3DObject from './base';

/**
 * Gets the scale of a block based on its type.
 * @param {BlockType} type The type of the block.
 * @returns {THREE.Vector3} The scale of the block.
 */
function getBlockScale(type: BlockType): THREE.Vector3 {
  switch (type) {
    case BlockType.earth:
    case BlockType.mud:
    case BlockType.ice:
      return new THREE.Vector3(0.01, 0.01, 0.01);
    case BlockType.snow:
      return new THREE.Vector3(0.01, 0.0107, 0.01);
    case BlockType.water:
    case BlockType.lava:
      return new THREE.Vector3(0.01, 0.005, 0.01);
    default:
      return new THREE.Vector3(1, 1, 1);
  }
}

/**
 * Gets the offset of a block based on its type.
 * @param {BlockType} type The type of the block.
 * @returns {THREE.Vector3} The offset of the block.
 */
function getOffset(type: BlockType): THREE.Vector3 {
  switch (type) {
    case 'earth':
    case 'mud':
    case 'ice':
      return new THREE.Vector3(0, 0.5, 0);
    case 'snow':
      return new THREE.Vector3(0, 0.5, 0);
    case 'water':
    case 'lava':
      return new THREE.Vector3(0, 0.25, 0);
    default:
      return new THREE.Vector3(0, 0, 0);
  }
}

/**
 * A 3D object representing ground.
 * @class GroundObject
 * @extends {Base3DObject}
 */
export default class GroundObject extends Base3DObject {
  constructor(scene, position, rotation, properties, indexQuadrant, quadrands) {
    super(scene, position, rotation, properties, indexQuadrant, quadrands);
    this.offset = getOffset(this.properties.type);
  }

  spawnObject() {
    const { type } = this.properties;
    this.mesh = new ExtendedObject3D();
    this.scene.third.load.fbx('block').then((object) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // apply texture
          this.scene.third.load.texture(type).then((texture) => {
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
      this.mesh.name = type;
    });
    const scale = getBlockScale(type);
    this.mesh.scale.set(scale.x, scale.y, scale.z);
    setTimeout(() => this.scene.third.add.existing(this.mesh), 100);
  }
}
