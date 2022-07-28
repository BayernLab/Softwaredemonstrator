import * as Blockly from 'blockly';
import { rotatePoint } from '../../utils/position';
import type BlockView from '../gui/views/block';
import type ConnectionView from '../gui/views/connection';
import {
  NextConnectionView, PrevConnectionView, StatementConnectionView, ValueConnectionView,
} from '../gui/views/connection';

const replaceBody = (blockView: BlockView) => {
  const newBody = blockView.scene.matter.bodies.rectangle(blockView.x, blockView.y, blockView.width, blockView.height, {
    isStatic: false,
    isSensor: true,
  });
  blockView.scene.matter.world.remove(blockView.body, false);
  (blockView as any).setExistingBody(newBody);
};

const findAllConsecutiveBranchChildren = (parent: BlockView): BlockView[] => {
  const nextChildren = parent.ownConnections.filter((x) => x.connectedWith != null && x instanceof NextConnectionView).map((x) => x.connectedWith.sourceBlockView);
  nextChildren.forEach((x) => nextChildren.push(...findAllConsecutiveBranchChildren(x)));
  return nextChildren;
};

const findConnection = (parent: BlockView, block: BlockView): ConnectionView => parent.ownConnections.filter((x) => x.connectedWith != null && x.connectedWith.sourceBlockView === block)[0];

const findAllConsecutiveChildren = (parent: BlockView): BlockView[] => {
  const nextChildren = parent.ownConnections
    .filter((x) => x.connectedWith != null && (x instanceof NextConnectionView || x instanceof StatementConnectionView || x instanceof ValueConnectionView))
    .map((x) => x.connectedWith.sourceBlockView);
  nextChildren.forEach((x) => nextChildren.push(...findAllConsecutiveBranchChildren(x)));
  return nextChildren;
};

const updateBlockSize = (superiorConnection: ConnectionView, blockId, height) => {
  if (superiorConnection == null) {
    return;
  }

  const blockView = superiorConnection.sourceBlockView;

  const { rotation } = blockView;
  blockView.setRotation(0);
  blockView.grid.setRotation(0);

  const element = superiorConnection.getByName(blockId) as Phaser.GameObjects.Rectangle;
  if (element != null) {
    element.setSize(element.width, height);
    blockView.grid.layout();
    blockView.setSize(blockView.grid.width, blockView.grid.height);
    replaceBody(blockView);
  }

  if (blockView.parent != null) {
    blockView.ownConnections
      .filter((x) => x !== superiorConnection && !x.connection.isSuperior())
      .forEach((x) => {
        updateBlockSize(x.connectedWith, blockId, height);
      });
  }

  blockView.setRotation(rotation);
  blockView.grid.setRotation(rotation);
  blockView.addOutline();
};

const addBlockSize = (superiorConnection: ConnectionView, blockId, blockHeight, padding) => {
  if (superiorConnection == null) {
    return;
  }

  const blockView = superiorConnection.sourceBlockView;
  let rectangle;
  const { rotation } = blockView;
  blockView.setRotation(0);
  blockView.grid.setRotation(0);
  if (superiorConnection instanceof StatementConnectionView) {
    rectangle = superiorConnection.scene.rexUI.add.roundRectangle(0, 0, 1, blockHeight, 0);
  } else if (superiorConnection instanceof ValueConnectionView) {
    const height = blockHeight - superiorConnection.sourceInputView.height;
    rectangle = superiorConnection.scene.add.rectangle(0, 0, padding, height);
  }

  if (rectangle != null) {
    rectangle.name = blockId;
    superiorConnection.add(rectangle);
    blockView.grid.layout();
    blockView.setSize(blockView.grid.width, blockView.grid.height);
    replaceBody(blockView);
  }

  if (blockView.parent != null && superiorConnection instanceof StatementConnectionView) {
    // size of child has changed, so update parent size as well
    updateBlockSize(findConnection(blockView.parent as BlockView, blockView), blockView.uid, blockView.height);
  }
  if (blockView.parent != null && superiorConnection instanceof NextConnectionView) {
    blockView.ownConnections
      .filter((x) => x !== superiorConnection && x instanceof PrevConnectionView)
      .forEach((x) => {
        addBlockSize(x.connectedWith, blockId, blockHeight, padding);
      });
  }

  blockView.setRotation(rotation);
  blockView.grid.setRotation(rotation);
  blockView.addOutline();
};

const removeBlockSize = (superiorConnection: ConnectionView, blockId) => {
  if (superiorConnection == null) {
    return;
  }

  const blockView = superiorConnection.sourceBlockView;
  const { rotation } = blockView;
  blockView.setRotation(0);
  blockView.grid.setRotation(0);

  const element = superiorConnection.getByName(blockId) as Phaser.GameObjects.Rectangle;
  if (element != null) {
    superiorConnection.remove(element, true);
    blockView.grid.layout();
    blockView.setSize(blockView.grid.width, blockView.grid.height);
    replaceBody(blockView);
  }

  if (blockView.parent != null && superiorConnection instanceof StatementConnectionView) {
    // size of child has changed, so update parent size as well
    updateBlockSize(findConnection(blockView.parent as BlockView, blockView), blockView.uid, blockView.height);
  }
  if (blockView.parent != null && superiorConnection instanceof NextConnectionView) {
    blockView.ownConnections
      .filter((x) => x !== superiorConnection && x instanceof PrevConnectionView)
      .forEach((x) => {
        removeBlockSize(x.connectedWith, blockId);
      });
  }

  blockView.setRotation(rotation);
  blockView.grid.setRotation(rotation);
  blockView.addOutline();
};

/**
 * Connects two block views and aligns them accordingly (position, size, etc.). The child connection will be attached to the superior connection.
 * @param {ConnectionView} superiorConnection - The connection to be connected with the child connection.
 * @param {ConnectionView} childConnection - The connection to be connected with the superior connection.
 * @param {number} padding - The padding between the two blocks.
 * @returns {void}
 */
export const connect = (superiorConnection: ConnectionView, childConnection: ConnectionView, padding: number) => {
  // attach to closest connection
  if (superiorConnection.connection.connect(childConnection.connection)) {
    const topMostParent = superiorConnection.sourceBlockView.getTopmostParent();
    const oldHeight = topMostParent.displayHeight;
    superiorConnection.sourceBlockView.addCompositeChild(childConnection.sourceBlockView);
    superiorConnection.connectedWith = childConnection;
    childConnection.connectedWith = superiorConnection;
    addBlockSize(superiorConnection, childConnection.sourceBlockView.uid, childConnection.sourceBlockView.height, padding);

    // add also the block sizes from superior blocks that are children of the connected block
    const compositeChildren = findAllConsecutiveBranchChildren(childConnection.sourceBlockView);
    compositeChildren.forEach((child) => addBlockSize(superiorConnection, child.uid, child.height, padding));

    // goto last child and layout all parents from there
    superiorConnection.sourceBlockView.layoutAll();

    childConnection.sourceBlockView.ownConnections.forEach((x) => x.highlight(false));
    superiorConnection.sourceBlockView.ownConnections.forEach((x) => x.highlight(false));

    const rotateOffset = rotatePoint(0, (topMostParent.displayHeight - oldHeight) / 2, topMostParent.rotation);
    topMostParent.move(rotateOffset.x, rotateOffset.y);
  }
};

/**
 * Disconnects a block view from its parent and aligns the parent accordingly (size, position). The child connection will be detached from the superior connection.
 * @param {BlockView} block - The block view to be disconnected.
 * @returns {void}
 */
export const disconnect = (block: BlockView) => {
  // attach to closest connection
  if (block.parent != null) {
    const superiorConnection = findConnection(block.parent as BlockView, block);
    const topMostParent = superiorConnection.sourceBlockView.getTopmostParent();
    const oldHeight = topMostParent.displayHeight;
    const childConnection = superiorConnection.connectedWith;
    childConnection.connectedWith = null;
    superiorConnection.connectedWith = null;
    block.parent.removeCompositeChild(block);
    block.block.unplug();
    removeBlockSize(superiorConnection, childConnection.sourceBlockView.uid);

    // remove also the block sizes from superior blocks that are children of the removed block
    const compositeChildren = findAllConsecutiveChildren(childConnection.sourceBlockView);
    compositeChildren.forEach((child) => removeBlockSize(superiorConnection, child.uid));

    // goto last child and layout all parents from there
    superiorConnection.sourceBlockView.layoutAll();

    const rotateOffset = rotatePoint(0, (topMostParent.displayHeight - oldHeight) / 2, topMostParent.rotation);
    topMostParent.move(rotateOffset.x, rotateOffset.y);
  }
};

/**
 * Lays out two connected blocks based on their connection status (aligns block view relative to its parent).
 * @param {ConnectionView} superiorConnection - The superior connection of the superior block view.
 * @param {ConnectionView} childConnection - The child connection of the cild block view.
 * @param {number} padding - The padding between the two blocks.
 * @returns {void}
 */
export const layout = (superiorConnection: ConnectionView, childConnection: ConnectionView, padding: number) => {
  if (superiorConnection == null || childConnection == null) {
    return;
  }

  const childBlock = childConnection.sourceBlockView;
  let widthOffset = 0;
  let heightOffset = 0;

  if (
    superiorConnection.connectionType === Blockly.connectionTypes.NEXT_STATEMENT &&
    superiorConnection.inputType == null &&
    childConnection.connectionType === Blockly.connectionTypes.PREVIOUS_STATEMENT
  ) {
    // next to previous
    heightOffset = padding + 2;
  } else if (
    superiorConnection.connectionType === Blockly.connectionTypes.NEXT_STATEMENT &&
    superiorConnection.inputType === Blockly.inputTypes.STATEMENT &&
    childConnection.connectionType === Blockly.connectionTypes.PREVIOUS_STATEMENT
  ) {
    // statement to previous
    widthOffset = padding + 2;
    heightOffset = padding + 2;
  } else if (
    superiorConnection.connectionType === Blockly.connectionTypes.INPUT_VALUE &&
    superiorConnection.inputType === Blockly.inputTypes.VALUE &&
    childConnection.connectionType === Blockly.connectionTypes.OUTPUT_VALUE
  ) {
    // value to output
    widthOffset = 2;
  }

  if ((childBlock.angle + 360) % 360 !== 0) {
    // adjust all offsets by rotation
    const offset = rotatePoint(widthOffset, heightOffset, childBlock.rotation);
    widthOffset = offset.x;
    heightOffset = offset.y;
  }

  const superiorBounds = superiorConnection.getTopLeft();
  const childBounds = childConnection.getTopLeft();
  const fromLeft = childBounds.x <= superiorBounds.x;
  const fromUp = childBounds.y <= superiorBounds.y;
  const x = Math.abs(childBounds.x - superiorBounds.x);
  const y = Math.abs(childBounds.y - superiorBounds.y);
  const dx = (fromLeft ? x : -x) + widthOffset;
  const dy = (fromUp ? y : -y) + heightOffset;

  childBlock.move(dx, dy);
};
