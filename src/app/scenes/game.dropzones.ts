import InstructorDragHandle from '../blockly/gui/instructor.handle';
import { Setting } from '../utils/settings';
import type GameScene from '../utils/game.scene';
import type MainGameScene from './game';
import GameBaseView from './game.base';

function getDropzoneConfigFromString(scene: GameScene): { color: number; highlightColor: number; zones: any[] } {
  const dropZoneKey = scene.gameSettings.get(Setting.dropZones);
  const color = scene.gameSettings.get(Setting.baseColor);
  const highlightColor = scene.gameSettings.get(Setting.highlightColor);
  const padding = scene.gameSettings.get(Setting.padding);
  switch (dropZoneKey) {
    case 'bottom':
      return {
        color,
        highlightColor,
        zones: [
          {
            width: 600,
            height: 300,
            x: 300 + 50 + padding,
            y: scene.cameras.main.height - 150 - padding,
            velocityX: 20,
            velocityY: -150,
          },
          {
            width: 600,
            height: 300,
            x: scene.cameras.main.width / 2 - 500,
            y: scene.cameras.main.height - 150 - padding,
            velocityX: 0,
            velocityY: -50,
          },
          {
            width: 600,
            height: 300,
            x: scene.cameras.main.width / 2 + 500,
            y: scene.cameras.main.height - 150 - padding,
            velocityX: 0,
            velocityY: -50,
          },
          {
            width: 600,
            height: 300,
            x: scene.cameras.main.width - 300 - 50 - padding,
            y: scene.cameras.main.height - 150 - padding,
            velocityX: -45,
            velocityY: -150,
          },
        ],
      };
    case 'center':
      return {
        color,
        highlightColor,
        zones: [
          {
            width: 300,
            height: 600,
            x: padding + 150,
            y: scene.cameras.main.height / 2,
            rotation: 90,
            velocityX: 50,
            velocityY: 0,
          },
          {
            width: 300,
            height: 600,
            x: scene.cameras.main.width - 150 - padding,
            y: scene.cameras.main.height / 2,
            rotation: 270,
            velocityX: -50,
            velocityY: 0,
          },
          {
            width: 600,
            height: 300,
            x: scene.cameras.main.width / 2,
            y: 150 + padding,
            rotation: 180,
            velocityX: 0,
            velocityY: 55,
          },
          {
            width: 600,
            height: 300,
            x: scene.cameras.main.width / 2,
            y: scene.cameras.main.height - 150 - padding,
            rotation: 0,
            velocityX: 0,
            velocityY: -50,
          },
        ],
      };
    default:
      throw new Error('Unknown dropzone config key.');
  }
}

function setZoneBorderColor(dropZone: Phaser.GameObjects.Zone, color: number) {
  dropZone.data.get('graphics').clear();
  dropZone.data.get('graphics').lineStyle(2, color);
  dropZone.data.get('graphics').strokeRect(dropZone.x - dropZone.width / 2, dropZone.y - dropZone.height / 2, dropZone.width, dropZone.height);
}

/**
 * A view that displays the dropzones of the game to activate players.
 * @class PlayerDropZones
 * @extends {GameBaseView}
 */
export default class PlayerDropZones extends GameBaseView {
  scene: MainGameScene;

  views: Phaser.GameObjects.GameObject[] = [];

  public playerActivationDropzoneConfig: { color: number; highlightColor: number; zones: any[] };

  constructor(scene: MainGameScene) {
    super(scene);
    this.playerActivationDropzoneConfig = getDropzoneConfigFromString(scene);
  }

  destroy() {
    while (this.views.length > 0) {
      const zone = this.views.pop();
      zone.data.get('graphics').destroy();
      zone.data.get('text').destroy();
      if (zone.data.get('btn')) zone.data.get('btn').destroy();
      if (zone.data.get('gameObject')) {
        zone.data.get('gameObject').setVelocity(zone.data.get('velocityX'), zone.data.get('velocityY'));
        zone.data.get('gameObject').input.enabled = true;
      }
      zone.destroy();
    }
  }

  create() {
    this.destroy();
    const padding = this.scene.gameSettings.get(Setting.padding);
    this.playerActivationDropzoneConfig.zones.forEach((zoneConfig) => {
      const { width } = zoneConfig;
      const { height } = zoneConfig;
      const zone = this.scene.add.zone(zoneConfig.x, zoneConfig.y, width, height).setRectangleDropZone(width, height);
      zone.data = new Phaser.Data.DataManager(zone);
      const zoneGraphics = this.scene.add.graphics();
      zone.data.set('graphics', zoneGraphics);
      zone.data.set('velocityX', zoneConfig.velocityX);
      zone.data.set('velocityY', zoneConfig.velocityY);
      setZoneBorderColor(zone, this.playerActivationDropzoneConfig.color);
      zone.data.set(
        'text',
        this.scene
          .addText(zone.x, zone.y, 'Ziehe Roboter zum aktivieren hier her')
          .setAngle(zoneConfig.rotation ?? 0)
          .setOrigin(0.5, 0.5),
      );
      this.views.push(zone);
    });

    this.scene.input.on('drop', (pointer, gameObject: InstructorDragHandle, dropZone: Phaser.GameObjects.Zone) => {
      if (!dropZone.data.get('gameObject')) {
        gameObject.setVelocity(0, 0);
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;
        gameObject.setRotation(dropZone.data.get('text').rotation);
        gameObject.input.enabled = false;
        gameObject.instructor.activate();
        const notreadyButton = this.scene.add.image(dropZone.getTopRight().x - padding, dropZone.getTopRight().y + padding, 'close_md').setOrigin(1, 0);
        notreadyButton.setInteractive();
        notreadyButton.on('pointerup', () => {
          gameObject.input.enabled = true;
          gameObject.x = gameObject.initialX;
          gameObject.y = gameObject.initialY;
          gameObject.instructor.deactivate();
          notreadyButton.destroy();
          dropZone.data.set('btn', undefined);
          dropZone.data.set('gameObject', undefined);
          dropZone.data.get('text').visible = true;
          setZoneBorderColor(dropZone, this.playerActivationDropzoneConfig.color);
        });
        dropZone.data.set('gameObject', gameObject);
        dropZone.data.set('btn', notreadyButton);
        dropZone.data.get('text').visible = false;
        setZoneBorderColor(dropZone, this.playerActivationDropzoneConfig.highlightColor);
      } else {
        dropZone.data.get('gameObject').x = dropZone.x;
        dropZone.data.get('gameObject').y = dropZone.y;
      }
    });

    this.scene.input.on('dragenter', (pointer, gameObject: InstructorDragHandle, dropZone) => {
      if (!dropZone.data.get('gameObject')) {
        setZoneBorderColor(dropZone, this.playerActivationDropzoneConfig.highlightColor);
      } else {
        dropZone.data.get('gameObject').x = dropZone.x;
        dropZone.data.get('gameObject').y = dropZone.y;
      }
    });

    this.scene.input.on('dragleave', (pointer, gameObject: InstructorDragHandle, dropZone) => {
      if (!dropZone.data.get('gameObject')) {
        setZoneBorderColor(dropZone, this.playerActivationDropzoneConfig.color);
      } else {
        dropZone.data.get('gameObject').x = dropZone.x;
        dropZone.data.get('gameObject').y = dropZone.y;
      }
    });
  }
}
