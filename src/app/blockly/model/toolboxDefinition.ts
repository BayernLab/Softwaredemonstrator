/* eslint-disable max-classes-per-file */

/**
 * A ToolboxDefinition describes the contents of a toolbox.
 * @class ToolboxDefinition
 */
export class ToolboxDefinition {
  /**
   * The categories in the toolbox.
   */
  contents: ToolboxCategory[];
}

/**
 * A ToolboxCategory represents a category in a toolbox.
 * @class ToolboxCategory
 */
export class ToolboxCategory {
  /**
   * The kind of the category.
   */
  kind: string;

  /**
   * The name of the category.
   */
  name: string;

  /**
   * The items in the category.
   */
  contents: ToolboxItem[];

  /**
   * Custom data associated with the category.
   */
  custom?: string = null;
}

/**
 * A ToolboxItem represents an item in a toolbox category.
 * @class ToolboxItem
 */
export class ToolboxItem {
  /**
   * The kind of the item.
   */
  kind: string;

  /**
   * The type of the item.
   */
  type: string;

  /**
   * Custom data associated with the item.
   */
  custom?: string = null;
}
