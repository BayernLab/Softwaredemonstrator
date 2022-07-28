import { levels } from '../levels/config';
import { Setting } from '../utils/settings';
import GameBaseView from './game.base';

/**
 * A view that displays the level select screen of the game.
 * @class GameLevelSelection
 * @extends {GameBaseView}
 */
export default class GameLevelSelection extends GameBaseView {
  create() {
    this.views = [
      this.scene.addText(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 - 50, 'Hilf Robo und lerne Programmieren!', { fontSize: Setting.fonttitle }),
      this.scene.addText(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 + 80, 'Eine Kooperation von', { fontSize: Setting.fontsmall }),
      this.scene.add.image(this.scene.cameras.main.centerX - 110, this.scene.cameras.main.centerY * 0.5 + 120, 'fortiss_logo').setScale(0.2),
      this.scene.add.image(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY * 0.5 + 120, 'cce_logo').setScale(0.2),
      this.scene.add.image(this.scene.cameras.main.centerX + 125, this.scene.cameras.main.centerY * 0.5 + 120, 'bayernlab_logo').setScale(0.5),
    ];

    const scrollablePanel = this.scene.rexUI.add
      .scrollablePanel({
        x: (this.scene.cameras.main.width - 1400) / 2 + 700,
        y: this.scene.cameras.main.centerY / 2 + 750,
        width: this.scene.cameras.main.width - 700,
        height: 500,
        scrollMode: 1,
        panel: {
          child: this.createLevelSelectSizer(),

          mask: {
            padding: 1,
          },
        },
        slider: {
          track: this.scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0xffffff, 0.2),
          thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xffffff),
        },
        mouseWheelScroller: {
          focus: false,
          speed: 0.1,
        },
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
          panel: 10,
        },
      })
      .layout();

    scrollablePanel
      .setChildrenInteractive({
        targets: levels.map((x, index) => scrollablePanel.getByName(index.toString(), true)),
      })
      .on('child.click', (child) => {
        const id = child.rexContainer.parent.name;
        child.rexContainer.parent.scaleYoyo(300, 1.1);
        setTimeout(() => {
          this.tryStartLevel(id, true);
        }, 300);
      });

    scrollablePanel.popUp(800, undefined, 'Back');
    this.views.push(scrollablePanel);

    this.views.push(
      this.scene
        .addText(this.scene.cameras.main.centerX, scrollablePanel.y + scrollablePanel.height / 2 + 4 * this.scene.getSetting(Setting.padding), 'Zurück')
        .setInteractive()
        .on(
          'pointerup',
          () => {
            this.destroy();
            this.scene.toTitleScreen(false, false);
          },
          this,
        ),
    );
  }

  createLevelSelectSizer(): Phaser.GameObjects.GameObject {
    const padding = this.scene.getSetting(Setting.padding);
    const sizer = this.scene.rexUI.add.sizer({
      orientation: 'x',
      space: { item: 100 },
    });

    levels.forEach((level, index) => {
      if (level != null) {
        const levelElement = this.scene.rexUI.add
          .sizer({
            orientation: 'y',
            space: {
              left: padding,
              right: padding,
              top: 5,
              bottom: 5,
              item: padding,
            },
            name: index.toString(),
          })
          .add(this.scene.add.image(0, 0, level.previewImageKey).setScale(0.4), { expand: false, align: 'center' })
          .add(
            this.scene.addText(0, 0, level.title, {
              fontSize: Setting.fontlarge,
            }),
          )
          .add(this.scene.addText(0, 0, level.subtitle));
        sizer.add(levelElement, { expand: true });
      }
    });

    return sizer;
  }
}
