import { FixWidthSizer } from 'phaser3-rex-plugins/templates/ui/ui-components';
import type GameScene from '../../utils/game.scene';
import { Setting } from '../../utils/settings';
import InstructorRightHandViewBase from './instructorview.righthand.base';

/**
 * Representing a view that allows the user to see further information on the task at hand.
 * @class LiveInfoView
 * @extends InstructorRightHandViewBase
 */
export default class LiveInfoView extends InstructorRightHandViewBase {
  private info: [string, Setting][];

  private scrollableSizer: FixWidthSizer;

  private next: Phaser.GameObjects.Image;

  private prev: Phaser.GameObjects.Image;

  constructor(scene: GameScene, info: [string, Setting][], activateCallback) {
    super(scene, activateCallback, 'Informationen', -156, 30);
    this.info = info;
    this.scrollableSizer = this.scene.rexUI.add
      .fixWidthSizer({
        width: 450,
        space: {
          left: 12,
          right: 12,
          top: 3,
          bottom: 3,
          item: 8,
          line: 8,
        },
      })
      .setOrigin(0, 0);
    this.updatePanel();
    this.views.push(this.scrollableSizer);
    this.scrollableSizer.x = -130;
    this.scrollableSizer.y = -170;
    this.addLocal(this.scrollableSizer);
  }

  private updatePanel(page = 0): Phaser.GameObjects.GameObject {
    this.scrollableSizer.rotation = 0;
    this.prev?.destroy();
    this.next?.destroy();
    this.scrollableSizer.clear(true);
    if (page >= this.info.length) {
      return this.updatePanel();
    }
    if (page > 0) {
      // prev button
      this.prev = this.scene.add.image(70, 50 + this.height / 2 - this.scene.getSetting(Setting.padding), 'back_md', null).setOrigin(0.5, 1);
      this.prev.name = 'prev';
      this.addLocal(this.prev);
      this.prev.setInteractive();
      this.prev.on('pointerup', () => {
        this.prev?.destroy();
        this.next?.destroy();
        this.updatePanel(page - 2);
      });
      this.views.push(this.prev);
    }
    if (page < this.info.length - 2) {
      // next button
      this.next = this.scene.add.image(130, 50 + this.height / 2 - this.scene.getSetting(Setting.padding), 'next_md', null).setOrigin(0.5, 1);
      this.next.name = 'next';
      this.addLocal(this.next);
      this.next.setInteractive();
      this.next.on('pointerup', () => {
        this.next?.destroy();
        this.prev?.destroy();
        this.updatePanel(page + 2);
      });
      this.views.push(this.next);
    }
    this.info.slice(page, page + 2).forEach(([text, fontSize]) => {
      const lines = text.split('\n');
      for (let li = 0, lcnt = lines.length; li < lcnt; li++) {
        const words = lines[li].split(' ');
        for (let wi = 0, wcnt = words.length; wi < wcnt; wi++) {
          this.scrollableSizer.add(this.scene.addText(0, 0, words[wi], { fontFamily: Setting.fontfamilyCode, fontSize }).setOrigin(0, 0.5));
        }
        if (li < lcnt - 1) {
          this.scrollableSizer.addNewLine();
        }
      }
      this.scrollableSizer.addNewLine();
      this.scrollableSizer.addNewLine();
    });

    this.scrollableSizer.layout();
    this.scrollableSizer.rotation = this.rotation;
    return this.scrollableSizer;
  }

  override getIcon(active) {
    if (active) {
      return 'info_sm_active';
    }
    return 'info_sm';
  }

  override showContent(animate?: boolean): void {
    super.showContent(animate);
    this.updatePanel();
  }
}
