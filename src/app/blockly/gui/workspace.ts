import * as Phaser from 'phaser';
import * as Blockly from 'blockly/core';
import * as BlocklyJavaScript from 'blockly/javascript';
import BlockView from './views/block';
import Toolbox from './views/toolbox';
import { ToolboxDefinition, ToolboxCategory } from '../model/toolboxDefinition';

import ConnectionView, {
  NextConnectionView, OutputConnectionView, PrevConnectionView, StatementConnectionView, ValueConnectionView,
} from './views/connection';
import { ViewType } from './views/base';
import InstructorViewBase from './instructorview.base';
import { newBlockViewFromString } from '../utils/block';
import { Setting } from '../../utils/settings';
import type BlocklyInstructor from './instructor';

/**
 * Represents a workspace view. Includes a Blockly workspace and a toolbox. The workspace UI and toolbox UI are Phaser game objects. Under the hood it uses a blockly workspace for block creation and the code generation.
 * @class WorkspaceView
 * @extends InstructorViewBase
 */
export default class WorkspaceView extends InstructorViewBase {
  title: Phaser.GameObjects.Text;

  instructor: BlocklyInstructor;

  toolboxDefinition: ToolboxDefinition;

  private toolbox: Toolbox;

  private startBlock: BlockView;

  private functionBlock: BlockView;

  private codingArea: Phaser.GameObjects.Rectangle;

  private workspace: Blockly.Workspace;

  private blocks: Map<BlockView, BlockView[]> = new Map();

  private workspaceConnections: ConnectionView[] = [];

  private bin: Phaser.GameObjects.Image;

  private readyButton: Phaser.GameObjects.Image;

  private activeProcedure: BlockView = null;

  private maxInstructions;

  private maxInstructionsText: Phaser.GameObjects.Text;

  constructor(instructor: BlocklyInstructor, toolboxDefinition: ToolboxDefinition, codeCallback: (code: string) => void, readyCallback: () => void, maxInstructions = -1, functionBlockName = null) {
    super(instructor.scene);
    this.instructor = instructor;

    const toolboxWidth = this.scene.getSetting(Setting.toolboxWidth);
    const codingOffset = -this.width / 2 + toolboxWidth;
    let contentOffset = this.scene.getSetting(Setting.contentOffsetY);

    this.codingArea = this.scene.add
      .rectangle(codingOffset, contentOffset, this.width - toolboxWidth, this.height - contentOffset)
      .setAlpha(0)
      .setOrigin(0, 0);
    this.codingArea.name = 'codingArea';
    this.addLocal(this.codingArea);

    this.maxInstructions = maxInstructions;
    this.toolboxDefinition = toolboxDefinition;
    this.initToolbox();
    this.initBlockly(codeCallback);

    if (functionBlockName != null) {
      this.functionBlock = newBlockViewFromString(this, functionBlockName, codingOffset + this.scene.getSetting(Setting.padding), contentOffset + this.scene.getSetting(Setting.padding), false);
      this.functionBlock.panHandlers.forEach((element) => element.shutdown());
      this.addBlockView(this.functionBlock);
      contentOffset += this.functionBlock.displayHeight + this.scene.getSetting(Setting.padding) / 2;
    }

    this.startBlock = newBlockViewFromString(this, 'start', codingOffset + this.scene.getSetting(Setting.padding), contentOffset + this.scene.getSetting(Setting.padding), false);
    this.startBlock.panHandlers.forEach((element) => element.shutdown());
    this.addBlockView(this.startBlock);

    if (functionBlockName != null) {
      this.functionBlock.pinned = this.startBlock;
    }

    this.bin = this.scene.matter.add
      .image(this.width / 2 - this.scene.getSetting(Setting.padding), this.height - this.scene.getSetting(Setting.padding), 'bin_md', null, {
        isSensor: true,
        isStatic: true,
      })
      .setOrigin(1, 1) as Phaser.GameObjects.Image;
    this.bin.name = 'bin';
    this.addLocal(this.bin);

    this.readyButton = this.scene.add.image(-this.width / 2 + this.scene.getSetting(Setting.padding), this.height - this.scene.getSetting(Setting.padding), 'play_md').setOrigin(0, 1);
    this.readyButton.name = 'ready';
    this.addLocal(this.readyButton);
    this.readyButton.setInteractive();
    this.readyButton.on('pointerup', () => {
      this.updateWorkspace();
      readyCallback();
    });

    this.title = this.scene.addText(codingOffset + (this.width / 2 - codingOffset) / 2, this.scene.getSetting(Setting.headerY), 'Programmierung').setOrigin(0.5);
    this.addLocal(this.title);
    if (this.maxInstructions > -1) {
      const instructionsText = this.scene
        .addText(this.width / 2 - this.scene.getSetting(Setting.padding), this.scene.getSetting(Setting.contentOffsetY) + this.scene.getSetting(Setting.padding), `/${this.maxInstructions}`)
        .setOrigin(1, 0);
      this.addLocal(instructionsText);
      this.maxInstructionsText = this.scene
        .addText(
          this.width / 2 - this.scene.getSetting(Setting.padding) - instructionsText.width,
          this.scene.getSetting(Setting.contentOffsetY) + this.scene.getSetting(Setting.padding),
          this.getNumberOfInstructions().toString(),
        )
        .setOrigin(1, 0);
      this.addLocal(this.maxInstructionsText);
    }
  }

  private initToolbox() {
    this.toolbox = new Toolbox(this.scene, -this.width / 2, 0, this, this.toolboxDefinition);
    this.toolbox.name = 'toolbox';
    this.addLocal(this.toolbox);
  }

  /**
   * Returns the toolbox of this workspace.
   * @returns {Toolbox} the toolbox of this workspace.
   */
  getToolbox(): Toolbox {
    return this.toolbox;
  }

  private initBlockly(codeCallback) {
    const div = document.createElement('blocklyDiv');
    this.scene.game.domContainer.appendChild(div).style.display = 'none';
    const config = {
      sounds: false,
      css: false,
      comments: false,
      toolbox: this.toolboxDefinition,
    };

    this.workspace = Blockly.inject(div, config as any);
    this.workspace.addChangeListener((event) => {
      if (event instanceof Blockly.Events.BlockChange && event.name === 'NAME') {
        const blockView = this.getByName(`procedure-${event.oldValue}`, true) as BlockView;
        if (blockView != null) {
          blockView.setName(event.newValue);
        }
      }
      const code = this.getCode();
      codeCallback(code);
    });

    this.blocks.set(null, []);
  }

  /**
   * Manually trigger the change listener of the workspace.
   */
  updateWorkspace() {
    this.workspace.fireChangeListener(new Blockly.Events.Abstract());
  }

  /**
   * Generates a new block of the given type.
   * @param {string} blockType The type of the block to generate.
   * @returns {Blockly.Block} A new block of the given type.
   */
  generateNewBlock(blockType: string): Blockly.Block {
    const block = this.workspace.newBlock(blockType);
    this.workspace.removeBlockById(block.id);
    this.workspace.removeTopBlock(block);
    this.workspace.removeTypedBlock(block);
    return block;
  }

  /**
   * Generates a new block for a custom procedure of the given name.
   * @param {string} blockType The type of the block to generate.
   * @returns {Blockly.Block} A new block of the given procedure.
   */
  generateNewCustomProcedureBlock(name: string): Blockly.Block {
    const block = this.generateNewBlock('custom_procedure');
    block.setFieldValue(name, 'NAME');
    return block;
  }

  /**
   * Gets the names for all custom procedures specified in the blockly workspace.
   * @returns {Set<string>} A set of all custom procedure names.
   */
  getCustomProcedureNames(): Set<string> {
    const procedures = new Set<string>(this.workspace.getBlocksByType(this.getFunctionBlockName(), false).map((x: any) => x.getProcedureDef()[0]));
    procedures.delete('default');
    return procedures;
  }

  /**
   * Gets the function name of the toolbox category.
   * @returns {string} Function name if applicable.
   */
  getFunctionBlockName(): string {
    const customCategory = this.toolboxDefinition.contents.filter((cat: ToolboxCategory) => cat.custom != null);
    if (customCategory.length !== 0 && customCategory[0].contents.length > 0) {
      return customCategory[0].custom;
    }
    return '';
  }

  /**
   * Checks if the given block is contained in the blockly workspace.
   * @params {BlockView | Blockly.Block} block The block to check.
   * @returns {boolean} True if the block is contained in the workspace, false otherwise.
   */
  isInWorkspace(block: BlockView | Blockly.Block): boolean {
    let blockObj: Blockly.Block;
    if (block instanceof BlockView) {
      blockObj = block.block;
    } else {
      blockObj = block;
    }
    return this.workspace.getBlockById(blockObj.id) != null;
  }

  /**
   * Adds a block to the workspace.
   * @param {BlockView} blockView The block to add.
   * @returns {void}
   */
  addBlockView(blockView: BlockView) {
    this.workspace.setBlockById(blockView.block.id, blockView.block);
    this.workspace.addTopBlock(blockView.block);
    this.workspace.addTypedBlock(blockView.block);
    this.updateWorkspace();
    if (!this.blocks.has(this.activeProcedure)) {
      this.blocks.set(this.activeProcedure, []);
    }
    this.blocks.get(this.activeProcedure).push(blockView);
    this.workspaceConnections.push(...(blockView.getAllChildren().filter((x: any) => x.viewType === ViewType.Connection) as ConnectionView[]));
    this.updateMaxInstructions();
  }

  private updateMaxInstructions() {
    if (this.activeProcedure == null && this.maxInstructions > -1) {
      this.maxInstructionsText?.setText(this.getNumberOfInstructions().toString());
    }
  }

  /**
   * gets the number of blocks/instructions in the workspace.
   * @returns {number} number of blocks/instructions in the workspace (excluding the start and function blocks).
   */
  getNumberOfInstructions(): number {
    if (this.blocks.get(this.activeProcedure).length === 0) {
      return 0;
    }
    let offset = 0;
    if (this.startBlock) offset += 1;
    if (this.functionBlock) offset += 1;
    return this.blocks.get(this.activeProcedure).length - offset;
  }

  /**
   * Removes a block from the workspace.
   * @param {BlockView} blockView The block to be removed.
   * @returns {void}
   */
  removeBlockView(blockView: BlockView) {
    const connections = blockView.getAllChildren().filter((x: any) => x.viewType === ViewType.Connection) as ConnectionView[];
    this.workspaceConnections = this.workspaceConnections.filter((connection) => connections.indexOf(connection) === -1);
    try {
      blockView.block.dispose(false);
      if (blockView != null && this.blocks.has(blockView)) {
        this.blocks.delete(blockView);
      } else {
        this.blocks.get(this.activeProcedure)?.splice(this.blocks.get(this.activeProcedure).indexOf(blockView), 1);
      }
    } catch (e) {
      // do nothing here because block was never part of the program
    }
    this.updateMaxInstructions();
  }

  override destroy() {
    this.hide();
    this.workspace?.dispose();
    this.workspace = null;
    try {
      super.destroy();
    } catch (e) {
      // do nothing here because block was never part of the program
    }
  }

  override show() {
    super.show();
    this.toolbox.hideBlockCategory();
  }

  private checkCodingArea(blockView: BlockView): boolean {
    if (Phaser.Geom.Rectangle.Overlaps(this.codingArea.getBounds(), blockView.getBounds())) {
      return true;
    }
    return false;
  }

  /**
   * Checks if the given block is overlapping with the bin (and should be removed).
   * @param {BlockView} blockView The block to check for collision with the bin.
   * @returns {boolean} True if the block is overlapping with the bin, false otherwise.
   */
  checkBin(blockView: BlockView): boolean {
    if (this.scene.matter.overlap(this.bin, [blockView])) {
      this.bin.setTexture('bin_md_active');
      return true;
    }
    this.bin.setTexture('bin_md');
    return false;
  }

  /**
   * Checks if the given connection view is overlapping with another connection view that is free (no active connections) and has a fitting type.
   * @param {ConnectionView} connection The connection view to check for collision with other connection views.
   * @returns {ConnectionView} The connection view that is overlapping with the given connection view, null if no connection view is overlapping.
   */
  checkConnections(connection: ConnectionView) {
    const connectionSnapPadding = 10;
    const connectionBounds = connection.connectionAnchor.getBounds();
    connectionBounds.width += connectionSnapPadding;
    connectionBounds.height += connectionSnapPadding;
    connectionBounds.x -= connectionSnapPadding / 2;
    connectionBounds.y -= connectionSnapPadding / 2;
    let collidingConnection = null;
    // eslint-disable-next-line no-restricted-syntax
    for (const workspaceConnection of this.workspaceConnections) {
      const workspaceConnectionBounds = workspaceConnection.connectionAnchor.getBounds();
      workspaceConnectionBounds.width += connectionSnapPadding;
      workspaceConnectionBounds.height += connectionSnapPadding;
      workspaceConnectionBounds.x -= connectionSnapPadding / 2;
      workspaceConnectionBounds.y -= connectionSnapPadding / 2;
      if (
        collidingConnection == null &&
        !connection.isConnected() &&
        !workspaceConnection.isConnected() &&
        connection.sourceBlockView !== workspaceConnection.sourceBlockView &&
        ((connection instanceof PrevConnectionView && (workspaceConnection instanceof NextConnectionView || workspaceConnection instanceof StatementConnectionView)) ||
          (connection instanceof NextConnectionView && workspaceConnection instanceof PrevConnectionView) ||
          (connection instanceof StatementConnectionView && workspaceConnection instanceof PrevConnectionView) ||
          (connection instanceof OutputConnectionView && workspaceConnection instanceof ValueConnectionView) ||
          (connection instanceof ValueConnectionView && workspaceConnection instanceof OutputConnectionView)) &&
        Phaser.Geom.Rectangle.Overlaps(connectionBounds, workspaceConnectionBounds)
      ) {
        workspaceConnection.highlight(true);
        collidingConnection = workspaceConnection;
      } else {
        workspaceConnection.highlight(false);
      }
    }
    return collidingConnection;
  }

  /**
   * Checks if the given block is in a valid position within the workspace and the workspace is able to position the block there.
   * @param {BlockView} blockView The block to check for valid position within the workspace.
   * @returns {boolean} True if the block is in a valid position, false otherwise.
   */
  isValidBlockPosition(blockView: BlockView): boolean {
    // max blocks exceeded
    if (this.activeProcedure == null && this.maxInstructions > -1 && this.getNumberOfInstructions() >= this.maxInstructions && !this.isInWorkspace(blockView)) {
      this.maxInstructionsText.setColor('red');
      this.instructor.showToast(
        `Es sind maximal ${this.maxInstructions} Blöcke erlaubt.\n Entferne nicht verwendete Blöcke bevor du neue Blöcke hinzufügst.`,
        5000,
        300,
        this.scene.getSetting(Setting.warningColor),
      );
      this.scene.time.delayedCall(1500, () => this.maxInstructionsText.setColor('white'), [], this);
      return false;
    }
    if (this.checkBin(blockView) || !this.checkCodingArea(blockView)) {
      this.scene.time.delayedCall(500, () => this.bin.setTexture('bin_md'), [], this);
      return false;
    }
    return true;
  }

  override enable() {
    this.readyButton.setInteractive();
    this.toolbox.enable();
  }

  override disable() {
    this.readyButton.disableInteractive();
    this.toolbox.disable();
  }

  private getCode(): string {
    let code = '';
    if (this.startBlock) {
      BlocklyJavaScript.init(this.workspace);
      this.workspace.getTopBlocks(true).forEach((block) => {
        try {
          BlocklyJavaScript.blockToCode(block);
          // eslint-disable-next-line no-underscore-dangle
          const name = `%${BlocklyJavaScript.nameDB_.getName(block.getFieldValue('NAME'), 'PROCEDURE')}`;
          // eslint-disable-next-line no-underscore-dangle
          code += `${BlocklyJavaScript.definitions_[name]}\n\n`;
        } catch (err) {
          /* empty */
        }
      });
      // eslint-disable-next-line no-underscore-dangle
      BlocklyJavaScript.nameDB_?.reset();
      code += BlocklyJavaScript.blockToCode(this.startBlock.block);
    }
    return code;
  }
}
