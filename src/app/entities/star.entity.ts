import { THREE } from '@enable3d/phaser-extension';
import { EntityType } from '../levels/entity';
import type GameScene from '../utils/game.scene';
import BaseEntity from './base.entity';
import StarObject from './objects/star';

/**
 * Represents a star entity.
 * @class StarEntity
 * @extends BaseEntity
 */
export default class StarEntity extends BaseEntity {
  gameObject: StarObject = null;

  type = EntityType.star;

  override spawn(scene: GameScene, position: THREE.Vector3, rotation = 0, indexQuadrant = 0, quadrants = 1): void {
    this.destroyGameObject();
    this.gameObject = new StarObject(scene, position, rotation, null, indexQuadrant, quadrants);
    this.mapPosition = position;
    this.mapRotation = rotation;
    this.gameObject.spawn();
  }

  override update(time, delta): void {
    if (this.shouldUpdate()) {
      this.gameObject.mesh.rotation.y += 0.03;
    }
  }
}
