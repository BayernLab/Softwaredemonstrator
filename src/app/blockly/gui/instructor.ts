import WorkspaceView from './workspace';
import type GameScene from '../../utils/game.scene';
import GameUIContainer from '../../utils/game.container';
import TextBoxContainer from './views/speechbubble';
import CodeView from './code';
import { hideView } from '../../utils/visibility';
import type InstructorViewBase from './instructorview.base';
import OverlayView from './overlay';
import LiveCodeView from './live';
import InstructorDragHandle from './instructor.handle';
import type LevelBase from '../../levels/base';
import { Setting } from '../../utils/settings';
import LiveInfoView from './info';
import { setRotatedPosition } from '../../utils/position';
import { AnimationKey } from '../../utils/animate';
import { colorShadeAsHex } from '../../utils/color';

/**
 * A view that contains the instructor and manages the player view on screen. Thereby, it determines which user views are currently active. It also manages the instructor's speech bubble and level initialization/handling.
 * It also combies all views that are needed to represent the player's view.
 * @class BlocklyInstructor
 * @extends GameUIContainer
 */
export default class BlocklyInstructor extends GameUIContainer {
  dragHandle: InstructorDragHandle;

  workspace: WorkspaceView;

  codeView: CodeView;

  overlay: OverlayView;

  speechBubble: TextBoxContainer;

  liveCodeView: LiveCodeView;

  liveInfoView: LiveInfoView;

  public isInitialized = false;

  public currentView: InstructorViewBase = null;

  isHidden = false;

  private activateCallback: () => void;

  private deactivateCallback: () => void;

  toastActive = false;

  constructor(scene: GameScene, x: number, y: number, color: number, activateCallback: () => void, deactivateCallback: () => void) {
    super(scene, 0, 0);

    this.activateCallback = activateCallback;
    this.deactivateCallback = deactivateCallback;

    this.dragHandle = new InstructorDragHandle(this, x, y, color);
    this.add(this.dragHandle);

    this.speechBubble = TextBoxContainer.create(
      this.scene,
      0,
      0,
      {
        wrapWidth: 300,
        fixedWidth: 300,
        fixedHeight: 125,
      },
      null,
      () => {
        this.enableCurrentView();
      },
    );
    this.add(this.speechBubble);
    hideView(this.scene, this.speechBubble);
  }

  activate() {
    this.dragHandle.previewAnims.play('ThumbsUp', 100, true);
    this.dragHandle.previewAnims.play(AnimationKey.IDLE, 10000);
    this.isInitialized = true;
    this.activateCallback();
  }

  deactivate() {
    this.dragHandle.previewAnims.play(AnimationKey.WAVE, 100, true);
    this.isInitialized = false;
    this.deactivateCallback();
  }

  public initializeLevel(level: LevelBase, codeCallback: (code: string) => void, readyCallback: () => void, notreadyCallback: () => void) {
    if (!level.retried) {
      this.workspace = new WorkspaceView(
        this,
        level.toolboxDefinition,
        (c) => {
          this.liveCodeView?.setCode(c);
          codeCallback(c);
        },
        readyCallback,
        level.maxInstructions,
        level.functionBlock,
      );
      this.addLocal(this.workspace);
      this.workspace.hide();
    }
    this.codeView = new CodeView(this.scene, notreadyCallback);
    this.addLocal(this.codeView);
    this.codeView.hide();

    this.liveCodeView = new LiveCodeView(this.scene, () => this.liveInfoView?.hideContent());
    this.pinLocal(this.liveCodeView);
    if (level.furtherInformationTexts) {
      this.liveInfoView = new LiveInfoView(this.scene, level.furtherInformationTexts, () => this.liveCodeView?.hideContent());
      this.pinLocal(this.liveInfoView);
    }
    this.workspace.updateWorkspace();

    this.currentView = this.workspace;
    this.disableCurrentView();
  }

  showTextBubble(text: string) {
    this.speechBubble.start(text, 25);
  }

  hideTextBubble() {
    this.speechBubble.end();
  }

  showToast(message: string, duration, animationDuration, color?) {
    if (!this.toastActive) {
      this.toastActive = true;
      if (color == null) color = this.scene.getSetting(Setting.baseColorDark);
      const strokeColor = colorShadeAsHex(color, -100);
      const toast = this.scene.rexUI.add.label({
        x: 0,
        y: 0,
        background: this.scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, color).setStrokeStyle(2, strokeColor, 1),
        text: this.scene.addText(0, 0, message, { fontSize: Setting.fontsmall }).setAlign('center'),
        align: 'center',
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
        },
      });
      setRotatedPosition(toast, this.dragHandle.rotation, this.dragHandle.x, this.dragHandle.y, 0, 50);
      toast.setRotation(this.dragHandle.rotation);
      toast.popUp(animationDuration).layout();
      setTimeout(() => {
        toast.destroy();
        this.toastActive = false;
      }, duration);
    }
  }

  public displayCodeView(code: string) {
    if (this.codeView) {
      this.codeView.setCode(code);
      this.codeView.setPosition(this.dragHandle.x, this.dragHandle.y).setAngle(this.dragHandle.angle);
      this.hideCurrentView();
      this.currentView = this.codeView;
      this.showCurrentView();
    }
  }

  public enableCodeViewInput() {
    if (this.codeView) {
      this.codeView.enable();
    }
  }

  public disableCodeViewInput() {
    if (this.codeView) {
      this.codeView.disable();
    }
  }

  startLevel(debug: boolean) {
    this.codeView.notreadyButton.setAlpha(0).setVisible(false);
  }

  public displayOverlay(success: boolean) {
    this.overlay = new OverlayView(this.scene, success);
    this.overlay.setOrigin(this.overlay.originY, 0);
    if (this.currentView != null) this.currentView.pinLocal(this.overlay);
  }

  public displayWorkspace() {
    if (this.workspace) {
      this.workspace.setPosition(this.dragHandle.x, this.dragHandle.y).setAngle(this.dragHandle.angle);
      this.hideCurrentView();
      this.currentView = this.workspace;
      this.showCurrentView();
    }
  }

  public enableWorkspaceInput() {
    if (this.workspace) {
      this.workspace.enable();
    }
  }

  public disableWorkspaceInput() {
    if (this.workspace) {
      this.workspace.disable();
    }
  }

  public highlightCodeLines(lines) {
    this.codeView?.highlightCode(lines);
  }

  highlightCurrentViewElement(elementName: string, active) {
    this.currentView?.highlight(elementName, active);
  }

  addCurrentViewElementClickListener(elementName: string, callback: (element) => void) {
    this.currentView?.addClickListener(elementName, callback);
  }

  public update(time, delta): void {
    this.dragHandle?.update(time, delta);
    if (this.isInitialized && !this.isHidden) {
      if (this.dragHandle.isMoving) {
        this.hideCurrentView();
      } else {
        this.showCurrentView();
      }
    }

    if (this.speechBubble) {
      setRotatedPosition(this.speechBubble, this.dragHandle.rotation, this.dragHandle.x, this.dragHandle.y, -50, -this.dragHandle.height / 2 + 10);
    }
    if (this.liveCodeView) {
      setRotatedPosition(this.liveCodeView, this.dragHandle.rotation, this.dragHandle.x, this.dragHandle.y, 500 + this.scene.getSetting(Setting.padding), 250);
    }
    if (this.liveInfoView) {
      setRotatedPosition(this.liveInfoView, this.dragHandle.rotation, this.dragHandle.x, this.dragHandle.y, 500 + this.scene.getSetting(Setting.padding), 250);
    }
    this.currentView?.setPosition(this.dragHandle.x, this.dragHandle.y).setRotation(this.dragHandle.rotation);
  }

  disableCurrentView() {
    this.isHidden = true;
    this.hideCurrentView();
    this.liveCodeView?.hide();
    this.liveInfoView?.hide();
  }

  enableCurrentView() {
    this.isHidden = false;
    this.showCurrentView();
  }

  disableInput() {
    this.disableWorkspaceInput();
    this.disableCodeViewInput();
  }

  enableInput() {
    this.enableWorkspaceInput();
    this.enableCodeViewInput();
  }

  hideCurrentView() {
    if (this.currentView != null && this.currentView.visible) {
      this.currentView.hide();
      this.liveInfoView?.hideContent(false);
      this.liveCodeView?.hideContent(false);
    }
  }

  showCurrentView() {
    if (!this.isHidden && this.currentView != null && !this.currentView.visible) {
      this.currentView.setPosition(this.dragHandle.x, this.dragHandle.y).setRotation(this.dragHandle.rotation);
      this.currentView.show();
      this.liveCodeView?.show();
      this.liveInfoView?.show();
      this.liveInfoView?.hideContent(false);
      this.liveCodeView?.hideContent(false);
    }
  }

  public reset(retry) {
    if (!retry && this.workspace) {
      this.remove(this.workspace);
      this.workspace.destroy();
    }
    if (this.codeView) {
      this.remove(this.codeView);
      this.codeView.destroy();
    }
    this.overlay = null;
    this.liveCodeView?.destroy();
    this.liveCodeView = null;
    this.liveInfoView?.destroy();
    this.liveInfoView = null;
    this.dragHandle.previewAnims.play(AnimationKey.IDLE, 0, true);
  }

  animate(animationKey, delay = 0, repeat = false) {
    this.dragHandle.previewAnims.play(animationKey, delay, repeat);
  }

  destroy(fromScene?: boolean): void {
    this.isInitialized = false;
    this.reset(false);
    this.disableCurrentView();
    this.dragHandle.destroy();
    super.destroy();
  }
}
