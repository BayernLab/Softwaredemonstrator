import { THREE } from '@enable3d/phaser-extension';
import { EntityType } from '../levels/entity';
import type GameScene from '../utils/game.scene';
import BaseEntity from './base.entity';
import SawObject from './objects/saw';

/**
 * Represents a moving entity.
 * @class MovingEntity
 * @extends BaseEntity
 */
export default class MovingEntity extends BaseEntity {
  gameObject: SawObject = null;

  type = EntityType.mover;

  isMoving = false;

  target: THREE.Vector3;

  currentTarget: THREE.Vector3;

  rtt: any;

  moveStoppedTime: number;

  override spawn(scene: GameScene, position: THREE.Vector3): void {
    this.destroyGameObject();
    this.rtt = 2000;
    this.moveStoppedTime = 0;
    this.gameObject = new SawObject(scene, position, Math.PI / 2, null);
    this.mapPosition = position;
    this.mapRotation = 0;
    this.target = (this.properties.target as THREE.Vector3).clone() ?? position;
    this.currentTarget = this.target;
    this.gameObject.spawn();
  }

  willCollide(position: THREE.Vector3) {
    if (position === this.mapPosition) {
      return this.rtt - Date.now() - this.moveStoppedTime < 200; // will the object be here for at least another 200ms
    }
    return this.rtt - Date.now() - this.moveStoppedTime < 1200; // will the object arrive here in less than 1200ms (normal animation time)
  }

  override update(time, delta): void {
    if (this.shouldUpdate()) {
      this.gameObject.mesh.rotation.z += 0.5;
      if (!this.isMoving) {
        this.isMoving = true;
        const forwardPosition: THREE.Vector3 = this.currentTarget;
        const currentPosition = this.mapPosition.clone();
        this.mapPosition = forwardPosition;

        if (this.gameObject?.mesh != null) {
          this.gameObject.moveTo(
            currentPosition,
            forwardPosition,
            () => {
              if (this.gameObject?.mesh != null) {
                this.setInGamePosition(this.mapPosition);
                if (this && this.gameObject && this.gameObject.mesh) {
                  if (this.mapPosition.equals(this.target)) {
                    this.currentTarget = this.gameObject.initialPosition;
                    this.scene.time.delayedCall(this.rtt, () => {
                      this.isMoving = false;
                    });
                  } else if (this.mapPosition.equals(this.gameObject.initialPosition)) {
                    this.currentTarget = this.target;
                    this.scene.time.delayedCall(this.rtt, () => {
                      this.isMoving = false;
                    });
                  } else {
                    this.isMoving = false;
                  }
                  this.moveStoppedTime = Date.now();
                }
              }
            },
            500,
          );
        }
      }
    }
  }
}
