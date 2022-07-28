import { Setting } from './settings';

/**
 * Represents a set of style options for text.
 * @class TextStyle
 */
export default class TextStyle {
  /**
   * The font family to use.
   *
   * @type {Setting}
   */
  fontFamily: Setting = Setting.fontfamilyDefault;

  /**
   * The font size to use.
   *
   * @type {Setting}
   */
  fontSize: Setting = Setting.fontnormal;

  /**
   * The font color to use.
   *
   * @type {Setting}
   */
  fontColor: Setting = Setting.fontColor;

  /**
   * Creates a new `TextStyle` instance based on any partial style configuration.
   *
   * @param {Partial<TextStyle>} style - The initial style options for the instance.
   */
  constructor(style: Partial<TextStyle>) {
    Object.assign(this, style);
  }
}
