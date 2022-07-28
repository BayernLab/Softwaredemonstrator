import type GameScene from './game.scene';

/**
 * Shows the given object on the game scene.
 * @param {GameScene} scene The currently active game scene holding the object.
 * @param {Phaser.GameObjects.Components.Visible} obj The object to show.
 * @param {boolean} animate Whether to animate the show using tweens.
 */
export const showView = (scene: GameScene, obj: Phaser.GameObjects.Components.Visible, animate = false) => {
  if (!obj.visible) {
    if (animate) {
      scene.tweens.add({
        onStart: () => {
          obj.setVisible(true);
        },
        targets: [obj],
        duration: 200,
        alpha: 1,
      });
    } else {
      obj.setVisible(true);
    }
  }
};

/**
 * Hides the given object on the game scene.
 * @param {GameScene} scene The currently active game scene holding the object.
 * @param {Phaser.GameObjects.Components.Visible} obj The object to hide.
 * @param {boolean} animate Whether to animate the hide using tweens.
 */
export const hideView = (scene: GameScene, obj: Phaser.GameObjects.Components.Visible, animate = false) => {
  if (obj.visible) {
    if (animate) {
      scene.tweens.add({
        onComplete: () => {
          obj.setVisible(false);
        },
        targets: [obj],
        duration: 200,
        alpha: 0,
      });
    } else {
      obj.setVisible(false);
    }
  }
};
