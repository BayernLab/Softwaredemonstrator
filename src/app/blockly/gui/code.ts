import * as Phaser from 'phaser';
import type GameScene from '../../utils/game.scene';
import { Setting } from '../../utils/settings';
import TweenHelper from '../../utils/tween';
import InstructorViewBase from './instructorview.base';

/**
 * Represents a view for viewing the generated code for execution. It shows a debug marker everytime a command is executed highlighting the current line.
 * @class CodeView
 * @extends {InstructorViewBase}
 */
export default class CodeView extends InstructorViewBase {
  playLineIndicators: Phaser.GameObjects.Image[] = [];

  currentLineIndicators: number[] = [];

  notreadyButton: Phaser.GameObjects.Image;

  texts: Phaser.GameObjects.Text[] = [];

  title: Phaser.GameObjects.Text;

  constructor(scene: GameScene, notReadyCallback: () => void) {
    super(scene);
    this.name = 'code';

    this.notreadyButton = this.scene.add.image(0, this.height - this.scene.getSetting(Setting.padding), 'close_md', null).setOrigin(0.5, 1);
    this.notreadyButton.name = 'notReady';
    this.add(this.notreadyButton);
    this.notreadyButton.setInteractive();
    this.notreadyButton.on('pointerup', () => {
      while (this.texts.length > 0) {
        this.texts.pop().destroy();
      }
      while (this.playLineIndicators.length > 0) {
        this.playLineIndicators.pop().destroy();
      }
      setTimeout(() => notReadyCallback());
    });
    this.title = this.scene.addText(0, this.scene.getSetting(Setting.headerY), 'Ausführung');
    this.pinLocal(this.title);
  }

  /**
   * Sets the code to display.
   *
   * @param {string} code - The code to display.
   * @returns {void}
   */
  setCode(code: string) {
    const padding = this.scene.getSetting(Setting.padding);
    const paddingsmall = this.scene.getSetting(Setting.paddingsmall);
    while (this.texts.length > 0) {
      this.texts.pop().destroy();
    }
    while (this.playLineIndicators.length > 0) {
      this.playLineIndicators.pop().destroy();
    }
    const wantedX = -this.width / 2 + padding;
    let wantedY = this.scene.getSetting(Setting.contentOffsetY) + padding;
    code.split('\n').forEach((line) => {
      const currentLineView = this.scene.add.image(0, 0, 'play_md_active').setVisible(false);
      this.playLineIndicators.push(currentLineView);
      currentLineView.setPosition(wantedX, wantedY);
      currentLineView.setOrigin(0);
      this.addLocal(currentLineView);

      const text = this.scene.addText(0, 0, line, { fontFamily: Setting.fontfamilyCode, fontSize: Setting.fontsmall });
      this.texts.push(text);
      text.setPosition(wantedX + currentLineView.displayWidth + text.displayWidth / 2 + paddingsmall, wantedY + currentLineView.displayHeight / 2);
      this.addLocal(text);

      if (text != null) {
        wantedY += paddingsmall + text.height;
      }
    });
  }

  /**
   * Highlights the given lines of code.
   *
   * @param {number[]} lines - The array of line numbers to highlight.
   * @returns {void}
   */
  highlightCode(lines: number[]) {
    this.currentLineIndicators = lines;
    this.playLineIndicators.forEach((x, index) => {
      if (lines.indexOf(index) === -1) {
        // line not active
        x.setVisible(false);
      } else {
        x.setAlpha(0);
        x.setVisible(true);
        TweenHelper.flashElement(this.scene, x, {
          repeat: 0,
          ease: 'Cubic.easeOut',
          overallDuration: 900,
          pauseDuration: 200,
        });
      }
    });
  }

  override show() {
    super.show();
    this.highlightCode(this.currentLineIndicators);
  }

  override enable() {
    this.notreadyButton.setInteractive();
  }

  override disable() {
    this.notreadyButton.disableInteractive();
  }

  override destroy() {
    this.hide();
    super.destroy();
  }
}
