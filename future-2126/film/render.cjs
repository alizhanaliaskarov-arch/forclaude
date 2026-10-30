// Рендер фильма: Chromium (Playwright) рисует кадры на canvas, ffmpeg кодирует их в видео.
// Несколько вкладок рендерят свои отрезки параллельно, потом отрезки склеиваются без перекодирования.
//
//   node render.cjs --out=../out/video.mp4 [--scale=2] [--fps=30] [--from=0] [--to=900]
//                   [--workers=3] [--crf=16] [--preset=medium] [--subs=0]
//
// scale=2 → 3840×2160, scale=1 → 1920×1080.
const {chromium} = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

const ROOT = __dirname;
const A = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const scale = Number(A.scale || 2), fps = Number(A.fps || 30);
const from = Number(A.from || 0), to = Number(A.to || 900);
const workers = Number(A.workers || 3), crf = A.crf || '16', preset = A.preset || 'medium';
const out = path.resolve(A.out || path.join(ROOT, '..', 'build', 'video.mp4'));
const subs = A.subs === '1' ? 1 : 0;

const MIME = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png'};
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        rsp.writeHead(404);
        return rsp.end();
      }
      rsp.writeHead(200, {'Content-Type': MIME[path.extname(p)] || 'application/octet-stream'});
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  const srv = await serve();
  const url = `http://127.0.0.1:${srv.address().port}/index.html?scale=${scale}&fps=${fps}&subs=${subs}`;
  const browser = await chromium.launch();
  const f0 = Math.round(from * fps), f1 = Math.round(to * fps), N = f1 - f0;
  const segDir = path.join(path.dirname(out), `seg_${path.basename(out, '.mp4')}`);
  fs.mkdirSync(segDir, {recursive: true});
  let done = 0;
  const t0 = Date.now();
  let lastPct = -1;
  const report = () => {
    const pct = Math.floor((done / N) * 100);
    if (pct !== lastPct && (pct % 2 === 0 || done === N)) {
      lastPct = pct;
      const el = (Date.now() - t0) / 1000, rate = done / el;
      console.log(`${pct}%  ${done}/${N} кадров  ${rate.toFixed(1)} к/с  осталось ~${Math.round((N - done) / Math.max(rate, 0.01) / 60)} мин`);
    }
  };
  const segs = [];
  const jobs = Array.from({length: workers}, (_, w) => {
    const a = f0 + Math.floor((N * w) / workers), b = f0 + Math.floor((N * (w + 1)) / workers);
    const seg = path.join(segDir, `part${w}.mp4`);
    segs.push(seg);
    return (async () => {
      const page = await browser.newPage();
      page.on('pageerror', (e) => {
        console.error('ОШИБКА СТРАНИЦЫ:', e.message);
        process.exit(2);
      });
      await page.goto(url);
      await page.waitForFunction(() => window.READY === true, null, {timeout: 120000});
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
        '-c:v', 'libx264', '-preset', preset, '-crf', String(crf), '-pix_fmt', 'yuv420p', '-g', String(fps * 2),
        '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-r', String(fps), seg], {stdio: ['pipe', 'inherit', 'inherit']});
      const closed = new Promise((r) => ff.on('close', r));
      for (let n = a; n < b; n++) {
        const b64 = await page.evaluate((k) => window.frame(k), n);
        if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
        done++;
        report();
      }
      ff.stdin.end();
      const code = await closed;
      if (code !== 0) throw new Error(`ffmpeg завершился с кодом ${code}`);
      await page.close();
    })();
  });
  await Promise.all(jobs);
  await browser.close();
  srv.close();
  const list = path.join(segDir, 'list.txt');
  fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
  await new Promise((r, j) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], {stdio: 'inherit'}).on('close', (c) => (c ? j(new Error('concat')) : r())));
  console.log(`готово: ${out}  (${((Date.now() - t0) / 60000).toFixed(1)} мин)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
