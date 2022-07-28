import { THREE } from '@enable3d/phaser-extension';
import { EntityType } from '../levels/entity';
import type GameScene from '../utils/game.scene';
import BaseEntity from './base.entity';
import RobotObject from './objects/robot';

/**
 * Represents a player entity.
 * @class PlayerEntity
 * @extends BaseEntity
 */
export default class PlayerEntity extends BaseEntity {
  readonly index: number;

  name: string;

  type = EntityType.robot;

  gameObject: RobotObject = null;

  override spawn(scene: GameScene, position: THREE.Vector3, rotation = 0, indexQuadrant = 0, quadrants = 1): void {
    this.destroyGameObject();
    this.gameObject = new RobotObject(scene, position, rotation, this.properties, indexQuadrant, quadrants);
    this.mapPosition = position;
    this.mapRotation = rotation;
    this.gameObject.spawn();
  }
}
