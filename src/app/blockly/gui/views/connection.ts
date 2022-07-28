// eslint-disable-next-line max-classes-per-file
import * as Blockly from 'blockly/core';
import { CustomShapes, Sizer } from 'phaser3-rex-plugins/templates/ui/ui-components';
import type GameScene from '../../../utils/game.scene';
import { Setting } from '../../../utils/settings';
import { Base, ViewType } from './base';
import type WorkspaceView from '../workspace';
import type BlockView from './block';
import type InputView from './input';

/**
 * The view for an connection of a block. Node to connect output, previous, next statement to other blocks
 * @class ConnectionView
 * @extends Sizer
 */
export default abstract class ConnectionView extends Sizer implements Base {
  workspace: WorkspaceView;

  connectionType: Blockly.connectionTypes;

  inputType: Blockly.inputTypes;

  connection: Blockly.Connection;

  sourceBlockView: BlockView;

  sourceInputView: InputView;

  connectionAnchor: CustomShapes;

  viewType = ViewType.Connection;

  scene: GameScene;

  connectedWith: ConnectionView;

  constructor(scene: GameScene, connection: Blockly.Connection, sourceBlock: BlockView, sourceInput?: InputView) {
    super(scene, { orientation: 'y' });
    this.viewType = ViewType.Connection;
    this.workspace = sourceBlock.workspace;
    this.connection = connection;
    this.connectionType = connection.type;
    this.sourceInputView = sourceInput;
    this.inputType = sourceInput?.blockInput?.type;
    this.sourceBlockView = sourceBlock;
    this.connectionAnchor = this.buildAnchorSymbol();
    this.createLayout();

    this.scene.add.existing(this);

    this.layout();
    this.connectionAnchor.setOrigin(0, 0);
  }

  /**
   * Checks if the connection is connected to another connection
   * @returns true if the connection is connected to another connection
   */
  isConnected(): boolean {
    return this.connection.isConnected();
  }

  /**
   * Hightlights the connection if it is set to active
   * @param active true if the connection should be highlighted
   * @returns {void}
   */
  highlight(active: boolean) {
    const highlightColor = this.scene.getSetting(Setting.highlightColor);
    if (!this.isConnected() && active) {
      this.connectionAnchor.getShapes()[0].lineStyle(4, highlightColor, 1);
    } else {
      this.connectionAnchor.getShapes()[0].lineStyle(0, highlightColor, 0);
    }
  }

  /**
   * Returns the outline graphics of the connection
   * @returns {CustomShapes} the outline graphics of the connection
   * @abstract
   */
  abstract getOutlineGraphics(): CustomShapes;

  /**
   * Creates the layout of the connection
   * @abstract
   */
  protected abstract createLayout();

  /**
   * Creates the anchor symbol of the connection
   * * @returns {CustomShapes} the anchor symbol of the connection
   * @abstract
   */
  protected abstract buildAnchorSymbol(): CustomShapes;
}

/**
 * The view for an connection of a block. This class represents output connections (left-side connections of blocks with outputs)
 * @class OutputConnectionView
 * @extends ConnectionView
 */
export class OutputConnectionView extends ConnectionView {
  createLayout() {
    this.add(this.connectionAnchor, 1, 'top');
  }

  buildAnchorSymbol(): CustomShapes {
    const { color } = this.sourceBlockView;
    const height = this.scene.getSetting(Setting.blockUnitLarge);
    const width = this.scene.getSetting(Setting.blockUnitSmall);
    const highlightColor = this.scene.getSetting(Setting.highlightColor);
    return this.scene.rexUI.add.customShapes({
      height,
      width,

      create: { lines: 2 },
      update() {
        const left = 0;
        const right = this.width;
        const top = 0;
        const bottom = this.height;
        (this.getShapes()[0] as any)
          .lineStyle(4, highlightColor, 0)
          .fillStyle(color, 0)
          .startAt(right, top)
          .lineTo(right, top + bottom / 4)
          .lineTo(left, bottom / 2)
          .lineTo(right, bottom - bottom / 4)
          .lineTo(right, bottom)
          .end();
        (this.getShapes()[1] as any)
          .lineStyle(this.lineWidth, color, this.strokeAlpha)
          .fillStyle(color, this.fillAlpha)
          .startAt(right, top)
          .lineTo(right, top + bottom / 4)
          .lineTo(left, bottom / 2)
          .lineTo(right, bottom - bottom / 4)
          .lineTo(right, bottom)
          .lineTo(right, top)
          .close();
      },
    });
  }

  getOutlineGraphics(): CustomShapes {
    const { height } = this;
    const { width } = this;
    const borderThickness = this.scene.getSetting(Setting.blockBorderThickness);
    const { outlineColor } = this.sourceBlockView;
    return this.scene.rexUI.add.customShapes({
      create: { lines: 1 },
      update() {
        (this.getShapes()[0] as any)
          .lineStyle(borderThickness, outlineColor)
          .fillStyle(outlineColor, 0)
          .startAt(width, 0)
          .lineTo(width, height / 4)
          .lineTo(0, height / 2)
          .lineTo(width, height - height / 4)
          .lineTo(width, height)
          .end();
      },
    });
  }
}

/**
 * The view for an connection of a block. This class represents statement connections (connections to inner statements of e.g., if, while, for)
 * @class StatementConnectionView
 * @extends ConnectionView
 */
export class StatementConnectionView extends ConnectionView {
  createLayout() {
    const sizer = this.scene.rexUI.add.sizer({ orientation: 'x' });

    sizer.add(this.connectionAnchor, { align: 'left' });

    sizer.layout();

    this.add(sizer, { align: 'top', proportion: 1 });
    const paddingBlock = this.scene.rexUI.add.roundRectangle(0, 0, 1, 25, 0);
    this.add(paddingBlock);
  }

  buildAnchorSymbol(): CustomShapes {
    const { color } = this.sourceBlockView;
    const height = this.scene.getSetting(Setting.blockUnitSmall);
    const width = this.scene.getSetting(Setting.blockUnitLarge);
    const baseUnit = this.scene.getSetting(Setting.blockUnitSmall);
    const highlightColor = this.scene.getSetting(Setting.highlightColor);
    return this.scene.rexUI.add.customShapes({
      height,
      width: 2 * baseUnit + width,
      create: { lines: 2 },
      update() {
        const left = 0;
        const right = this.width - 2 * baseUnit;
        const top = 0;
        const bottom = this.height;
        (this.getShapes()[0] as any)
          .lineStyle(4, highlightColor, 0)
          .fillStyle(color, 0)
          .startAt(left, bottom)
          .lineTo(left + baseUnit, bottom)
          .lineTo(baseUnit + right / 2, bottom + width / 2)
          .lineTo(baseUnit + right, bottom)
          .lineTo(2 * baseUnit + right, bottom)
          .end();
        (this.getShapes()[1] as any)
          .lineStyle(this.lineWidth, color, this.strokeAlpha)
          .fillStyle(color, this.fillAlpha)
          .startAt(left, top)
          .lineTo(left, bottom)
          .lineTo(left + baseUnit, bottom)
          .lineTo(baseUnit + right / 2, bottom + width / 2)
          .lineTo(baseUnit + right, bottom)
          .lineTo(2 * baseUnit + right, bottom)
          .lineTo(2 * baseUnit + right, top)
          .lineTo(left, top)
          .close();
      },
    });
  }

  getOutlineGraphics(): CustomShapes {
    const height = this.scene.getSetting(Setting.blockUnitSmall);
    const width = this.scene.getSetting(Setting.blockUnitLarge);
    const baseUnit = this.scene.getSetting(Setting.blockUnitSmall);
    const offsetHeight = this.sourceInputView.height - height;
    const offsetWidth = this.width - width;

    const borderThickness = this.scene.getSetting(Setting.blockBorderThickness);
    const { outlineColor } = this.sourceBlockView;
    return this.scene.rexUI.add.customShapes({
      height,
      width,
      create: { lines: 1 },
      update() {
        (this.getShapes()[0] as any)
          .lineStyle(borderThickness, outlineColor)
          .fillStyle(outlineColor, 0)
          .startAt(width + offsetWidth + baseUnit, 0 + borderThickness)
          .lineTo(width + offsetWidth + baseUnit, baseUnit + 2 * borderThickness)
          .lineTo(width + offsetWidth, baseUnit + 2 * borderThickness)
          .lineTo(width / 2 + offsetWidth, baseUnit + 2 * borderThickness + height)
          .lineTo(offsetWidth, baseUnit + 2)
          .lineTo(offsetWidth - baseUnit, baseUnit + 2 * borderThickness)
          .lineTo(offsetWidth - baseUnit, height + offsetHeight + 2 * borderThickness)
          .lineTo(width + offsetWidth + baseUnit, height + offsetHeight + 2 * borderThickness)
          .end();
      },
    });
  }
}

/**
 * The view for an connection of a block. This class represents value connections (right-hand connections that take input from other blocks)
 * @class ValueConnectionView
 * @extends ConnectionView
 */
export class ValueConnectionView extends ConnectionView {
  createLayout() {
    this.add(this.connectionAnchor, 1, 'left');
  }

  buildAnchorSymbol(): CustomShapes {
    const { color } = this.sourceBlockView;
    const height = this.scene.getSetting(Setting.blockUnitLarge);
    const width = this.scene.getSetting(Setting.blockUnitSmall);
    const highlightColor = this.scene.getSetting(Setting.highlightColor);
    return this.scene.rexUI.add.customShapes({
      height,
      width,
      create: { lines: 2 },
      update() {
        const left = 0;
        const right = this.width;
        const top = 0;
        const bottom = this.height;
        (this.getShapes()[0] as any)
          .lineStyle(4, highlightColor, 0)
          .fillStyle(color, 0)
          .startAt(right, top)
          .lineTo(right, top + bottom / 4)
          .lineTo(left, bottom / 2)
          .lineTo(right, bottom - bottom / 4)
          .lineTo(right, bottom)
          .end();
        (this.getShapes()[1] as any)
          .lineStyle(this.lineWidth, color, this.strokeAlpha)
          .fillStyle(color, this.fillAlpha)
          .startAt(left, top)
          .lineTo(right, top)
          .lineTo(right, top + bottom / 4)
          .lineTo(left, bottom / 2)
          .lineTo(right, bottom - bottom / 4)
          .lineTo(right, bottom)
          .lineTo(left, bottom)
          .lineTo(left, top)
          .close();
      },
    });
  }

  getOutlineGraphics(): CustomShapes {
    const { height } = this;
    const width = this.scene.getSetting(Setting.blockUnitSmall);
    const offsetWidth = this.width - width;
    const borderThickness = this.scene.getSetting(Setting.blockBorderThickness);
    const { outlineColor } = this.sourceBlockView;
    return this.scene.rexUI.add.customShapes({
      create: { lines: 1 },
      update() {
        const shape = (this.getShapes()[0] as any).lineStyle(borderThickness, outlineColor).fillStyle(outlineColor, 0);
        if (offsetWidth > 0) {
          shape.startAt(width + offsetWidth + borderThickness, 0);
        } else {
          shape.startAt(0, 0);
        }
        shape
          .lineTo(width + borderThickness, 0)
          .lineTo(width + borderThickness, height / 4 + borderThickness)
          .lineTo(0 + borderThickness, height / 2 + borderThickness)
          .lineTo(width + borderThickness, height - height / 4 + borderThickness)
          .lineTo(width + borderThickness, height);
        if (offsetWidth > 0) {
          shape.lineTo(width + offsetWidth + borderThickness, height);
        } else {
          shape.lineTo(0, height);
        }
        shape.end();
      },
    });
  }
}

/**
 * The view for an connection of a block. This class represents previous connections (upper connections to connect block as child)
 * @class PrevConnectionView
 * @extends ConnectionView
 */
export class PrevConnectionView extends ConnectionView {
  createLayout() {
    const sizer = this.scene.rexUI.add.sizer({ orientation: 'x' });
    sizer.add(this.connectionAnchor, { align: 'left' });

    const backdrop = this.getBackdropSymbol();
    sizer.add(backdrop, { expand: true, proportion: 1 });
    sizer.layout();

    this.add(sizer, { expand: true });
  }

  buildAnchorSymbol(): CustomShapes {
    const { color } = this.sourceBlockView;
    const height = this.scene.getSetting(Setting.blockUnitSmall);
    const width = this.scene.getSetting(Setting.blockUnitLarge);
    const highlightColor = this.scene.getSetting(Setting.highlightColor);
    return this.scene.rexUI.add.customShapes({
      height,
      width,
      create: { lines: 2 },
      update() {
        const left = 0;
        const right = this.width;
        const top = 0;
        const bottom = this.height;
        (this.getShapes()[0] as any)
          .lineStyle(4, highlightColor, 0)
          .fillStyle(color, 0)
          // top line, right arc
          .startAt(left - width / 2, top)
          .lineTo(left, top)
          .lineTo(right / 2, bottom)
          .lineTo(right, top)
          .lineTo(right + width, top)
          .end();
        (this.getShapes()[1] as any)
          .lineStyle(0, color, 0)
          .fillStyle(color, 1)
          .startAt(left, bottom)
          .lineTo(left, top)
          .lineTo(right / 2, bottom)
          .lineTo(right, top)
          .lineTo(right + width, top)
          .lineTo(right + width, bottom)
          .lineTo(left, bottom)
          .close();
      },
    });
  }

  getOutlineGraphics(): CustomShapes {
    const height = this.scene.getSetting(Setting.blockUnitSmall);
    const width = this.scene.getSetting(Setting.blockUnitLarge);
    const totalWidth = this.width;
    const borderThickness = this.scene.getSetting(Setting.blockBorderThickness);
    const { outlineColor } = this.sourceBlockView;
    return this.scene.rexUI.add.customShapes({
      create: { lines: 1 },
      update() {
        (this.getShapes()[0] as any)
          .lineStyle(borderThickness, outlineColor)
          .fillStyle(outlineColor, 0)
          .startAt(0, 0)
          .lineTo(width / 2 + borderThickness, height + borderThickness)
          .lineTo(width + borderThickness, 0)
          .lineTo(totalWidth, 0)
          .end();
      },
    });
  }

  getBackdropSymbol(): Phaser.GameObjects.Rectangle {
    const { color } = this.sourceBlockView;
    return this.scene.add.rectangle(0, 0, 1, 1, color);
  }
}

/**
 * The view for an connection of a block. This class represents next connections (bottom connections to connect block as parent)
 * @class NextConnectionView
 * @extends ConnectionView
 */
export class NextConnectionView extends ConnectionView {
  createLayout() {
    const sizer = this.scene.rexUI.add.sizer({ orientation: 'x' });
    sizer.add(this.connectionAnchor, { align: 'left' });

    const backdrop = this.getBackdropSymbol();
    sizer.add(backdrop, { expand: true, proportion: 1 });
    sizer.layout();

    this.add(sizer, { expand: true });
  }

  buildAnchorSymbol(): CustomShapes {
    const { color } = this.sourceBlockView;
    const height = this.scene.getSetting(Setting.blockUnitSmall);
    const width = this.scene.getSetting(Setting.blockUnitLarge);
    const highlightColor = this.scene.getSetting(Setting.highlightColor);
    return this.scene.rexUI.add.customShapes({
      height,
      width,
      create: { lines: 2 },
      update() {
        const left = 0;
        const right = width;
        const top = 0;
        const bottom = height;
        (this.getShapes()[0] as any)
          .lineStyle(4, highlightColor, 0)
          .fillStyle(color, 0)
          .startAt(left - width / 2, bottom)
          .lineTo(left, bottom)
          .lineTo(right / 2, bottom + height)
          .lineTo(right, bottom)
          .lineTo(right + width, bottom)
          .end();
        (this.getShapes()[1] as any)
          .lineStyle(this.lineWidth, color, this.strokeAlpha)
          .fillStyle(color, this.fillAlpha)
          .startAt(left, top)
          .lineTo(left, bottom)
          .lineTo(right / 2, bottom + height)
          .lineTo(right, bottom)
          .lineTo(right, top)
          .lineTo(left, top)
          .close();
      },
    });
  }

  getOutlineGraphics(): CustomShapes {
    const height = this.scene.getSetting(Setting.blockUnitSmall);
    const width = this.scene.getSetting(Setting.blockUnitLarge);
    const totalWidth = this.width;
    const borderThickness = this.scene.getSetting(Setting.blockBorderThickness);
    const { outlineColor } = this.sourceBlockView;
    return this.scene.rexUI.add.customShapes({
      create: { lines: 1 },
      update() {
        (this.getShapes()[0] as any)
          .lineStyle(borderThickness, outlineColor)
          .fillStyle(outlineColor, 0)
          .startAt(0, height)
          .lineTo(width / 2 + borderThickness, height * 2 + borderThickness)
          .lineTo(width + borderThickness, height)
          .lineTo(totalWidth, height)
          .end();
      },
    });
  }

  getBackdropSymbol(): Phaser.GameObjects.Rectangle {
    const { color } = this.sourceBlockView;
    return this.scene.add.rectangle(0, 0, 1, 1, color);
  }
}
