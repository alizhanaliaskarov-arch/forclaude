// Обложки YouTube (три варианта из publish.md). Рисуются тем же движком, что и фильм.
import {W, H, P, C, rgba, vgrad, rgrad, glow, makeCanvas} from './core.js';
import {TEMPLATES} from './shots/index.js';
import {miraPortrait} from './characters.js';
import {drawCity} from './shots/city.js';

P.scale = 1;
const canvas = document.getElementById('c');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');

function title(lines, x, y, size, align = 'left') {
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  lines.forEach(([text, color], i) => {
    ctx.font = `800 ${size}px 'Unbounded'`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = 'rgba(8,12,20,0.85)';
    ctx.strokeText(text, x, y + i * size * 1.1);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y + i * size * 1.1);
  });
  ctx.restore();
}
const shot = (tpl, t, p = {}) => {
  ctx.save();
  TEMPLATES[tpl](ctx, t, 10, p, {}, {id: 'thumb', tpl});
  ctx.restore();
};

const THUMBS = {
  // 1. «ОНА УВИДИТ 2126» — Мира смотрит в камеру, рыжий шарф — самое яркое пятно
  she() {
    const [bc, bg] = makeCanvas(W, H);
    bg.filter = 'blur(14px)';
    drawCity(bg, 0, {}, 'golden', {z: 1.4, fx: 1300, fy: 600}, 1);
    ctx.drawImage(bc, 0, 0, W, H);
    glow(ctx, 1500, 380, 700, '#FFC27A', 0.35);
    miraPortrait(ctx, 1360, 470, 350, {t: 4, smile: 0.7});
    const g = ctx.createLinearGradient(0, 0, W * 0.6, 0);
    g.addColorStop(0, 'rgba(6,10,18,0.75)');
    g.addColorStop(1, 'rgba(6,10,18,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    title([['ОНА', '#FFFFFF'], ['УВИДИТ', '#FFFFFF'], ['2126', C.amber]], 90, 360, 150);
  },
  // 2. «ЧЕРЕЗ 100 ЛЕТ» — 1926 и 2126 по диагонали
  hundred() {
    const [c1, g1] = makeCanvas(W, H);
    TEMPLATES.goddard(g1, 2, 6, {phase: 'field'}, {}, {});
    shot('cityFly', 6, {stage: 1});
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W * 0.52, 0);
    ctx.lineTo(W * 0.38, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(c1, 0, 0, W, H);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#FFE2A8';
    ctx.lineWidth = 10;
    ctx.shadowColor = C.amber;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.moveTo(W * 0.52, 0);
    ctx.lineTo(W * 0.38, H);
    ctx.stroke();
    ctx.restore();
    title([['1926', '#E6E1D6']], 80, 170, 110);
    title([['2126', C.amberLight]], W - 80, 170, 110, 'right');
    title([['ЧЕРЕЗ 100 ЛЕТ', '#FFFFFF']], W / 2, H - 110, 140, 'center');
  },
  // 3. «3 БУДУЩИХ» — развилка реки в цветах сценариев
  three() {
    shot('riverFork', 8.6, {mode: 'reveal'});
    ctx.fillStyle = vgrad(ctx, 0, H * 0.55, H, [[0, 'rgba(6,10,18,0)'], [1, 'rgba(6,10,18,0.75)']]);
    ctx.fillRect(0, H * 0.55, W, H * 0.45);
    ctx.save();
    ctx.font = "800 380px 'Unbounded'";
    ctx.lineWidth = 50;
    ctx.strokeStyle = 'rgba(8,12,20,0.85)';
    ctx.lineJoin = 'round';
    ctx.strokeText('3', 90, 1000);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('3', 90, 1000);
    ctx.restore();
    title([['БУДУЩИХ', '#FFFFFF']], 420, 1000, 150);
  },
};

async function init() {
  const fams = [['Unbounded', [600, 700, 800]], ['Manrope', [500, 600, 700, 800]]];
  await Promise.all(fams.flatMap(([f, ws]) => ws.flatMap((w) => [document.fonts.load(`${w} 40px '${f}'`, 'ЁАБВгде'), document.fonts.load(`${w} 40px '${f}'`, '0123456789AZ')])));
  window.thumb = (name) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    THUMBS[name]();
    return canvas.toDataURL('image/png').split(',')[1];
  };
  window.READY = true;
}
init();
