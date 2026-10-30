// node scripts/stills.mjs out/stills <seconds...>  -> PNG stills for checking
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, ...secs] = process.argv.slice(2);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const composition = await selectComposition({serveUrl, id: 'HealthyFood', browserExecutable});
for (const s of secs) {
  const frame = Math.round(Number(s) * 30);
  await renderStill({serveUrl, composition, frame, output: path.join(outDir, `t${String(s).padStart(5, '0')}.png`), browserExecutable, imageFormat: 'png'});
  console.log('ok', s);
}
