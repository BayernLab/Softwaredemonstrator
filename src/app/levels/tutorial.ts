import type GameScene from '../utils/game.scene';
import type Player from '../player';
import LevelBase from './base';
import TutorialStep from './tutorial.step';

/**
 * Represents a special type of level containing a tutorial. The tutorial has more descriptive elements and is played guided by tutorial steps (``./tutorial.step.ts``).
 * @class Tutorial
 * @extends LevelBase
 */
export default class Tutorial extends LevelBase {
  steps: Partial<TutorialStep>[];

  currentStepIndex: number;

  currentStep: TutorialStep;

  constructor(scene: GameScene, partial: Partial<Tutorial>, players: Player[], redoCallback?, nextCallback?, backCallback?) {
    super(scene, partial, players, false, redoCallback, nextCallback, backCallback);
    this.createMinimaps();
    this.createResetCamera();
    this.levelMenuButton.create();
    this.startStep();
  }

  startStep(index = 0) {
    const step = this.steps[index];
    this.currentStepIndex = index;
    this.currentStep = new TutorialStep(step, this.players.length);
    this.currentStep.start(this);
  }

  update(time, delta) {
    super.update(time, delta);
    if (this.currentStep != null && !this.ended) {
      this.currentStep.done = this.players.map((player, index) => this.currentStep.succeedStepCheck(player) || this.currentStep.done[index]);
      if (this.currentStep.allDone()) {
        this.currentStep.suceedStepCallback(this);
        if (this.currentStepIndex === this.steps.length - 1) {
          // last step
          this.currentStep = null;
          this.end();
        } else {
          this.startStep(this.currentStepIndex + 1);
        }
      } else {
        this.players.forEach((x: Player, i) => {
          if (this.currentStep.done[i] === true && !this.currentStep.done.every((done) => done === true)) {
            x.showToast('Warte auf die anderen Spieler...');
          }
        });
      }
    }
  }

  async destroy(callback) {
    while (this.currentStep && this.currentStep.customViews.length > 0) {
      this.currentStep.customViews.pop().destroy();
    }
    await super.destroy(callback);
  }
}
