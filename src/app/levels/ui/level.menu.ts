import { Setting } from '../../utils/settings';
import type LevelBase from '../base';
import LevelUIBaseView from './level.base';

/**
 * A view that displays the menu overlay when a level is currently active.
 * @class LevelMenuButton
 * @extends {LevelUIBaseView}
 */
export default class LevelMenuButton extends LevelUIBaseView {
  redoCallback: () => void;

  backCallback: () => void;

  private enabled = true;

  constructor(level: LevelBase, redoCallback: () => void, backCallback: () => void) {
    super(level);
    this.redoCallback = redoCallback;
    this.backCallback = backCallback;
  }

  create(force = false): LevelMenuButton {
    if (force) {
      this.destroy();
    }
    if (this.views.length === 0) {
      this.enabled = true;
      const padding = this.scene.getSetting(Setting.padding);
      const image = this.scene.add.image(0, 0, 'menu_md');
      const text3d = this.scene.addText(0, 0, 'Menü');
      const menuButton = this.scene.rexUI.add
        .sizer({
          x: window.innerWidth / 2 + 80,
          y: padding,
          orientation: 'x',
          space: { item: padding },
        })
        .setOrigin(1, 0)
        .add(image, 1, 'center')
        .add(text3d, 1, 'center')
        .setInteractive()
        .on('pointerup', () => {
          if (this.enabled) {
            menuButton.scaleYoyo(300, 1.1);
            setTimeout(() => this.createMenu(), 300);
          }
        })
        .layout();
      this.views.push(menuButton);
    }
    return this;
  }

  createMenu() {
    this.enabled = false;
    const padding = this.scene.getSetting(Setting.padding);
    const sizer = this.scene.rexUI.add.sizer({
      x: this.scene.cameras.main.centerX,
      y: this.scene.cameras.main.centerY,
      orientation: 'y',
      space: {
        item: padding,
        left: padding,
        right: padding,
        top: padding,
        bottom: padding,
      },
    });
    sizer.addBackground(this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, this.scene.getSetting(Setting.baseColorDark)));
    const playButton = this.scene.rexUI.add
      .sizer({ orientation: 'x', space: { item: padding } })
      .add(this.scene.add.image(0, 0, 'retry_lg'))
      .add(this.scene.addText(0, 0, 'Level erneut starten'));
    playButton.setInteractive().on('pointerup', () => {
      this.enabled = true;
      playButton.scaleYoyo(300, 1.1);
      setTimeout(() => {
        this.destroy();
        this.redoCallback();
      }, 300);
    });
    sizer.add(playButton, { align: 'left' });
    const levelButton = this.scene.rexUI.add
      .sizer({ orientation: 'x', space: { item: padding } })
      .add(this.scene.add.image(0, 0, 'menu_lg'))
      .add(this.scene.addText(0, 0, 'Zum Hauptmenü'));
    levelButton.setInteractive().on('pointerup', () => {
      this.enabled = true;
      levelButton.scaleYoyo(300, 1.1);
      setTimeout(() => {
        this.destroy();
        this.backCallback();
      }, 300);
    });
    sizer.add(levelButton, { align: 'left' });
    sizer.popUp(300, undefined, 'Back');
    sizer.layout();
    this.scene.input.once('pointerup', () => {
      sizer.destroy();
      this.enabled = true;
    });
  }
}
