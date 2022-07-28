import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite';
import type GameScene from '../../utils/game.scene';
import { Setting } from '../../utils/settings';
import { hideView, showView } from '../../utils/visibility';

/**
 * Base class container for views shown to the right of the instructor.
 * @class InstructorRightHandViewBase
 * @extends ContainerLite
 */
export default abstract class InstructorRightHandViewBase extends ContainerLite {
  scene: GameScene;

  indicator: Phaser.GameObjects.Image;

  views = [];

  readonly padding;

  background: Phaser.GameObjects.Image;

  title: Phaser.GameObjects.Text;

  contentVisible = true;

  activateCallback;

  offsetY: number;

  offsetX: number;

  constructor(scene: GameScene, activateCallback, title, indicatorX, indicatorY) {
    super(scene, 100, 53, 500, 600);
    this.offsetX = 100;
    this.offsetY = 53;
    this.setOrigin(0.5, 0.5);
    this.activateCallback = activateCallback;
    this.padding = scene.getSetting(Setting.paddingsmall);

    this.background = this.scene.add.image(this.offsetX, this.offsetY, 'window').setScale(0.515, 0.605);
    this.background.setOrigin(0.5, 0.5);
    this.addLocal(this.background);

    this.title = this.scene.addText(this.offsetX, this.offsetY - this.height / 2 + this.scene.getSetting(Setting.headerY), title);
    this.pinLocal(this.title);

    this.indicator = this.scene.add.image(this.offsetX - this.width / 2 + indicatorX, this.offsetY - this.height / 2 + indicatorY, this.getIcon(false));
    this.indicator.setInteractive().on('pointerup', () => (this.contentVisible ? this.hideContent() : this.showContent()));
    this.add(this.indicator);
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
   * Hides the contents of this view container.
   * @param {boolean} animate - Whether to animate the hiding.
   * @returns {void}
   */
  hideContent(animate = true) {
    this.views.forEach((view) => hideView(this.scene, view));
    hideView(this.scene, this.background, animate);
    hideView(this.scene, this.title, animate);
    this.indicator.setTexture(this.getIcon(false));
    this.contentVisible = false;
  }

  /**
   * Show the contents of this view container.
   * @param {boolean} animate - Whether to animate the showing.
   * @returns {void}
   */
  showContent(animate = true) {
    this.activateCallback();
    this.views.forEach((view) => showView(this.scene, view));
    showView(this.scene, this.background, animate);
    showView(this.scene, this.title, animate);
    this.indicator.setTexture(this.getIcon(true));
    this.contentVisible = true;
  }

  /**
   * Resets this view container.
   * @returns {void}
   */
  reset() {
    while (this.views.length > 0) {
      const view = this.views.pop();
      view.destroy();
    }
    this.hide();
  }

  /**
   * Gets the icon to use as showing indication for this view container.
   * @param {boolean} active - Whether the icon should be active or inactive. Based on whether the view is currently shown.
   * @returns {string} The path to the icon.
   */
  abstract getIcon(active): string;

  /**
   * Destroys this view container.
   * @returns {void}
   */
  override destroy() {
    this.hide();
    super.destroy();
  }
}
