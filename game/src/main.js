import Phaser from 'phaser';
import { W, H } from './layout.js';
import { Boot } from './scenes/Boot.js';
import { Menu } from './scenes/Menu.js';
import { Play } from './scenes/Play.js';
import { GameOver } from './scenes/GameOver.js';

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0e2a',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
  physics: { default: 'arcade', arcade: { debug: false } },
  input: { activePointers: 2 },
  scene: [Boot, Menu, Play, GameOver],
});
