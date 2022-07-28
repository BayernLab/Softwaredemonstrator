import { Container, TextBox } from 'phaser3-rex-plugins/templates/ui/ui-components';
import type GameScene from '../../../utils/game.scene';
import { Setting } from '../../../utils/settings';
import { hideView, showView } from '../../../utils/visibility';

const getBuiltInText = (scene: GameScene, wrapWidth, fixedWidth, fixedHeight) =>
  scene
    .addText(0, 0, '', { fontFamily: Setting.fontfamilyDefault, fontSize: Setting.fontsmall })
    .setStyle({
      wordWrap: {
        width: wrapWidth,
      },
      maxLines: 5,
    })
    .setFixedSize(fixedWidth, fixedHeight);

const createSpeechBubbleShape = (scene) =>
  scene.rexUI.add.customShapes({
    create: { lines: 1 },
    update() {
      const radius = 20;
      const indent = 15;

      const left = 0;
      const right = this.width;
      const top = 0;
      const bottom = this.height;
      const boxBottom = bottom - indent;
      this.getShapes()[0]
        .lineStyle(this.lineWidth, this.strokeColor, this.strokeAlpha)
        .fillStyle(this.fillColor, this.fillAlpha)
        // top line, right arc
        .startAt(left + radius, top)
        .lineTo(right - radius, top)
        .arc(right - radius, top + radius, radius, 270, 360)
        // right line, bottom arc
        .lineTo(right, boxBottom - radius)
        .arc(right - radius, boxBottom - radius, radius, 0, 90)
        // bottom indent
        .lineTo(left + 60, boxBottom)
        .lineTo(left + 50, bottom)
        .lineTo(left + 40, boxBottom)
        // bottom line, left arc
        .lineTo(left + radius, boxBottom)
        .arc(left + radius, boxBottom - radius, radius, 90, 180)
        // left line, top arc
        .lineTo(left, top + radius)
        .arc(left + radius, top + radius, radius, 180, 270)
        .close();
    },
  });

/**
 * A speech bubble that can be used to display text to the player.
 * @class TextBoxContainer
 * @extends Container
 */
export default class TextBoxContainer extends Container {
  scene: GameScene;

  textBox: TextBox;

  indicator: Phaser.GameObjects.Image;

  yIndicator: Phaser.GameObjects.Image;

  text: string;

  typingSpeed: number;

  openCallback: () => void = null;

  closeCallback: () => void = null;

  static create(scene: GameScene, x: number, y: number, config, openCallback?, closeCallback?) {
    const container = new TextBoxContainer(scene, x, y);
    const wrapWidth = Phaser.Utils.Objects.GetValue(config, 'wrapWidth', 0);
    const fixedWidth = Phaser.Utils.Objects.GetValue(config, 'fixedWidth', 0);
    const fixedHeight = Phaser.Utils.Objects.GetValue(config, 'fixedHeight', 0);
    container.openCallback = openCallback;
    container.closeCallback = closeCallback;

    container.indicator = scene.add.image(x + 100, y + 0, 'notification_sm').setVisible(false);
    container.indicator.setInteractive().on(
      'pointerup',
      function () {
        this.start(this.text, this.typingSpeed);
      },
      container
    );
    container.add(container.indicator);

    container.textBox = scene.rexUI.add
      .textBox({
        x,
        y,
        background: createSpeechBubbleShape(scene).setFillStyle(scene.getSetting(Setting.baseColorDark), 1).setStrokeStyle(2, scene.getSetting(Setting.baseColor), 1),
        text: getBuiltInText(scene, wrapWidth, fixedWidth, fixedHeight),
        action: scene.add.image(0, 0, 'nextPage').setTint(scene.getSetting(Setting.baseColor)).setVisible(false),
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
          icon: 10,
          text: 10,
        },
      })
      .setOrigin(0, 1)
      .layout()
      .setVisible(false);

    container.textBox
      .setInteractive()
      .on(
        'pointerup',
        function () {
          const icon = this.textBox.getElement('action').setVisible(false);
          this.textBox.resetChildVisibleState(icon);
          if (this.textBox.isTyping) {
            this.textBox.stop(true);
            return;
          }
          if (this.textBox.isLastPage) {
            container.end();
          } else {
            this.textBox.typeNextPage();
          }
        },
        container
      )
      .on(
        'pageend',
        function () {
          const icon = this.getElement('action').setVisible(true).setTexture('nextPage').setTint(scene.getSetting(Setting.baseColor));
          icon.y -= 30;
          scene.tweens.add({
            targets: icon,
            y: '+=30', // '+=100'
            ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 500,
            repeat: 0, // -1: infinity
            yoyo: false,
          });
        },
        container.textBox
      );
    container.add(container.textBox);
    return container;
  }

  /**
   * Shows the text box and starts typing the text.
   * @param {string} text - The text to display.
   * @param {number} typingSpeed - The speed at which to display the text.
   * @returns {void}
   */
  start(text: string, typingSpeed: number) {
    this.text = text;
    this.typingSpeed = typingSpeed;
    hideView(this.scene, this.indicator);
    showView(this.scene, this.textBox, true);
    if (this.openCallback) {
      this.openCallback();
    }
    this.textBox.start(text, typingSpeed);
  }

  /**
   * Ends and hides the text box. Triggers the close callback if available.
   * @returns {void}
   */
  end() {
    showView(this.scene, this.indicator);
    hideView(this.scene, this.textBox, true);
    if (this.closeCallback) {
      this.closeCallback();
    }
  }
}
