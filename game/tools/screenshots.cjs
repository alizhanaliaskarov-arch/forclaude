// Скриншоты для Google Play (1080x1920). Нужен запущенный `npm run preview` на :4173
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
  const out = n => path.join(__dirname, '../store', n);
  await p.goto('http://localhost:4173/'); await p.waitForTimeout(1500);
  await p.screenshot({ path: out('screen-1-menu.png') });
  await p.touchscreen.tap(270, 660); await p.waitForTimeout(100);
  await p.evaluate(() => { game.scene.getScene('Play').invulnerable = true; });
  for (let i = 0; i < 40; i++) { await p.touchscreen.tap(80 + (i * 97) % 380, 820); await p.waitForTimeout(120); }
  await p.screenshot({ path: out('screen-2-play.png') });
  await p.evaluate(() => { const s = game.scene.getScene('Play'); s.lives = 1; s.invulnerable = false; s.ship.setAlpha(1); s.score = Math.max(s.score, 87); s.onHit(s.ship, s.rocks.create(0, 0, 'rock')); });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: out('screen-3-gameover.png') });
  await b.close();
})();
