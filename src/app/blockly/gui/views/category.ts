import { Sizer } from 'phaser3-rex-plugins/templates/ui/ui-components';
import { getColorOfCategory } from '../../../utils/color';
import type GameScene from '../../../utils/game.scene';
import { Setting } from '../../../utils/settings';
import { ViewType } from './base';
import type Toolbox from './toolbox';

/**
 * The view for categories in the toolbox.
 * @class CategoryView
 * @extends Sizer
 */
export default class CategoryView extends Sizer {
  scene: GameScene;

  category: string;

  toolbox: Toolbox;

  viewType: ViewType = ViewType.Category;

  constructor(toolbox: Toolbox, name: string) {
    super(toolbox.scene, { orientation: 'x' });
    this.toolbox = toolbox;
    this.category = name;
    this.name = `category-${name}`;
    this.addBackground(this.scene.add.rectangle(0, 0, 1, 1, this.scene.getSetting(Setting.backgroundColor)));
    this.add(this.scene.add.rectangle(0, 0, 10, 30, getColorOfCategory(name)));
    const text = this.scene.addText(0, 0, name, {
      fontSize: Setting.fontblock,
      fontColor: Setting.blockFontColor,
    });
    this.add(text, { align: 'left', padding: { left: 5, right: 5 } });
    this.add(this.scene.add.rectangle(0, 0, 1, 1, this.scene.getSetting(Setting.backgroundColor)), { proportion: 1, expand: true });
    this.setMinSize(150, 0);

    this.scene.add.existing(this);
    this.layout();
  }
}
