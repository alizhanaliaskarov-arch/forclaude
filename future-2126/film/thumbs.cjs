// Обложки YouTube: node thumbs.cjs → ../thumbnails/*.jpg (1280×720)
const {chromium} = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const ROOT = __dirname, OUT = path.join(ROOT, '..', 'thumbnails');
const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2'};
(async () => {
  fs.mkdirSync(OUT, {recursive: true});
  const srv = http.createServer((q, r) => {
    const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, {'Content-Type': MIME[path.extname(p)] || 'application/octet-stream'});
    fs.createReadStream(p).pipe(r);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(), page = await b.newPage();
  page.on('pageerror', (e) => console.error('ОШИБКА:', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/thumbs.html`);
  await page.waitForFunction(() => window.READY === true, null, {timeout: 60000});
  for (const [name, file] of [['she', '1_ona-uvidit-2126'], ['hundred', '2_cherez-100-let'], ['three', '3_tri-budushchih']]) {
    const png = path.join(OUT, `${file}.png`);
    fs.writeFileSync(png, Buffer.from(await page.evaluate((n) => window.thumb(n), name), 'base64'));
    const jpg = png.replace('.png', '.jpg');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '2', jpg]);
    fs.unlinkSync(png);
    console.log(jpg, Math.round(fs.statSync(jpg).size / 1024), 'КБ');
  }
  await b.close();
  srv.close();
})();
