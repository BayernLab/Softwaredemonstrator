import { THREE } from '@enable3d/phaser-extension';
import CategoryView from '../blockly/gui/views/category';
import Player from '../player';
import { BlockType } from '../utils/block';
import type GameScene from '../utils/game.scene';
import { Setting } from '../utils/settings';
import LevelBase from './base';
import EndScreen from './endscreen';
import { EntityType } from './entity';
import Level from './level';
import Tutorial from './tutorial';
import StartButton from './ui/start.button';

/**
 * This file contains all level configurations.
 * Each level is defined by a class that extends LevelBase.
 */

const tutorialElements: Partial<Tutorial> = {
  isTutorial: true,
  title: 'Tutorial',
  previewImageKey: 'tutorial',
  subtitle: 'Lerne mich kennen',
  endSuccessText:
    'Super! Du hast mir geholfen den ersten Stern zu sammeln. Im Laufe unseres Abenteuers werden wir noch weitere Programmierkonzepte kennenlernen, um auch schwierigere Aufgaben lösen zu können...',
  endFailText: 'Schade! Naja vielleicht beim nächsten Mal... Probier es doch gleich nochmal.',
  playerStartPosition: new THREE.Vector3(1, 0, 1),
  playerSuccessPosition: new THREE.Vector3(1, 0, 3),
  playerStartRotation: 0,
  gridDataTypes: [
    [BlockType.water, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.water],
  ],
  gridDataHeight: [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
        ],
      },
    ],
  },
  steps: [
    {
      start: (level) => {
        level.players.forEach((x) => {
          x.enableDragging();
          x.showTextBubble('Hallo! Ich bin Robo :)\nIch bin ein Computer.');
        });
      },
      succeedStepCheck: (player) => !player.isTextBubble(),
    },
    {
      start: (level) => {
        level.createGroundBlocks();
        level.players.forEach((x) => {
          x.showTextBubble('Ich lebe in einer kleinen Welt.');
        });
      },
      succeedStepCheck: (player) => !player.isTextBubble(),
    },
    {
      start: (level) => {
        level.players.forEach((player: Player, index: number) => {
          level.addPlayerToMap(player, index, 0);
          player.showTextBubble('Und das bin ich!');
        });
      },
      succeedStepCheck: (player) => !player.isTextBubble(),
    },
    {
      start: (level) => {
        level.initPlayerSuccessPositionMarkers(0);
        level.spawned = true;
        level.players.forEach((player: Player) => {
          player.showTextBubble('Ich liebe Sterne. Kannst du mir helfen Sterne zu sammeln?');
        });
      },
      succeedStepCheck: (player) => !player.isTextBubble(),
    },
    {
      start: (level) => {
        level.players.forEach((x) => {
          x.initializeLevel(level);
          x.showInstructor();
          x.disableInstructor();
          x.showTextBubble(
            'Das ist mein Programmfenster. Ein Programm besteht aus verschiedenen Anweisungenn, die nacheinander ausgeführt werden. Alle Anweisungen in meinem Programmierfenster können in Code übersetzt werden und mir helfen mich in der Welt zurechtzufinden.',
          );
        });
      },
      succeedStepCheck: (player) => !player.isTextBubble(),
    },
    {
      start: (level) => {
        level.players.forEach((player, index) => {
          player.showTextBubble('Zum Beispiel gibt es Anweisungen, die mir helfen mich zu bewegen. Schau ruhig mal, welche Anweisungen es gibt.');
          player.enableInstructor();
          player.highlightInstructor('category-Bewegungen');
          player.recognizeInstructorClick('category-Bewegungen', (element) => {
            const elem = element as CategoryView;
            elem.toolbox.showBlockCategory(elem.category);
            player.highlightInstructor('category-Bewegungen', false);
            level.currentStep.done[index] = true;
          });
        });
      },
    },
    {
      start: (level) => {
        level.players.forEach((player, index) => {
          player.enableInstructor();
          player.showTextBubble('Du kannst mich programmieren. Ziehe einfach eine Anweisung von links in mein Programmierfenster und docke ihn am Programmstart an.');
          player.highlightInstructor('block-Schritt gehen-inToolbox');
          player.recognizeInstructorClick('block-Schritt gehen-inToolbox', () => {
            player.highlightInstructor('block-Schritt gehen-inToolbox', false);
            level.currentStep.done[index] = true;
          });
        });
      },
      succeedStepCheck: (player) => player.getNumberOfInstructions() >= 1,
    },
    {
      start: (level) => {
        level.players.forEach((player, index) => {
          player.showTextBubble('Ich denke 2x "Schritt gehen" sollte genügen...');
          player.enableInstructor();
          player.highlightInstructor('block-Schritt gehen-inToolbox');
          player.recognizeInstructorClick('block-Schritt gehen-inToolbox', () => {
            player.highlightInstructor('block-Schritt gehen-inToolbox', false);
            level.currentStep.done[index] = true;
          });
        });
      },
      succeedStepCheck: (player) => player.getNumberOfInstructions() >= 2,
    },
    {
      start: (level) => {
        level.players.forEach((player) => {
          player.showTextBubble('Wenn du denkst, dass das Programm mich zum Stern führt, dann drücke auf den "Fertig"-Knopf.');
          player.enableInstructor();
          player.highlightInstructor('ready');
          player.recognizeInstructorClick('ready', () => {
            player.highlightInstructor('ready', false);
          });
        });
      },
      succeedStepCheck: (player) => player.isReady(),
    },
    {
      start: (level) => {
        level.players.forEach((player) => {
          player.disableInstructor();
          player.showTextBubble('Und so sieht der Programmcode aus, den du gerade programmiert hast. Denkst du das ist richtig? Dann klicke "Versuch starten".');
        });
        level.currentStep.customViews.push(
          new StartButton(level, () => {
            level.currentStep.done = level.currentStep.done.map(() => true);
          }).create(),
        );
      },
      suceedStepCallback: (level) => {
        level.started = true;
      },
    },
    {
      start: (level) => {
        level.players.forEach((player) => {
          player.showTextBubble('Und schon geht´s los! Der Pfeil zeigt dir, welche Anweisung gerade ausgeführt wird.');
          player.startLevel(true);
          level.scene.time.delayedCall(800, () => player.executeStep());
        });
      },
      succeedStepCheck: (player) => !player.isTextBubble(),
    },
    {
      start: (level) => {
        level.players.forEach((player) => {
          player.showTextBubble('Und weiter geht´s.');
          player.setDebug(false);
          level.scene.time.delayedCall(800, () => player.executeStep());
        });
      },
      succeedStepCheck: (player) => player.isFinished(),
    },
  ],
};

const instructionsLeftturn: Partial<Level> = {
  title: 'Anweisungen',
  previewImageKey: 'anweisungen',
  subtitle: 'Die Linksdrehung',
  startText: 'Schau mal, ich kann mich auch nach links drehen. Hilfst du mir wieder den Stern zu sammeln?',
  endSuccessText: 'Juhu, Programmieren ist doch leicht, oder?',
  endFailText: 'Oh schade, beim nächsten Mal klappt es bestimmt! Am Ende muss ich mich drehen und einen weiteren Schritt machen...',
  furtherInformationTexts: [
    ['Programm', Setting.fontnormal],
    [
      'Wir suchen nach einem Lösungsweg – den sogenannten Algorithmus – und implementieren diesen in einem Programm – der Software.\nEin Programm besteht aus einer Menge von Anweisungen – bei uns dargestellt als Blöcke.\nIn einem Programm werden Anweisungen normalerweise von oben nach unten nacheinander ausgeführt.\nDas Programm (Software) wird auf den Prozessoren (Hardware) des Roboters ausgeführt und steuert die Beine, Arme und vieles mehr.',
      Setting.fontsmall,
    ],
    ['Anweisungen', Setting.fontnormal],
    [
      'Anweisungen sind Arbeitsschritte. Der Roboter kennt zum Beispiel die Anweisung „Schritt gehen“. Anweisungen können wiederum selbst aus anderen Anweisungen bestehen. „Schritt gehen“ beinhaltet das Heben und Absetzen des Fußes, das Abwinkeln des Knies und vieles mehr.',
      Setting.fontsmall,
    ],
  ],
  playerStartPosition: new THREE.Vector3(1, 0, 1),
  playerSuccessPosition: new THREE.Vector3(2, 0, 4),
  playerStartRotation: 0,
  gridDataTypes: [
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water],
  ],
  gridDataHeight: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ],
  gridEntities: [],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
        ],
      },
    ],
  },
};

const loopsCounting: Partial<Level> = {
  title: 'Schleifen',
  previewImageKey: 'schleifenI',
  subtitle: 'Wieder und wieder und ...',
  maxInstructions: 4,
  startText:
    'Manchmal muss ich einfache Anweisungen oft wiederholen, um mein Ziel zu erreichen. Damit mir das gelingen kann, ohne dass das Programm immer länger und unübersichtlicher wird, kannst du Schleifen programmieren. Schleifen helfen eine Anweisung mehrmals nacheinander wieder auszuführen. Du kannst bei einer zählenden Schleife durch klicken auf die Zahl die Anzahl der Iterationen einstellen. Versuchen wirs?',
  endSuccessText: 'Wow - du hast es geschafft. Schleifen machen Wiederholungen einfacher. Findest du nicht?',
  endFailText:
    'Schade. Das war es noch nicht! Ein Tipp fürs nächste Mal: Versuche doch erst dir das Programm ohne Schleifen vorzustellen und dann zu erkennen, welche Wiederholungen durch Schleifen ersetzt werden können.',
  furtherInformationTexts: [
    ['Zählergesteuerte Schleifen', Setting.fontnormal],
    [
      'Zählergesteuerte Schleifen erlauben es Anweisungen zu wiederholen. Dafür haben sie einen Zähler – eine Variable. Diese gibt die Anzahl der Wiederholungen an. Das, was „x“ mal wiederholt werden soll, wird in dem sogenannten Körper angewiesen. Dafür werden diese Anweisungen nach rechts gesondert eingerückt.\n\nDurch klicken auf die Zählvariable kann die Anzahl an Wiederholungen ausgewählt werden.',
      Setting.fontsmall,
    ],
  ],
  playerStartPosition: new THREE.Vector3(1, 0, 1),
  playerSuccessPosition: new THREE.Vector3(2, 0, 6),
  playerStartRotation: 0,
  gridDataTypes: [
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water],
  ],
  gridDataHeight: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ],
  gridEntities: [],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Schleifen',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_drop',
          },
        ],
      },
    ],
  },
};

const loopsNesting: Partial<Level> = {
  title: 'Verschachtelungen',
  previewImageKey: 'schleifenII',
  subtitle: 'Wieder und nochmal wieder',
  maxInstructions: 4,
  startText:
    'Wir können auch mehrere Anweisungen in einer Schleife ausführen oder sogar Schleifen in Schleifen implementieren. Gerade dann, wenn mehrere Anweisungen wiederholt werden sollen sind Schleifen sehr hilfreich. So kann ich diesen Stern mit nur 4 Anweisungen erreichen.',
  endSuccessText: 'Super! Merke dir also, Schleifen können auch mehrere unterschiedliche Anweisungen beinhalten.',
  endFailText:
    'Schade! Schleifen können auch mehrere unterschiedliche Anweisungen beinhalten. Ich muss hier 3x gerade aus gehen und mich anschließend nach links drehen. Versuche es doch gleich nochmal.',
  furtherInformationTexts: [
    ['Verschachtelung', Setting.fontnormal],
    [
      'Schleifen und andere Anweisungen können ineinander geschachtelt werden. Das bedeutet, dass in dem Körper einer Schleife beliebig viele weitere Schleifen enthalten sein können und beliebig viel nach rechts eingerückt. Im Programmcode ist die Verschachtelung durch geschweifte Klammern dargestellt.',
      Setting.fontsmall,
    ],
    ['Zählergesteuerte Schleifen', Setting.fontnormal],
    [
      'Zählergesteuerte Schleifen erlauben es Anweisungen zu wiederholen. Dafür haben sie einen Zähler – eine Variable. Diese gibt die Anzahl der Wiederholungen an. Das, was „x“ mal wiederholt werden soll, wird in dem sogenannten Körper angewiesen. Dafür werden diese Anweisungen nach rechts gesondert eingerückt.\n\nDurch klicken auf die Zählvariable kann die Anzahl an Wiederholungen ausgewählt werden.',
      Setting.fontsmall,
    ],
  ],
  playerStartPosition: new THREE.Vector3(1, 0, 1),
  playerSuccessPosition: new THREE.Vector3(4, 0, 1),
  playerStartRotation: 0,
  gridDataTypes: [
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water],
  ],
  gridDataHeight: [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
  ],
  gridEntities: [],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Schleifen',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_drop',
          },
        ],
      },
    ],
  },
};

const loopsCausal: Partial<Level> = {
  title: 'Bedingungen', // Bedingte Schleifen
  previewImageKey: 'schleifenIV',
  subtitle: 'Wieder, aber wie lange?',
  maxInstructions: 6,
  startText:
    'Jede Seite abzuzählen ist ganz schön aufwendig. Mit Bedingungen kann ich meine Umgebung abfragen. Mit bedingten Schleifen kann ich Anweisungen solange ausführen bis eine Bedingung wahr wird. Ich könnte also zum Beispiel solange einen "Schritt" machen bis das Wasser kommt. Mit einem Nicken oder Kopf-Schütteln zeige ich dir an, ob die Bedingung zutrifft oder nicht. Mit 6 Anweisungen bekommen wir das hin, oder?',
  endSuccessText:
    'Sehr gut, ein weiterer Stern! Bedingte Schleifen sind also sehr hilfreich, wenn wir etwas solange wiederholen wollen, bis eine bestimmte Bedingung eintritt, bzw. solange eine bestimmmte Bedingung wahr ist.',
  endFailText: 'Hm... Vielleicht kann ich immer einen "Schritt" machen, solange BIS das Wasser kommt und anschließend kann ich mich nach "links drehen". Probieren wir es nochmal?',
  furtherInformationTexts: [
    ['Bedingte Schleifen', Setting.fontnormal],
    [
      'Auch bedingte Schleifen erlauben es Anweisungen zu wiederholen. Dafür haben sie eine Bedingung. Solange diese Bedingung „wahr“ ist, werden Anweisungen wiederholt. Das, was wiederholt werden soll, wird wieder in dem sogenannten Körper definiert. Auch hier werden diese Anweisungen gesondert nach rechts eingerückt.',
      Setting.fontsmall,
    ],
    ['Bedingungen', Setting.fontnormal],
    [
      'Wir können zwischen Wahr (True; trifft zu) und Falsch (False; trifft nicht zu) unterscheiden. Beispielsweise können wir überprüfen, ob Wasser voraus ist („ist Wasser voraus“).\nOb eine Bedingung zutrifft, zeigt der Roboter später durch Nicken oder Kopfschütteln an.\nDurch Bedingungen können wir Entscheidungen treffen und den Ablauf von Programmen steuern.',
      Setting.fontsmall,
    ],
    ['Negierung', Setting.fontnormal],
    [
      'Es ist in der Programmierung möglich, die Auswertung jeder Bedingung in das Gegenteil umzukehren (aus Wahr wird Falsch und aus Falsch wird Wahr). Man spricht hierbei von Negierung. Dies kann besonders sinnvoll sein, wenn man überprüfen will, ob etwas NICHT zutreffend ist. Zum Beispiel könnten wir für unseren Roboter überprüfen, ob kein Wasser voraus ist (NICHT „ist Wasser voraus“).',
      Setting.fontsmall,
    ],
  ],
  playerStartPosition: new THREE.Vector3(1, 0, 1),
  playerSuccessPosition: new THREE.Vector3(3, 0, 1),
  playerStartRotation: 0,
  gridDataTypes: [
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.earth, BlockType.earth, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.earth, BlockType.earth, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water],
  ],
  gridDataHeight: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  gridEntities: [
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(4, 0, 3),
      properties: { style: '01', type: 'Round' },
    },
  ],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Schleifen',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_drop',
          },
          {
            kind: 'block',
            type: 'controls_whileUntil',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Bedingungen',
        contents: [
          {
            kind: 'block',
            type: 'is_water',
          },
          {
            kind: 'block',
            type: 'has_star',
          },
          {
            kind: 'block',
            type: 'logic_negate',
          },
        ],
      },
    ],
  },
};

const ifCauses: Partial<Level> = {
  title: 'Verzweigungen',
  previewImageKey: 'verzweigungen',
  subtitle: 'Achtung, Sägen!',
  startText:
    'Jetzt wird es gefährlich... Ich sollte auf jeden Fall vermeiden die Säge zu berühren! Bedingungen können mir auch helfen, mich nur zu bewegen, FALLS nichts im Weg ist. Mit einem Nicken zeige ich dir an, ob die Bedingung zutrifft oder nicht.',
  endSuccessText:
    'Du hast es verstanden! Eine Bedingung gibt mir Auskunft über die Umgebung und mit Falls-Blöcken kann ich je nach Ergebnis der Bedingung auf die Umgebung reagieren. Fast geschafft, weiter gehts!',
  endFailText:
    'Kein Problem! Lass es uns einfach nochmal versuchen. In diesem Fall sollte ich solange gehen, BIS ich den Stern gesammelt habe. Währendessen ist es wichtig, immer wieder abzufragen, ob denn gerade eine Säge im Weg ist!',
  furtherInformationTexts: [
    ['Verzweigungen', Setting.fontnormal],
    [
      'Eine Verzweigung (auch Fallunterscheidung) ist eine Anweisung, bei der eine Bedingung überprüft wird. Für jeden Fall – WAHR/FALSCH - steht ein eigener Programm-Körper für mögliche Anweisungen zur Verfügung.\nDie Bedingung stellt so eine Abzweigung des Programmablaufs dar: „FALLS eine Bedingung zutrifft, MACHE etwas, SONST etwas anderes“. Das SONST kann dabei auch weggelassen werden.',
      Setting.fontsmall,
    ],
    ['Bedingungen', Setting.fontnormal],
    [
      'Wir können zwischen Wahr (True; trifft zu) und Falsch (False; trifft nicht zu) unterscheiden. Beispielsweise können wir überprüfen, ob Wasser voraus ist („ist Wasser voraus“).\nOb eine Bedingung zutrifft, zeigt der Roboter später durch Nicken oder Kopfschütteln an.\nDurch Bedingungen können wir Entscheidungen treffen und den Ablauf von Programmen steuern.',
      Setting.fontsmall,
    ],
    ['Negierung', Setting.fontnormal],
    [
      'Es ist in der Programmierung möglich, die Auswertung jeder Bedingung in das Gegenteil umzukehren (aus Wahr wird Falsch und aus Falsch wird Wahr). Man spricht hierbei von Negierung. Dies kann besonders sinnvoll sein, wenn man überprüfen will, ob etwas NICHT zutreffend ist. Zum Beispiel könnten wir für unseren Roboter überprüfen, ob kein Wasser voraus ist (NICHT „ist Wasser voraus“).',
      Setting.fontsmall,
    ],
  ],
  playerStartPosition: new THREE.Vector3(3, 0, 1),
  playerSuccessPosition: new THREE.Vector3(3, 0, 6),
  playerStartRotation: 0,
  gridDataTypes: [
    [null, null, BlockType.water, BlockType.water, BlockType.water, null, null],
    [BlockType.earth, null, BlockType.water, BlockType.earth, BlockType.water, null, BlockType.earth],
    [BlockType.earth, null, BlockType.water, BlockType.earth, BlockType.water, null, BlockType.earth],
    [null, null, BlockType.water, BlockType.earth, BlockType.water, null, null],
    [BlockType.earth, null, BlockType.water, BlockType.earth, BlockType.water, null, BlockType.earth],
    [BlockType.earth, null, BlockType.water, BlockType.earth, BlockType.water, null, BlockType.earth],
    [null, null, BlockType.water, BlockType.earth, BlockType.water, null, null],
    [null, null, BlockType.water, BlockType.water, BlockType.water, null, null],
  ],
  gridDataHeight: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  gridEntities: [
    {
      type: EntityType.tree,
      rotation: 66,
      position: new THREE.Vector3(6, 0, 2),
      properties: { style: '02', type: 'Tall' },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(6, 0, 1),
      properties: { style: '01', type: 'Blob' },
    },
    {
      type: EntityType.tree,
      rotation: 10,
      position: new THREE.Vector3(0, 0, 2),
      properties: { style: '01', type: 'Blob' },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(0, 0, 1),
      properties: { style: '03', type: 'Blob' },
    },
    {
      type: EntityType.mover,
      rotation: 90,
      position: new THREE.Vector3(0, 0, 2),
      properties: { target: new THREE.Vector3(3, 0, 2) },
    },
    {
      type: EntityType.tree,
      rotation: 10,
      position: new THREE.Vector3(0, 0, 5),
      properties: { style: '01', type: 'Tall' },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(0, 0, 4),
      properties: { style: '03', type: 'Tall' },
    },
    {
      type: EntityType.tree,
      rotation: 30,
      position: new THREE.Vector3(6, 0, 5),
      properties: { style: '02', type: 'Blob' },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(6, 0, 4),
      properties: { style: '01', type: 'Round', texture: 'Snow' },
    },
    {
      type: EntityType.mover,
      rotation: -90,
      position: new THREE.Vector3(6, 0, 5),
      properties: { target: new THREE.Vector3(3, 0, 5) },
    },
  ],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Schleifen',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_drop',
          },
          {
            kind: 'block',
            type: 'controls_whileUntil',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Verzweigungen',
        contents: [
          {
            kind: 'block',
            type: 'controls_if',
          },
          {
            kind: 'block',
            type: 'controls_ifelse',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Bedingungen',
        contents: [
          {
            kind: 'block',
            type: 'is_water',
          },
          {
            kind: 'block',
            type: 'is_object',
          },
          {
            kind: 'block',
            type: 'has_star',
          },
          {
            kind: 'block',
            type: 'logic_negate',
          },
        ],
      },
    ],
  },
};

const functionsRightturn: Partial<Level> = {
  title: 'Funktionen',
  subtitle: 'Die Rechtsdrehung',
  previewImageKey: 'funktionenII',
  maxInstructions: 10,
  startText:
    'Eigentlich können wir jetzt alles, oder? Aber das Drehen nach rechts ist immer noch ganz schön schwierig und aufwendig. Wenn ich mich noch öfter nach "rechts drehen" muss, dann wird das Programm immer länger und es ist gar nicht so einfach bei so vielen Wiederholungen keine Fehler zu machen... Wollen wir es mal mit einer Funktion dafür versuchen?',
  endSuccessText: 'Super, jetzt kann ich mich auch nach rechts drehen! Funktionen können explizite Wiederholungen reduzieren, indem Anweisungen zu einer neuen Anweisung zusammengefasst werden.',
  endFailText: 'Schade! Die Funktion "rechts drehen" sollte 3x "links drehen" beinhalten. Dann kannst du sie jedes Mal wiederverwenden, wenn ich mich nach "rechts drehen" soll. Auf ein Neues!',
  furtherInformationTexts: [
    ['Funktionen', Setting.fontnormal],
    [
      'Eine Funktion ist eine Art Unterprogramm, das eine neue Anweisung bildet und den Vorteil bietet, mehrfach wiederverwendet zu werden.\nWie ein Programm besteht eine Funktion aus einer Menge von Anweisungen und sollte idealerweise einen Lösungsweg bzw. Algorithmus beschreiben.',
      Setting.fontsmall,
    ],
    ['Anwendung', Setting.fontnormal],
    [
      'Funktionen können helfen Wiederholungen zu vermeiden, Fehlerquellen bei der Programmierung zu reduzieren und mehr Funktionalität mit weniger Code umzusetzen. Deshalb lohnt es sich Funktionen immer dann einzusetzen, wenn gleiche Anweisungen wiederholt programmiert werden oder eine neue logische Funktion bilden.\n\nBeispiel: Rechtsdrehen = 3x linksdrehen',
      Setting.fontsmall,
    ],
  ],
  playerStartPosition: new THREE.Vector3(3, 0, 1),
  playerSuccessPosition: new THREE.Vector3(2, 0, 3),
  playerStartRotation: 90,
  gridDataTypes: [
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.earth, BlockType.water, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.earth, BlockType.water, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.water],
    [BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water, BlockType.water],
  ],
  gridDataHeight: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  gridEntities: [
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(1, 0, 2),
      properties: { style: '03', type: 'Blob' },
    },
    {
      type: EntityType.fence,
      rotation: 0,
      position: new THREE.Vector3(2, 0, 2),
      properties: { style: '01', type: '01', direction: 'down' },
    },
    {
      type: EntityType.fence,
      rotation: 0,
      position: new THREE.Vector3(2, 0, 2),
      properties: { style: '01', type: '01' },
    },
    {
      type: EntityType.fence,
      rotation: 0,
      position: new THREE.Vector3(3, 0, 2),
      properties: { style: '01', type: '01' },
    },
    {
      type: EntityType.fence,
      rotation: 90,
      position: new THREE.Vector3(3, 0, 2),
      properties: { style: '01', type: '01', direction: 'down' },
    },
    {
      type: EntityType.fence,
      rotation: 90,
      position: new THREE.Vector3(3, 0, 3),
      properties: { style: '01', type: '01', direction: 'down' },
    },
    {
      type: EntityType.fence,
      rotation: 0,
      position: new THREE.Vector3(3, 0, 3),
      properties: { style: '01', type: '01', direction: 'down' },
    },
    {
      type: EntityType.fence,
      rotation: -90,
      position: new THREE.Vector3(3, 0, 3),
      properties: { style: '01', type: '01', direction: 'down' },
    },
  ],
  functionBlock: 'procedures_defnoreturn_right',
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        custom: 'procedures_defnoreturn_right',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Schleifen',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_drop',
          },
          {
            kind: 'block',
            type: 'controls_whileUntil',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Verzweigungen',
        contents: [
          {
            kind: 'block',
            type: 'controls_if',
          },
          {
            kind: 'block',
            type: 'controls_ifelse',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Bedingungen',
        contents: [
          {
            kind: 'block',
            type: 'is_water',
          },
          {
            kind: 'block',
            type: 'has_star',
          },
          {
            kind: 'block',
            type: 'logic_negate',
          },
        ],
      },
    ],
  },
};

const labyrinthI: Partial<Level> = {
  title: 'Labyrinth I',
  subtitle: 'Zeig was du gelernt hast!',
  previewImageKey: 'labyrinthI',
  startText: 'Schafft du es auch hier den Stern zu sammeln?',
  playerStartPosition: new THREE.Vector3(2, 0, 2),
  playerSuccessPosition: new THREE.Vector3(4, 0, 6),
  playerStartRotation: 0,
  gridDataTypes: [
    [null, null, null, BlockType.lava, BlockType.lava, BlockType.lava, null, null],
    [null, null, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, null],
    [null, BlockType.lava, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.lava, BlockType.lava],
    [BlockType.lava, BlockType.lava, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.lava, BlockType.lava],
    [BlockType.lava, BlockType.lava, BlockType.mud, BlockType.lava, BlockType.lava, BlockType.mud, BlockType.lava, BlockType.lava],
    [BlockType.lava, BlockType.lava, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.lava, BlockType.lava],
    [BlockType.lava, BlockType.lava, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.lava, BlockType.lava],
    [BlockType.lava, BlockType.lava, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.mud, BlockType.lava, BlockType.lava],
    [null, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, null],
    [null, null, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, null, null],
  ],
  gridDataHeight: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 1, 2, 3, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  gridEntities: [
    {
      type: EntityType.mover,
      rotation: 0,
      position: new THREE.Vector3(3, 0, 3),
      properties: { target: new THREE.Vector3(5, 0, 3) },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(2, 0, 3),
      properties: { style: '06', type: 'Round' },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(3, 0, 3),
      properties: { style: '07', type: 'Round' },
    },
    {
      type: EntityType.tree,
      rotation: 10,
      position: new THREE.Vector3(4, 0, 3),
      properties: { style: '05', type: 'Round' },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(2, 0, 5),
      properties: { style: '07', type: 'Round' },
    },
    {
      type: EntityType.tree,
      rotation: 45,
      position: new THREE.Vector3(5, 2, 7),
      properties: { style: '07', type: 'Round' },
    },
  ],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
          {
            kind: 'block',
            type: 'turn_right',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Bedingungen',
        contents: [
          {
            kind: 'block',
            type: 'is_water',
          },
          {
            kind: 'block',
            type: 'is_lava',
          },
          {
            kind: 'block',
            type: 'is_wall',
          },
          {
            kind: 'block',
            type: 'is_object',
          },
          {
            kind: 'block',
            type: 'is_star',
          },
          {
            kind: 'block',
            type: 'has_star',
          },
          {
            kind: 'block',
            type: 'logic_negate',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Verzweigungen',
        contents: [
          {
            kind: 'block',
            type: 'controls_if',
          },
          {
            kind: 'block',
            type: 'controls_ifelse',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Schleifen',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_drop',
          },
          {
            kind: 'block',
            type: 'controls_whileUntil',
          },
        ],
      },
    ],
  },
};

const labyrinthII: Partial<Level> = {
  title: 'Labyrinth II',
  subtitle: 'Soweit so gut ...',
  previewImageKey: 'labyrinthII',
  startText: 'Schafft du es auch hier den Stern zu sammeln?',
  playerStartPosition: new THREE.Vector3(1, 0, 1),
  playerSuccessPosition: new THREE.Vector3(5, 0, 5),
  playerStartRotation: 0,
  gridDataTypes: [
    [BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, null, null, null],
    [BlockType.lava, BlockType.earth, BlockType.lava, BlockType.lava, BlockType.lava, null, null],
    [BlockType.lava, BlockType.earth, BlockType.earth, BlockType.lava, BlockType.lava, BlockType.lava, null],
    [BlockType.lava, BlockType.earth, BlockType.earth, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava],
    [BlockType.lava, BlockType.lava, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.lava, BlockType.lava],
    [BlockType.lava, BlockType.earth, BlockType.lava, BlockType.earth, BlockType.earth, BlockType.earth, BlockType.lava],
    [BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava, BlockType.lava],
  ],
  gridDataHeight: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  gridEntities: [
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(1, 0, 5),
      properties: { style: '06', type: 'Round' },
    },
    {
      type: EntityType.tree,
      rotation: 66,
      position: new THREE.Vector3(2, 0, 2),
      properties: { style: '07', type: 'Round' },
    },
    {
      type: EntityType.tree,
      rotation: 0,
      position: new THREE.Vector3(4, 0, 4),
      properties: { style: '02', type: 'Blob' },
    },
  ],
  toolboxDefinition: {
    contents: [
      {
        kind: 'category',
        name: 'Bewegungen',
        contents: [
          {
            kind: 'block',
            type: 'move_forward',
          },
          {
            kind: 'block',
            type: 'turn_left',
          },
          {
            kind: 'block',
            type: 'turn_right',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Bedingungen',
        contents: [
          {
            kind: 'block',
            type: 'is_water',
          },
          {
            kind: 'block',
            type: 'is_lava',
          },
          {
            kind: 'block',
            type: 'is_wall',
          },
          {
            kind: 'block',
            type: 'is_object',
          },
          {
            kind: 'block',
            type: 'is_star',
          },
          {
            kind: 'block',
            type: 'has_star',
          },
          {
            kind: 'block',
            type: 'logic_negate',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Verzweigungen',
        contents: [
          {
            kind: 'block',
            type: 'controls_if',
          },
          {
            kind: 'block',
            type: 'controls_ifelse',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Schleifen',
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_drop',
          },
          {
            kind: 'block',
            type: 'controls_whileUntil',
          },
        ],
      },
    ],
  },
};

/**
 * The levels of the game. null is ignored when selected and shows a special end screen (.endscreen.ts) otherwise.
 */
export const levels: Partial<LevelBase>[] = [tutorialElements, instructionsLeftturn, loopsCounting, loopsNesting, loopsCausal, ifCauses, functionsRightturn, null, labyrinthI, labyrinthII];

/**
 * Initializes a game level.
 *
 * @param {GameScene} scene - The game scene.
 * @param {number} index - The index of the level to initialize.
 * @param {Player[]} activePlayers - The active players in the game.
 * @param {Function} [redoCallback] - A callback to be called when the level is restarted.
 * @param {Function} [nextCallback] - A callback to be called when the level is completed.
 * @param {Function} [backCallback] - A callback to be called when the previous level is loaded.
 * @param {boolean} [retry=false] - Whether the level is being retried.
 * @param {boolean} [showTitle=true] - Whether to show the level title and description automatically on initialization.
 * @param {boolean} [spawnMap=true] - Whether to spawn the map automatically on initialization.
 * @returns {LevelBase} The initialized level.
 */
export const initializeLevel = (scene: GameScene, index: number, activePlayers: Player[], redoCallback?, nextCallback?, backCallback?, retry = false, showTitle = true, spawnMap = true): LevelBase => {
  const levelData: Partial<LevelBase> = levels[index];
  let level: LevelBase;
  if (index === 7) {
    return new EndScreen(scene, activePlayers, nextCallback, backCallback);
  }
  if (index >= levels.length) {
    return new EndScreen(scene, activePlayers, null, backCallback);
  }
  if (levelData.isTutorial) {
    level = new Tutorial(scene, levelData, activePlayers, redoCallback, nextCallback, backCallback);
  } else {
    level = new Level(scene, levelData, activePlayers, retry, redoCallback, nextCallback, backCallback, showTitle, spawnMap);
  }
  return level;
};
