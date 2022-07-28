import { v4 as uuidv4 } from 'uuid';
import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite';
import type GameScene from './game.scene';

/**
 * Represents a container for UI elements in a game scene.
 * @class GameUIContainer
 * @extends ContainerLite
 */
export default class GameUIContainer extends ContainerLite {
  uid: string;

  scene: GameScene;

  /**
   * Creates a new `GameUIContainer` instance.
   *
   * @param {GameScene} scene - The game scene that this container belongs to.
   * @param {number} [x] - The x-coordinate of the container.
   * @param {number} [y] - The y-coordinate of the container.
   * @param {number} [w] - The width of the container.
   * @param {number} [h] - The height of the container.
   */
  constructor(scene, x?, y?, w?, h?) {
    super(scene, x, y, w, h);
    this.uid = uuidv4();
  }

  /**
   * Lays out the UI elements in the container.
   *
   * This method should be implemented by subclasses to position and size
   * the UI elements in the container.
   */
  layout() {}

  /**
   * Returns the string representation of the container.
   *
   * @returns {string} The `uid` of the container.
   */
  override toString() {
    return this.uid;
  }
}
