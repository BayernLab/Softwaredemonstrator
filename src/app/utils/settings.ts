/**
 * An enumeration of all possible setting keys.
 *
 * @enum {string}
 */
export enum Setting {
  padding = 'padding',
  dropZones = 'dropZones',
  highlightColor = 'highlightColor',
  baseColor = 'baseColor',
  fontColor = 'fontColor',
  backgroundColor = 'backgroundColor',
  playerColors = 'playerColors',
  fonttitle = 'fonttitle',
  fontlarge = 'fontlarge',
  fontnormal = 'fontnormal',
  fontsmall = 'fontsmall',
  fontfamilyDefault = 'fontfamily.default',
  fontfamilyCode = 'fontfamily.code',
  miniMaps = 'miniMaps',
  blockPadding = 'block.padding',
  blockUnitSmall = 'block.unitsmall',
  blockUnitLarge = 'block.unitlarge',
  fontblock = 'block.fontsize',
  blockFontColor = 'block.fontcolor',
  baseColorLight = 'baseColorLight',
  baseColorDark = 'baseColorDark',
  paddingsmall = 'paddingsmall',
  blockBorderThickness = 'blockBorder',
  bodyColor = 'bodyColor',
  headerY = 'headerYPosition',
  toolboxWidth = 'toolboxWidth',
  contentOffsetY = 'contentOffsetY',
  instructorWidth = 'instructorWidth',
  instructorHeight = 'instructorHeight',
  infiniteLoopTime = 'infiniteLoopTime',
  warningColor = 'warningColor',
}

const innerSettings: Map<Setting, any> = new Map<Setting, any>([
  [Setting.backgroundColor, 0x1c1624],
  [Setting.baseColor, 0x337ab7],
  [Setting.baseColorDark, 0x205079],
  [Setting.baseColorLight, 0x00ffff],
  [Setting.highlightColor, 0xffff00],
  [Setting.warningColor, 0xd22b2b],
  [Setting.fontColor, 0xffffff],
  [Setting.padding, 16],
  [Setting.paddingsmall, 10],
  [Setting.fonttitle, 84],
  [Setting.fontlarge, 40],
  [Setting.fontnormal, 20],
  [Setting.fontsmall, 16],
  [Setting.fontblock, 13],
  [Setting.blockPadding, 3],
  [Setting.blockUnitSmall, 5],
  [Setting.blockUnitLarge, 10],
  [Setting.blockBorderThickness, 1],
  [Setting.blockFontColor, 0xffffff],
  [Setting.fontfamilyDefault, 'hurmit'],
  [Setting.fontfamilyCode, 'code'],
  // workflow
  [Setting.instructorWidth, 750],
  [Setting.instructorHeight, 600],
  [Setting.headerY, 30],
  [Setting.toolboxWidth, 230],
  [Setting.contentOffsetY, 60],
  // game
  [Setting.infiniteLoopTime, 15000],
]);
const defaultSettings: Map<Setting, any> = new Map<Setting, any>([
  [Setting.dropZones, 'center'], // 'bottom'
  [Setting.miniMaps, 'corner'], // 'center', 'none'
  [Setting.playerColors, [16711769, 4783872, 41471, 16760064]],
  [Setting.bodyColor, 0xc3c3c3],
]);

/**
 * A class representing and holding the current settings for a game.
 * @class GameSettings
 */
export default class GameSettings {
  settings: Map<Setting, any>;

  private static readonly identifier = 'gameSettings';

  constructor() {
    this.settings = GameSettings.load();
  }

  /**
   * Gets the value of a setting.
   *
   * @param {Setting} key - The setting to get the value of.
   * @returns {any} The value of the specified setting.
   */
  get(key: Setting) {
    return this.settings.get(key);
  }

  /**
   * Sets the value of a setting.
   *
   * @param {Setting} key - The setting to set the value of.
   * @param {any} value - The value to set the setting to.
   */
  set(key: Setting, value: any) {
    if (innerSettings.has(key)) {
      throw new Error('Cannot dynamically set inner settings');
    }
    this.settings.set(key, value);
    localStorage.setItem(GameSettings.identifier, JSON.stringify(this.settings, GameSettings.replacer));
  }

  /**
   * Resets the settings to their default values.
   */
  reset() {
    localStorage.removeItem(GameSettings.identifier);
    this.settings = GameSettings.load();
  }

  private static load(): Map<Setting, any> {
    let settings: Map<Setting, any> = new Map(JSON.parse(localStorage.getItem(GameSettings.identifier), GameSettings.reviver) ?? []);
    if (settings === null || settings.size <= 0) {
      settings = defaultSettings;
    }
    settings = new Map([...settings, ...innerSettings]);
    localStorage.setItem(GameSettings.identifier, JSON.stringify(settings, GameSettings.replacer));
    return settings;
  }

  private static replacer(key, value) {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    }
    return value;
  }

  private static reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }
}
