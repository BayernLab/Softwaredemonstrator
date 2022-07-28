import * as Blockly from 'blockly/core';
import type WorkspaceView from '../workspace';
import BlockView from './block';
import {
  NextConnectionView, OutputConnectionView, PrevConnectionView, StatementConnectionView, ValueConnectionView,
} from './connection';
import InputView from './input';

/**
 * Factory class for creating block views. This class is not meant to be instantiated.
 * Block views are created by calling the static method createView based on a specific Blockly block configuration.
 * @class BlockViewFactory
 */
export default class BlockViewFactory {
  /**
   * Creates a new block view from a Blockly block.
   * @param {WorkspaceView} workspace - The workspace view to add the block view to.
   * @param {Blockly.Block} block - The Blockly block to create the view for.
   * @param {number} x - The initial x-coordinate of the block view.
   * @param {number} y - The initial y-coordinate of the block view.
   * @param {number} color - The color of the block view.
   * @param {boolean} inToolbox - Whether the block view should be added to the toolbox or the workspace.
   * @return {BlockView} The newly created block view.
   */
  public static createView(workspace: WorkspaceView, block: Blockly.Block, x: number, y: number, color: number, inToolbox: boolean): BlockView {
    let blockView: BlockView = new BlockView(workspace, block, x, y, color);
    // INFO: all blocks are rendered with this.setInputsInline(false) so we never have inline value connectors

    if (!block.outputConnection) {
      this.createBlockStartRow(block, workspace, blockView);
    }

    block.inputList.forEach((input, index) => this.createBlockInputRow(block, input, workspace, blockView, index + 1));

    if (!block.outputConnection) {
      this.createBlockEndRow(block, workspace, blockView);
    }

    blockView.grid.layout();
    blockView.setSize(blockView.grid.width, blockView.grid.height);

    // add drag handling
    blockView = workspace.scene.matter.add.gameObject(blockView, { isSensor: true, isStatic: true, restitution: 0 }) as BlockView;
    const pan = workspace.scene.rexUI.add.pan(blockView);
    pan.on('panstart', blockView.onBeginDrag, blockView);
    pan.on('pan', blockView.onDrag, blockView);
    pan.on('panend', blockView.onEndDrag, blockView);
    blockView.panHandlers.push(pan);

    // center
    blockView.x += blockView.grid.width / 2;
    blockView.y += blockView.grid.height / 2;
    if (inToolbox) {
      blockView.setToToolbox();
    } else {
      blockView.setToWorkspace();
    }
    blockView.bringToTop();
    blockView.addOutline();
    return blockView;
  }

  private static createBlockInputRow(block: Blockly.Block, input: Blockly.Input, workspace: WorkspaceView, blockView: BlockView, row: number) {
    const inputView = new InputView(input, blockView, workspace.scene);
    for (let i = 0; i < 3; i++) {
      // for each collumn add
      let element;
      if (block.outputConnection && i === 0 && row === 1) {
        element = new OutputConnectionView(workspace.scene, block.outputConnection, blockView);
        blockView.ownConnections.push(element);
        blockView.grid.add(element, { column: i, align: 'left', expand: true });
      } else if (i === 1) {
        blockView.grid.add(inputView, { column: i, align: 'left', expand: true });
      } else if (i === 2 && (input.type === Blockly.inputTypes.VALUE || input.type === Blockly.inputTypes.STATEMENT)) {
        let connectionView;
        switch (input.type) {
          case Blockly.inputTypes.VALUE:
            connectionView = new ValueConnectionView(workspace.scene, input.connection, blockView, inputView);
            blockView.grid.add(connectionView, { column: i, align: 'left', expand: true });

            break;
          case Blockly.inputTypes.STATEMENT:
            connectionView = new StatementConnectionView(workspace.scene, input.connection, blockView, inputView);
            blockView.grid.add(connectionView, { column: i, align: 'top' });
            break;
          default:
            console.error('Unknown input type');
            break;
        }
        inputView.connectionView = connectionView;
        blockView.ownConnections.push(connectionView);
      } else {
        element = workspace.scene.rexUI.add.roundRectangle(0, 0, 5, 5, 0, blockView.color);
        // must set min width and height here to make resizing (to smaller sizer) work; see rexui containerlite GetChildrenHeight.js line 32
        (element as any).minWidth = 5;
        (element as any).minHeight = 5;
        blockView.grid.add(element, { column: i, expand: true });
      }
    }
  }

  private static createBlockEndRow(block: Blockly.Block, workspace: WorkspaceView, blockView: BlockView) {
    for (let i = 0; i < 3; i++) {
      // for each collumn add
      let element;
      if (block.nextConnection && i === 1) {
        element = new NextConnectionView(workspace.scene, block.nextConnection, blockView);
        blockView.ownConnections.push(element);
      } else {
        element = workspace.scene.rexUI.add.roundRectangle(0, 0, 5, 5, 0, blockView.color);
        (element as any).minWidth = 5;
        (element as any).minHeight = 5;
      }
      blockView.grid.add(element, { column: i, expand: true });
    }
  }

  private static createBlockStartRow(block: Blockly.Block, workspace: WorkspaceView, blockView: BlockView) {
    for (let i = 0; i < 3; i++) {
      // for each collumn add
      let element;
      if (block.previousConnection && i === 1) {
        element = new PrevConnectionView(workspace.scene, block.previousConnection, blockView);
        blockView.ownConnections.push(element);
      } else {
        element = workspace.scene.rexUI.add.roundRectangle(0, 0, 5, 5, 0, blockView.color);
        (element as any).minWidth = 5;
        (element as any).minHeight = 5;
      }
      blockView.grid.add(element, { column: i, align: 'left', expand: true });
    }
  }
}
