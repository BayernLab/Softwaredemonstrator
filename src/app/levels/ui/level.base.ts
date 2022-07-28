import type GameScene from '../../utils/game.scene';
import type LevelBase from '../base';

/**
 * A base class for views in a level.
 * @class LevelUIBaseView
 * @abstract
 */
export default abstract class LevelUIBaseView {
  level: LevelBase;

  scene: GameScene;

  /**
   * The game objects contained in this view.
   *
   * @type {Phaser.GameObjects.GameObject[]}
   */
  views: Phaser.GameObjects.GameObject[] = [];

  constructor(level: LevelBase) {
    this.level = level;
    this.scene = level.scene;
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
   *
   * @abstract
   * @param {boolean} force - Whether to force the creation of the views. If true, existing views will be destroyed first.
   * @returns {LevelUIBaseView} The created view container.
   */
  abstract create(force: boolean): LevelUIBaseView;
}
