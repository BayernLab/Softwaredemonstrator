import { Setting } from '../../utils/settings';
import { hideView } from '../../utils/visibility';
import InstructorRightHandViewBase from './instructorview.righthand.base';

/**
 * Representing a view that allows the user to see live code generated from the blocks.
 * @class LiveCodeView
 * @extends InstructorRightHandViewBase
 */
export default class LiveCodeView extends InstructorRightHandViewBase {
  private readonly wantedX: number;

  private readonly wantedY: any;

  constructor(scene, activateCallback) {
    super(scene, activateCallback, 'Vorschau', -174, -14);
    this.wantedX = this.offsetX - this.width / 2 + 3 * this.padding;
    this.wantedY = this.offsetY - this.height / 2 + 80 + this.padding;
  }

  /**
   * Sets the code that should be displayed by this view.
   * @param {string} code - The code to be displayed by this view.
   * @returns {void}
   */
  setCode(code: string) {
    while (this.views.length > 0) {
      this.views.pop().destroy();
    }
    let currentWantedY = this.wantedY;
    code.split('\n').forEach((line) => {
      const text = this.scene.addText(this.wantedX, currentWantedY, line, { fontFamily: Setting.fontfamilyCode, fontSize: Setting.fontsmall }).setOrigin(0, 0.5);
      this.views.push(text);
      this.addLocal(text);
      if (!this.contentVisible) hideView(this.scene, text);

      if (text != null) {
        currentWantedY += this.padding + text.height;
      }
    });
  }

  override getIcon(active) {
    if (active) {
      return 'code_sm_active';
    }
    return 'code_sm';
  }
}
