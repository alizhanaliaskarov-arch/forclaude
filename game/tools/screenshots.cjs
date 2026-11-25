// Скриншоты для Google Play (1080x1920) и App Store (1320x2868, iPhone 6.9").
// Нужен запущенный `npx vite preview --port 4173`
const { chromium } = require('playwright'); const path = require('path');
const PROFILES = [
  { dir: 'store', w: 540, h: 960, dpr: 2 },          // Google Play: 1080x1920
  { dir: 'store/appstore', w: 440, h: 956, dpr: 3 }, // App Store: 1320x2868
];
async function run(b, { dir, w, h, dpr }) {
  require('fs').mkdirSync(path.join(__dirname, '..', dir), { recursive: true });
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: true, isMobile: true })).newPage();
  const out = n => path.join(__dirname, '..', dir, n);
  // координаты игры (720x1280) → координаты экрана (режим FIT, по центру)
  const k = Math.min(w / 720, h / 1280), ox = (w - 720 * k) / 2, oy = (h - 1280 * k) / 2;
  const at = (x, y) => [ox + x * k, oy + y * k];
  await p.goto('http://localhost:4173/'); await p.waitForTimeout(1500);
  await p.screenshot({ path: out('screen-1-menu.png') });
  await p.touchscreen.tap(...at(360, 880)); await p.waitForTimeout(100);
  await p.evaluate(() => { game.scene.getScene('Play').invulnerable = true; });
  for (let i = 0; i < 40; i++) { await p.touchscreen.tap(...at(100 + (i * 137) % 520, 1100)); await p.waitForTimeout(120); }
  await p.screenshot({ path: out('screen-2-play.png') });
  await p.evaluate(() => { const s = game.scene.getScene('Play'); s.lives = 1; s.invulnerable = false; s.ship.setAlpha(1); s.score = Math.max(s.score, 87); s.onHit(s.ship, s.rocks.create(0, 0, 'rock')); });
  await p.waitForTimeout(2000);
  await p.screenshot({ path: out('screen-3-gameover.png') });
  await p.context().close();
}
(async () => {
  const b = await chromium.launch();
  for (const prof of PROFILES) await run(b, prof);
  await b.close();
})();
