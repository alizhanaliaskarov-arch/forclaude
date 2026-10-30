// Движок: по номеру кадра рисует нужный план, переходы между планами и графику поверх.
import {W, H, P, clamp, makeCanvas} from './core.js';
import {SHOTS, TOTAL} from './timeline.js';
import {TEMPLATES} from './shots/index.js';
import {drawOverlays} from './ui.js';

const q = new URLSearchParams(location.search);
P.scale = Number(q.get('scale') || 2);
P.fps = Number(q.get('fps') || 30);
const WITH_SUBS = q.get('subs') === '1';

const canvas = document.getElementById('c');
canvas.width = Math.round(W * P.scale);
canvas.height = Math.round(H * P.scale);
const ctx = canvas.getContext('2d');
let buf = null; // второй слой для растворений
const caches = new Map();
let subs = null;

const HALF = {dis: 0.6, black: 0.45, white: 0.25};

function drawShot(g, i, t) {
  const s = SHOTS[i];
  if (!s) return;
  if (!caches.has(i)) caches.set(i, {});
  const fn = TEMPLATES[s.tpl] || TEMPLATES.todo;
  g.save();
  fn(g, Math.max(0, t), s.dur, s.p || {}, caches.get(i), s); // входящий план на растворении не уходит в отрицательное время
  g.restore();
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.filter = 'none';
}
function reset(g) {
  g.setTransform(P.scale, 0, 0, P.scale, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.filter = 'none';
}

export function renderFrame(n) {
  const T = Math.min(n / P.fps, TOTAL - 1e-6);
  let k = SHOTS.findIndex((s) => T >= s.start && T < s.end);
  if (k < 0) k = SHOTS.length - 1;
  const s = SHOTS[k], next = SHOTS[k + 1];
  reset(ctx);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // базовый план и растворения
  let base = k, over = -1, overA = 0;
  if (s.tr === 'dis' && T < s.start + HALF.dis && k > 0) {
    base = k - 1;
    over = k;
    overA = 0.5 + (T - s.start) / (2 * HALF.dis);
  } else if (next && next.tr === 'dis' && T > s.end - HALF.dis) {
    over = k + 1;
    overA = 0.5 - (s.end - T) / (2 * HALF.dis);
  }
  drawShot(ctx, base, T - SHOTS[base].start);
  reset(ctx);
  if (over >= 0) {
    if (!buf) buf = makeCanvas(W, H);
    const [bc, bg] = buf;
    reset(bg);
    bg.fillStyle = '#000';
    bg.fillRect(0, 0, W, H);
    drawShot(bg, over, T - SHOTS[over].start);
    reset(ctx);
    ctx.globalAlpha = clamp(overA);
    ctx.drawImage(bc, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  // через чёрное / вспышка
  const dip = (kind, color) => {
    const h = HALF[kind];
    let a = 0;
    if (s.tr === kind && T < s.start + h) a = 1 - (T - s.start) / h;
    if (next && next.tr === kind && T > s.end - h) a = Math.max(a, 1 - (s.end - T) / h);
    if (a > 0) {
      ctx.fillStyle = color;
      ctx.globalAlpha = clamp(a);
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  };
  dip('black', '#000');
  dip('white', '#FFF8EC');
  if (n === 0) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
  }
  drawOverlays(ctx, T, s, subs);
  // финальное затемнение
  if (T > TOTAL - 0.8) {
    ctx.fillStyle = '#000';
    ctx.globalAlpha = clamp((T - (TOTAL - 0.8)) / 0.8);
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  // освобождаем кэш планов, которые уже не понадобятся
  for (const key of caches.keys()) if (key < k - 1 || key > k + 1) caches.delete(key);
}

async function init() {
  const fams = [['Unbounded', [600, 700, 800]], ['Manrope', [500, 600, 700, 800]]];
  await Promise.all(fams.flatMap(([f, ws]) => ws.flatMap((w) => [document.fonts.load(`${w} 40px '${f}'`, 'ЁАБВгде'), document.fonts.load(`${w} 40px '${f}'`, '0123456789AZ')])));
  if (WITH_SUBS) {
    try {
      subs = await (await fetch('voice-timing.json')).json();
    } catch (e) {
      subs = null;
    }
  }
  window.TOTAL = TOTAL;
  window.frame = (n, type = 'jpeg', quality = 0.93) => {
    renderFrame(n);
    return canvas.toDataURL(`image/${type}`, quality).split(',')[1];
  };
  window.READY = true;
}
init();
