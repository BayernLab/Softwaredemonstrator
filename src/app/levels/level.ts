import Player from '../player';
import type GameScene from '../utils/game.scene';
import { Setting } from '../utils/settings';
import LevelBase from './base';
import StartButton from './ui/start.button';

/**
 * Represents the standard type of level.
 * @class 
 * @extends LevelBase
 */
export default class Level extends LevelBase {
  startButton: StartButton;

  constructor(scene: GameScene, partial: Partial<Level>, players: Player[], retry, redoCallback?, nextCallback?, backCallback?, showTitle = true, spawnMap = true) {
    super(scene, partial, players, retry, redoCallback, nextCallback, backCallback);

    this.startButton = new StartButton(this, () => {
      this.started = true;
      this.players.forEach((player) => {
        player.startLevel();
      });
    });

    if (showTitle) this.showLevelTitle();
    if (spawnMap) this.spawnMap();
  }

  update(time, delta) {
    super.update(time, delta);
    if (!this.started) {
      if (this.players.every((player) => player.isReady())) {
        this.startButton.create();
      } else {
        this.startButton.destroy();
        this.players.forEach((x: Player) => {
          if (x.isReady()) {
            x.showToast('Warte auf die anderen Spieler...');
          }
        });
      }
    }
    if (this.started && !this.ended) {
      if (this.players.every((player) => player.isFinished())) {
        this.end();
      }
    }
  }

  async showLevelTitle() {
    const padding = this.scene.gameSettings.get(Setting.padding);
    const titleText = this.scene.rexUI.add
      .label({
        x: this.scene.cameras.main.centerX,
        y: this.scene.cameras.main.centerY * 0.5,
        text: this.scene.addText(0, 0, this.title, { fontSize: Setting.fontlarge }),
      })
      .layout()
      .popUp(500);
    const titleSubText = this.scene.rexUI.add
      .label({
        x: this.scene.cameras.main.centerX,
        y: titleText.y + titleText.height + padding,
        text: this.scene.addText(0, 0, this.subtitle),
      })
      .layout()
      .popUp(500);
    this.scene.add.tween({
      delay: 3000,
      onComplete: () => {
        titleText.destroy();
        titleSubText.destroy();
      },
      targets: [titleText, titleSubText],
      duration: 200,
      alpha: 0,
    });
  }

  override async destroy(callback, retry = false) {
    this.startButton?.destroy();
    await super.destroy(callback, retry);
  }
}
