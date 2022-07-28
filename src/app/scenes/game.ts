import GameScene from '../utils/game.scene';
import Player from '../player';
import { State } from '../commands/state';
import { initializeLevel } from '../levels/config';
import LevelBase from '../levels/base';
import GameLevelSelection from './game.levels';
import GameTitleScreen from './game.title';
import PlayerDropZones from './game.dropzones';
import { Setting } from '../utils/settings';

/**
 * A scene that handles displaying the main game menu and handles the corresponding user input.
 * @class MainGameScene
 * @extends {GameScene}
 */
export default class MainGameScene extends GameScene {
  static sceneName = 'MainGame';

  public players: Player[] = [];

  private titleScreen: GameTitleScreen;

  private levelSelectionScreen: GameLevelSelection;

  private dropZones: PlayerDropZones;

  private level: LevelBase;

  create() {
    setTimeout(() => this.initialize());
  }

  initialize() {
    this.third.camera.zoom = 0.7;
    this.titleScreen = new GameTitleScreen(this);
    this.levelSelectionScreen = new GameLevelSelection(this);
    this.dropZones = new PlayerDropZones(this);
    this.toTitleScreen();
  }

  public async toTitleScreen(resetData = true, resetDropZones = true) {
    // reset possibly bound data
    await this.reset(resetData, resetDropZones);
    this.titleScreen.create();
  }

  public async toLevelScreen(resetData = true, resetDropZones = false) {
    // reset possibly bound data
    await this.reset(resetData, resetDropZones);
    this.levelSelectionScreen.create();
  }

  async reset(resetData: boolean, resetDropZones: boolean) {
    if (resetData) {
      await this.level?.destroy(() => {
        this.level = null;
      });
    }
    if (resetDropZones) {
      this.dropZones.create();
      this.createPlayers();
    }
    this.orbitControls?.dispose();
    this.setCameraTo3D();
  }

  createPlayers() {
    this.destroyPlayers();
    const colors = this.getSetting(Setting.playerColors);
    for (let i = 0; i < colors.length; i++) {
      this.players.push(new Player(this, `player${i}`, colors[i], this.cameras.main.width / 2, this.cameras.main.height / 2 - 100));
    }
  }

  destroyPlayers() {
    while (this.players.length > 0) {
      const player = this.players.pop();
      player.destroy();
    }
  }

  public update(time, delta): void {
    super.update(time, delta);

    let isClicked = false;
    this.players?.forEach((player) => {
      player.update(time, delta);
      isClicked = isClicked || player.isCurrentlyClicked();
    });
    if (this.orbitControls != null) {
      this.orbitControls.enabled = !isClicked;
    }

    this.level?.update(time, delta);
  }

  async startLevel(levelId, retry, levelSelect = false) {
    this.setCameraTo3D();
    if (this.level != null) {
      await this.level.destroy(() => {
        this.level = null;
        this.startLevel(levelId, retry, levelSelect);
      }, retry);
    } else {
      this.dropZones.destroy();
      this.players.filter((x) => x.state === State.NOT_ACTIVE).forEach((x) => x.destroy());
      this.players = this.players.filter((x) => x.state !== State.NOT_ACTIVE);
      this.level = initializeLevel(
        this,
        levelId,
        this.players,
        () => this.startLevel(levelId, true),
        () => this.startLevel(levelId + 1, false),
        () => this.toTitleScreen(),
        retry,
      );
      this.initOrbitControls();
    }
  }
}
