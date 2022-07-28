import { THREE } from '@enable3d/phaser-extension';
import { EntityType } from '../levels/entity';
import type GameScene from '../utils/game.scene';
import BaseEntity from './base.entity';
import TreeObject from './objects/tree';

/**
 * Represents a tree entity.
 * @class TreeEntity
 * @extends BaseEntity
 */
export default class TreeEntity extends BaseEntity {
  readonly index: number;

  name: string;

  type = EntityType.tree;

  gameObject: TreeObject = null;

  override spawn(scene: GameScene, position: THREE.Vector3, rotation = 0): void {
    this.destroyGameObject();
    this.gameObject = new TreeObject(scene, position, rotation, this.properties);
    this.mapPosition = position;
    this.mapRotation = rotation;
    this.gameObject.spawn();
  }
}
