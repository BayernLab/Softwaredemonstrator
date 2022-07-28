import GameSettingsScene from './settings';
import GameBaseView from './game.base';
import { Setting } from '../utils/settings';

/**
 * A view that displays the title screen of the game.
 * @class GameTitleScreen
 * @extends {GameBaseView}
 */
export default class GameTitleScreen extends GameBaseView {
  override create() {
    const padding = this.scene.gameSettings.get(Setting.padding);
    this.views = [
      this.scene.addText(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 - 50, 'Hilf Robo und lerne Programmieren!', { fontSize: Setting.fonttitle }),
      this.scene.addText(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 + 80, 'Eine Kooperation von', { fontSize: Setting.fontsmall }),
      this.scene.add.image(this.scene.cameras.main.centerX - 110, this.scene.cameras.main.centerY * 0.5 + 120, 'fortiss_logo').setScale(0.2),
      this.scene.add.image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 + 120, 'cce_logo').setScale(0.2),
      this.scene.add.image(this.scene.cameras.main.centerX + 125, this.scene.cameras.main.centerY * 0.5 + 120, 'bayernlab_logo').setScale(0.5),
    ];

    const sizer = this.scene.rexUI.add.sizer({
      x: this.scene.cameras.main.centerX,
      y: this.scene.cameras.main.centerY + 250,
      orientation: 'y',
      space: { item: padding },
    });

    const playButton = this.scene.rexUI.add
      .sizer({ orientation: 'x', space: { item: padding } })
      .add(this.scene.add.image(0, 0, 'play_lg'))
      .add(this.scene.addText(0, 0, 'Spiel starten'));
    playButton.setInteractive().on('pointerup', () => {
      playButton.scaleYoyo(300, 1.1);
      setTimeout(() => {
        this.tryStartLevel(0);
      }, 300);
    });
    sizer.add(playButton, { align: 'left' });
    const levelButton = this.scene.rexUI.add
      .sizer({ orientation: 'x', space: { item: padding } })
      .add(this.scene.add.image(0, 0, 'level_lg'))
      .add(this.scene.addText(0, 0, 'Level auswählen'));
    levelButton.setInteractive().on('pointerup', () => {
      levelButton.scaleYoyo(300, 1.1);
      setTimeout(() => {
        this.destroy();
        this.scene.toLevelScreen();
      }, 300);
    });
    sizer.add(levelButton, { align: 'left' });
    const settingsButton = this.scene.rexUI.add
      .sizer({ orientation: 'x', space: { item: padding } })
      .add(this.scene.add.image(0, 0, 'settings_lg'))
      .add(this.scene.addText(0, 0, 'Einstellungen'));
    settingsButton.setInteractive().on('pointerup', () => {
      settingsButton.scaleYoyo(300, 1.1);
      this.destroy();
      this.scene.destroyPlayers();
      setTimeout(() => {
        this.scene.scene.start(GameSettingsScene.sceneName);
      }, 300);
    });
    sizer.add(settingsButton, { align: 'left' });
    sizer.popUp(800, undefined, 'Back');
    sizer.layout();
    this.views.push(sizer);
  }

  override destroy() {
    this.views.forEach((x) => x.destroy());
  }
}
