import { State } from '../../commands/state';
import { Setting } from '../../utils/settings';
import type LevelBase from '../base';
import LevelUIBaseView from './level.base';

const updateParticleRotation = (particle): number => Phaser.Math.RadToDeg(Math.atan2(particle.velocityY, particle.velocityX));

/**
 * A view that displays the level end screen with optional fireworks.
 * @class LevelEndScreen
 * @extends {LevelUIBaseView}
 */
export default class LevelEndScreen extends LevelUIBaseView {
  /**
   * A callback to be called when the redo button of this view is clicked.
   *
   * @type {Function}
   */
  redoCallback: () => void;

  /**
   * A callback to be called when the next button of this view is active and is clicked.
   *
   * @type {Function}
   */
  nextCallback: () => void;

  /**
   * A callback to be called when the back button of this view is clicked.
   *
   * @type {Function}
   */
  backCallback: () => void;

  private tints = [0x74737a, 0x4dd091, 0x00b0ba, 0x6c88c4, 0xe77577, 0xffff00];

  private emitterConfig = {
    alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
    angle: { start: 0, end: 360, steps: 100 },
    rotate: { onEmit: updateParticleRotation, onUpdate: updateParticleRotation },
    blendMode: 'ADD',
    gravityY: 128,
    lifespan: 3000,
    quantity: 500,
    reserve: 500,
    scaleX: { onUpdate: (p) => Phaser.Math.Easing.Cubic.Out(1 - p.lifeT) },
    speed: { min: 128, max: 256 },
  };

  constructor(level: LevelBase, redoCallback: () => void, nextCallback: () => void, backCallback: () => void) {
    super(level);
    if (!this.scene.textures.exists('fireworks')) {
      this.scene.textures.generate('fireworks', {
        data: ['0123...'],
        palette: {
          0: '#fff2',
          1: '#fff4',
          2: '#fff8',
          3: '#ffff',
        } as any,
        pixelWidth: 4,
      });
    }
    this.redoCallback = redoCallback;
    this.nextCallback = nextCallback;
    this.backCallback = backCallback;
  }

  create(showMenu = true, showFireworks = true, force = false): LevelEndScreen {
    if (force) {
      this.destroy();
    }
    if (this.views.length === 0) {
      const succeededPlayers = this.level.started ? this.level.players.filter((x) => x.state === State.SUCCESS) : this.level.players;
      if (showMenu) {
        this.createMenu(succeededPlayers.length, this.level.players.length);
      }
      if (showFireworks && succeededPlayers.length > 0) this.createFireworks();
    }
    return this;
  }

  private createFireworks() {
    const fireworks = this.scene.add.particles('fireworks');
    this.views.push(fireworks);

    const emitter1 = fireworks.createEmitter(this.emitterConfig).setFrequency(3000);
    const emitter2 = fireworks.createEmitter(this.emitterConfig).setFrequency(4000);
    const emitter3 = fireworks.createEmitter(this.emitterConfig).setFrequency(5000);

    this.updateEmitter(emitter1);
    this.updateEmitter(emitter2);
    this.updateEmitter(emitter3);

    this.scene.time.addEvent({
      delay: emitter1.frequency,
      repeat: -1,
      callback: () => {
        this.updateEmitter(emitter1);
      },
    });

    this.scene.time.addEvent({
      delay: emitter2.frequency,
      repeat: -1,
      callback: () => {
        this.updateEmitter(emitter2);
      },
    });

    this.scene.time.addEvent({
      delay: emitter3.frequency,
      repeat: -1,
      callback: () => {
        this.updateEmitter(emitter3);
      },
    });
  }

  private createMenu(suceeded: number, total: number) {
    this.level.levelMenuButton?.destroy();
    const padding = this.scene.gameSettings.get(Setting.padding);
    const singlePlayer = total === 1;
    this.views.push(...this.getLevelEndTexts(suceeded, total, singlePlayer));
    this.views.push(this.getLevelEndStars(suceeded, total, padding));

    const sizer = this.scene.rexUI.add.sizer({
      x: this.scene.cameras.main.centerX,
      y: this.scene.cameras.main.centerY + 250,
      orientation: 'y',
      space: {
        item: padding,
        left: padding,
        right: padding,
        bottom: padding,
        top: padding,
      },
    });
    sizer.addBackground(this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, this.scene.getSetting(Setting.baseColorDark)));
    const redoButton = this.scene.rexUI.add
      .sizer({ orientation: 'x', space: { item: padding } })
      .add(this.scene.add.image(0, 0, 'retry_lg'), 1, 'center')
      .add(this.scene.addText(0, 0, 'Nochmal versuchen'), 1, 'center');
    redoButton.setInteractive().on('pointerup', () => {
      redoButton.scaleYoyo(300, 1.1);
      setTimeout(() => {
        this.destroy();
        this.redoCallback();
      }, 500);
    });
    sizer.add(redoButton, 1, 'left');

    if (suceeded > 0) {
      const playButton = this.scene.rexUI.add
        .sizer({ orientation: 'x', space: { item: padding } })
        .add(this.scene.add.image(0, 0, 'next_lg'), 1, 'center')
        .add(this.scene.addText(0, 0, 'Nächstes Level'), 1, 'center');
      playButton.setInteractive().on('pointerup', () => {
        playButton.scaleYoyo(300, 1.1);
        setTimeout(() => {
          this.destroy();
          this.nextCallback();
        }, 500);
      });
      sizer.add(playButton, 1, 'left');
    }

    const levelButton = this.scene.rexUI.add
      .sizer({ orientation: 'x', space: { item: padding } })
      .add(this.scene.add.image(0, 0, 'menu_lg'), 1, 'center')
      .add(this.scene.addText(0, 0, 'Zum Hauptmenü'), 1, 'center');
    levelButton.setInteractive().on('pointerup', () => {
      levelButton.scaleYoyo(300, 1.1);
      setTimeout(() => {
        this.destroy();
        this.backCallback();
      }, 500);
    });
    sizer.add(levelButton, 1, 'left');

    sizer.popUp(1000, undefined, 'Back');
    sizer.layout();
    this.views.push(sizer);
  }

  private updateEmitter(emitter) {
    emitter
      .setPosition(this.scene.cameras.main.width * Phaser.Math.FloatBetween(0.1, 0.9), this.scene.cameras.main.height * Phaser.Math.FloatBetween(0, 0.8))
      .setTint(Phaser.Utils.Array.GetRandom(this.tints));
  }

  private getLevelEndStars(succeeded: number, total: number, padding: number) {
    const starSizer = this.scene.rexUI.add.sizer({
      x: this.scene.cameras.main.centerX,
      y: this.scene.cameras.main.centerY * 0.5 + 200,
      orientation: 'x',
      space: { item: padding },
    });
    for (let p = 0; p < total; p++) {
      let icon = 'levelstar';
      if (p < succeeded) {
        icon = 'levelstar_active';
      }
      starSizer.add(this.scene.add.image(0, 0, icon).setScale(0.1), 1, 'center');
    }
    starSizer.popUp(500, undefined, 'Bounce').layout();
    return starSizer;
  }

  private getLevelEndTexts(succeeded: number, total: number, singlePlayer: boolean) {
    let text = '';
    let subText = '';
    if (succeeded > 0) {
      if (singlePlayer) {
        text = 'Gratulation!';
        subText = 'Dein Roboter hat es sicher ans Ziel geschafft!';
      } else {
        text = 'Gratulation!';
        subText = `${succeeded} von ${total} der Roboter haben es sicher ans Ziel geschafft!`;
      }
    } else if (singlePlayer) {
      text = 'Schade!';
      subText = 'Dein Roboter hat es leider nicht sicher ans Ziel geschafft... Versuche es gleich noch einmal!';
    } else {
      text = 'Schade! ';
      subText = 'Leider hat es kein Roboter sicher ans Ziel geschafft... Versucht es gleich noch einmal!';
    }
    const titleText = this.scene.addText(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 + 50, text, { fontSize: Setting.fontlarge });
    const subTextTitle = this.scene.addText(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 + 100, subText, { fontSize: Setting.fontnormal });
    return [titleText, subTextTitle];
  }
}
