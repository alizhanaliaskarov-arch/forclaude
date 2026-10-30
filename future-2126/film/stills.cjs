// Стоп-кадры для проверки: node stills.cjs <папка> <масштаб> <время|кадр@секунда> ...
// Примеры:  node stills.cjs ../build/stills 0.5 12.5 S08-3@4 S10-4@2.5
const {chromium} = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const [dir, scaleArg, ...times] = process.argv.slice(2);
const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2'};

(async () => {
  fs.mkdirSync(dir, {recursive: true});
  const srv = http.createServer((req, rsp) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      rsp.writeHead(404);
      return rsp.end();
    }
    rsp.writeHead(200, {'Content-Type': MIME[path.extname(p)] || 'application/octet-stream'});
    fs.createReadStream(p).pipe(rsp);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('ОШИБКА СТРАНИЦЫ:', e.message));
  page.on('requestfailed', (r) => console.error('не загрузилось:', r.url()));
  page.on('console', (m) => m.type() === 'error' && console.error('console:', m.text()));
  await page.goto(`http://127.0.0.1:${srv.address().port}/index.html?scale=${scaleArg || 0.5}&fps=30`);
  await page.waitForFunction(() => window.READY === true, null, {timeout: 60000});
  const starts = await page.evaluate(async () => (await import('./src/timeline.js')).SHOTS.map((s) => [s.id, s.start]));
  const map = Object.fromEntries(starts);
  for (const t of times) {
    let sec = Number(t);
    if (t.includes('@')) {
      const [id, off] = t.split('@');
      sec = map[id] + Number(off);
    }
    const t1 = Date.now();
    const b64 = await page.evaluate((n) => window.frame(n, 'png'), Math.round(sec * 30));
    const f = path.join(dir, `${t.replace('@', '_')}.png`);
    fs.writeFileSync(f, Buffer.from(b64, 'base64'));
    console.log(f, `${Date.now() - t1} мс`);
  }
  await browser.close();
  srv.close();
})();
