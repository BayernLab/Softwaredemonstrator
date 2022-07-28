import * as Blockly from 'blockly';
import { CustomShapes, GridSizer, Pan } from 'phaser3-rex-plugins/templates/ui/ui-components';
import { connect, disconnect, layout } from '../../utils/connection';
import type WorkspaceView from '../workspace';
import { CompositeContainerView, ViewType } from './base';
import ConnectionView from './connection';

import { colorShadeAsHex } from '../../../utils/color';
import type GameScene from '../../../utils/game.scene';
import { setRotatedPosition } from '../../../utils/position';
import { Setting } from '../../../utils/settings';

const getOutlineGraphics = (scene: GameScene, x: number, y: number, width: number, height: number, borderThickness: number, color: number): CustomShapes => scene.rexUI.add.customShapes({
  x,
  y,
  create: { lines: 1 },
  update() {
    (this.getShapes()[0] as any).lineStyle(borderThickness, color, 1).fillStyle(color, 0).startAt(x, y).lineTo(width, height)
      .end();
  },
});

/**
 * The view for block in the workspace or toolbox.
 * @class BlockView
 * @extends CompositeContainerView
 */
export default class BlockView extends CompositeContainerView {
  block: Blockly.Block;

  grid: GridSizer;

  color: number;

  panHandlers: Pan[] = [];

  ownConnections: ConnectionView[] = [];

  private inToolbox: boolean;

  // closest connection found when dragging
  private closestConnection: ConnectionView = null;

  // local connection opposite to closest connection found
  private ownAttachingConnection: ConnectionView = null;

  initialX: number;

  initialY: number;

  displayName: string;

  outlines: CustomShapes[] = [];

  outlineColor: number;

  constructor(workspace: WorkspaceView, block: Blockly.Block, x: number, y: number, color: number) {
    super(workspace.scene, x, y);
    this.initialX = x;
    this.initialY = y;
    this.workspace = workspace;
    this.viewType = ViewType.Block;
    this.block = block;
    this.color = color;
    this.outlineColor = colorShadeAsHex(color, -100);
    this.grid = this.scene.rexUI.add.gridSizer({ column: 3, row: 1, columnProportions: [0, 1, 0] });
    this.pinLocal(this.grid);
    this.scene.add.existing(this);
  }

  /**
   * Sets the block to the workspace. Removes it from the toolbox if it was there.
   * @returns {void}
   */
  setToWorkspace() {
    if (this.inToolbox) {
      this.workspace.getToolbox().remove(this, false);
      this.workspace.add(this);
    } else {
      this.workspace.addLocal(this);
    }
    this.setName(this.block.getFieldValue('NAME') ?? this.block.toString());
    this.inToolbox = false;
  }

  /**
   * Sets the block to the toolbox.
   * @returns {void}
   */
  setToToolbox() {
    if (!this.inToolbox) {
      this.workspace.getToolbox().addLocal(this);
    }
    this.setName(`${this.block.getFieldValue('NAME') ?? this.block.toString()}-inToolbox`);
    this.inToolbox = true;
  }

  /**
   * Sets the name of the block.
   * @returns {BlockView} this
   */
  setName(value: string) {
    let prefix = 'block';
    if (this.block.type.indexOf('procedures_defnoreturn_') >= 0) {
      prefix = 'procedure';
    }
    this.displayName = value;
    this.name = `${prefix}-${value}`;
    return this;
  }

  override destroy() {
    this.panHandlers.forEach((x) => x.shutdown());
    this.compositeChildren.forEach((elem: any) => {
      this.removeCompositeChild(elem);
      elem.destroy();
    });

    this.workspace.removeBlockView(this);
    super.destroy();
  }

  override layout() {
    this.ownConnections
      .filter((connection) => !connection.connection.isSuperior() && connection.connectedWith != null)
      .forEach((connection) => {
        layout(connection.connectedWith, connection, this.scene.getSetting(Setting.blockPadding));
        connection.connectedWith.sourceBlockView.layout();
      });
  }

  /**
   * Layouts all blocks in the workspace that are connected to this block. Starting from the topmost parent.
   * @returns {void}
   */
  layoutAll() {
    const topMostParent = this.getTopmostParent();
    topMostParent.getLeafChildren().forEach((child: BlockView) => child.layout());
  }

  /**
   * Highlights the border of the block by adding an outline/border.
   * @returns {void}
   */
  addOutline() {
    while (this.outlines.length > 0) {
      this.outlines.pop().destroy();
    }
    const color = this.outlineColor;
    const thickness = this.scene.getSetting(Setting.blockBorderThickness);
    for (let column = 0; column < this.grid.columnCount; column++) {
      for (let row = 0; row < this.grid.rowCount; row++) {
        const child = (this.grid as any).getChildAt(column, row);
        let graphic: CustomShapes = null;
        if (child instanceof ConnectionView) {
          graphic = child.getOutlineGraphics();
          setRotatedPosition(graphic, this.rotation, child.getTopLeft().x, child.getTopLeft().y);
          this.outlines.push(graphic);
        } else {
          if (column === 0) {
            graphic = getOutlineGraphics(this.scene, 0, 0, 0, child.height, thickness, color);
            setRotatedPosition(graphic, this.rotation, child.getTopLeft().x, child.getTopLeft().y);
            this.outlines.push(graphic);
          }
          if (row === 0) {
            graphic = getOutlineGraphics(this.scene, 0, 0, child.width, 0, thickness, color);
            setRotatedPosition(graphic, this.rotation, child.getTopLeft().x, child.getTopLeft().y);
            this.outlines.push(graphic);
          }
          if (column === this.grid.columnCount - 1) {
            graphic = getOutlineGraphics(this.scene, 0, 0, 0, child.height, thickness, color);
            setRotatedPosition(graphic, this.rotation, child.getTopRight().x, child.getTopRight().y);
            this.outlines.push(graphic);
          }
          if (row === this.grid.rowCount - 1) {
            graphic = getOutlineGraphics(this.scene, 0, 0, child.width, 0, thickness, color);
            this.scene.add.graphics({ lineStyle: { color, width: thickness } });
            setRotatedPosition(graphic, this.rotation, child.getBottomLeft().x, child.getBottomLeft().y);
            this.outlines.push(graphic);
          }
        }
      }
    }
    this.add(this.outlines);
  }

  onBeginDrag() {
    if (this.inToolbox) {
      this.setToWorkspace();
      this.workspace.getToolbox().recreateBlockView(this);
    }

    if (this.parent != null) {
      disconnect(this);
    }

    this.bringToTop();
    this.outlines.forEach((element) => {
      element.getShapes()[0].lineStyle(this.scene.getSetting(Setting.blockBorderThickness), this.scene.getSetting(Setting.highlightColor));
    });
  }

  onDrag(event: any) {
    this.move(event.dx, event.dy);

    // find the closest connection
    this.closestConnection = null;
    this.ownAttachingConnection = null;
    this.getAllChildren()
      .filter((x: any) => x.viewType === ViewType.Connection)
      .every((child: ConnectionView) => {
        const connection: ConnectionView = this.workspace.checkConnections(child);
        if (connection) {
          // break after closest connection was found
          this.closestConnection = connection;
          this.ownAttachingConnection = child;
          return false;
        }
        return true;
      });

    this.workspace.checkBin(this);
  }

  onEndDrag() {
    this.outlines.forEach((element) => {
      element.getShapes()[0].lineStyle(this.scene.getSetting(Setting.blockBorderThickness), this.outlineColor);
    });

    if (!this.workspace.isValidBlockPosition(this)) {
      this.destroy();
      return;
    }
    // add to blockly workspace if not there yet
    if (!this.workspace.isInWorkspace(this.block)) {
      this.workspace.addBlockView(this);
    }

    if (this.closestConnection != null) {
      if (this.closestConnection.connection.isSuperior()) {
        connect(this.closestConnection, this.ownAttachingConnection, this.scene.getSetting(Setting.blockPadding));
      } else {
        connect(this.ownAttachingConnection, this.closestConnection, this.scene.getSetting(Setting.blockPadding));
      }
    }
  }
}
