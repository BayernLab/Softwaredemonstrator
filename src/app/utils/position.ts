/**
 * Rotates a point around the origin by the given angle and adjusts the x and y coordinate accordingly.
 *
 * @param {number} x - The x-coordinate of the point.
 * @param {number} y - The y-coordinate of the point.
 * @param {number} rotation - The angle to rotate the point, in radians.
 * @returns {Phaser.Geom.Point} The rotated point.
 */
export const rotatePoint = (x: number, y: number, rotation: number): Phaser.Geom.Point => {
  const point = new Phaser.Geom.Point(x, y);
  return Phaser.Math.Rotate(point, rotation);
};

/**
 * Sets the position and rotation of an element based on the given coordinates and angle and adjusts the x and y coordinate accordingly.
 *
 * @param {any} element - The element to set the position and rotation for.
 * @param {number} rotation - The angle to rotate the element, in radians.
 * @param {number} x - The x-coordinate to position the element at.
 * @param {number} y - The y-coordinate to position the element at.
 * @param {number} [offsetX=0] - The x-offset to apply to the element's position.
 * @param {number} [offsetY=0] - The y-offset to apply to the element's position.
 * @returns {any} The element that was passed in, with updated position and rotation.
 */
export const setRotatedPosition = (element: any, rotation, x: number, y: number, offsetX = 0, offsetY = 0): any => {
  const offset = rotatePoint(offsetX, offsetY, rotation);
  element.setPosition(x + offset.x, y + offset.y);
  element.setRotation(rotation);
  return element;
};
