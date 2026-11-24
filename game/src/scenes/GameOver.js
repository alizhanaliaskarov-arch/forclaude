import Phaser from 'phaser';
import { addStarfield, FONT } from './Boot.js';
import { sfx } from '../audio.js';

export class GameOver extends Phaser.Scene {
  constructor() { super('GameOver'); }

  create({ score = 0, best = 0, record = false }) {
    addStarfield(this);
    this.add.text(360, 320, 'ИГРА ОКОНЧЕНА', { ...FONT, fontSize: '72px', fontStyle: '900', color: '#ff4d6d' }).setOrigin(0.5);
    this.add.text(360, 480, `${score}`, { ...FONT, fontSize: '160px', fontStyle: '900', color: '#ffe066' }).setOrigin(0.5);
    this.add.text(360, 590, 'очков', { ...FONT, fontSize: '36px', color: '#b8c4ff' }).setOrigin(0.5);

    if (record) {
      const r = this.add.text(360, 680, '★ НОВЫЙ РЕКОРД! ★', { ...FONT, fontSize: '48px', fontStyle: '800', color: '#ff7ad9' }).setOrigin(0.5);
      this.tweens.add({ targets: r, scale: 1.12, duration: 500, yoyo: true, repeat: -1 });
    } else {
      this.add.text(360, 680, `Рекорд: ${best}`, { ...FONT, fontSize: '40px', color: '#5ef2ff' }).setOrigin(0.5);
    }

    const again = this.add.rectangle(360, 880, 460, 120, 0xff7ad9).setInteractive({ useHandCursor: true }).setStrokeStyle(6, 0xffffff, 0.8);
    this.add.text(360, 880, 'ЕЩЁ РАЗ', { ...FONT, fontSize: '56px', fontStyle: '800' }).setOrigin(0.5);
    const menu = this.add.rectangle(360, 1030, 460, 100, 0x2a3480).setInteractive({ useHandCursor: true });
    this.add.text(360, 1030, 'В меню', { ...FONT, fontSize: '42px' }).setOrigin(0.5);

    // Небольшая задержка, чтобы случайный тап не перезапустил игру сразу
    this.time.delayedCall(500, () => {
      again.on('pointerdown', () => { sfx.click(); this.scene.start('Play'); });
      menu.on('pointerdown', () => { sfx.click(); this.scene.start('Menu'); });
    });
  }
}
