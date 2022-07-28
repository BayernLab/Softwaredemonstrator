import { State } from '../commands/state';
import type MainGameScene from './game';

/**
 * A base class for more complex and containerized views in the game.
 * @class GameBaseView
 * @abstract
 */
export default abstract class GameBaseView {
  /**
   * The main game scene.
   *
   * @type {MainGameScene}
   */
  scene: MainGameScene;

  /**
   * The game objects contained in this view.
   *
   * @type {Phaser.GameObjects.GameObject[]}
   */
  views: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: MainGameScene) {
    this.scene = scene;
  }

  /**
   * Tries to start a level.
   *
   * @param {(number|string)} id - The ID of the level.
   * @param {boolean} [levelSelect=false] - Whether the level is being selected from the level select screen.
   * @returns {boolean} Whether the level was started successfully.
   */
  tryStartLevel(id: number | string, levelSelect = false) {
    if (typeof id === 'string') {
      id = Number.parseInt(id, 10);
    }
    if (this.scene.players.filter((x) => x.state !== State.NOT_ACTIVE).length === 0) {
      this.scene.showToast('Nicht genug Spieler ausgewählt');
      return false;
    }
    this.destroy();
    this.scene.startLevel(id, false, levelSelect);
    return true;
  }

  /**
   * Destroys the views contained in this view.
   */
  destroy() {
    while (this.views.length > 0) {
      const view = this.views.pop();
      view.destroy();
    }
  }

  /**
   * Creates the views in the game. Should be implemented by subclasses.
   */
  abstract create();
}
