import { getColorOfBlock } from '../../utils/color';
import type BlockView from '../gui/views/block';
import BlockViewFactory from '../gui/views/block.factory';
import type WorkspaceView from '../gui/workspace';

/**
 * Creates a new block view from a Blockly block type string.
 * @param {WorkspaceView} workspace The workspace view the block should belong to.
 * @param {string} blockType The type of the block.
 * @param {number} [x=0] The x coordinate of the block.
 * @param {number} [y=0] The y coordinate of the block.
 * @param {boolean} [inToolbox=true] Whether the block is in the toolbox.
 * @returns {BlockView} The created block view.
 */
export const newBlockViewFromString = (workspace: WorkspaceView, blockType: string, x = 0, y = 0, inToolbox = true): BlockView => {
  const block = workspace.generateNewBlock(blockType);
  const color = getColorOfBlock(blockType, workspace.toolboxDefinition);
  const view: BlockView = BlockViewFactory.createView(workspace, block, x, y, color, inToolbox);
  return view;
};

/**
 * Creates a new block view from a custom procedure name.
 * @param {WorkspaceView} workspace The workspace view the block should belong to.
 * @param {string} procedureName The name of the custom procedure.
 * @param {number} [x=0] The x coordinate of the block.
 * @param {number} [y=0] The y coordinate of the block.
 * @param {boolean} [inToolbox=true] Whether the block is in the toolbox.
 * @returns {BlockView} The created block view.
 */
export const newBlockViewFromProcedureName = (workspace: WorkspaceView, procedureName: string, x = 0, y = 0, inToolbox = true): BlockView => {
  const block = workspace.generateNewCustomProcedureBlock(procedureName);
  const color = getColorOfBlock(workspace.getFunctionBlockName(), workspace.toolboxDefinition);
  const view: BlockView = BlockViewFactory.createView(workspace, block, x, y, color, inToolbox);
  return view;
};
