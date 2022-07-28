import type GameScene from '../../utils/game.scene';
import GameUIContainer from '../../utils/game.container';

/**
 * A view that overlays the instructor view. It shows whether the player succeeded or failed the level.
 * @class OverlayView
 * @extends GameUIContainer
 */
export default class OverlayView extends GameUIContainer {
  static isFirst = true;

  constructor(scene: GameScene, success = true) {
    super(scene, 0, 0, 500, 500);

    if (OverlayView.isFirst) {
      OverlayView.isFirst = false;
      this.scene.anims.create({
        key: 'final_anim_fail',
        frames: this.scene.anims.generateFrameNumbers('final_anim', { start: 0, end: 40 }),
        frameRate: 25,
        repeat: 0,
      });
      this.scene.anims.create({
        key: 'final_anim_success',
        frames: this.scene.anims.generateFrameNumbers('final_anim', { start: 47, end: 90 }),
        frameRate: 25,
        repeat: 0,
      });
    }
    const overlay = this.scene.add.sprite(0, 250, null).setAlpha(0.5);
    this.addLocal(overlay);
    if (success) {
      overlay.play('final_anim_success');
    } else {
      overlay.play('final_anim_fail');
    }
  }
}
