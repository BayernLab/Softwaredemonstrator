import { Label, Sizer } from 'phaser3-rex-plugins/templates/ui/ui-components';
import Player from '../player';
import type GameScene from '../utils/game.scene';
import { Setting } from '../utils/settings';
import LevelBase from './base';

/**
 * Represents the end screen of the game.
 * @class EndScreen
 * @extends LevelBase
 */
export default class EndScreen extends LevelBase {
  titleText: Label;

  titleSubText: Label;

  buttonSizer: Sizer;

  constructor(scene: GameScene, players: Player[], nextCallback, endCallback) {
    super(scene, {}, players, false);
    this.initialize(nextCallback, endCallback);
  }

  async initialize(nextCallback, endCallback) {
    this.levelEndScreen.create(false, true);
    const title = 'Toll, geschafft!';
    const subtitle = 'Ihr habt mir geholfen alle Sterne zu sammeln und dabei auch noch die Grundbausteine der Programmierung kennengelernt!';
    const padding = this.scene.gameSettings.get(Setting.padding);
    this.titleText = this.scene.rexUI.add
      .label({
        x: this.scene.cameras.main.centerX,
        y: this.scene.cameras.main.centerY * 0.5,
        text: this.scene.addText(0, 0, title, { fontSize: Setting.fontlarge }),
      })
      .layout()
      .popUp(500);
    this.titleSubText = this.scene.rexUI.add
      .label({
        x: this.scene.cameras.main.centerX,
        y: this.titleText.y + this.titleText.height + padding,
        text: this.scene.addText(0, 0, subtitle),
      })
      .layout()
      .popUp(500);

    this.buttonSizer = this.scene.rexUI.add.sizer({
      x: this.scene.cameras.main.centerX,
      y: this.titleSubText.y + this.titleSubText.height + padding + 150,
      orientation: 'y',
      space: {
        item: padding,
        left: padding,
        right: padding,
        bottom: padding,
        top: padding,
      },
    });
    this.buttonSizer.addBackground(this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, this.scene.getSetting(Setting.baseColorDark)));

    if (nextCallback) {
      const nextButton = this.scene.rexUI.add
        .sizer({ orientation: 'x', space: { item: padding } })
        .add(this.scene.add.image(0, 0, 'next_lg'), 1, 'center')
        .add(this.scene.addText(0, 0, 'Zu den Expertenleveln'), 1, 'center');
      nextButton.setInteractive().on('pointerup', () => {
        nextButton.scaleYoyo(300, 1.1);
        setTimeout(() => {
          this.levelEndScreen.destroy();
          nextCallback();
        }, 300);
      });
      this.buttonSizer.add(nextButton);
    }

    const backButton = this.scene.rexUI.add
      .sizer({
        x: this.scene.cameras.main.centerX,
        y: this.titleSubText.y + this.titleSubText.height + padding + 50,
        orientation: 'x',
        space: { item: padding },
      })
      .add(this.scene.add.image(0, 0, 'menu_lg'), 1, 'center')
      .add(this.scene.addText(0, 0, 'Zurück zum Start'), 1, 'center');
    backButton.setInteractive().on('pointerup', () => {
      backButton.scaleYoyo(300, 1.1);
      setTimeout(() => {
        this.levelEndScreen.destroy();
        endCallback();
      }, 300);
    });
    this.buttonSizer.add(backButton);
    this.buttonSizer.layout();
    this.buttonSizer.popUp(500, undefined, 'Back');
    this.players.forEach((x) => {
      x.showTextBubble('Du bist ein wahrer Held!');
      x.animatePreview('ThumbsUp', Math.random() * 500, true);
    });
  }

  async destroy(callback) {
    this.titleText.destroy();
    this.titleSubText.destroy();
    this.buttonSizer.destroy();
    await super.destroy(callback);
  }
}
