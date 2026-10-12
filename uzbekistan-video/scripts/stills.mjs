// usage: node scripts/stills.mjs outDir frame frame ...   (bundle once, reuse browser)
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const [out, ...fr] = process.argv.slice(2);
fs.mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), onProgress: () => {}});
const browser = await openBrowser('chrome', {
  browserExecutable: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  chromiumOptions: {gl: 'swangle'},
});
const comp = await selectComposition({serveUrl, id: 'Uzbekistan', puppeteerInstance: browser});
for (const f of fr) {
  await renderStill({
    composition: comp, serveUrl, frame: +f, puppeteerInstance: browser, scale: 0.5,
    output: path.join(out, `f${String(f).padStart(4, '0')}.png`),
  });
}
await browser.close({silent: true});
console.log('done', fr.length);
