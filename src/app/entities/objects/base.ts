import { ExtendedObject3D, THREE } from '@enable3d/phaser-extension';
import { AnimationKey } from '../../utils/animate';
import type GameScene from '../../utils/game.scene';
import { rotatePoint } from '../../utils/position';

/**
 * An abstract base class representing a 3D object in a game scene.
 * @class Base3DObject
 * @abstract
 */
export default abstract class Base3DObject {
  scene: GameScene;

  initialPosition: THREE.Vector3;

  initialRotation: number;

  mesh: ExtendedObject3D | THREE.Group;

  properties: any;

  blockSegments: number;

  blockIndex: number;

  protected offset = new THREE.Vector3(0, 0, 0);

  /**
   * Creates a new Base3DObject.
   * @param scene {GameScene} The game scene that this object belongs to.
   * @param position {THREE.Vector3} The initial position of the object in 3D space.
   * @param rotation {number} The initial rotation of the object.
   * @param properties {any} Any properties associated with the object.
   * @param blockIndex {number} The index to a segment on a block the object should be placed in.
   * @param blockSegments {number} The number of segments a block should be seperated in.
   */
  constructor(scene: GameScene, position: THREE.Vector3, rotation: number, properties: any, blockIndex = 0, blockSegments = 1) {
    this.scene = scene;
    this.initialPosition = position;
    this.initialRotation = rotation;
    this.properties = properties;
    this.blockIndex = blockIndex;
    this.blockSegments = blockSegments;
  }

  /**
   * Sets the position of the object in 3D space.
   * @param {THREE.Vector3} position The position to set the mesh to.
   * @returns {void}
   */
  setPosition(position: THREE.Vector3) {
    if (this.mesh) {
      let offsetPosition = position.clone().add(this.offset);
      offsetPosition = this.calculateMultipleEntityOffset(offsetPosition);
      this.mesh.position.set(offsetPosition.x, offsetPosition.y, offsetPosition.z);
    }
  }

  /**
   * Sets the rotation of the object in 3D space.
   * @param {number} rotation The rotation to set the mesh to in degress.
   * @returns {void}
   */
  setRotation(rotation: number) {
    if (this.mesh) {
      this.mesh.rotation.set(0, Phaser.Math.DegToRad(rotation), 0);
    }
  }

  /**
   * Rotates the object from its current rotation to the target rotation.
   * @param {number} currentRotation - The current rotation of the object in degrees.
   * @param {number} targetRotation - The target rotation of the object in degrees.
   * @param {Function} completeCallback - A callback function to be called when the rotation animation is complete.
   * @param {number} [duration=1000] - The duration of the rotation animation in milliseconds.
   * @returns {void}
   */
  rotateTo(currentRotation: number, targetRotation: number, completeCallback: () => void, duration = 1000) {
    this.getAnimationManager()?.play(AnimationKey.WALK, 0, true);
    this.scene.tweens.addCounter({
      from: currentRotation,
      to: targetRotation,
      duration,
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        this?.setRotation(tween.getValue());
      },
      onComplete: completeCallback,
    });
  }

  /**
   * Moves the object from its current position to its target position.
   * @param {THREE.Vector3} currentPosition - The current position of the object.
   * @param {THREE.Vector3} targetPosition - The target position of the object.
   * @param {Function} completeCallback - A callback function to be called when the move animation is complete.
   * @param {number} [duration=1000] - The duration of the rotation animation in milliseconds.
   * @returns {void}
   */
  moveTo(currentPosition: THREE.Vector3, targetPosition: THREE.Vector3, completeCallback: () => void, duration = 1000) {
    this.getAnimationManager()?.play(AnimationKey.WALK);
    const pos = currentPosition.clone();
    const tmp = targetPosition.clone();
    this.scene.tweens.add({
      targets: pos,
      x: tmp.x,
      y: tmp.y,
      z: tmp.z,
      duration,
      onUpdate: () => {
        this?.setPosition(pos);
      },
      onComplete: completeCallback,
    });
  }

  /**
   * Falls the object from its current position to its target position.
   * @param {THREE.Vector3} currentPosition - The current position of the object.
   * @param {THREE.Vector3} targetPosition - The target position of the object.
   * @param {Function} completeCallback - A callback function to be called when the fall animation is complete.
   * @returns {void}
   */
  fallTo(currentPosition: THREE.Vector3, targetPosition: THREE.Vector3, completeCallback: () => void) {
    this.getAnimationManager()?.play(AnimationKey.JUMP, 0, false);
    const pos = currentPosition.clone();
    const tmp = targetPosition.clone();
    const distance = targetPosition.clone().sub(pos).divide(new THREE.Vector3(1.2, 0, 1.2));
    this.scene.tweens.timeline({
      targets: pos,
      delay: 200,
      tweens: [
        {
          x: currentPosition.x + distance.x,
          y: currentPosition.y + 0.2,
          z: currentPosition.z + distance.z,
          ease: 'Sine.easeIn',
          duration: 500,
        },
        {
          x: tmp.x,
          y: tmp.y,
          z: tmp.z,
          ease: 'Sine',
          duration: 300,
          offset: 500,
        },
      ],
      onUpdate: () => {
        this?.setPosition(pos);
      },
      onComplete: completeCallback,
    });
  }

  /**
   * Bumps the object on its current position against the target position.
   * @param {THREE.Vector3} currentPosition - The current position of the object.
   * @param {THREE.Vector3} targetPosition - The target position of the object.
   * @param {Function} completeCallback - A callback function to be called when the bump animation is complete.
   * @returns {void}
   */
  bump(currentPosition: THREE.Vector3, targetPosition: THREE.Vector3, completeCallback: () => void) {
    const pos = currentPosition.clone();
    const distance = targetPosition.clone().sub(pos).divide(new THREE.Vector3(2, 0, 2));

    this.scene.tweens.add({
      targets: pos,
      x: currentPosition.x + distance.x,
      z: currentPosition.z + distance.z,
      duration: 500,
      onStart: () => {
        this?.getAnimationManager()?.play(AnimationKey.WALK);
      },
      onUpdate: () => {
        this?.setPosition(pos);
      },
    });
    this.scene.tweens.add({
      targets: pos,
      x: currentPosition.x - distance.x,
      z: currentPosition.z - distance.z,
      duration: 500,
      delay: 500,
      onStart: () => {
        this?.getAnimationManager()?.play(AnimationKey.JUMP);
      },
      onUpdate: () => {
        this?.setPosition(pos);
      },
      onComplete: completeCallback,
    });
  }

  /**
   * Destroys the object.
   * @returns {void}
   */
  destroy() {
    if (!this.mesh) {
      return;
    }
    this.mesh.visible = false;
    this.scene.third.scene.remove(this.mesh);
    this.mesh = null;
  }

  /**
   * Gets the animation manager for the mesh.
   * @returns {THREE.AnimationMixer | undefined} - The animation manager for the mesh, or undefined if the object is not spawned.
   */
  getAnimationManager() {
    return (this.mesh as any)?.anims;
  }

  /**
   * Resets the position and rotation of the object to its initial values.
   * @returns {void}
   */
  reset() {
    this.setPosition(this.initialPosition);
    this.setRotation(this.initialRotation);
  }

  /**
   * Spawns an object and sets its initial position and rotation. What is spawned is determined by the child class (see the `spawnObject` function).
   * @returns {void}
   */
  spawn() {
    this.spawnObject();
    this.setPosition(this.initialPosition);
    this.setRotation(this.initialRotation);
  }

  /**
   * Adds an animation to the animation manager of this object.
   * @protected
   * @param {string | AnimationKey} name The name of the animation.
   * @param {THREE.AnimationClip} animation The animation clip to add.
   * @returns {void}
   */
  protected addAnimation(name: string | AnimationKey, animation: THREE.AnimationClip) {
    this.getAnimationManager()?.add(name, animation);
  }

  /**
   * Spawns an 3D representation of an object. This is called when the object is spawned. Do not call this method directly.
   * This is an abstract method and must be implemented by the child class.
   * @returns {void}
   * @abstract
   * @protected
   */
  protected abstract spawnObject();

  private calculateMultipleEntityOffset(position: THREE.Vector3) {
    const { x, y, z } = position;
    let calculatedX = x;
    let calculatedZ = z;
    if (this.blockSegments > 1) {
      const offset = rotatePoint(1 / 6, 1 / 6, Phaser.Math.DegToRad((360 / this.blockSegments) * (this.blockIndex + 1)));
      calculatedX = x + offset.x;
      calculatedZ = z + offset.y;
    }
    const offsetPosition = new THREE.Vector3(calculatedX, y, calculatedZ);
    return offsetPosition;
  }
}
