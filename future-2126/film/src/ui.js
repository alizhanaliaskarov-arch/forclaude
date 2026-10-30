// Графика поверх кадров: счётчик года, карточки глав, шкала уверенности, плашки с фактами, графики, финальный экран.
import {W, H, C, clamp, lerp, ip, ease, fade, rgba, rrect, circle, vgrad, rgrad, makeCanvas} from './core.js';
import {SHOTS, EVENTS, sceneStart} from './timeline.js';

const FD = "'Unbounded', sans-serif";
const FB = "'Manrope', sans-serif";
const font = (ctx, w, px, fam = FB) => (ctx.font = `${w} ${px}px ${fam}`);
const LEVEL = {3: 'высокая', 2: 'средняя', 1: 'низкая'};
const LEVEL_C = {3: C.ok, 2: C.yellow, 1: C.red};

const EV = EVENTS.map((e) => ({...e, t0: sceneStart(e.sc) + e.at}));

function shadowText(ctx, text, x, y, color = '#FFFFFF', blur = 18, a = 0.55) {
  ctx.save();
  ctx.shadowColor = rgba('#000000', a);
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}
function panel(ctx, x, y, w, h, a = 0.62) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 30;
  rrect(ctx, x, y, w, h, 18, rgba('#0B1220', a));
  ctx.restore();
}

// ---------- счётчик года ----------
function yearChip(ctx, T, shot) {
  const prev = SHOTS[shot.i - 1];
  const y1 = shot.year, y0 = prev ? prev.year : null;
  if (!y1 && !y0) return;
  const lt = T - shot.start;
  const changing = y0 !== y1 && lt < 0.9;
  const a = y1 ? 1 : 1 - clamp(lt / 0.4);
  if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha = a;
  panel(ctx, 56, 52, 196, 64, 0.5);
  font(ctx, 600, 14, FB);
  ctx.fillStyle = rgba('#FFFFFF', 0.65);
  ctx.textBaseline = 'middle';
  ctx.fillText('ГОД', 78, 84);
  ctx.save();
  ctx.beginPath();
  ctx.rect(118, 56, 130, 56);
  ctx.clip();
  font(ctx, 700, 32, FD);
  const col = (y) => (y === 2126 ? C.amberLight : y === 1926 ? '#E6E1D6' : '#BFE3EA');
  if (changing && y0 && y1) {
    const k = ease.inOut(clamp(lt / 0.9));
    ctx.fillStyle = col(y0);
    ctx.globalAlpha = a * (1 - k);
    ctx.fillText(String(y0), 120, 85 - k * 40);
    ctx.globalAlpha = a * k;
    ctx.fillStyle = col(y1);
    ctx.fillText(String(y1), 120, 85 + (1 - k) * 40);
  } else if (y1) {
    ctx.fillStyle = col(y1);
    ctx.fillText(String(y1), 120, 85);
  }
  ctx.restore();
  ctx.restore();
}

// ---------- события ----------
function chapter(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.45, 0.6);
  const k = ease.out(clamp(lt / 0.9));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = vgrad(ctx, 0, H * 0.32, H * 0.68, [[0, 'rgba(5,10,18,0)'], [0.5, 'rgba(5,10,18,0.62)'], [1, 'rgba(5,10,18,0)']]);
  ctx.fillRect(0, H * 0.32, W, H * 0.36);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  font(ctx, 600, 26, FD);
  ctx.fillStyle = C.amber;
  ctx.fillText(`ГЛАВА ${e.n}`, W / 2, H / 2 - 62);
  ctx.letterSpacing = `${lerp(40, 14, k)}px`;
  font(ctx, 800, 96, FD);
  shadowText(ctx, e.text, W / 2 + 7, H / 2 + 22);
  ctx.letterSpacing = '0px';
  ctx.fillStyle = C.amber;
  const lw = 520 * k;
  ctx.fillRect(W / 2 - lw / 2, H / 2 + 96, lw, 4);
  ctx.restore();
}
function title(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 1.2, 0.9);
  const k = ease.out(clamp(lt / 3));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = `${lerp(48, 22, k)}px`;
  font(ctx, 800, 132, FD);
  ctx.shadowColor = rgba(C.amber, 0.65);
  ctx.shadowBlur = 60;
  ctx.fillStyle = '#FFF6E8';
  ctx.fillText(e.text, W / 2 + 11, H * 0.44);
  ctx.shadowBlur = 0;
  ctx.letterSpacing = '6px';
  font(ctx, 600, 24, FB);
  ctx.fillStyle = rgba('#FFFFFF', 0.85 * clamp((lt - 1.4) / 1));
  ctx.fillText('КАКИМ СТАНЕТ МИР ЧЕРЕЗ 100 ЛЕТ', W / 2 + 3, H * 0.44 + 112);
  ctx.restore();
}
function conf(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.5, 0.6);
  let level = e.level;
  if (e.demo) level = lt < 3 ? 1 : lt < 5 ? 2 : 3;
  const x = W - 486, y = H - 214, w = 430, h = e.label ? 158 : 128;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(0, (1 - ease.out(clamp(lt / 0.6))) * 30);
  panel(ctx, x, y + (e.label ? -30 : 0), w, h);
  const yy = y + (e.label ? -30 : 0);
  ctx.textBaseline = 'alphabetic';
  font(ctx, 700, 16, FB);
  ctx.letterSpacing = '3px';
  ctx.fillStyle = rgba('#FFFFFF', 0.7);
  ctx.fillText('УВЕРЕННОСТЬ ПРОГНОЗА', x + 28, yy + 42);
  ctx.letterSpacing = '0px';
  for (let i = 0; i < 3; i++) {
    const on = i < level;
    rrect(ctx, x + 28 + i * 74, yy + 62, 64, 14, 7, on ? LEVEL_C[level] : rgba('#FFFFFF', 0.16));
  }
  font(ctx, 800, 25, FD);
  ctx.fillStyle = LEVEL_C[level];
  ctx.fillText(LEVEL[level], x + 258, yy + 79);
  if (e.label) {
    font(ctx, 500, 19, FB);
    ctx.fillStyle = rgba('#FFFFFF', 0.82);
    ctx.fillText(e.label, x + 28, yy + 124);
  }
  ctx.restore();
}
function fact(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.45, 0.6);
  font(ctx, 800, 44, FD);
  const tw = ctx.measureText(e.text).width;
  font(ctx, 500, 22, FB);
  const sw = e.sub ? ctx.measureText(e.sub).width : 0;
  const w = Math.max(tw, sw) + 92, x = 72, y = H - 236;
  ctx.save();
  ctx.globalAlpha = a;
  const k = ease.out(clamp(lt / 0.7));
  ctx.translate((1 - k) * -40, 0);
  panel(ctx, x, y, w, e.sub ? 150 : 104);
  ctx.fillStyle = C.rust;
  ctx.fillRect(x, y + 22, 7, (e.sub ? 150 : 104) - 44);
  ctx.textBaseline = 'alphabetic';
  font(ctx, 800, 44, FD);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(e.text, x + 40, y + 70);
  if (e.sub) {
    font(ctx, 500, 22, FB);
    ctx.fillStyle = rgba('#FFFFFF', 0.8);
    ctx.fillText(e.sub, x + 40, y + 114);
  }
  ctx.restore();
}
function counter(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.5, 0.7);
  const k = ease.inOut(clamp((lt - e.delay) / 3.2));
  const v = lerp(e.from, e.to, k);
  const x = W - 560, y = 120;
  ctx.save();
  ctx.globalAlpha = a;
  panel(ctx, x, y, 488, 196);
  ctx.textBaseline = 'alphabetic';
  font(ctx, 700, 16, FB);
  ctx.letterSpacing = '3px';
  ctx.fillStyle = rgba('#FFFFFF', 0.7);
  ctx.fillText(e.label.toUpperCase(), x + 32, y + 48);
  ctx.letterSpacing = '0px';
  font(ctx, 800, 86, FD);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(v.toFixed(1).replace('.', ','), x + 32, y + 142);
  font(ctx, 600, 30, FB);
  ctx.fillText(e.unit, x + 252, y + 140);
  font(ctx, 600, 20, FB);
  ctx.fillStyle = C.amberLight;
  ctx.fillText(String(Math.round(lerp(e.fromYear, e.toYear, k))), x + 32, y + 178);
  ctx.restore();
}
function ruler(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.6, 0.8);
  const x = W - 330, y0 = H - 170, hh = 560, top = y0 - hh;
  const m = (v) => y0 - (v / 2.2) * hh;
  ctx.save();
  ctx.globalAlpha = a;
  panel(ctx, x - 40, top - 80, 300, hh + 140);
  ctx.textBaseline = 'middle';
  font(ctx, 700, 16, FB);
  ctx.letterSpacing = '2px';
  ctx.fillStyle = rgba('#FFFFFF', 0.72);
  ctx.fillText('УРОВЕНЬ МОРЯ · 2100', x - 14, top - 42);
  ctx.letterSpacing = '0px';
  // столб воды
  const lv = ip(lt, 1.5, 9, 0, 2.0, ease.inOut);
  ctx.fillStyle = vgrad(ctx, 0, m(lv), y0, [[0, rgba(C.seaLight, 0.9)], [1, rgba(C.sea, 0.95)]]);
  ctx.fillRect(x, m(lv), 64, y0 - m(lv));
  ctx.strokeStyle = rgba('#FFFFFF', 0.6);
  ctx.lineWidth = 2;
  ctx.strokeRect(x, top, 64, hh);
  [[0.3, '+0,3 м', 'лучший сценарий', C.ok], [1.0, '+1 м', 'худший', C.red], [2.0, 'до +2 м', 'не исключено', '#FF8A7A']].forEach(([v, lab, sub, col], i) => {
    const on = clamp((lt - (2 + i * 2.6)) / 0.6);
    ctx.globalAlpha = a * on;
    ctx.fillStyle = col;
    ctx.fillRect(x - 8, m(v) - 1.5, 82, 3);
    font(ctx, 800, 28, FD);
    ctx.fillText(lab, x + 88, m(v) - 8);
    font(ctx, 500, 16, FB);
    ctx.fillStyle = rgba('#FFFFFF', 0.75);
    ctx.fillText(sub, x + 90, m(v) + 18);
  });
  ctx.globalAlpha = a;
  font(ctx, 500, 14, FB);
  ctx.fillStyle = rgba('#FFFFFF', 0.55);
  ctx.fillText('МГЭИК, AR6', x - 14, y0 + 32);
  ctx.restore();
}
function popcurve(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.6, 0.8);
  const D = [[1950, 2.5], [1970, 3.7], [1990, 5.3], [2000, 6.1], [2010, 6.96], [2022, 8.0], [2040, 9.2], [2060, 9.9], [2084, 10.3], [2100, 10.2]];
  const x = 120, y = 150, w = 760, h = 380;
  const px = (yr) => x + ((yr - 1950) / 150) * w, py = (v) => y + h - (v / 11) * h;
  ctx.save();
  ctx.globalAlpha = a;
  panel(ctx, x - 50, y - 90, w + 130, h + 170);
  ctx.textBaseline = 'alphabetic';
  font(ctx, 700, 16, FB);
  ctx.letterSpacing = '3px';
  ctx.fillStyle = rgba('#FFFFFF', 0.72);
  ctx.fillText('НАСЕЛЕНИЕ ЗЕМЛИ, МЛРД', x, y - 40);
  ctx.letterSpacing = '0px';
  ctx.strokeStyle = rgba('#FFFFFF', 0.15);
  ctx.lineWidth = 1;
  [2, 4, 6, 8, 10].forEach((v) => {
    ctx.beginPath();
    ctx.moveTo(x, py(v));
    ctx.lineTo(x + w, py(v));
    ctx.stroke();
    font(ctx, 500, 15, FB);
    ctx.fillStyle = rgba('#FFFFFF', 0.5);
    ctx.fillText(String(v), x - 34, py(v) + 5);
  });
  [1950, 2000, 2050, 2100].forEach((yr) => {
    ctx.fillStyle = rgba('#FFFFFF', 0.5);
    ctx.fillText(String(yr), px(yr) - 20, y + h + 30);
  });
  const k = ease.inOut(clamp((lt - 0.8) / 6));
  const lastYr = lerp(1950, 2100, k);
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let yr = 1950; yr <= lastYr; yr += 1) {
    let i = D.findIndex((d) => d[0] > yr);
    if (i < 0) i = D.length - 1;
    const [y0, v0] = D[Math.max(0, i - 1)], [y1, v1] = D[i];
    const v = y1 === y0 ? v1 : lerp(v0, v1, (yr - y0) / (y1 - y0));
    yr === 1950 ? ctx.moveTo(px(yr), py(v)) : ctx.lineTo(px(yr), py(v));
  }
  ctx.stroke();
  if (lastYr > 2022) {
    circle(ctx, px(2022), py(8), 7, '#FFFFFF');
    font(ctx, 600, 17, FB);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('8 млрд · 2022', px(2022) - 150, py(8) - 14);
  }
  if (lastYr > 2084) {
    const pa = clamp((lt - 6.2) / 0.6);
    ctx.globalAlpha = a * pa;
    circle(ctx, px(2084), py(10.3), 9, C.amber);
    font(ctx, 800, 26, FD);
    ctx.fillStyle = C.amberLight;
    ctx.fillText('пик ≈ 10,3 млрд', px(2084) - 250, py(10.3) - 22);
    font(ctx, 500, 16, FB);
    ctx.fillStyle = rgba('#FFFFFF', 0.7);
    ctx.fillText('середина 2080-х · ООН, WPP 2024', px(2084) - 250, py(10.3) + 6);
  }
  ctx.restore();
}
function lifeline(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.6, 0.8);
  const x = W - 900, y = 170, w = 760, h = 300;
  const P3 = [[1925, 35, '≈ 35 лет', '1920-е'], [1950, 46, '46', '1950'], [2024, 73.3, '73 года', '2024']];
  const px = (yr) => x + ((yr - 1920) / 210) * w, py = (v) => y + h - (v / 110) * h;
  ctx.save();
  ctx.globalAlpha = a;
  panel(ctx, x - 50, y - 90, w + 100, h + 170);
  font(ctx, 700, 16, FB);
  ctx.letterSpacing = '3px';
  ctx.fillStyle = rgba('#FFFFFF', 0.72);
  ctx.fillText('ОЖИДАЕМАЯ ПРОДОЛЖИТЕЛЬНОСТЬ ЖИЗНИ', x, y - 40);
  ctx.letterSpacing = '0px';
  const k = ease.inOut(clamp((lt - 0.6) / 4.5));
  ctx.strokeStyle = C.amber;
  ctx.lineWidth = 5;
  ctx.beginPath();
  const end = lerp(1925, 2024, k);
  ctx.moveTo(px(1925), py(35));
  if (end > 1950) ctx.lineTo(px(1950), py(46));
  else ctx.lineTo(px(end), py(lerp(35, 46, (end - 1925) / 25)));
  if (end > 1950) ctx.lineTo(px(end), py(lerp(46, 73.3, (end - 1950) / 74)));
  ctx.stroke();
  P3.forEach(([yr, v, lab, sub], i) => {
    const on = clamp((lt - 0.6 - i * 1.8) / 0.5);
    if (on <= 0) return;
    ctx.globalAlpha = a * on;
    circle(ctx, px(yr), py(v), 8, '#FFFFFF');
    font(ctx, 800, 26, FD);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(lab, px(yr) - 30, py(v) - 22);
    font(ctx, 500, 15, FB);
    ctx.fillStyle = rgba('#FFFFFF', 0.6);
    ctx.fillText(sub, px(yr) - 20, y + h + 30);
  });
  const q = clamp((lt - 6.2) / 0.8);
  if (q > 0) {
    ctx.globalAlpha = a * q;
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = rgba(C.amberLight, 0.9);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px(2024), py(73.3));
    ctx.lineTo(px(2126), py(92));
    ctx.stroke();
    ctx.setLineDash([]);
    font(ctx, 800, 44, FD);
    ctx.fillStyle = C.amberLight;
    ctx.fillText('?', px(2126) - 10, py(92) - 20);
    font(ctx, 500, 15, FB);
    ctx.fillStyle = rgba('#FFFFFF', 0.6);
    ctx.fillText('2126', px(2126) - 22, y + h + 30);
  }
  ctx.restore();
}
function stamp(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.08, 0.4);
  const s = lerp(1.6, 1, ease.out(clamp(lt / 0.25)));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.translate(W - 400, 190);
  ctx.rotate(-0.08);
  ctx.scale(s, s);
  ctx.strokeStyle = e.text === 'ОЖИДАНИЕ' ? C.amber : C.ok;
  ctx.lineWidth = 6;
  rrect(ctx, -230, -62, 460, 124, 14);
  ctx.stroke();
  font(ctx, 800, 58, FD);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fillText(e.text, 0, 4);
  ctx.restore();
}
function quote(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.7, 0.8);
  ctx.save();
  if (e.bg === 'black') {
    // по сценарию — на чёрном экране, затем тишина
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, lt / 0.6)})`;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.globalAlpha = a;
    ctx.fillStyle = vgrad(ctx, 0, H / 2 - 160, H / 2 + 160, [[0, 'rgba(5,10,18,0)'], [0.5, 'rgba(5,10,18,0.55)'], [1, 'rgba(5,10,18,0)']]);
    ctx.fillRect(0, H / 2 - 160, W, 320);
  }
  ctx.globalAlpha = a;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  font(ctx, 700, 64, FD);
  shadowText(ctx, e.text, W / 2, H / 2, '#FFFFFF', 30, 0.7);
  ctx.restore();
}
function equation(ctx, lt, e) {
  const a = fade(lt, 0, e.dur, 0.5, 0.8);
  const parts = ['2026', ' + 100', ' = 2126'];
  ctx.save();
  ctx.globalAlpha = a;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  font(ctx, 800, 92, FD);
  const total = ctx.measureText(parts.join('')).width;
  let x = W / 2 - total / 2;
  parts.forEach((p, i) => {
    const on = clamp((lt - i * 1.1) / 0.5);
    ctx.globalAlpha = a * on;
    ctx.fillStyle = i === 2 ? C.amberLight : '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 30;
    ctx.fillText(p, x, H * 0.22 + (1 - on) * 20);
    x += ctx.measureText(p).width;
  });
  ctx.restore();
}
function endScreen(ctx, lt, e) {
  const a = fade(lt, 0, e.dur + 2, 1.0, 0.01);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = vgrad(ctx, 0, 0, H, [[0, 'rgba(6,10,20,0.15)'], [1, 'rgba(6,10,20,0.6)']]);
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';
  font(ctx, 800, 58, FD);
  shadowText(ctx, 'Источники и разбор —', 110, 330);
  shadowText(ctx, 'в нашем Telegram', 110, 404, C.amberLight);
  font(ctx, 500, 28, FB);
  shadowText(ctx, 'ссылка в описании под видео', 112, 462, rgba('#FFFFFF', 0.85));
  font(ctx, 700, 30, FB);
  shadowText(ctx, 'Какой сценарий ждёт нас? Напишите в комментариях', 112, 640);
  [[C.ok, 'зелёный'], [C.yellow, 'жёлтый'], [C.red, 'красный']].forEach(([c, l], i) => {
    const on = clamp((lt - 1.5 - i * 0.4) / 0.4);
    ctx.globalAlpha = a * on;
    circle(ctx, 140 + i * 230, 720, 22, c);
    font(ctx, 600, 26, FB);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(l, 176 + i * 230, 730);
  });
  ctx.restore();
}
const KIND = {chapter, title, conf, fact, counter, ruler, popcurve, lifeline, stamp, quote, equation, end: endScreen};

let vignette = null;
export function drawOverlays(ctx, T, shot, subs) {
  if (!vignette) {
    const [c, g] = makeCanvas(W, H);
    g.fillStyle = rgrad(g, W / 2, H / 2, W * 0.72, [[0.6, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.38)']]);
    g.fillRect(0, 0, W, H);
    vignette = c;
  }
  ctx.drawImage(vignette, 0, 0, W, H);
  if (T < 885) yearChip(ctx, T, shot);
  for (const e of EV) {
    const lt = T - e.t0;
    if (lt >= 0 && lt <= e.dur + (e.kind === 'end' ? 2 : 0)) KIND[e.kind](ctx, lt, e);
  }
  if (subs) subtitles(ctx, T, subs);
}

function subtitles(ctx, T, subs) {
  const cue = subs.find((c) => T >= c.start - 0.05 && T <= c.end + 0.25);
  if (!cue) return;
  const a = Math.min(clamp((T - cue.start + 0.05) / 0.15), clamp((cue.end + 0.25 - T) / 0.2));
  ctx.save();
  ctx.globalAlpha = a;
  font(ctx, 600, 38, FB);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const lines = wrap(ctx, cue.text, 1400);
  lines.forEach((ln, i) => {
    const y = H - 70 - (lines.length - 1 - i) * 50;
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineJoin = 'round';
    ctx.strokeText(ln, W / 2, y);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(ln, W / 2, y);
  });
  ctx.restore();
}
function wrap(ctx, text, maxW) {
  const words = text.split(' ');
  const out = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}
