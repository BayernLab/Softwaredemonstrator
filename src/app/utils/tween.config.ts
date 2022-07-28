/**
 * The configuration object for a tween manager.
 * @class TweenManagerConfig
 */
export default class TweenManagerConfig {
  /**
   * The number of times to repeat the tween. A value of -1 indicates that the tween should repeat indefinitely.
   *
   * @type {number}
   */
  repeat = -1;

  /**
   * The easing function to use for the tween.
   *
   * @type {string}
   */
  ease = 'Linear';

  /**
   * The overall duration of the tween, including any pause duration.
   *
   * @type {number}
   */
  overallDuration = 1500;

  /**
   * The duration of the pause between each repeat of the tween.
   *
   * @type {number}
   */
  pauseDuration = 500;

  /**
   * A callback function to be called when the tween ends.
   *
   * @type {Function}
   */
  endCallback: () => void = null;
}
