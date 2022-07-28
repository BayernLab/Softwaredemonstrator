import { Setting } from '../../utils/settings';
import LevelBase from '../base';
import LevelUIBaseView from './level.base';

/**
 * A view that displays the level start button (in order to start execution of player´s code).
 * @class StartButton
 * @extends {LevelUIBaseView}
 */
export default class StartButton extends LevelUIBaseView {
  /**
   * A callback to be called when the view is clicked.
   *
   * @type {Function}
   */
  clickCallback: () => void;

  constructor(level: LevelBase, clickCallback: () => void) {
    super(level);
    this.clickCallback = clickCallback;
  }

  create(force = false): StartButton {
    if (force) {
      this.destroy();
    }
    if (this.views.length === 0) {
      const padding = this.scene.gameSettings.get(Setting.padding);
      const startButton = this.scene.rexUI.add.label({
        name: 'tryStart',
        x: this.level.scene.cameras.main.centerX,
        y: this.level.scene.cameras.main.centerY + 250,
        background: this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, this.scene.getSetting(Setting.baseColorDark)),
        icon: this.level.scene.add.image(0, 0, 'play_lg'),
        text: this.scene.addText(0, 0, 'Versuch starten', { fontSize: Setting.fontlarge }),
        space: {
          left: padding,
          right: padding,
          top: padding,
          bottom: padding,
          icon: padding,
        },
        align: 'center',
      });

      startButton.setInteractive().on('pointerup', () => {
        startButton.scaleYoyo(300, 1.1);
        this.destroy();
        this.clickCallback();
      });
      startButton.layout();
      this.views.push(startButton);
    }
    return this;
  }
}
