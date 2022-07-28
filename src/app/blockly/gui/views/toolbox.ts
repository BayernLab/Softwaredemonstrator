import type WorkspaceView from '../workspace';
import CategoryView from './category';

import { ToolboxCategory, ToolboxDefinition, ToolboxItem } from '../../model/toolboxDefinition';

import GameUIContainer from '../../../utils/game.container';
import type GameScene from '../../../utils/game.scene';
import { Setting } from '../../../utils/settings';
import { newBlockViewFromProcedureName, newBlockViewFromString } from '../../utils/block';
import { ViewType } from './base';
import type BlockView from './block';

/**
 * A view for the toolbox based on the toolbox definition specified in blockly format.
 * @class Toolbox
 * @extends GameUIContainer
 */
export default class Toolbox extends GameUIContainer {
  activeCategory: string;

  categoryToolboxes: Map<string, ToolboxCategory> = new Map();

  customProcedures: Set<string> = new Set();

  workspace: WorkspaceView;

  scene: GameScene;

  config: ToolboxDefinition;

  private views = [];

  enabled = true;

  constructor(scene: GameScene, x, y, workspace: WorkspaceView, config: ToolboxDefinition) {
    super(scene, x, y, scene.getSetting(Setting.toolboxWidth), scene.getSetting(Setting.instructorHeight));
    this.workspace = workspace;
    this.config = config;
    this.build();
  }

  private build() {
    this.setOrigin(0);
    const backdrop = this.scene.add.image(-3, -3, 'table').setScale(0.6, 1.22);
    backdrop.setOrigin(0);
    this.addLocal(backdrop);
    this.activeCategory = null;
    this.categoryToolboxes.clear();
    this.buildMenu();
  }

  private buildMenu() {
    const padding = this.scene.getSetting(Setting.padding);
    const wantedX = padding;
    let wantedY = this.scene.getSetting(Setting.contentOffsetY) + padding;
    while (this.views.length > 0) {
      const view = this.views.pop();
      view.destroy();
    }
    const contents = this.categoryToolboxes.get(this.activeCategory)?.contents ?? this.config.contents;
    contents.forEach((node: ToolboxCategory | ToolboxItem) => {
      let view;
      if (node.kind === 'block') {
        const item = node as ToolboxItem;
        view = newBlockViewFromString(this.workspace, item.type, wantedX, wantedY);
      } else if (node.kind === 'category') {
        const category = node as ToolboxCategory;
        view = new CategoryView(this, category.name);
        view.setInteractive();
        const tap = this.scene.rexUI.add.tap(view);
        tap.on('tap', () => this.showBlockCategory(category.name), this);
        view.setPosition(wantedX + view.width / 2, wantedY + view.height / 2);
        this.pinLocal(view);
        this.categoryToolboxes.set(category.name, category);
      }
      if (view != null) {
        this.views.push(view);
        wantedY += padding + view.height;
      }
    });
    if (this.activeCategory != null) {
      const backView = this.scene.add.image(padding, this.scene.getSetting(Setting.headerY), 'back_sm').setOrigin(0, 0.5);
      backView.setInteractive();
      const tap = this.scene.rexUI.add.tap(backView);
      tap.on('tap', () => {
        this.hideBlockCategory();
      });
      this.pinLocal(backView);
      this.views.push(backView);
      const title = this.scene.addText(backView.displayWidth + 1.5 * padding, this.scene.getSetting(Setting.headerY), this.activeCategory).setOrigin(0, 0.5);
      this.pinLocal(title);
      this.views.push(title);
    } else {
      const title = this.scene.addText(this.width / 2, this.scene.getSetting(Setting.headerY), 'Toolbox');
      this.pinLocal(title);
      this.views.push(title);
    }

    this.buildDynamicMenu(wantedX, wantedY, padding);
    if (this.enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  /**
   * Create a new block view from the given block view and add it to the toolbox based on the block's type and position.
   * @param blockView Create the new block view from the given block view.
   * @return {void}
   */
  recreateBlockView(blockView: BlockView) {
    this.views.splice(this.views.indexOf(blockView), 1);
    const procedureName = blockView.block.getFieldValue('NAME');
    if (procedureName == null) {
      this.views.push(newBlockViewFromString(this.workspace, blockView.block.type, blockView.initialX, blockView.initialY));
    } else if (this.customProcedures.has(procedureName)) {
      this.views.push(newBlockViewFromProcedureName(this.workspace, procedureName, blockView.initialX, blockView.initialY));
    } else {
      this.hideBlockCategory();
    }
  }

  private buildDynamicMenu(wantedX, wantedY, padding) {
    if (this.categoryToolboxes.get(this.activeCategory)?.custom != null) {
      this.customProcedures = this.workspace.getCustomProcedureNames();

      this.customProcedures.forEach((procedure) => {
        const view: BlockView = newBlockViewFromProcedureName(this.workspace, procedure, wantedX, wantedY);
        wantedY += padding + view.height;
        this.views.push(view);
      });
    }
  }

  /**
   * Show the block category with the given name.
   * @param {string} categoryName The name of the category to show.
   * @return {void}
   */
  showBlockCategory(categoryName: string) {
    if (categoryName === this.activeCategory) {
      return;
    }

    this.activeCategory = categoryName;
    this.buildMenu();
  }

  /**
   * Hide the currently active block category. Show the main toolbox.
   * @return {void}
   */
  hideBlockCategory() {
    if (this.activeCategory != null) {
      this.activeCategory = null;
      if (this.scene) this.buildMenu();
    }
  }

  /**
   * Enable the toolbox and all its containing views.
   * @return {void}
   */
  enable() {
    this.enabled = true;
    this.getChildren()
      .filter((child: CategoryView) => child.viewType === ViewType.Category)
      .forEach((child: CategoryView) => child.setInteractive());
    this.getChildren()
      .filter((child: BlockView) => child.viewType === ViewType.Block)
      .forEach((child: BlockView) => child.panHandlers.forEach((pan) => pan.setEnable(true)));
  }

  /**
   * Disable the toolbox and all its containing views.
   * @return {void}
   */
  disable() {
    this.enabled = false;
    this.getChildren()
      .filter((child: CategoryView) => child.viewType === ViewType.Category)
      .forEach((child: CategoryView) => child.disableInteractive());
    this.getChildren()
      .filter((child: BlockView) => child.viewType === ViewType.Block)
      .forEach((child: BlockView) => child.panHandlers.forEach((pan) => pan.setEnable(false)));
  }
}
