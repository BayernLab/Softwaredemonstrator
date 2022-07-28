/**
 * An enumeration of all possible command states.
 *
 * @enum {number}
 */
export enum State {
  NOT_ACTIVE = 999,
  NOT_STARTED = 0,
  READY = 1,
  WORKING = 2,
  SUCCESS = 3,
  FAILURE = 4,
}

export default State;
