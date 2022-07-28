import type GameScene from '../../utils/game.scene';
import GameUIContainer from '../../utils/game.container';
import { Setting } from '../../utils/settings';
import TweenHelper from '../../utils/tween';
import { hideView, showView } from '../../utils/visibility';

/**
 * Base class container for views representing the instructor.
 * @class InstructorViewBase
 * @extends GameUIContainer
 */
export default abstract class InstructorViewBase extends GameUIContainer {
  scene: GameScene;

  background: Phaser.GameObjects.Image;

  constructor(scene: GameScene) {
    super(scene, 0, 0, scene.getSetting(Setting.instructorWidth), scene.getSetting(Setting.instructorHeight));
    this.setOrigin(0.5, 0);
    this.background = this.scene.add.image(0, 0, 'window').setScale(0.81, 0.605).setOrigin(0.5, 0);
    this.background.setInteractive();
    this.addLocal(this.background);
  }

  /**
   * Shows this view container.
   * @returns {void}
   */
  show() {
    showView(this.scene, this);
  }

  /**
   * Hides this view container.
   * @returns {void}
   */
  hide() {
    hideView(this.scene, this);
  }

  /**
   * Adds a click listener to the specified element of this view container.
   * @param {string} elementName The name of the element to add the listener to.
   * @param {function} callback The callback to invoke when the element is clicked.
   * @returns {void}
   */
  addClickListener(elementName: string, callback: (element) => void) {
    const element = this.getByName(elementName, true);
    if (element != null) {
      element.setInteractive();
      const tap = this.scene.rexUI.add.tap(element);
      tap.on('tappingstart', () => {
        tap.setEnable(false);
        tap.destroy();
        setTimeout(() => callback(element), 500);
      });
    }
  }

  /**
   * Highlights the specified element in this view container.
   * @param {string} elementName The name of the element to highlight.
   * @param {boolean} activate Whether to activate or deactivate the highlight.
   * @returns {void}
   */
  highlight(elementName: string, activate: boolean) {
    TweenHelper.highlight(this.scene, this, elementName, activate);
  }

  /**
   * Enables all view interactions of this view container.
   * @returns {void}
   */
  abstract enable();

  /**
   * Disables all view interactions of this view container.
   * @returns {void}
   */
  abstract disable();
}
