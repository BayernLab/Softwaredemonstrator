import * as Blockly from 'blockly/core';
import { Sizer } from 'phaser3-rex-plugins/templates/ui/ui-components';
import { colorShadeAsHex } from '../../../utils/color';
import type GameScene from '../../../utils/game.scene';
import { Setting } from '../../../utils/settings';
import type BlockView from './block';
import ConnectionView from './connection';

/**
 * The view for an input of a block.
 * @class InputView
 * @extends Sizer
 */
export default class InputView extends Sizer {
  blockInput: Blockly.Input;

  hasConnection: boolean;

  connectionView: ConnectionView;

  sourceBlockView: BlockView;

  constructor(input: Blockly.Input, source: BlockView, scene: GameScene) {
    super(scene, { orientation: 'x' });
    this.blockInput = input;
    this.hasConnection = input.connection != null;
    this.sourceBlockView = source;
    this.addBackground(scene.rexUI.add.roundRectangle(0, 0, 1, 1, 0, this.sourceBlockView.color));

    input.fieldRow.forEach((field) => this.buildFieldView(field, scene).forEach((view) => this.add(view, { align: 'left' })));
    if (input.fieldRow.length === 0) {
      const background2 = scene.rexUI.add.roundRectangle(0, 0, 5, 2, 0, this.sourceBlockView.color);
      this.add(background2, { align: 'left' });
    }
    scene.add.existing(this);
  }

  buildFieldView(field: Blockly.Field, scene: GameScene): Phaser.GameObjects.GameObject[] {
    const padding = scene.getSetting(Setting.blockPadding);
    switch (field.constructor) {
      case Blockly.FieldLabel: {
        const text = scene.addText(0, 0, field.getText().trim(), {
          fontSize: Setting.fontblock,
          fontColor: Setting.blockFontColor,
        });
        const nameLabel = scene.rexUI.add.label({
          text,
          space: {
            left: padding,
            right: padding,
            top: padding,
            bottom: padding,
            icon: padding,
          },
        });
        return [nameLabel];
      }
      case Blockly.FieldDropdown: {
        const shaded = colorShadeAsHex(this.sourceBlockView.color, -100);
        const dropDownSizer = scene.rexUI.add.dropDownList({
          background: scene.rexUI.add.roundRectangle(0, 0, 1, 1, 0, shaded),
          text: scene.addText(0, 0, ` ${field.getText()} `, {
            fontSize: Setting.fontblock,
            fontColor: Setting.blockFontColor,
          }),
          space: {
            left: 2 * padding,
            right: 2 * padding,
            top: padding,
            bottom: padding,
            icon: padding,
          },
          // eslint-disable-next-line no-underscore-dangle
          options: (field as any).menuGenerator_.map((option) => ({ text: option[0], value: option[1] })),
          list: {
            createBackgroundCallback: () => scene.rexUI.add.roundRectangle(0, 0, 1, 1, 0, shaded),
            createButtonCallback: (x: GameScene, option, index, options) => {
              const button = scene.rexUI.add.label({
                background: scene.rexUI.add.roundRectangle(0, 0, 1, 1, 0).setStrokeStyle(1, 0xffffff),
                text: scene.addText(0, 0, option.text, {
                  fontSize: Setting.fontblock,
                  fontColor: Setting.blockFontColor,
                }),
                space: {
                  left: 2 * padding,
                  right: 2 * padding,
                  top: padding,
                  bottom: padding,
                  icon: padding,
                },
              });
              (button as any).text = ` ${option.text} `;
              (button as any).value = option.value;
              return button;
            },
            onButtonClick: (button: any, index, pointer, event) => {
              // Set label text, and value
              dropDownSizer.text = button.text;
              dropDownSizer.value = button.value;
              dropDownSizer.closeListPanel();
              field.setValue(button.value);
              const { rotation } = this.sourceBlockView;
              this.sourceBlockView.setRotation(0);
              this.sourceBlockView.grid.setRotation(0);
              this.sourceBlockView.grid.layout();
              this.sourceBlockView.setRotation(rotation);
              this.sourceBlockView.grid.setRotation(rotation);
              this.sourceBlockView.addOutline();
              this.sourceBlockView.layoutAll();
            },
          },
          value: field.getText(),
        });
        dropDownSizer.onClick(() => {
          (dropDownSizer as any)?.listPanel?.setRotation(dropDownSizer.rotation);
        }, this);
        dropDownSizer.enableClick();
        const pan = this.sourceBlockView.scene.rexUI.add.pan(dropDownSizer);
        pan.on('panstart', this.sourceBlockView.onBeginDrag, this.sourceBlockView);
        pan.on('pan', this.sourceBlockView.onDrag, this.sourceBlockView);
        pan.on('panend', this.sourceBlockView.onEndDrag, this.sourceBlockView);
        this.sourceBlockView.panHandlers.push(pan);
        return [dropDownSizer];
      }
      default:
        return [];
    }
  }
}
