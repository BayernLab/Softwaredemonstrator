import { THREE } from '@enable3d/phaser-extension';
import { EntityType } from '../levels/entity';
import type GameScene from '../utils/game.scene';
import BaseEntity from './base.entity';
import FenceObject from './objects/fence';

/**
 * Represents a fence entity.
 * @class FenceEntity
 * @extends BaseEntity
 */
export default class FenceEntity extends BaseEntity {
  readonly index: number;

  name: string;

  type: EntityType.fence;

  gameObject: FenceObject = null;

  override spawn(scene: GameScene, position: THREE.Vector3, rotation = 0): void {
    this.destroyGameObject();
    this.gameObject = new FenceObject(scene, position, rotation, this.properties);
    this.mapPosition = position;
    this.mapRotation = rotation;
    this.gameObject.spawn();
  }
}
