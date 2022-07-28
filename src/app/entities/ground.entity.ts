import { THREE } from '@enable3d/phaser-extension';
import { EntityType } from '../levels/entity';
import BaseEntity from './base.entity';
import GroundObject from './objects/ground';
import TweenHelper from '../utils/tween';
import { BlockType } from '../utils/block';
import type GameScene from '../utils/game.scene';

/**
 * Represents ground.
 * @class GroundBlock
 * @extends BaseEntity
 */
export default class GroundBlock extends BaseEntity {
  type = EntityType.block;

  gameObject: GroundObject = null;

  override spawn(scene: GameScene, position: THREE.Vector3): void {
    this.destroyGameObject();
    this.gameObject = new GroundObject(scene, position, 0, this.properties, 0, 1);
    this.mapPosition = position;
    this.mapRotation = 0;
    this.gameObject.spawn();
    if (this.properties.type === BlockType.water || this.properties.type === BlockType.lava) {
      TweenHelper.scaleElement(scene, this.gameObject.mesh, new THREE.Vector3(0, 0.0005, 0), { overallDuration: 700, pauseDuration: 300 });
    }
  }
}
