import Phaser from 'phaser';
import { addStarfield, FONT } from './Boot.js';
import { getBest } from '../storage.js';
import { sfx } from '../audio.js';
import { DY, SAFE_TOP } from '../layout.js';

export class Menu extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    addStarfield(this);
    this.cameras.main.setScroll(0, -DY);
    this.add.text(360, 300, 'ЗВЕЗДОПАД', { ...FONT, fontSize: '96px', fontStyle: '900', color: '#ffe066' })
      .setOrigin(0.5).setShadow(0, 6, '#ff7ad9', 0, true, true);
    this.add.text(360, 400, 'Лови звёзды — уклоняйся от метеоритов', { ...FONT, fontSize: '30px', color: '#b8c4ff' }).setOrigin(0.5);

    const ship = this.add.image(360, 640, 'ship').setScale(1.6);
    this.tweens.add({ targets: ship, y: 610, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    const btn = this.add.rectangle(360, 880, 420, 120, 0xff7ad9).setInteractive({ useHandCursor: true });
    btn.setStrokeStyle(6, 0xffffff, 0.8);
    this.add.text(360, 880, 'ИГРАТЬ', { ...FONT, fontSize: '56px', fontStyle: '800' }).setOrigin(0.5);
    this.tweens.add({ targets: btn, scale: 1.05, duration: 700, yoyo: true, repeat: -1 });

    this.add.text(360, 1010, `Рекорд: ${getBest()}`, { ...FONT, fontSize: '40px', color: '#5ef2ff' }).setOrigin(0.5);
    this.add.text(360, 1180, 'Веди палец по экрану, чтобы управлять кораблём', { ...FONT, fontSize: '24px', color: '#7f8bc4' }).setOrigin(0.5);

    const mute = this.add.text(660, 60 + SAFE_TOP, sfx.isMuted() ? '🔇' : '🔊', { fontSize: '48px' }).setOrigin(0.5).setScrollFactor(0).setInteractive();
    mute.on('pointerdown', (p, x, y, e) => { e.stopPropagation(); sfx.toggleMute(); mute.setText(sfx.isMuted() ? '🔇' : '🔊'); });

    btn.on('pointerdown', () => { sfx.unlock(); sfx.click(); this.scene.start('Play'); });
  }
}
