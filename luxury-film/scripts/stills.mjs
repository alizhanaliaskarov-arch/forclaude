// usage: node scripts/stills.mjs <composition> <outDir> frame frame ...   (bundle once, reuse the browser)
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [id, out, ...fr] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const browser = await openBrowser('chrome', {
  browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  chromiumOptions: {gl: 'swangle'},
});
const comp = await selectComposition({serveUrl, id, puppeteerInstance: browser});
for (const f of fr) {
  const t0 = Date.now();
  await renderStill({composition: comp, serveUrl, frame: +f, puppeteerInstance: browser, scale: 0.5, output: path.join(out, `f${String(f).padStart(4, '0')}.png`)});
  console.log('frame', f, Date.now() - t0, 'ms');
}
await browser.close({silent: true});
