import { ExtendedObject3D } from '@enable3d/phaser-extension';
import { Container } from 'phaser3-rex-plugins/templates/ui/ui-components';
import type GameScene from './game.scene';
import { setRotatedPosition } from './position';
import { Setting } from './settings';
import TweenManagerConfig from './tween.config';

/**
 * The TweenHelper class provides functions to animate game objects using tweens in a game.
 * @class TweenHelper
 */
export default class TweenHelper {
  static currentHighlights: Map<string, Phaser.Tweens.Timeline> = new Map();

  /**
   * Scales an element according to the provided scale offset and tween configuration.
   *
   * @param {GameScene} scene - The scene in which to scale the element.
   * @param {ExtendedObject3D|THREE.Group} element - The element to scale.
   * @param {THREE.Vector3} scaleOffset - The amount by which to scale the element.
   * @param {Partial<TweenManagerConfig>} [tweenConfig=null] - The tween configuration to use when scaling the element.
   * @returns {Phaser.Tweens.Timeline} The timeline containing the tween that scales the element.
   */
  static scaleElement(scene: GameScene, element: ExtendedObject3D | THREE.Group, scaleOffset: THREE.Vector3, tweenConfig: Partial<TweenManagerConfig> = null): Phaser.Tweens.Timeline {
    const config = new TweenManagerConfig();
    if (tweenConfig != null) {
      Object.assign(config, tweenConfig);
    }
    if (scene && element) {
      const duration = config.overallDuration - config.pauseDuration / 2;
      const initialScale = element.scale.clone();
      const scale = element.scale.clone();

      const onUpdate = () => {
        element.scale.set(scale.x, scale.y, scale.z);
      };

      return scene.tweens.timeline({
        tweens: [
          {
            targets: scale,
            x: initialScale.x,
            y: initialScale.y,
            z: initialScale.z,
            ease: config.ease,
            duration: 0,
            onUpdate,
          },
          {
            targets: scale,
            x: initialScale.x + scaleOffset.x,
            y: initialScale.y + scaleOffset.y,
            z: initialScale.z + scaleOffset.z,
            ease: config.ease,
            duration,
            onUpdate,
          },
          {
            targets: scale,
            x: initialScale.x + scaleOffset.x,
            y: initialScale.y + scaleOffset.y,
            z: initialScale.z + scaleOffset.z,
            ease: config.ease,
            duration: config.pauseDuration,
            onUpdate,
          },
          {
            targets: scale,
            x: config.repeat === -1 ? initialScale.x : initialScale.x + scaleOffset.x,
            y: config.repeat === -1 ? initialScale.y : initialScale.y + scaleOffset.y,
            z: config.repeat === -1 ? initialScale.z : initialScale.z + scaleOffset.z,
            ease: config.ease,
            onUpdate,
            duration,
            onComplete: () => {
              if (config.repeat === -1) {
                this.scaleElement(scene, element, scaleOffset, config);
              } else if (config.repeat > 0) {
                config.repeat -= 1;
                this.scaleElement(scene, element, scaleOffset, config);
              }
            },
          },
        ],
      });
    }
    return null;
  }

  /**
   * Flashes an element according to the provided tween configuration and removes the element at the end if specified.
   *
   * @param {GameScene} scene - The scene in which to flash the element.
   * @param {object} element - The element to flash.
   * @param {Partial<TweenManagerConfig>} [tweenConfig=null] - The tween configuration to use when flashing the element.
   * @param {boolean} [removeElementAtEnd=false] - Whether to remove the element at the end of the tween.
   * @returns {Phaser.Tweens.Timeline} The timeline containing the tween that flashes the element.
   */
  static flashElement(scene: GameScene, element, tweenConfig: Partial<TweenManagerConfig> = null, removeElementAtEnd = false): Phaser.Tweens.Timeline {
    const config = new TweenManagerConfig();
    if (tweenConfig != null) {
      Object.assign(config, tweenConfig);
    }
    if (scene && element) {
      const flashDuration = config.overallDuration - config.pauseDuration / 2;

      return scene.tweens.timeline({
        tweens: [
          {
            targets: element,
            duration: 0,
            alpha: 0,
            ease: config.ease,
          },
          {
            targets: element,
            duration: flashDuration,
            alpha: 1,
            ease: config.ease,
          },
          {
            targets: element,
            duration: config.pauseDuration,
            alpha: 1,
            ease: config.ease,
          },
          {
            targets: element,
            duration: flashDuration,
            alpha: config.repeat === -1 ? 0 : 1,
            ease: config.ease,
            onComplete: () => {
              if (config.repeat === -1) {
                this.flashElement(scene, element, config, removeElementAtEnd);
              } else if (config.repeat > 0) {
                config.repeat -= 1;
                this.flashElement(scene, element, config, removeElementAtEnd);
              } else if (removeElementAtEnd === true) {
                config.endCallback();
                element.destroy();
              }
            },
          },
        ],
      });
    }
    return null;
  }

  /**
   * Highlights an element by flashing its border.
   *
   * @param {GameScene} scene - The scene in which to highlight the element.
   * @param {object} container - The container containing the element to highlight.
   * @param {string} elementName - The name of the element to highlight.
   * @param {boolean} activate - Whether to activate or deactivate the highlight.
   */
  static highlight(scene: GameScene, container, elementName: string, activate: boolean) {
    const borderElementName = `${elementName}-border`;
    if (activate) {
      if (TweenHelper.currentHighlights.has(container + elementName)) {
        console.debug('Highlight already active');
        return;
      }
      const element = container.getByName(elementName, true);
      if (element != null) {
        const highlightObject = TweenHelper.flashElementBorder(scene, element, borderElementName, 0xffd631, {
          repeat: -1,
          ease: 'Linear',
          overallDuration: 1200,
          pauseDuration: 800,
          endCallback: () => {
            TweenHelper.currentHighlights.delete(container + elementName);
          },
        });
        TweenHelper.currentHighlights.set(container + elementName, highlightObject);
      }
    } else if (!TweenHelper.currentHighlights.has(container + elementName)) {
      console.debug('Highlight does not exist');
    } else {
      const element = container.getByName(borderElementName, true);
      if (element != null) {
        element.destroy();
      }
      const highlightObject = TweenHelper.currentHighlights.get(container + elementName);
      TweenHelper.currentHighlights.delete(container + elementName);
      highlightObject.destroy();
    }
  }

  /**
   * Flashes an element's border according to the provided configuration.
   *
   * @param {GameScene} scene - The scene in which to flash the element's border.
   * @param {object} element - The element whose border to flash.
   * @param {string} [borderName=null] - The name to give the border.
   * @param {number} [color=null] - The color to use for the border.
   * @param {TweenManagerConfig} [config=new TweenManagerConfig()] - The tween configuration to use when flashing the border.
   * @returns {Phaser.Tweens.Timeline} The timeline containing the tween that flashes the border.
   */
  static flashElementBorder(scene: GameScene, element, borderName = null, color = null, config: TweenManagerConfig = new TweenManagerConfig()): Phaser.Tweens.Timeline {
    if (scene && element) {
      if (color == null) {
        color = scene.getSetting(Setting.highlightColor);
      }
      // CREATE A BORDER ON TOP OF BUTTON
      const border = scene.add.graphics();
      const strokeWidth = 3;
      border.lineStyle(strokeWidth, color, 1);
      border.strokeRoundedRect(-strokeWidth / 2, -strokeWidth / 2, element.displayWidth + strokeWidth, element.displayHeight + strokeWidth, 0);
      setRotatedPosition(border, element.rotation, element.x, element.y, -element.displayOriginX * element.scaleX, -element.displayOriginY * element.scaleY);
      border.alpha = 0;
      border.name = borderName;

      if (element instanceof Container) {
        element.pin(border);
      } else if (element.rexContainer != null) {
        element.rexContainer.parent.pin(border);
      }

      return this.flashElement(scene, border, config, true);
    }
    return null;
  }
}
