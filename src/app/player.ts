import Interpreter from 'js-interpreter';
import BlocklyInstructor from './blockly/gui/instructor';
import Command from './commands/base.command';
import {
  hasStar, isEmpty, isLava, isObject, isStar, isWall, isWater, moveForward, turnLeft, turnRight,
} from './commands/command.mapping';
import { State } from './commands/state';
import PlayerEntity from './entities/player.entity';
import type LevelBase from './levels/base';
import type GameScene from './utils/game.scene';

import { AnimationKey } from './utils/animate';
import { BlockType } from './utils/block';
import { Setting } from './utils/settings';

/**
* The Player class represents a player in a game. It contains the player's state, code, interpreter, current command, and level.
* It also has methods for setting and finishing commands, updating the player's state, checking if the player has won or lost, and activating and deactivating the player.
* @class Player
*/

export default class Player {
  scene: GameScene;

  state: State;

  code: string = null;

  interpreter: Interpreter;

  currentCommand: Command;

  interpreterConfig: any;

  identifier: string;

  color: number;

  private instructor: BlocklyInstructor;

  private entity: PlayerEntity;

  private stopped = false;

  private debug = false;

  level: LevelBase;

  visitedBlocks: Map<string, number> = new Map();

  constructor(scene: GameScene, identifier: string, color: number, x: number, y: number) {
    this.scene = scene;
    this.identifier = identifier;
    this.color = color;
    this.entity = new PlayerEntity(scene, identifier, { color });
    this.instructor = new BlocklyInstructor(
      scene,
      x,
      y,
      color,
      () => this.activate(),
      () => this.deactivate(),
    );
    this.interpreterConfig = (interpreter, globalObject) => {
      const robot = interpreter.nativeToPseudo({});
      interpreter.setProperty(globalObject, 'robot', robot);
      interpreter.setProperty(
        robot,
        'moveForward',
        interpreter.createNativeFunction(() => this.setCommand(() => moveForward(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'turnLeft',
        interpreter.createNativeFunction(() => this.setCommand(() => turnLeft(this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'turnRight',
        interpreter.createNativeFunction(() => this.setCommand(() => turnRight(this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'isWater',
        interpreter.createNativeFunction(() => this.setCommand(() => isWater(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'isLava',
        interpreter.createNativeFunction(() => this.setCommand(() => isLava(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'isObject',
        interpreter.createNativeFunction(() => this.setCommand(() => isObject(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'isEmpty',
        interpreter.createNativeFunction(() => this.setCommand(() => isEmpty(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'isWall',
        interpreter.createNativeFunction(() => this.setCommand(() => isWall(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'isStar',
        interpreter.createNativeFunction(() => this.setCommand(() => isStar(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
      interpreter.setProperty(
        robot,
        'hasStar',
        interpreter.createNativeFunction(() => this.setCommand(() => hasStar(this.level, this.entity, (s) => this.finishCommand(s)))),
      );
    };
    this.state = State.NOT_ACTIVE;
  }

  animate(animationKey, delay = 0, repeat = false) {
    this.entity.animate(animationKey, delay, repeat);
  }

  animatePreview(animationKey, delay = 0, repeat = false) {
    this.instructor.animate(animationKey, delay, repeat);
  }

  initializeLevel(level: LevelBase) {
    this.level = level;
    this.instructor.initializeLevel(
      level,
      (c) => this.setCode(c),
      () => this.setReady(),
      () => this.setNotReady(),
    );
    if (level.startText != null) {
      this.showTextBubble(level.startText);
    } else {
      this.showInstructor();
    }
  }

  startLevel(debug = false, successCallback = () => {}, failCallback = (err: string) => {}) {
    this.debug = debug;
    this.visitedBlocks.clear();
    if (this.state !== State.READY) {
      failCallback('Not ready');
      return;
    }
    this.state = State.WORKING;
    this.instructor.startLevel(debug);
    successCallback();
  }

  isTextBubble(): boolean {
    return this.instructor?.speechBubble.textBox.visible ?? false;
  }

  showTextBubble(text: string): void {
    this.instructor?.showTextBubble(text);
  }

  hideTextBubble(): void {
    this.instructor.hideTextBubble();
  }

  isInstructor(): boolean {
    return this.instructor?.isHidden;
  }

  showInstructor(): void {
    this.instructor?.enableCurrentView();
  }

  hideInstructor(): void {
    this.instructor?.disableCurrentView();
  }

  disableInstructor(): void {
    this.instructor?.disableInput();
  }

  enableInstructor(): void {
    this.instructor?.enableInput();
  }

  getNumberOfInstructions(): number {
    if (this.instructor?.workspace == null) return 0;
    return this.instructor.workspace.getNumberOfInstructions();
  }

  highlightInstructor(elementName: string, active = true) {
    this.instructor?.highlightCurrentViewElement(elementName, active);
  }

  recognizeInstructorClick(elementName: string, callback: (element) => void) {
    this.instructor?.addCurrentViewElementClickListener(elementName, callback);
  }

  spawn(scene: GameScene, position: THREE.Vector3, rotation: number, indexQuadrant = 0, quadrants = 1) {
    this.entity?.spawn(scene, position, rotation, indexQuadrant, quadrants);
  }

  getMapPosition() {
    return this.entity?.getInGamePosition();
  }

  getMapRotation() {
    return this.entity?.getInGameRotation();
  }

  setInGamePosition(position: THREE.Vector3) {
    this.entity?.setInGamePosition(position);
  }

  setInGameRotation(rotation: number) {
    this.entity?.setInGameRotation(rotation);
  }

  setSpawned(spawned: boolean) {
    if (this.entity) {
      this.entity.spawned = spawned;
    }
  }

  setCode(code: string) {
    // only allowed if not yet started
    if (this.state === State.NOT_STARTED) {
      this.code = code;
    }
  }

  setReady() {
    // only allowed if not yet started
    if (this.state === State.NOT_STARTED && this.code !== '') {
      this.currentCommand = null;
      this.interpreter = new Interpreter(this.code, this.interpreterConfig);
      this.state = State.READY;
      this.instructor.displayCodeView(this.code);
    } else {
      this.showToast('Dein Programm ist leer.\nBist du sicher, dass Blöcke mit dem "Programmstart" verbunden sind?', 5000, 300);
    }
  }

  setNotReady() {
    // only allowed if not yet working
    if (this.state === State.NOT_STARTED || this.state === State.READY) {
      this.currentCommand = null;
      this.interpreter = null;
      this.state = State.NOT_STARTED;
      this.instructor.displayWorkspace();
    }
  }

  setDebug(debug = false) {
    this.debug = debug;
  }

  isCurrentlyClicked() {
    if (this.stopped) {
      return false;
    }
    return this.scene.game.input.pointers.some((pointer) => {
      const pointerBounds = new Phaser.Geom.Rectangle(pointer.downX, pointer.downY, 5, 5);
      if (pointer.active) {
        if (this.instructor.workspace?.visible && Phaser.Geom.Rectangle.Overlaps(this.instructor.workspace.getBounds(), pointerBounds)) {
          return true;
        }
        if (this.instructor.speechBubble?.textBox?.visible && Phaser.Geom.Rectangle.Overlaps(this.instructor.speechBubble.textBox.getBounds(), pointerBounds)) {
          return true;
        }
        if (this.instructor.codeView?.visible && Phaser.Geom.Rectangle.Overlaps(this.instructor.codeView.getBounds(), pointerBounds)) {
          return true;
        }
        if (this.instructor.liveCodeView?.contentVisible && Phaser.Geom.Rectangle.Overlaps(this.instructor.liveCodeView.getBounds(), pointerBounds)) {
          return true;
        }
        if (this.instructor.liveInfoView?.contentVisible && Phaser.Geom.Rectangle.Overlaps(this.instructor.liveInfoView.getBounds(), pointerBounds)) {
          return true;
        }
        if (Phaser.Geom.Rectangle.Overlaps(this.instructor.dragHandle.getBounds(), new Phaser.Geom.Rectangle(pointer.x, pointer.y, 5, 5))) {
          return true;
        }
      }
      return false;
    });
  }

  update(time, delta) {
    if (!this.stopped) {
      this.entity.update(time, delta);
      this.instructor.update(time, delta);
      if (this.state === State.WORKING && (this.currentCommand == null || this.currentCommand.isFinished())) {
        if (this.currentCommand != null && this.currentCommand.isFailed()) {
          // undesired command state - break execution and set done and failed status
          this.state = State.FAILURE;
          this.onLevelFailed(this.level);
        } else {
          // previous command has succeeded or is first instruction
          let working = false;
          try {
            working = this.interpreter.step();
            const mapPosition = this.getMapPosition();
            const mapPositionString = `(${mapPosition.x};${mapPosition.y};${mapPosition.z})`;
            if (!this.visitedBlocks.has(mapPositionString)) {
              this.visitedBlocks.set(mapPositionString, Date.now());
            }
            if (Date.now() - this.visitedBlocks.get(mapPositionString) > this.scene.getSetting(Setting.infiniteLoopTime)) {
              // failed with infinite loop - will not terminate
              this.animate(AnimationKey.IDLE);
              this.state = State.FAILURE;
              this.onLevelFailed(this.level);
              this.instructor.showToast('Wir haben eine Endlosschleife entdeckt und das Level abgebrochen.', 5000, 300, this.scene.getSetting(Setting.warningColor));
            }
          } catch (err) {
            // syntax error: break execution and set done and failed status
            this.state = State.FAILURE;
            this.onLevelFailed(this.level);
          } finally {
            if (!working) {
              // finished execution and not command did not fail
              if (this.getMapPosition().equals(this.level.playerSuccessPosition)) {
                this.state = State.SUCCESS;
                this.onLevelSuccess(this.level);
              } else {
                // failed after program ended
                this.state = State.FAILURE;
                this.onLevelFailed(this.level);
              }
            }
          }
        }
      }
    }
  }

  reset(retry = false) {
    this.state = State.NOT_STARTED;
    if (!retry) {
      this.code = null;
      this.currentCommand = null;
      this.interpreter = null;
    }
    this.entity.reset();
    this.instructor.reset(retry);
    this.visitedBlocks.clear();
  }

  destroy() {
    this.stopped = true;
    this.entity?.destroy();
    this.instructor?.destroy();
  }

  enableDragging() {
    this.instructor.dragHandle.input.enabled = true;
  }

  activate() {
    this.state = State.NOT_STARTED;
  }

  deactivate() {
    this.state = State.NOT_ACTIVE;
  }

  setCommand(func) {
    this.currentCommand = new Command(func);
    if (!this.debug) {
      // If not in debug mode start the command automatically.
      return this.executeStep();
    }
    return null;
  }

  finishCommand(shouldFail: boolean) {
    const mapPosition = this.getMapPosition();
    const groundType = this.level.getGridBlockType(mapPosition.x, mapPosition.z);
    let commandState = State.FAILURE;
    // check fail states
    if (shouldFail) {
      this.animate(AnimationKey.DEATH, 0, false);
    } else if (groundType === BlockType.water || groundType === BlockType.lava) {
      this.animate(AnimationKey.DEATH, 0, false);
    } else {
      this.animate(AnimationKey.IDLE);
      commandState = State.SUCCESS;
    }
    if (this.currentCommand != null) {
      if (commandState === State.SUCCESS) {
        this.currentCommand.succeeded();
      } else if (commandState === State.FAILURE) {
        this.currentCommand.failed();
      } else {
        throw new Error('No other final command state allowed');
      }
    }
  }

  executeStep() {
    if (this.currentCommand && !this.currentCommand.isStarted()) {
      const currentLines = [];
      const currentInstructions = this.getCurrentInstructions();
      currentInstructions.forEach((instruction) => {
        const currentCodeStartLine = this.code.substring(0, instruction.start).split('\n').length - 1; // zero indexed
        const lines = this.code.substring(instruction.start, instruction.end).split('\n').length;
        for (let lineNo = 0; lineNo < lines; lineNo++) {
          currentLines.push(currentCodeStartLine + lineNo);
        }
      });
      this.instructor.highlightCodeLines(currentLines);
      return this.currentCommand.begin();
    }
    return null;
  }

  isReady(): boolean {
    return this.state === State.READY;
  }

  isFinished(): boolean {
    return this.state === State.SUCCESS || this.state === State.FAILURE;
  }

  onLevelSuccess(level: LevelBase) {
    if (level.endSuccessText != null) this.showTextBubble(level.endSuccessText);
    this.instructor.displayOverlay(true);
    this.instructor.dragHandle.previewAnims.play(AnimationKey.YES);
    this.entity.animate(AnimationKey.YES, 0, true);
  }

  onLevelFailed(level: LevelBase) {
    if (level.endFailText != null) this.showTextBubble(level.endFailText);
    this.instructor.displayOverlay(false);
    this.instructor.dragHandle.previewAnims.play(AnimationKey.NO);
  }

  showToast(message: string, duration = 1500, animationDuration = 300) {
    this.instructor.showToast(message, duration, animationDuration);
  }

  private getCurrentInstructions() {
    return this.interpreter.stateStack.filter((command) => command.node.type === 'CallExpression').map((command) => command.node);
  }
}
