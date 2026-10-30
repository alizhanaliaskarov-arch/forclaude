// Прогон всего фильма в низком разрешении: ищем ошибки в любом кадре (1 кадр в секунду).
const {chromium} = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
(async () => {
  const srv = http.createServer((q, r) => {
    const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, {'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.html') ? 'text/html' : 'application/octet-stream'});
    fs.createReadStream(p).pipe(r);
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(), page = await b.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/index.html?scale=0.25&fps=30`);
  await page.waitForFunction(() => window.READY === true, null, {timeout: 60000});
  const step = Number(process.argv[2] || 30);
  const t0 = Date.now();
  for (let n = 0; n < 900 * 30; n += step) {
    try { await page.evaluate((k) => window.frame(k).length, n); }
    catch (e) { errs.push(`кадр ${n} (${(n / 30).toFixed(1)} с): ${e.message.split('\n')[0]}`); }
    if (errs.length > 10) break;
  }
  console.log(`проверено за ${((Date.now() - t0) / 1000).toFixed(0)} с; ошибок: ${errs.length}`);
  errs.slice(0, 10).forEach((e) => console.log(' -', e));
  await b.close(); srv.close();
})();
