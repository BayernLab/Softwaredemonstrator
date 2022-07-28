import { parseColor, rgbToHsl } from '../utils/color';
import GameScene from '../utils/game.scene';
import { Setting } from '../utils/settings';

/**
 * A scene that displays the game settings.
 * @class GameSettingsScene
 * @extends {GameScene}
 */
export default class GameSettingsScene extends GameScene {
  static sceneName = 'GameSettings';

  public create(): void {
    const padding = this.getSetting(Setting.padding);

    const mainsizer = this.createSizer((this.cameras.main.width - 200) / 2 + 100, this.cameras.main.height / 3);
    const sizer = this.rexUI.add.sizer({
      x: mainsizer.x,
      y: mainsizer.y + mainsizer.height / 2 + 4 * padding,
      orientation: 'x',
      space: {
        item: 2 * padding,
        left: padding,
        right: padding,
        bottom: padding,
        top: padding,
      },
    });
    const back = this.addText(0, 0, 'Zum Startbildschirm')
      .setInteractive()
      .on(
        'pointerup',
        () => {
          this.scene.start('MainGame');
        },
        this
      );
    sizer.add(back);
    const reset = this.addText(0, 0, 'Einstellungen zurücksetzen')
      .setInteractive()
      .on(
        'pointerup',
        () => {
          this.gameSettings.reset();
          this.scene.restart();
        },
        this
      );
    sizer.add(reset);
    sizer.layout();
  }

  private createSizer(x, y) {
    const padding = this.getSetting(Setting.padding);
    const color = this.getSetting(Setting.backgroundColor);
    const mainSizer = this.rexUI.add.gridSizer({
      x,
      y,
      column: 2,
      row: 1,
      space: { column: padding, row: padding * 10 },
    });
    mainSizer.add(
      this.rexUI.add.label({
        text: this.addText(0, 0, 'Aktivierungszonen Platzierung:'),
        space: {
          left: padding,
          right: padding,
          top: padding,
          bottom: padding,
          icon: padding,
        },
      }),
      0
    );

    const dropZoneSetting = this.createDropDownSizer(
      [
        { text: 'Mittig', value: 'center' },
        { text: 'Unten', value: 'bottom' },
      ],
      Setting.dropZones,
      padding,
      color
    );
    mainSizer.add(dropZoneSetting, { column: 1, align: 'center', expand: true });
    mainSizer.add(
      this.rexUI.add.label({
        text: this.addText(0, 0, 'Kartenvorschau Platzierung:'),
        space: {
          left: padding,
          right: padding,
          top: padding,
          bottom: padding,
          icon: padding,
        },
      }),
      0
    );

    const minimapSetting = this.createDropDownSizer(
      [
        { text: 'Mittig', value: 'center' },
        { text: 'In den Ecken', value: 'corner' },
        { text: 'Keine', value: 'none' },
      ],
      Setting.miniMaps,
      padding,
      color
    );
    mainSizer.add(minimapSetting, { column: 1, align: 'center', expand: true });
    const colorPickers = [];
    for (let i = 0; i < 4; i++) {
      mainSizer.add(
        this.rexUI.add.label({
          text: this.addText(0, 0, `Spielerfarben: Spieler${i + 1}:`),
          space: {
            left: padding,
            right: padding,
            top: padding,
            bottom: padding,
            icon: padding,
          },
        }),
        0
      );
      const colorPicker = this.createPlayerColorPicker(i);
      colorPickers.push(colorPicker);
      mainSizer.add(colorPicker, { column: 1, align: 'left' });
    }
    mainSizer.layout();
    colorPickers.forEach((picker) => picker.layout().drawBounds(this.add.graphics(), 0xffffff));
    dropZoneSetting.layout();
    minimapSetting.layout();
    return mainSizer;
  }

  private createPlayerColorPicker(playerId) {
    const currentPlayerColors = this.getSetting(Setting.playerColors);
    const colorStrip = this.rexUI.add.canvas(0, 0, 400, 60);
    const ctx = colorStrip.context;
    const grd = ctx.createLinearGradient(0, 0, 400, 0);
    grd.addColorStop(0, parseColor(0xff0000));
    grd.addColorStop(1 / 6, parseColor(0xffff00));
    grd.addColorStop((1 / 6) * 2, parseColor(0x00ff00));
    grd.addColorStop((1 / 6) * 3, parseColor(0x00ffff));
    grd.addColorStop((1 / 6) * 4, parseColor(0x0000ff));
    grd.addColorStop((1 / 6) * 5, parseColor(0xff00ff));
    grd.addColorStop(1, parseColor(0xff0004));
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 400, 60);
    colorStrip.updateTexture();
    const thumb = this.add.rectangle(0, 0, 20, 20);
    const slider = this.rexUI.add.slider({
      height: 20,
      thumb,
      input: 'click',
      value: rgbToHsl(currentPlayerColors[playerId])[0],
      valuechangeCallback: (value) => {
        const x = (colorStrip.width - 1) * value;
        const color = colorStrip.getPixel(x, 0);
        thumb.setFillStyle(color.color);
        currentPlayerColors[playerId] = color.color;
        this.gameSettings.set(Setting.playerColors, currentPlayerColors);
      },
    });

    colorStrip.setInteractive().on('pointerdown', (pointer, localX, localY) => {
      slider.setValue(localX / colorStrip.width);
    });

    const colorPicker = this.rexUI.add
      .sizer({
        orientation: 'y',
      })
      .add(colorStrip)
      .add(slider, { expand: true });
    return colorPicker;
  }

  private createDropDownSizer(values, settingKey, padding: any, color: any) {
    const currentValue = this.getSetting(settingKey);
    const currentText = values.filter((x) => x.value === currentValue)[0].text;
    const dropDownSizer = this.rexUI.add.dropDownList({
      name: settingKey,
      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 0, color),
      text: this.addText(0, 0, currentText),
      space: {
        left: padding,
        right: padding,
        top: padding,
        bottom: padding,
        icon: padding,
      },
      options: values,
      list: {
        createBackgroundCallback: () => this.rexUI.add.roundRectangle(0, 0, 1, 1, 0, color),
        createButtonCallback: (x: GameScene, option, index, options) => {
          const button = this.rexUI.add.label({
            background: this.rexUI.add.roundRectangle(0, 0, 1, 1, 0),
            text: this.addText(0, 0, option.text),
            space: {
              left: padding,
              right: padding,
              top: padding,
              bottom: padding,
              icon: padding,
            },
          });
          (button as any).text = option.text;
          (button as any).value = option.value;
          return button;
        },
        onButtonClick: (button: any, index, pointer, event) => {
          dropDownSizer.text = button.text;
          dropDownSizer.value = button.value;
          dropDownSizer.closeListPanel();
          this.gameSettings.set(settingKey, button.value);
          dropDownSizer.layout();
        },
      },
      value: currentValue,
    });
    return dropDownSizer;
  }
}
