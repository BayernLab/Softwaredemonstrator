import { State } from './state';

/**
 * A base class for all commands.
 * @class Command
 */
export default class Command {
  /**
   * The state of the command.
   */
  state: State;

  /**
   * The function to be excuted when the command is started.
   */
  func: any;

  constructor(func) {
    this.state = State.NOT_STARTED;
    this.func = func;
  }

  /**
   * Begin the command's work by executing the command function.
   *
   * @returns the result of the command function.
   */
  begin() {
    this.state = State.WORKING;
    return this.func();
  }

  /**
   * Whether the command has started working.
   *
   * @returns {boolean}
   */
  isStarted() {
    return this.state !== State.NOT_STARTED;
  }

  /**
   * Whether the command has succeeded or failed, and is finished with its work.
   *
   * @returns {boolean}
   */
  isFinished() {
    return this.isSucceeded() || this.isFailed();
  }

  /**
   * Whether the command has finished with its work and reported success.
   *
   * @returns {boolean}
   */
  isSucceeded() {
    return this.state === State.SUCCESS;
  }

  /**
   * Whether the command has finished with its work and reported failure.
   *
   * @returns {boolean}
   */
  isFailed() {
    return this.state === State.FAILURE;
  }

  /**
   * Sets the command state to the success state.
   */
  succeeded() {
    this.state = State.SUCCESS;
  }

  /**
   * Sets the command state to the failed state.
   */
  failed() {
    this.state = State.FAILURE;
  }
}
