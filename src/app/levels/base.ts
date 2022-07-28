import { THREE } from '@enable3d/phaser-extension';
import type { ToolboxDefinition } from '../blockly/model/toolboxDefinition';
import type BaseEntity from '../entities/base.entity';
import GroundBlock from '../entities/ground.entity';
import StarEntity from '../entities/star.entity';
import MiniMap from '../minimap';
import Player from '../player';
import { BlockType } from '../utils/block';
import type GameScene from '../utils/game.scene';
import { Setting } from '../utils/settings';
import { createEntity, EntityDefinition } from '../utils/entity';
import LevelMenuButton from './ui/level.menu';
import LevelEndScreen from './ui/levelend.screen';

/**
 * Represents a level base class.
 * @class LevelBase
 * @abstract
 */
export default abstract class LevelBase {
  isTutorial = false;

  scene: GameScene;

  players: Player[];

  entities: BaseEntity[] = [];

  endMarkers: BaseEntity[] = [];

  title = '';

  subtitle = '';

  previewImageKey = '';

  startText?: string;

  endSuccessText?: string;

  endFailText?: string;

  gridDataTypes: BlockType[][];

  gridDataHeight: number[][];

  gridEntities: EntityDefinition[];

  toolboxDefinition: ToolboxDefinition;

  playerStartPosition: THREE.Vector3;

  playerSuccessPosition: THREE.Vector3;

  playerStartRotation: number;

  groundBlocks: GroundBlock[] = [];

  levelEndScreen: LevelEndScreen;

  levelMenuButton: LevelMenuButton;

  spawned = false;

  started = false;

  ended = false;

  maxInstructions = -1;

  private minimaps: MiniMap[] = [];

  functionBlock: string;

  retried = false;

  furtherInformationTexts: [string, Setting][];

  resetCameraButton: any;

  readonly mapOffset;

  constructor(scene: GameScene, partial: Partial<LevelBase>, players: Player[], retry, redoCallback?, nextCallback?, backCallback?) {
    Object.assign(this, partial);
    this.retried = retry;
    this.scene = scene;
    this.players = players;
    this.levelEndScreen = new LevelEndScreen(this, redoCallback, nextCallback, backCallback);
    this.levelMenuButton = new LevelMenuButton(this, redoCallback, backCallback);
    this.mapOffset = new THREE.Vector3(-Math.floor(this.getWidth() / 2), 2, -Math.floor(this.getDepth() / 2));
    this.playerStartPosition = this.playerStartPosition?.clone().add(this.mapOffset);
    this.playerSuccessPosition = this.playerSuccessPosition?.clone().add(this.mapOffset);
  }

  update(time, delta) {
    if (this.spawned) {
      this.groundBlocks.forEach((value: GroundBlock) => value.update(time, delta));
      this.entities.forEach((value: BaseEntity) => value.update(time, delta));
      this.endMarkers.forEach((value: BaseEntity) => value.update(time, delta));
    }
    if (this.started && !this.ended) {
      this.players.forEach((player, index) => {
        if (player.getMapPosition().equals(this.playerSuccessPosition)) {
          this.removeEntity(this.endMarkers[index]);
        }
      });
    }
  }

  end() {
    this.levelEndScreen.create();
  }

  getWidth() {
    if (this.gridDataTypes != null && this.gridDataTypes.length > 0 && this.gridDataTypes[0].length > 0) return this.gridDataTypes[0].length;
    return 0;
  }

  getDepth() {
    if (this.gridDataTypes != null && this.gridDataTypes.length > 0) return this.gridDataTypes.length;
    return 0;
  }

  getHeight() {
    function getMax(arr) {
      return Math.max(...arr.map((e) => (Array.isArray(e) ? getMax(e) : e)));
    }
    return getMax(this.gridDataHeight);
  }

  getMoveForwardPosition(target: BaseEntity): THREE.Vector3 {
    const forwardPosition = target.getInGamePosition();
    const currentRotation = target.getInGameRotation();
    if (currentRotation === 0) {
      // move in z direction
      forwardPosition.add(new THREE.Vector3(0, 0, 1));
    } else if (currentRotation === 90 || currentRotation === -270) {
      // move in x direction
      forwardPosition.add(new THREE.Vector3(1, 0, 0));
    } else if (currentRotation === 180 || currentRotation === -180) {
      // move in -z direction
      forwardPosition.add(new THREE.Vector3(0, 0, -1));
    } else if (currentRotation === 270 || currentRotation === -90) {
      // move in -x direction
      forwardPosition.add(new THREE.Vector3(-1, 0, 0));
    }
    const groundType = this.getGridBlockType(forwardPosition.x, forwardPosition.z);
    if (groundType == null) {
      forwardPosition.y = -10;
    } else if (groundType === BlockType.water || groundType === BlockType.lava) {
      forwardPosition.y = this.mapOffset.y - 1;
    } else {
      const groundLevel = this.mapOffset.y + this.getGridHeight(forwardPosition.x, forwardPosition.z) - 1;
      forwardPosition.y = groundLevel;
    }
    return forwardPosition;
  }

  canMoveForward(target: BaseEntity): boolean {
    const moveForwardPosition = this.getMoveForwardPosition(target);
    return this.isPositionOnSameOrLowerLevel(target.getInGamePosition(), moveForwardPosition) && this.isPositionEmpty(moveForwardPosition);
  }

  public isPositionOnSameOrLowerLevel(currentPosition: THREE.Vector3, targetPosition: THREE.Vector3) {
    return this.getGridHeight(currentPosition.x, currentPosition.z) >= this.getGridHeight(targetPosition.x, targetPosition.z);
  }

  isPositionEmpty(position: THREE.Vector3): boolean {
    return this.getGridEntityByPosition(position) == null;
  }

  isPositionOccupied(position: THREE.Vector3): boolean {
    return this.getGridEntityByPosition(position) != null;
  }

  isPositionOfType(position: THREE.Vector3, type: BlockType): boolean {
    return this.getGridBlockType(position.x, position.z) === type;
  }

  isSuccessPosition(targetPosition: THREE.Vector3) {
    return targetPosition.equals(this.playerSuccessPosition);
  }

  getGridBlockType(x, z, shouldAdjustOffset = true): BlockType {
    if (shouldAdjustOffset) [x, z] = this.adjustOffset(x, z);
    return this.isOnMap(x, z) ? this.gridDataTypes[z][x] : null;
  }

  getGridHeight(x, z, shouldAdjustOffset = true) {
    if (shouldAdjustOffset) [x, z] = this.adjustOffset(x, z);
    return this.isOnMap(x, z) ? this.gridDataHeight[z][x] : null;
  }

  private isOnMap(x, z): boolean {
    return x >= 0 && x < this.getWidth() && z >= 0 && z < this.getDepth();
  }

  private adjustOffset(x, z) {
    x += this.mapOffset.x * -1;
    z += this.mapOffset.z * -1;
    return [x, z];
  }

  getGridEntityByPosition(position: THREE.Vector3) {
    return this.entities.find((entity) => entity.getInGamePosition().equals(position));
  }

  async spawnMap() {
    this.createMinimaps();
    this.createResetCamera();
    this.levelMenuButton.create();
    await this.createGroundBlocks();
    this.initEntities();
    this.initPlayers();
    this.initPlayerSuccessPositionMarkers();
    this.spawned = true;
  }

  async destroy(callback, retry = false) {
    this.ended = true;
    this.levelMenuButton?.destroy();
    this.resetCameraButton?.destroy();
    this.destroyMinimaps();
    this.destroyGroundBlocks();
    this.endMarkers.forEach((marker) => {
      this.removeEntity(marker);
    });
    this.entities.forEach((entity) => {
      entity.ended = true;
      this.removeEntity(entity);
    });
    this.resetPlayers(retry);
    this.scene.time.delayedCall(1500, () => {
      this.groundBlocks = [];
      this.endMarkers = [];
      callback();
    });
  }

  initEntities(delay = 500, randomDelay = true) {
    if (this.gridEntities != null) {
      this.gridEntities.forEach((entityData, index) => {
        const entityObj = createEntity(this, `entity${index + 1}`, entityData);
        if (entityObj != null) {
          const targetPosition = entityData.position.clone().add(this.mapOffset);
          const target = targetPosition.y;
          const position = new THREE.Vector3(targetPosition.x, targetPosition.y + 12, targetPosition.z);
          this.scene.time.delayedCall(delay + (randomDelay ? Math.random() * 500 : 0), () => {
            entityObj.spawn(this.scene, position, entityData.rotation);
            this.scene.tweens.add({
              targets: position,
              y: target,
              duration: 300,
              onStart: () => this.entities.push(entityObj),
              onUpdate: () => entityObj.setInGamePosition(position),
              onComplete: () => {
                entityObj.spawned = true;
              },
            });
          });
        }
      });
    }
  }

  async initPlayerSuccessPositionMarkers(delay = 500, randomDelay = true) {
    const target = this.playerSuccessPosition.y;
    this.players.forEach((player: Player, index: number) => {
      const position = new THREE.Vector3(this.playerSuccessPosition.x, this.playerSuccessPosition.y + 12, this.playerSuccessPosition.z);
      const marker = new StarEntity(this.scene);
      this.endMarkers.push(marker);
      this.scene.time.delayedCall(delay + (randomDelay ? Math.random() * 500 : 0), () => {
        marker.spawn(this.scene, position, 0, index, this.players.length);
        this.scene.tweens.add({
          targets: position,
          y: target,
          duration: 500,
          onUpdate: () => marker.setInGamePosition(position),
          onComplete: () => {
            marker.spawned = true;
          },
        });
      });
    });
  }

  removeEntity(entity: BaseEntity) {
    const position = entity.getInGamePosition();
    if (entity != null) {
      const target = position.y + 20;
      this.scene.tweens.addCounter({
        from: position.y,
        to: target,
        duration: Math.random() * 1000 + 500,
        onUpdate: (tween: Phaser.Tweens.Tween) => {
          if (entity != null) {
            entity.setInGamePosition(new THREE.Vector3(position.x, tween.getValue(), position.z));
          }
        },
        onComplete: () => {
          entity.destroy();
        },
      });
    }
  }

  initPlayers() {
    this.players.forEach((player: Player, index: number) => {
      player.reset(this.retried);
      player.initializeLevel(this);
      this.addPlayerToMap(player, index);
    });
  }

  addPlayerToMap(player: Player, index: number, delay = 500, randomDelay = true) {
    const position = new THREE.Vector3(this.playerStartPosition.x, this.playerStartPosition.y + 12, this.playerStartPosition.z);
    const target = this.playerStartPosition.y;
    this.scene.time.delayedCall(delay + (randomDelay ? Math.random() * 500 : 0), () => {
      player.spawn(this.scene, position, this.playerStartRotation, index, this.players.length);
      this.scene.tweens.add({
        targets: position,
        y: target,
        duration: 500,
        onUpdate: () => {
          player.setInGamePosition(position);
        },
        onComplete: () => {
          player.setSpawned(true);
        },
      });
    });
  }

  resetPlayers(retry) {
    this.players.forEach((player: Player) => {
      const pos = player.getMapPosition();
      const target = player.getMapPosition();
      target.y += 20;
      this.scene.tweens.add({
        targets: pos,
        y: target.y,
        duration: Math.random() * 1000 + 500,
        onUpdate: () => {
          player.setInGamePosition(pos);
        },
        onComplete: () => player.reset(retry),
      });
    });
  }

  destroyGroundBlocks() {
    this.groundBlocks.forEach((obj) => {
      const pos = obj.getInGamePosition().clone();
      const target = pos.clone();
      target.y -= 20;
      this.scene.tweens.add({
        targets: pos,
        y: target.y,
        duration: Math.random() * 1000 + 500,
        onUpdate: () => {
          obj.setInGamePosition(pos);
        },
        onComplete: () => {
          obj.destroy();
        },
      });
    });
  }

  async createGroundBlocks(shouldFallIntoPlace = true) {
    for (let widthIndex = 0; widthIndex < this.getWidth(); widthIndex++) {
      for (let depthIndex = 0; depthIndex < this.getDepth(); depthIndex++) {
        for (let height = 0; height < this.getGridHeight(widthIndex, depthIndex, false); height++) {
          const blockPosition = new THREE.Vector3(widthIndex + this.mapOffset.x, height + (shouldFallIntoPlace ? 10 : 0), depthIndex + this.mapOffset.z);
          const blockType = this.getGridBlockType(widthIndex, depthIndex, false);
          if (blockType != null) {
            const block = new GroundBlock(this.scene, blockType, { type: blockType });
            if (shouldFallIntoPlace) {
              this.scene.time.delayedCall(Math.random() * 500, () => {
                block.spawn(this.scene, blockPosition);
                this.scene.tweens.add({
                  targets: blockPosition,
                  y: height + this.mapOffset.y - 1,
                  duration: 300,
                  onUpdate: () => {
                    block.setInGamePosition(blockPosition);
                  },
                  onComplete: () => {
                    this.groundBlocks.push(block);
                    block.spawned = true;
                  },
                });
              });
            } else {
              block.spawn(this.scene, blockPosition);
              this.groundBlocks.push(block);
              block.spawned = true;
            }
          }
        }
      }
    }
  }

  protected createResetCamera() {
    const padding = this.scene.getSetting(Setting.padding);
    this.resetCameraButton?.destroy();
    const text2d = this.scene.addText(0, 0, '2D');
    const image = this.scene.add.image(0, 0, 'switchright_md');
    const text3d = this.scene.addText(0, 0, '3D');
    this.resetCameraButton = this.scene.rexUI.add
      .sizer({
        x: window.innerWidth / 2 - 80,
        y: padding,
        orientation: 'x',
        space: { item: padding },
      })
      .setOrigin(1, 0)
      .add(text2d, 1, 'center')
      .add(image, 1, 'center')
      .add(text3d, 1, 'center')
      .setInteractive()
      .on('pointerup', () => {
        this.resetCameraButton.scaleYoyo(300, 1.1);
        if (image.texture.key === 'switchright_md') {
          this.scene.setCameraTo2D();
          image.setTexture('switchleft_md');
        } else {
          this.scene.setCameraTo3D();
          image.setTexture('switchright_md');
        }
      })
      .layout();
  }

  protected createMinimaps() {
    const padding = this.scene.getSetting(Setting.padding);
    this.destroyMinimaps();
    if (this.minimaps == null || this.minimaps.length === 0) {
      const size = 150;
      switch (this.scene.getSetting(Setting.miniMaps)) {
        case 'corner':
          this.minimaps.push(new MiniMap(this, 0, 0, size, padding, this.getWidth(), this.getDepth(), 'top'));
          this.minimaps.push(new MiniMap(this, this.scene.cameras.main.width, this.scene.cameras.main.height, size, padding, this.getWidth(), this.getDepth(), 'bottom'));
          this.minimaps.push(new MiniMap(this, 0, this.scene.cameras.main.height, size, padding, this.getWidth(), this.getDepth(), 'left'));
          this.minimaps.push(new MiniMap(this, this.scene.cameras.main.width, 0, size, padding, this.getWidth(), this.getDepth(), 'right'));
          break;
        case 'center':
          this.minimaps.push(new MiniMap(this, this.scene.cameras.main.width / 2 - size, 50, size, padding, this.getWidth(), this.getDepth(), 'top'));
          this.minimaps.push(new MiniMap(this, this.scene.cameras.main.width / 2 - size, this.scene.cameras.main.height, size, padding, this.getWidth(), this.getDepth(), 'bottom'));
          this.minimaps.push(new MiniMap(this, 0, this.scene.cameras.main.height / 2 - size, size, padding, this.getWidth(), this.getDepth(), 'left'));
          this.minimaps.push(new MiniMap(this, this.scene.cameras.main.width, this.scene.cameras.main.height / 2 - size, size, padding, this.getWidth(), this.getDepth(), 'right'));
          break;
        case 'none':
        default:
          break;
      }
    }
  }

  private destroyMinimaps() {
    while (this.minimaps.length > 0) {
      const minimap = this.minimaps.pop();
      minimap.destroy();
    }
  }
}
