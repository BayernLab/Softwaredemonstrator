import { THREE } from '@enable3d/phaser-extension';
import type Base3DObject from './objects/base';
import { EntityType } from '../levels/entity';
import { AnimationKey } from '../utils/animate';
import type GameScene from '../utils/game.scene';

/**
 * Represents a base entity. The mapPosition is the position of the entity in the map and not its position in the game world. For the game world position use the gameObject.
 * @class BaseEntity
 * @extends Base3DObject
 * @abstract
 */
export default abstract class BaseEntity {
  scene: GameScene;

  identifier: string;

  gameObject: Base3DObject;

  protected mapPosition: THREE.Vector3 = null;

  protected mapRotation = 0;

  protected properties: any;

  abstract type: EntityType;

  spawned = false;

  ended = false;

  constructor(scene: GameScene, identifier = 'default', properties: any = null) {
    this.scene = scene;
    this.identifier = identifier;
    this.properties = properties;
  }

  /**
   * Checks whether the update function should be triggered for this entity.
   * @returns {boolean} true if the update function should be triggered, false otherwise.
   */
  shouldUpdate() {
    if (this.gameObject?.mesh == null || !this.spawned || this.ended) return false;
    return true;
  }

  // default implementation
  // eslint-disable-next-line class-methods-use-this
  /**
   * Checks whether this entity collides with other entities.
   * @returns {boolean} true if the entity collides, false otherwise.
   */
  willCollide(position: THREE.Vector3) {
    return true;
  }

  // default implementation
  // eslint-disable-next-line class-methods-use-this
  /**
   * Update the entity. Called in the game update loop if shouldUpdate returned true.
   */
  update(time, delta) {}

  /**
   * Reset the entity to its initial state.
   */
  reset() {
    this.destroy();
  }

  /**
   * Animate the entity.
   * @param {AnimationKey} animationKey The key of the animation to play.
   * @param {number} delay The delay in milliseconds before the animation starts.
   * @param {boolean} repeat Whether the animation should be repeated.
   * @returns {void}
   */
  animate(animationKey: AnimationKey, delay = 0, repeat = false) {
    this.gameObject?.getAnimationManager().play(animationKey, delay, repeat);
  }

  /**
   * Set the position of the entity in the game world.
   * @param {THREE.Vector3} position The new position of the entity.
   */
  setInGamePosition(position: THREE.Vector3) {
    if (this.gameObject != null) {
      this.gameObject.setPosition(position);
      this.mapPosition = position;
    }
  }

  /**
   * Set the rotation of the entity in the game world and limit it to 360.
   * @param {number} rotation The new rotation of the entity in degrees.
   */
  setInGameRotation(rotation: number) {
    if (this.gameObject != null) {
      rotation %= 360;
      this.gameObject.setRotation(rotation);
      this.mapRotation = rotation;
    }
  }

  /**
   * Gets the position of the entity in the game world.
   * @returns {THREE.Vector3} The position of the entity.
   */
  getInGamePosition() {
    return this.mapPosition?.clone() ?? new THREE.Vector3(0, 0, 0);
  }

  /**
   * Gets the rotation of the entity in the game world.
   * @returns {number} The rotation of the entity in degrees.
   */
  getInGameRotation() {
    return this.mapRotation;
  }

  /**
   * Sets the result animation for a command execution of a entity.
   * @param {boolean} result true if the action was successful, false otherwise
   * @param {Function} finishCallback The callback to call after the animation is finished
   * @param {boolean} urgentExecution Should the action be executed immediately
   * @returns {void}
   */
  setResultAnimation(result: boolean, finishCallback: (shouldFail: boolean) => void, urgentExecution = false) {
    if (urgentExecution) {
      this.afterMove(this.mapPosition, this.mapRotation, finishCallback);
    } else {
      this.gameObject?.getAnimationManager().play(result ? AnimationKey.YES : AnimationKey.NO, 0, true);
      this.scene.time.delayedCall(1000, () => this.afterMove(this.mapPosition, this.mapRotation, finishCallback));
    }
  }

  /**
   * Execute a left turn on the gameObject.
   * @param {Function} finishCallback The callback to call after the turn is finished.
   * @returns {void}
   */
  doTurnLeft(finishCallback: (shouldFail: boolean) => void) {
    const targetRotation = this.mapRotation + 90;
    this.gameObject?.rotateTo(this.mapRotation, targetRotation, () => this.afterMove(this.mapPosition, targetRotation, finishCallback));
  }

  /**
   * Execute a right turn on the gameObject.
   * @param {Function} finishCallback The callback to call after the turn is finished.
   * @returns {void}
   */
  doTurnRight(finishCallback: (shouldFail: boolean) => void) {
    const targetRotation = this.mapRotation - 90;
    this.gameObject?.rotateTo(this.mapRotation, targetRotation, () => this.afterMove(this.mapPosition, targetRotation, finishCallback));
  }

  /**
   * Execute a move forward on the gameObject.
   * @param {THREE.Vector3} forwardPosition The position to move to.
   * @param {Function} finishCallback The callback to call after the turn is finished.
   * @returns {void}
   */
  doMoveForward(forwardPosition: THREE.Vector3, finishCallback: (shouldFail: boolean) => void) {
    if (this.mapPosition.y > forwardPosition.y) {
      this.gameObject?.fallTo(this.mapPosition, forwardPosition, () => this.afterMove(forwardPosition, this.mapRotation, finishCallback));
    } else {
      this.gameObject?.moveTo(this.mapPosition, forwardPosition, () => this.afterMove(forwardPosition, this.mapRotation, finishCallback));
    }
  }

  /**
   * Execute a bump and reset the gameObject position.
   * @param {THREE.Vector3} forwardPosition The position to bump against.
   * @param {Function} finishCallback The callback to call after the turn is finished.
   * @returns {void}
   */
  doBump(forwardPosition: THREE.Vector3, finishCallback: (shouldFail: boolean) => void) {
    this.gameObject?.bump(this.mapPosition, forwardPosition, () => this.afterMove(this.mapPosition, this.mapRotation, finishCallback, true));
  }

  /**
   * Finalize the move by setting the new position and rotation.
   * @param {THREE.Vector3} finalPosition The final position of the gameObject.
   * @param {number} finalRotation The final rotation of the gameObject.
   * @param {Function} finishCallback The callback to call after the turn is finished.
   * @param {boolean} shouldFail Whether the action should be marked as failed.
   * @returns {void}
   * @private
   */
  private afterMove(finalPosition: THREE.Vector3, finalRotation: number, finishCallback: (shouldFail: boolean) => void, shouldFail = false) {
    this.setInGamePosition(finalPosition);
    this.setInGameRotation(finalRotation);
    finishCallback(shouldFail);
  }

  /**
   * Destroy the entity.
   */
  destroy() {
    this.destroyGameObject();
  }

  /**
   * Destroy the game object if spawned.
   */
  protected destroyGameObject() {
    this.spawned = false;
    if (this.gameObject) {
      this.gameObject.destroy();
      this.gameObject = null;
    }
  }

  /**
   * Spawn the entity in the game world.
   * @param {GameScene} scene The scene to spawn the entity in.
   * @param {THREE.Vector3} position The position to spawn the entity at.
   * @param {number} rotation The rotation to spawn the entity at.
   * @returns {void}
   * @abstract
   */
  abstract spawn(scene: GameScene, position: THREE.Vector3, rotation: number);
}
