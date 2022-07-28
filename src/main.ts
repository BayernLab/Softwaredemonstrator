import * as Blockly from 'blockly/core';
import * as De from 'blockly/msg/de';

import { Canvas, enable3d } from '@enable3d/phaser-extension';
import * as Phaser from 'phaser';
import ButtonPlugin from 'phaser3-rex-plugins/plugins/button-plugin';
import GesturesPlugin from 'phaser3-rex-plugins/plugins/gestures-plugin';
import CreateListPanel from 'phaser3-rex-plugins/templates/ui/dropdownlist/methods/listpanel/CreateListPanel';
import { DropDownList, GetViewport } from 'phaser3-rex-plugins/templates/ui/ui-components';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin';
import MainGameScene from './app/scenes/game';
import PreGameScene from './app/scenes/pregame';
import PreloaderScene from './app/scenes/preloader';
import GameSettingsScene from './app/scenes/settings';

/**
* This function monkey patches the DropDownList.prototype.openListPanel method.
* The method is used to expand a dropdown list panel and set its position, origin, and events.
* It also emits several events when the list is opened, a button is hovered, clicked, or no longer hovered.
*/
const monkeyPatchRexUIDropdownList = () => {
  DropDownList.prototype.openListPanel = function () {
    if (this.listPanel) {
      return this;
    }
    const { scene } = this;
    // Expand direction
    const isExpandDown = this.listExpandDirection === 0;
    const isExpandUp = this.listExpandDirection === 1;
    const flexExpand = !isExpandDown && !isExpandUp;
    const listPanel = CreateListPanel.call(this, scene);
    const originX = 0;
    const originY = isExpandDown || flexExpand ? 0 : 1;
    listPanel.setOrigin(originX, originY).layout();
    const { x } = this.getElement(this.listAlignMode).getTopLeft();
    const y = isExpandDown || flexExpand ? this.bottom : this.top;
    listPanel.setPosition(x, y);
    let bounds = this.listBounds;
    if (!bounds) {
      bounds = GetViewport(scene);
    }
    if (flexExpand && listPanel.bottom > bounds.bottom) {
      // Out of bounds, can't put list-panel below parent
      listPanel.changeOrigin(0, 1).setPosition(x, this.top);
    }
    listPanel
      .on(
        'button.over',
        function (button, index, pointer, event) {
          if (this.listOnButtonOver) {
            this.listOnButtonOver.call(this, button, index, pointer, event);
          }
          this.emit('button.over', this, listPanel, button, index, pointer, event);
        },
        this,
      )
      .on(
        'button.out',
        function (button, index, pointer, event) {
          if (this.listOnButtonOut) {
            this.listOnButtonOut.call(this, button, index, pointer, event);
          }
          this.emit('button.out', this, listPanel, button, index, pointer, event);
        },
        this,
      );
    const duration = this.listEaseInDuration;
    this.listTransitInCallback(listPanel, duration);
    this.delayCall(
      duration,
      function () {
        // After popping up
        // Can click
        listPanel.on(
          'button.click',
          function (button, index, pointer, event) {
            if (this.listOnButtonClick) {
              this.listOnButtonClick.call(this, button, index, pointer, event);
            }
            this.emit('button.click', this, listPanel, button, index, pointer, event);
          },
          this,
        );

        // Can close list panel
        // scene.input.once('pointerup', this.closeListPanel, this);
        this.emit('list.open', this, listPanel);
      },
      this,
    );
    this.pin(listPanel);
    this.listPanel = listPanel;
    scene.children.bringToTop(this.listPanel);
    return this;
  };
};

/**
* This function initializes command blocks for a robot simulation.
* It defines a set of blocks for starting a program, moving forward, turning left or right,
* and checking for different types of objects in front of the robot.
* It also defines the JavaScript code that is generated for each block.
*/
const initializeCommandBlocks = () => {
  (Blockly as any).setLocale(De);

  (Blockly as any).JavaScript.start = () => '';

  Blockly.Blocks.start = {
    init() {
      this.appendDummyInput().appendField('Programmstart');
      this.setNextStatement(true);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  Blockly.Blocks.move_forward = {
    init() {
      this.setPreviousStatement(true);
      this.appendDummyInput().appendField('Schritt gehen');
      this.setNextStatement(true);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.move_forward = () => {
    const code = 'robot.moveForward();\n';
    return code;
  };

  Blockly.Blocks.turn_right = {
    init() {
      this.setPreviousStatement(true);
      this.appendDummyInput().appendField('Rechts drehen');
      this.setNextStatement(true);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.turn_right = () => {
    const code = 'robot.turnRight();\n';
    return code;
  };

  Blockly.Blocks.turn_left = {
    init() {
      this.setPreviousStatement(true);
      this.appendDummyInput().appendField('Links drehen');
      this.setNextStatement(true);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.turn_left = () => {
    const code = 'robot.turnLeft();\n';
    return code;
  };

  Blockly.Blocks.is_water = {
    init() {
      this.appendDummyInput().appendField('ist Wasser voraus');
      this.setOutput(true, 'Boolean');
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  (Blockly as any).JavaScript.is_water = () => {
    const code = 'robot.isWater()';
    return [code, (Blockly as any).JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks.is_lava = {
    init() {
      this.appendDummyInput().appendField('ist Lava voraus');
      this.setOutput(true, 'Boolean');
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  (Blockly as any).JavaScript.is_lava = () => {
    const code = 'robot.isLava()';
    return [code, (Blockly as any).JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks.is_object = {
    init() {
      this.appendDummyInput().appendField('ist Objekt voraus');
      this.setOutput(true, 'Boolean');
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  (Blockly as any).JavaScript.is_object = () => {
    const code = 'robot.isObject()';
    return [code, (Blockly as any).JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks.is_empty = {
    init() {
      this.appendDummyInput().appendField('ist frei');
      this.setOutput(true, 'Boolean');
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  (Blockly as any).JavaScript.is_empty = () => {
    const code = 'robot.isEmpty()';
    return [code, (Blockly as any).JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks.is_wall = {
    init() {
      this.appendDummyInput().appendField('ist Wand voraus');
      this.setOutput(true, 'Boolean');
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  (Blockly as any).JavaScript.is_wall = () => {
    const code = 'robot.isWall()';
    return [code, (Blockly as any).JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks.is_star = {
    init() {
      this.appendDummyInput().appendField('ist Stern voraus');
      this.setOutput(true, 'Boolean');
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  (Blockly as any).JavaScript.is_star = () => {
    const code = 'robot.isStar()';
    return [code, (Blockly as any).JavaScript.ORDER_ATOMIC];
  };

  Blockly.Blocks.has_star = {
    init() {
      this.appendDummyInput().appendField('hat Stern');
      this.setOutput(true, 'Boolean');
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };

  (Blockly as any).JavaScript.has_star = () => {
    const code = 'robot.hasStar()';
    return [code, (Blockly as any).JavaScript.ORDER_ATOMIC];
  };

  // loops
  Blockly.Blocks.controls_repeat_drop = {
    init() {
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['0', '0'],
            ['1', '1'],
            ['2', '2'],
            ['3', '3'],
            ['4', '4'],
            ['5', '5'],
            ['6', '6'],
            ['7', '7'],
            ['8', '8'],
            ['9', '9'],
          ]),
          'TIMES',
        )
        .appendField('mal');
      this.appendStatementInput('DO').appendField('mache').setCheck(null);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.controls_repeat_drop = (Blockly as any).JavaScript.controls_repeat_ext;

  // functions
  Blockly.Blocks.procedures_defnoreturn_drop = {
    ...Blockly.Blocks.procedures_defnoreturn,
    init() {
      this.appendDummyInput().appendField('Definiere Funktion');
      this.appendStatementInput('STACK').appendField(
        new Blockly.FieldDropdown([
          ['rechtsDrehen', 'rechtsDrehen'],
          ['geheBisWand', 'geheBisWand'],
          ['geheZurueck', 'geheZurueck'],
          ['mache', 'mache'],
        ]),
        'NAME',
      );
      this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
      this.setStyle('procedure_blocks');
      this.arguments_ = []; // eslint-disable-line no-underscore-dangle
      this.argumentVarModels_ = []; // eslint-disable-line no-underscore-dangle
      this.statementConnection_ = null; // eslint-disable-line no-underscore-dangle
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.procedures_defnoreturn_drop = (Blockly as any).JavaScript.procedures_defnoreturn;

  Blockly.Blocks.procedures_defnoreturn_right = {
    ...Blockly.Blocks.procedures_defnoreturn,
    init() {
      this.appendDummyInput().appendField('Definiere Funktion');
      this.appendStatementInput('STACK').appendField(new Blockly.FieldDropdown([['rechts Drehen', 'turnRight']]), 'NAME');
      this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
      this.setStyle('procedure_blocks');
      this.arguments_ = []; // eslint-disable-line no-underscore-dangle
      this.argumentVarModels_ = []; // eslint-disable-line no-underscore-dangle
      this.statementConnection_ = null; // eslint-disable-line no-underscore-dangle
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.procedures_defnoreturn_right = (Blockly as any).JavaScript.procedures_defnoreturn;

  Blockly.Blocks.custom_procedure = {
    init() {
      this.setPreviousStatement(true);
      this.appendDummyInput().appendField(new Blockly.FieldDropdown([['rechts Drehen', 'turnRight']]), 'NAME');
      this.setNextStatement(true);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.custom_procedure = (block) => {
    const functionName = block.getFieldValue('NAME');
    const code = `${functionName}();\n`;
    return code;
  };

  // variables

  Blockly.Blocks.define_count_variable = {
    init() {
      this.setPreviousStatement(true);
      this.appendDummyInput()
        .appendField('definiere')
        .appendField(
          new Blockly.FieldDropdown([
            ['zähler', 'counter'],
            ['x', 'x'],
            ['y', 'y'],
            ['iteration', 'iteration'],
          ]),
          'VAR',
        )
        .appendField('als "1"');
      this.setNextStatement(true, null);
    },
  };
  (Blockly as any).JavaScript.define_count_variable = (block) => {
    const varName = block.getFieldValue('VAR');
    const code = `${varName} = 1;\n`;
    return code;
  };

  Blockly.Blocks.count_variables_get = {
    init() {
      this.appendDummyInput().appendField(
        new Blockly.FieldDropdown([
          ['zähler', 'counter'],
          ['x', 'x'],
          ['y', 'y'],
          ['iteration', 'iteration'],
        ]),
        'VAR',
      );
      this.setOutput(true, null);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.count_variables_get = (Blockly as any).JavaScript.variables_get;

  Blockly.Blocks.count_variables_increment_by = {
    init() {
      this.setPreviousStatement(true);
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['zähler', 'counter'],
            ['x', 'x'],
            ['y', 'y'],
            ['iteration', 'iteration'],
          ]),
          'VAR',
        )
        .appendField('um 1 erhöhen');
      this.setNextStatement(true, null);
      this.setTooltip('');
      this.setHelpUrl('');
    },
  };
  (Blockly as any).JavaScript.count_variables_increment_by = (block) => {
    const varName = block.getFieldValue('VAR');
    const code = `${varName} = ${varName} + 1;\n`;
    return code;
  };
};

/**
* This sets up the game configuration for a Phaser3 game.
* It sets the dimensions of the game, the rendering type, the parent container,
* the physics engine, and the plugins used. It also specifies the title, scale,
* audio settings, and FPS of the game. It adds event listeners for when the game
* is loaded and when the WebGL context is lost. Finally, it creates the game object
* and adds all game scenes to it, before starting the preloader scene.
*/
const gameConfig: Phaser.Types.Core.GameConfig = {
  width: 2560,
  height: 1440,
  type: Phaser.WEBGL,
  transparent: true,
  antialias: true,
  antialiasGL: true,
  parent: 'phaser-game',
  dom: { createContainer: true },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  plugins: {
    global: [
      {
        key: 'rexButton',
        plugin: ButtonPlugin,
        start: true,
      },
    ],
    scene: [
      {
        key: 'rexUI',
        plugin: RexUIPlugin,
        mapping: 'rexUI',
      },
      {
        key: 'rexGestures',
        plugin: GesturesPlugin,
        mapping: 'rexGestures',
      },
    ],
  },
  title: 'BayernLab Software Demonstrator',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth * Math.max(1, window.devicePixelRatio / 2),
    height: window.innerHeight * Math.max(1, window.devicePixelRatio / 2),
  },
  audio: { noAudio: true },
  fps: {
    target: 60,
    min: 30,
    forceSetTimeOut: true,
  },
  ...Canvas(),
};

window.addEventListener('load', () => {
  monkeyPatchRexUIDropdownList();
  initializeCommandBlocks();
  const game = new Phaser.Game(gameConfig);
  game.scene.add(PreloaderScene.sceneName, PreloaderScene);
  game.scene.add(PreGameScene.sceneName, PreGameScene);
  game.scene.add(MainGameScene.sceneName, MainGameScene);
  game.scene.add(GameSettingsScene.sceneName, GameSettingsScene);
  enable3d(() => game);
  game.canvas.addEventListener('webglcontextlost', (e) => {
    window.location.reload();
  });

  game.scene.start(PreloaderScene.sceneName);
});
