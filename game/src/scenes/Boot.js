import Phaser from 'phaser';
import { loadBest } from '../storage.js';
import { W, H } from '../layout.js';

// Генерирует все текстуры кодом, затем открывает меню.
export class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Корабль
    g.clear();
    g.fillStyle(0x5ef2ff, 1);
    g.fillTriangle(40, 0, 0, 88, 80, 88);
    g.fillStyle(0x1b2a6b, 1);
    g.fillTriangle(40, 26, 22, 70, 58, 70);
    g.fillStyle(0xff7ad9, 1);
    g.fillRect(14, 84, 14, 10); g.fillRect(52, 84, 14, 10);
    g.generateTexture('ship', 80, 96);

    // Метеорит
    g.clear();
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r = 42 + (i % 3 === 0 ? -8 : i % 2 ? 4 : -2);
      pts.push(new Phaser.Math.Vector2(48 + Math.cos(a) * r, 48 + Math.sin(a) * r));
    }
    g.fillStyle(0x8a5a44, 1); g.fillPoints(pts, true);
    g.fillStyle(0x5e3a2c, 1); g.fillCircle(34, 38, 9); g.fillCircle(60, 60, 12); g.fillCircle(62, 30, 6);
    g.lineStyle(4, 0xb07a5e, 1); g.strokePoints(pts, true);
    g.generateTexture('rock', 96, 96);

    // Звезда
    this.starTexture(g, 'star', 0xffe066, 64);
    this.starTexture(g, 'bonus', 0xff7ad9, 72);

    // Сердце
    g.clear(); g.fillStyle(0xff4d6d, 1);
    g.fillCircle(14, 14, 12); g.fillCircle(34, 14, 12); g.fillTriangle(3, 20, 45, 20, 24, 44);
    g.generateTexture('heart', 48, 48);

    // Частица
    g.clear(); g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 6);
    g.generateTexture('dot', 12, 12);

    g.destroy();
    loadBest().then(() => this.scene.start('Menu'));
  }

  starTexture(g, key, color, size) {
    g.clear();
    const c = size / 2, R = size / 2 - 2, r = R * 0.45, pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 ? r : R;
      pts.push(new Phaser.Math.Vector2(c + Math.cos(a) * rad, c + Math.sin(a) * rad));
    }
    g.fillStyle(color, 1); g.fillPoints(pts, true);
    g.fillStyle(0xffffff, 0.5); g.fillCircle(c - R * 0.15, c - R * 0.15, R * 0.18);
    g.generateTexture(key, size, size);
  }
}

// Общий звёздный фон с параллаксом
export function addStarfield(scene) {
  const layers = [];
  for (const [count, speed, alpha, scale] of [[60, 40, 0.35, 0.25], [35, 90, 0.6, 0.4], [15, 160, 0.9, 0.55]]) {
    for (let i = 0; i < count; i++) {
      const s = scene.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), 'dot')
        .setAlpha(alpha).setScale(scale).setDepth(-10).setScrollFactor(0);
      s.speed = speed;
      layers.push(s);
    }
  }
  scene.events.on('update', (_t, dt) => {
    const mul = scene.starSpeedMul || 1;
    for (const s of layers) {
      s.y += (s.speed * mul * dt) / 1000;
      if (s.y > H + 10) { s.y = -10; s.x = Phaser.Math.Between(0, W); }
    }
  });
}

export const FONT = { fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif', color: '#ffffff' };
