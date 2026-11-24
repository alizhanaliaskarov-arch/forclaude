import Phaser from 'phaser';
import { addStarfield, FONT } from './Boot.js';
import { getBest, saveBest } from '../storage.js';
import { sfx } from '../audio.js';

const W = 720, H = 1280, SHIP_Y = 1100;

export class Play extends Phaser.Scene {
  constructor() { super('Play'); }

  create() {
    this.score = 0;
    this.lives = 3;
    this.elapsed = 0;
    this.combo = 0;
    this.invulnerable = false;
    this.over = false;
    this.starSpeedMul = 1;
    this.targetX = W / 2;
    addStarfield(this);

    // Корабль и шлейф двигателя
    this.trail = this.add.particles(0, 0, 'dot', {
      speedY: { min: 200, max: 320 }, speedX: { min: -30, max: 30 }, lifespan: 380,
      scale: { start: 0.9, end: 0 }, tint: [0xff7ad9, 0x5ef2ff], blendMode: 'ADD', frequency: 25,
    });
    this.ship = this.physics.add.image(W / 2, SHIP_Y, 'ship');
    this.ship.body.setSize(44, 60).setOffset(18, 24);
    this.trail.startFollow(this.ship, 0, 46);

    this.rocks = this.physics.add.group();
    this.stars = this.physics.add.group();
    this.physics.add.overlap(this.ship, this.rocks, this.onHit, null, this);
    this.physics.add.overlap(this.ship, this.stars, this.onStar, null, this);

    this.burst = this.add.particles(0, 0, 'dot', {
      speed: { min: 120, max: 380 }, lifespan: 500, scale: { start: 0.8, end: 0 }, blendMode: 'ADD', emitting: false,
    });

    // HUD
    this.scoreText = this.add.text(30, 30, '0', { ...FONT, fontSize: '64px', fontStyle: '900' }).setDepth(10);
    this.bestText = this.add.text(32, 104, `Рекорд: ${getBest()}`, { ...FONT, fontSize: '26px', color: '#7f8bc4' }).setDepth(10);
    this.hearts = [0, 1, 2].map(i => this.add.image(W - 50 - i * 58, 62, 'heart').setDepth(10));
    this.comboText = this.add.text(W / 2, 200, '', { ...FONT, fontSize: '44px', fontStyle: '800', color: '#ffe066' }).setOrigin(0.5).setDepth(10);

    // Управление: палец/мышь, а также стрелки на ПК
    this.input.on('pointerdown', p => { this.targetX = p.x; });
    this.input.on('pointermove', p => { if (p.isDown) this.targetX = p.x; });
    this.cursors = this.input.keyboard?.createCursorKeys();

    this.spawnRock = this.time.addEvent({ delay: 900, loop: true, callback: () => this.spawn('rock') });
    this.spawnStar = this.time.addEvent({ delay: 1100, loop: true, callback: () => this.spawn('star') });

    // Пауза, когда приложение уходит в фон
    this.onVis = () => { if (document.hidden) this.scene.pause(); else this.scene.resume(); };
    document.addEventListener('visibilitychange', this.onVis);
    this.events.once('shutdown', () => document.removeEventListener('visibilitychange', this.onVis));
  }

  speed() { return 320 + Math.min(this.elapsed / 1000, 120) * 6; }

  spawn(kind) {
    if (this.over) return;
    const x = Phaser.Math.Between(50, W - 50);
    if (kind === 'rock') {
      const r = this.rocks.create(x, -60, 'rock');
      const s = Phaser.Math.FloatBetween(0.6, 1.25);
      r.setScale(s).setAngularVelocity(Phaser.Math.Between(-120, 120));
      r.body.setCircle(36, 12, 12);
      r.setVelocity(Phaser.Math.Between(-40, 40), this.speed() * Phaser.Math.FloatBetween(0.85, 1.2));
    } else {
      const isBonus = Math.random() < 0.12;
      const st = this.stars.create(x, -50, isBonus ? 'bonus' : 'star');
      st.isBonus = isBonus;
      st.setAngularVelocity(90).setVelocityY(this.speed() * 0.8);
      st.body.setCircle(isBonus ? 30 : 26, 6, 6);
      this.tweens.add({ targets: st, scale: 1.15, duration: 300, yoyo: true, repeat: -1 });
    }
  }

  onStar(_ship, st) {
    const pts = st.isBonus ? 5 : 1;
    this.combo++;
    const mult = 1 + Math.floor(this.combo / 10);
    this.addScore(pts * mult);
    this.burst.setParticleTint(st.isBonus ? 0xff7ad9 : 0xffe066);
    this.burst.explode(st.isBonus ? 24 : 12, st.x, st.y);
    st.isBonus ? sfx.bonus() : sfx.star();
    if (mult > 1 && this.combo % 10 === 0) this.flashCombo(`Комбо ×${mult}!`);
    st.destroy();
  }

  onHit(_ship, rock) {
    if (this.invulnerable || this.over) return;
    this.burst.setParticleTint(0xff9f43);
    this.burst.explode(30, rock.x, rock.y);
    rock.destroy();
    sfx.hit();
    navigator.vibrate?.(120);
    this.cameras.main.shake(250, 0.012);
    this.combo = 0;
    this.lives--;
    this.hearts[this.lives]?.setVisible(false);
    if (this.lives <= 0) return this.gameOver();
    this.invulnerable = true;
    this.tweens.add({ targets: this.ship, alpha: 0.25, duration: 120, yoyo: true, repeat: 6,
      onComplete: () => { this.ship.setAlpha(1); this.invulnerable = false; } });
  }

  addScore(n) {
    this.score += n;
    this.scoreText.setText(this.score);
    this.tweens.add({ targets: this.scoreText, scale: 1.15, duration: 80, yoyo: true });
  }

  flashCombo(text) {
    this.comboText.setText(text).setAlpha(1).setScale(0.6);
    this.tweens.add({ targets: this.comboText, scale: 1, duration: 200, ease: 'Back.out' });
    this.tweens.add({ targets: this.comboText, alpha: 0, delay: 900, duration: 400 });
  }

  async gameOver() {
    this.over = true;
    this.ship.setVisible(false);
    this.trail.stop();
    this.burst.setParticleTint(0x5ef2ff);
    this.burst.explode(50, this.ship.x, this.ship.y);
    this.physics.pause();
    sfx.over();
    const record = await saveBest(this.score);
    this.time.delayedCall(1100, () => this.scene.start('GameOver', { score: this.score, best: getBest(), record }));
  }

  update(_t, dt) {
    if (this.over) return;
    this.elapsed += dt;
    this.starSpeedMul = this.speed() / 320;

    // Сложность растёт со временем
    this.spawnRock.delay = Math.max(320, 900 - this.elapsed / 60);
    this.spawnStar.delay = Math.max(600, 1100 - this.elapsed / 120);

    if (this.cursors?.left.isDown) this.targetX -= 0.9 * dt;
    if (this.cursors?.right.isDown) this.targetX += 0.9 * dt;
    this.targetX = Phaser.Math.Clamp(this.targetX, 40, W - 40);
    const dx = this.targetX - this.ship.x;
    this.ship.x += dx * Math.min(1, dt / 70);
    this.ship.rotation = Phaser.Math.Clamp(dx / 400, -0.35, 0.35);

    for (const grp of [this.rocks, this.stars]) {
      grp.children.each(o => { if (o.y > H + 80) { if (grp === this.stars) this.combo = 0; o.destroy(); } });
    }
  }
}
