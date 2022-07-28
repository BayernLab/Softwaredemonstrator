import type Player from '../player';
import type Tutorial from './tutorial';

/**
 * Represents a step in a tutorial.
 * @class TutorialStep
 */
export default class TutorialStep {
  /**
   * Whether the step has been completed for each player.
   */
  done: boolean[];

  /**
   * The function to call when the step is started in order to intizialize the step.
   */
  start: (level: Tutorial) => void;

  // default implementation
  // eslint-disable-next-line class-methods-use-this
  /**
   * The function to call to check if the step has been completed for a given player.
   */
  succeedStepCheck: (player: Player) => boolean = () => false;

  // default implementation
  // eslint-disable-next-line class-methods-use-this
  /**
   * The function to call when the step is completed by all players.
   */
  suceedStepCallback: (level: Tutorial) => void = () => {};

  /**
   * The custom views for the step.
   */
  customViews = [];

  /**
   * Creates a new `TutorialStep` instance from a configuration object.
   *
   * @param {Partial<TutorialStep>} partial - The partial properties to initialize the step with.
   * @param {number} playerCount - The number of players in the tutorial.
   */
  constructor(partial: Partial<TutorialStep>, playerCount: number) {
    Object.assign(this, partial);
    this.succeedStepCheck = partial.succeedStepCheck ?? this.succeedStepCheck;
    this.suceedStepCallback = partial.suceedStepCallback ?? this.suceedStepCallback;
    this.done = Array.from(Array(playerCount), () => false);
  }

  /**
   * Determines whether the step has been completed for all players.
   *
   * @returns {boolean} `true` if the step has been completed for all players, `false` otherwise.
   */
  allDone(): boolean {
    return this.done.every((x) => x === true);
  }
}
