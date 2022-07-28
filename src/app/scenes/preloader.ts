import GameScene from '../utils/game.scene';
import { Setting } from '../utils/settings';
import PreGameScene from './pregame';

/**
 * Loads a font from the assets.
 *
 * @param {string} name - The name of the font.
 * @param {string} path - The assets path of the font.
 */
const loadFont = (name: string, path: string) => {
  const font = new FontFace(name, `url(${path})`);
  font
    .load()
    .then((loaded) => {
      (document.fonts as any).add(loaded);
    })
    .catch((error) => error);
};

/**
 * A scene that handles loading all necessary game assets and displays a loading screen.
 * @class PreloaderScene
 * @extends {GameScene}
 */
export default class PreloaderScene extends GameScene {
  static sceneName = 'Preloader';

  async preload() {
    super.preload();
    this.addProgressBar();

    loadFont('hurmit', 'assets/fonts/hurmit.otf');
    loadFont('code', 'assets/fonts/code.ttf');

    this.load.path = 'assets/';
    this.load.image('phaser_logo');
    this.load.image('fortiss_logo');
    this.load.image('cce_logo');
    this.load.image('bayernlab_logo');

    this.load.spritesheet('final_anim', 'gui/final_anim.png', {
      frameWidth: 200,
      frameHeight: 200,
      margin: 0,
      spacing: 10,
    });

    this.load.html('star', 'svg/star.svg');
    this.load.html('saw', 'svg/saw.svg');

    this.load.image('tutorial', 'preview/tutorial.png');
    this.load.image('anweisungen', 'preview/anweisungen.png');
    this.load.image('schleifenI', 'preview/schleifenI.png');
    this.load.image('schleifenII', 'preview/schleifenII.png');
    this.load.image('schleifenIII', 'preview/schleifenIII.png');
    this.load.image('schleifenIV', 'preview/schleifenIV.png');
    this.load.image('verzweigungen', 'preview/verzweigungen.png');
    this.load.image('funktionenI', 'preview/funktionenI.png');
    this.load.image('funktionenII', 'preview/funktionenII.png');
    this.load.image('labyrinthI', 'preview/labyrinthI.png');
    this.load.image('labyrinthII', 'preview/labyrinthII.png');

    this.load.image('levelstar', 'gui/Level/Star_01.png');
    this.load.image('levelstar_active', 'gui/Level/Star_03.png');
    this.load.image('level_lg', 'gui/Buttons/BTNs/Level_BTN_lg.png');
    this.load.image('settings_lg', 'gui/Buttons/BTNs/Settings_BTN_lg.png');
    this.load.image('settings_lg_active', 'gui/Buttons/BTNs_Active/Settings_BTN_lg.png');
    this.load.image('settings_sm', 'gui/Buttons/BTNs/Settings_BTN_sm.png');
    this.load.image('settings_sm_active', 'gui/Buttons/BTNs_Active/Settings_BTN_sm.png');
    this.load.image('notification_sm', 'gui/Buttons/BTNs/Notifications_BTN_sm.png');
    this.load.image('notification_sm_active', 'gui/Buttons/BTNs_Active/Notifications_BTN_sm.png');
    this.load.image('play_md', 'gui/Buttons/BTNs/Play_BTN_md.png');
    this.load.image('play_md_active', 'gui/Buttons/BTNs_Active/Play_BTN_md.png');
    this.load.image('play_lg', 'gui/Buttons/BTNs/Play_BTN_lg.png');
    this.load.image('play_lg_active', 'gui/Buttons/BTNs_Active/Play_BTN_lg.png');
    this.load.image('menu_md', 'gui/Buttons/BTNs/Menu_BTN_md.png');
    this.load.image('menu_lg', 'gui/Buttons/BTNs/Menu_BTN_lg.png');
    this.load.image('close_md', 'gui/Buttons/BTNs/Close_BTN_md.png');
    this.load.image('close_md_active', 'gui/Buttons/BTNs_Active/Close_BTN_md.png');
    this.load.image('back_sm', 'gui/Buttons/BTNs/Backward_BTN_sm.png');
    this.load.image('back_md', 'gui/Buttons/BTNs/Backward_BTN_md.png');
    this.load.image('back_sm_active', 'gui/Buttons/BTNs_Active/Backward_BTN_sm.png');
    this.load.image('info_sm', 'gui/Buttons/BTNs/Info_BTN_sm.png');
    this.load.image('info_sm_active', 'gui/Buttons/BTNs_Active/Info_BTN_sm.png');
    this.load.image('code_sm', 'gui/Buttons/BTNs/Code_BTN_sm.png');
    this.load.image('code_sm_active', 'gui/Buttons/BTNs_Active/Code_BTN_sm.png');
    this.load.image('next_lg', 'gui/Buttons/BTNs/Forward_BTN_lg.png');
    this.load.image('next_md', 'gui/Buttons/BTNs/Forward_BTN_md.png');
    this.load.image('next_lg_active', 'gui/Buttons/BTNs_Active/Forward_BTN_lg.png');
    this.load.image('retry_lg', 'gui/Buttons/BTNs/Replay_BTN_lg.png');
    this.load.image('retry_lg_active', 'gui/Buttons/BTNs_Active/Replay_BTN_lg.png');
    this.load.image('bin_md', 'gui/Buttons/BTNs/Bin_BTN_md.png');
    this.load.image('bin_md_active', 'gui/Buttons/BTNs_Active/Bin_BTN_md.png');
    this.load.image('switchright_md', 'gui/Buttons/BTNs/Switch_right_BTN_md.png');
    this.load.image('switchleft_md', 'gui/Buttons/BTNs/Switch_left_BTN_md.png');
    this.load.image('nextPage', 'gui/arrow-down-left.png');
    this.load.image('window', 'gui/Window.png');
    this.load.image('table', 'gui/Table.png');
    this.load.image('robotcircle', 'gui/robotcircle.png');

    this.third.load.preload('robot', 'assets/glb/robot.glb');
    this.third.load.preload('forest_treeRound01', 'assets/FBX/forest_treeRound01.fbx');
    this.third.load.preload('forest_treeRound02', 'assets/FBX/forest_treeRound02.fbx');
    this.third.load.preload('forest_treeRound03', 'assets/FBX/forest_treeRound03.fbx');
    this.third.load.preload('forest_treeRound04', 'assets/FBX/forest_treeRound04.fbx');
    this.third.load.preload('forest_treeRound05', 'assets/FBX/forest_treeRound05.fbx');
    this.third.load.preload('forest_treeRound06', 'assets/FBX/forest_treeRound06.fbx');
    this.third.load.preload('forest_treeRound07', 'assets/FBX/forest_treeRound07.fbx');
    this.third.load.preload('forest_treeTall01', 'assets/FBX/forest_treeTall01.fbx');
    this.third.load.preload('forest_treeTall02', 'assets/FBX/forest_treeTall02.fbx');
    this.third.load.preload('forest_treeTall03', 'assets/FBX/forest_treeTall03.fbx');
    this.third.load.preload('forest_treeTall04', 'assets/FBX/forest_treeTall04.fbx');
    this.third.load.preload('forest_treeTall05', 'assets/FBX/forest_treeTall05.fbx');
    this.third.load.preload('forest_treeTall06', 'assets/FBX/forest_treeTall06.fbx');
    this.third.load.preload('forest_treeBlob01', 'assets/FBX/forest_treeBlob01.fbx');
    this.third.load.preload('forest_treeBlob02', 'assets/FBX/forest_treeBlob02.fbx');
    this.third.load.preload('forest_treeBlob03', 'assets/FBX/forest_treeBlob03.fbx');
    this.third.load.preload('forest_treeBlob04', 'assets/FBX/forest_treeBlob04.fbx');
    this.third.load.preload('forest_fence01', 'assets/FBX/forest_fence01.fbx');
    this.third.load.preload('forest_fence02', 'assets/FBX/forest_fence02.fbx');
    this.third.load.preload('forest_fence03', 'assets/FBX/forest_fence03.fbx');
    this.third.load.preload('forest_fence04', 'assets/FBX/forest_fence04.fbx');
    this.third.load.preload('block', 'assets/FBX/ground.fbx');

    this.third.load.preload('treeRound', 'assets/textures/treeRound.png');
    this.third.load.preload('treeTop', 'assets/textures/treeRoundTop.png');
    this.third.load.preload('treeSnow', 'assets/textures/treeRoundTopSnow.png');
    this.third.load.preload('treeBlob', 'assets/textures/treeBlob.png');
    this.third.load.preload('treeTall', 'assets/textures/treeTall.png');
    this.third.load.preload('treeThin', 'assets/textures/treeTall.png');
    this.third.load.preload('ground', 'assets/textures/ground.png');
    this.third.load.preload('earth', 'assets/textures/groundEarth.png');
    this.third.load.preload('water', 'assets/textures/water.png');
    this.third.load.preload('snow', 'assets/textures/snow.png');
    this.third.load.preload('lava', 'assets/textures/lava01.png');
    this.third.load.preload('ice', 'assets/textures/ice01.png');
    this.third.load.preload('mud', 'assets/textures/groundMud.png');
    this.third.load.preload('fence01', 'assets/textures/fence01.png');
    this.third.load.preload('fence02', 'assets/textures/fence02.png');
  }

  /**
   * Adds a progress bar to the display, showing the percentage of assets loaded and their name.
   */
  private addProgressBar(): void {
    const { width } = this.cameras.main;
    const { height } = this.cameras.main;
    const outerTextColor = this.getSetting(Setting.fontColor);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

    const loadingText = this.addText(width / 2, height / 2 - 50, 'Loading...');
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.addText(width / 2, height / 2 - 5, '0%');
    percentText.setOrigin(0.5, 0.5);

    const assetText = this.addText(width / 2, height / 2 + 50, '');

    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${parseInt(`${value * 100}`, 10)}%`);
      progressBar.clear();
      progressBar.fillStyle(outerTextColor, 1);
      progressBar.fillRect(width / 4 + 10, height / 2 - 30 + 10, (width / 2 - 10 - 10) * value, 30);
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      assetText.setText(`Loading asset: ${file.key}`);
    });

    this.load.on('complete', () => {
      setTimeout(() => this.scene.start(PreGameScene.sceneName), 1000);
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });
  }
}
