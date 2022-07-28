import { ToolboxCategory, ToolboxDefinition, ToolboxItem } from '../blockly/model/toolboxDefinition';

/**
 * Parses a color from a number into a hexadecimal string.
 *
 * @param {number} color - The color to parse, as a number.
 * @returns {string} The parsed color, as a hexadecimal string.
 */
export const parseColor = (color: number): string => {
  // eslint-disable-next-line no-bitwise
  let parsed = `00000${(color | 0).toString(16)}`;
  parsed = `#${parsed.substring(parsed.length - 6)}`;
  return parsed;
};

/**
 * Converts a color from RGB to HSL format.
 *
 * @param {number} color - The color to convert, as a number.
 * @returns {(number, number, number)} The converted color, as an array of HSL values.
 */
export const rgbToHsl = (color: number): [number, number, number] => {
  const colorString = parseColor(color);
  const r: number = parseInt(colorString.substring(1, 3), 16) / 255;
  const g: number = parseInt(colorString.substring(3, 5), 16) / 255;
  const b: number = parseInt(colorString.substring(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number = (max + min) / 2;
  let s: number;
  const l: number = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return [h, s, l];
};

const calculateColorShade = (col: string | number, amount): [string, string, string] => {
  let colorString: string;
  if (typeof col === 'string') {
    colorString = col.replace(/^#/, '');
  } else {
    colorString = col.toString(16);
  }
  if (colorString.length === 3) colorString = colorString[0] + colorString[0] + colorString[1] + colorString[1] + colorString[2] + colorString[2];

  let [r, g, b] = colorString.match(/.{2}/g);
  const [rn, gn, bn] = [parseInt(r, 16) + amount, parseInt(g, 16) + amount, parseInt(b, 16) + amount];

  r = Math.max(Math.min(255, rn), 0).toString(16);
  g = Math.max(Math.min(255, gn), 0).toString(16);
  b = Math.max(Math.min(255, bn), 0).toString(16);

  const rr = (r.length < 2 ? '0' : '') + r;
  const gg = (g.length < 2 ? '0' : '') + g;
  const bb = (b.length < 2 ? '0' : '') + b;
  return [rr, gg, bb];
};

/**
 * Calculates the shade of a color, with the given intensity.
 *
 * @param {string|number} color - The color to shade, as a hexadecimal string or a number.
 * @param {number} intensity - The intensity of the shade.
 * @returns {string} The shaded color, as a hexadecimal string.
 */
export const colorShade = (color: string | number, intensity) => {
  const [rr, gg, bb] = calculateColorShade(color, intensity);
  return `#${rr}${gg}${bb}`;
};

/**
 * Calculates the shade of a color, with the given intensity.
 *
 * @param {string|number} color - The color to shade, as a hexadecimal string or a number.
 * @param {number} intensity - The intensity of the shade.
 * @returns {number} The shaded color, as a hexadecimal number.
 */
export const colorShadeAsHex = (col: string | number, amount) => {
  const [rr, gg, bb] = calculateColorShade(col, amount);
  return Number.parseInt(`0x${rr}${gg}${bb}`, 16);
};

const toolboxColorMap = new Map<string, number>([
  ['Bewegungen', 0xe77577],
  ['Bedingungen', 0x6c88c4],
  ['Verzweigungen', 0x00b0ba],
  ['Schleifen', 0x4dd091],
  ['Funktionen', 0x74737a],
  ['Variablen', 0x74737a],
]);

const getParentCategoryName = (blockType: string, config: ToolboxDefinition): string => {
  const category: ToolboxCategory = config.contents.find((node: ToolboxCategory) => node.contents.some((content: ToolboxItem) => content.kind === 'block' && content.type === blockType));
  return category?.name;
};

/**
 * Gets the color of a category.
 *
 * @param {string} name - The name of the category.
 * @returns {number} The color of the category, as a number.
 */
export const getColorOfCategory = (name: string) => toolboxColorMap.get(name) ?? 0x232753;

/**
 * Gets the color of a block, based on its category.
 *
 * @param {string} viewType - The type of the block.
 * @param {ToolboxDefinition} config - The configuration of the toolbox.
 * @returns {number} The color of the block, as a number.
 */
export const getColorOfBlock = (viewType: string, config: ToolboxDefinition): number => {
  const category = getParentCategoryName(viewType, config);
  return getColorOfCategory(category);
};
