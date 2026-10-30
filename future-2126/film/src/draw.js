// Библиотека рисования: природа, город, техника, люди. Всё — векторно, в логических координатах.
import {C, W, H, clamp, lerp, rnd, rng, noise1, fbm, rgba, mixc, vgrad, rgrad, circle, ellipse, poly, rrect, glow} from './core.js';

// ---------- небо, свет, атмосфера ----------
export function sky(g, stops, w = W, h = H) {
  g.fillStyle = vgrad(g, 0, 0, h, stops);
  g.fillRect(0, 0, w, h);
}
export const SKY = {
  golden: [[0, '#3C6E8F'], [0.45, '#E9A968'], [0.72, '#F7CF95'], [1, '#FCE7C4']],
  dawn: [[0, '#2B4F7A'], [0.5, '#C98A8A'], [0.8, '#F2B98A'], [1, '#FBE2C0']],
  day: [[0, '#5EA9D6'], [0.6, '#A9D8EC'], [1, '#E4F2F4']],
  haze: [[0, '#8FB7C9'], [1, '#E8E2D4']],
  dusk: [[0, '#1A2A55'], [0.5, '#7A4F7A'], [0.8, '#E98A5A'], [1, '#F7C07A']],
  night: [[0, '#050A1A'], [0.7, '#0E1C3C'], [1, '#1C2E52']],
  storm: [[0, '#38424D'], [0.6, '#5C6873'], [1, '#8D979E']],
  grey: [[0, '#8C949A'], [1, '#C9CCCC']],
};
export function sun(g, x, y, r, core = '#FFF3D6', halo = '#FFC27A', a = 1) {
  glow(g, x, y, r * 9, halo, 0.35 * a);
  glow(g, x, y, r * 3.2, halo, 0.55 * a);
  circle(g, x, y, r, rgba(core, a));
}
export function rays(g, x, y, n, len, color, a = 0.08, spread = Math.PI, dir = Math.PI / 2, seed = 1) {
  const op = g.globalCompositeOperation;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const ang = dir - spread / 2 + spread * ((i + rnd(seed + i) * 0.6) / n);
    const wdt = 0.02 + rnd(seed + i * 3) * 0.05;
    const gr = g.createRadialGradient(x, y, 0, x, y, len);
    gr.addColorStop(0, rgba(color, a * (0.5 + rnd(i + seed * 7))));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x, y);
    g.arc(x, y, len, ang - wdt, ang + wdt);
    g.closePath();
    g.fill();
  }
  g.globalCompositeOperation = op;
}
export function cloud(g, x, y, s, color, a = 1, seed = 1) {
  const R = rng(seed);
  for (let i = 0; i < 9; i++) {
    const cx = x + (R() - 0.5) * s * 2.2, cy = y + (R() - 0.5) * s * 0.35;
    const r = s * (0.35 + R() * 0.45);
    g.fillStyle = rgrad(g, cx, cy, r, [[0, rgba(color, 0.55 * a)], [0.6, rgba(color, 0.32 * a)], [1, rgba(color, 0)]]);
    g.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
}
export function clouds(g, seed, n, y0, y1, color, a = 1, w = W, size = [60, 180]) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) cloud(g, R() * w, lerp(y0, y1, R()), lerp(size[0], size[1], R()), color, a * (0.5 + R() * 0.5), seed * 10 + i);
}
export function haze(g, y0, y1, color, a = 0.6, w = W) {
  g.fillStyle = vgrad(g, 0, y0, y1, [[0, rgba(color, 0)], [1, rgba(color, a)]]);
  g.fillRect(0, y0, w, y1 - y0);
}
export function stars(g, seed, n, w = W, h = H, a = 1) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const r = R() < 0.92 ? 0.6 + R() * 0.8 : 1.4 + R() * 1.2;
    circle(g, R() * w, R() * h, r, rgba('#FFFFFF', a * (0.35 + R() * 0.65)));
  }
}

// ---------- земля и вода ----------
/** Хребет/холмы: заливка от линии с шумом до низа слоя. */
export function ridge(g, seed, baseY, amp, color, w = W, h = H, freq = 0.004, oct = 4) {
  g.beginPath();
  g.moveTo(0, h);
  for (let x = 0; x <= w; x += 6) g.lineTo(x, baseY - fbm(x * freq + seed * 13.7, seed, oct) * amp);
  g.lineTo(w, h);
  g.closePath();
  g.fillStyle = color;
  g.fill();
}
export function sea(g, y0, top, bottom, w = W, h = H) {
  g.fillStyle = vgrad(g, 0, y0, h, [[0, top], [1, bottom]]);
  g.fillRect(0, y0, w, h - y0);
}
/** Блики на воде — анимированные штрихи. */
export function shimmer(g, t, y0, y1, color, n = 140, a = 0.5, w = W, seed = 3, speed = 12) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const yy = lerp(y0, y1, Math.pow(R(), 1.6));
    const depth = (yy - y0) / (y1 - y0 + 1e-6);
    const x = ((R() * w + t * speed * (0.4 + depth)) % (w + 200)) - 100;
    const len = 6 + depth * 46 * R();
    const al = a * (0.3 + 0.7 * Math.abs(Math.sin(t * (1 + R() * 2) + i)));
    g.fillStyle = rgba(color, al);
    g.fillRect(x, yy, len, 1 + depth * 2.2);
  }
}
export function waveLine(g, t, y, amp, len, color, lw = 2, phase = 0, w = W) {
  g.beginPath();
  for (let x = -10; x <= w + 10; x += 8) g.lineTo(x, y + Math.sin(x / len + t * 1.4 + phase) * amp + Math.sin(x / (len * 0.37) - t * 0.9 + phase) * amp * 0.4);
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.stroke();
}

// ---------- растения ----------
export function tree(g, x, y, s, o = {}) {
  const {leaf = C.leaf, dark = C.greenDeep, light = C.greenLight, trunk = '#5B4331', seed = 1, sway = 0} = o;
  const R = rng(seed);
  g.fillStyle = trunk;
  g.fillRect(x - s * 0.05, y - s * 0.55, s * 0.1, s * 0.55);
  const top = y - s * 0.6;
  for (let i = 0; i < 7; i++) {
    const cx = x + (R() - 0.5) * s * 0.7 + sway * (0.6 + R() * 0.4), cy = top - R() * s * 0.45;
    const r = s * (0.22 + R() * 0.16);
    circle(g, cx, cy, r, i < 3 ? dark : leaf);
  }
  for (let i = 0; i < 4; i++) {
    const cx = x - s * 0.15 + (R() - 0.5) * s * 0.4 + sway, cy = top - s * 0.25 - R() * s * 0.3;
    circle(g, cx, cy, s * (0.1 + R() * 0.08), rgba(light, 0.85));
  }
}
export function pine(g, x, y, s, color = '#2F5D46', snow = 0) {
  for (let k = 0; k < 4; k++) {
    const yy = y - s * (0.15 + k * 0.22), ww = s * (0.42 - k * 0.09);
    poly(g, [[x - ww, yy], [x + ww, yy], [x, yy - s * 0.38]], color);
    if (snow) poly(g, [[x - ww * 0.5, yy - s * 0.17], [x + ww * 0.5, yy - s * 0.17], [x, yy - s * 0.38]], rgba('#FFFFFF', snow));
  }
  g.fillStyle = '#4A3628';
  g.fillRect(x - s * 0.03, y - s * 0.15, s * 0.06, s * 0.15);
}
export function grass(g, seed, y, w, h, color, n = 300) {
  const R = rng(seed);
  g.strokeStyle = color;
  g.lineWidth = 1.2;
  for (let i = 0; i < n; i++) {
    const x = R() * w, hh = h * (0.4 + R() * 0.6);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (R() - 0.5) * 6, y - hh * 0.6, x + (R() - 0.5) * 10, y - hh);
    g.stroke();
  }
}
export function bush(g, x, y, s, color = C.leaf, dark = C.greenDeep, seed = 1) {
  const R = rng(seed);
  for (let i = 0; i < 5; i++) circle(g, x + (R() - 0.5) * s * 1.4, y - R() * s * 0.5, s * (0.3 + R() * 0.25), i < 2 ? dark : color);
}

// ---------- город 2126 ----------
/** Террасная башня с висячими садами. light: 0 — день, 1 — сумерки/ночь (окна светятся). */
export function terraceTower(g, x, baseY, w, h, o = {}) {
  const {tiers = 5, body = C.stone, shade = '#C9BBA6', glass = '#5E9AA0', light = 0, seed = 1, garden = 1, haze: hz = 0, hazeColor = '#BFD8D6'} = o;
  const R = rng(seed);
  const th = h / tiers;
  for (let k = 0; k < tiers; k++) {
    const tw = w * (1 - k * 0.11), tx = x + (w - tw) / 2 + (R() - 0.5) * w * 0.04, ty = baseY - (k + 1) * th;
    // корпус с тенью справа (солнце слева)
    g.fillStyle = body;
    g.fillRect(tx, ty, tw, th);
    g.fillStyle = shade;
    g.fillRect(tx + tw * 0.72, ty, tw * 0.28, th);
    // солнечное стекло
    g.fillStyle = vgrad(g, 0, ty + th * 0.18, ty + th * 0.78, [[0, rgba(glass, 0.95)], [1, rgba(mixc(glass, '#1B3A44', 0.5), 0.95)]]);
    g.fillRect(tx + tw * 0.06, ty + th * 0.2, tw * 0.88, th * 0.56);
    // переплёт и окна
    const cols = Math.max(3, Math.round(tw / 26));
    for (let i = 0; i < cols; i++) {
      const wx = tx + tw * 0.06 + (i * tw * 0.88) / cols;
      g.fillStyle = rgba('#20343A', 0.35);
      g.fillRect(wx, ty + th * 0.2, 1.2, th * 0.56);
      if (light > 0 && R() < 0.55 + light * 0.3) {
        g.fillStyle = rgba('#FFC978', light * (0.55 + R() * 0.45));
        g.fillRect(wx + 2, ty + th * 0.24, tw * 0.88 / cols - 4, th * 0.46);
      }
    }
    // сад на террасе: кроны и свисающие лианы
    if (garden) {
      const n = Math.max(3, Math.round(tw / 20));
      for (let i = 0; i < n; i++) {
        const cx = tx + (i + 0.5) * (tw / n) + (R() - 0.5) * 6;
        circle(g, cx, ty + 2, (tw / n) * (0.55 + R() * 0.35), R() < 0.5 ? C.greenDeep : C.leaf);
        if (R() < 0.5) {
          g.strokeStyle = rgba(C.green, 0.9);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(cx, ty + 4);
          g.lineTo(cx + (R() - 0.5) * 4, ty + 4 + th * (0.2 + R() * 0.45));
          g.stroke();
        }
      }
    }
  }
  // корона деревьев на крыше
  const top = baseY - h, tw = w * (1 - (tiers - 1) * 0.11);
  for (let i = 0; i < 4; i++) circle(g, x + w / 2 + (R() - 0.5) * tw * 0.8, top - R() * 10, tw * (0.16 + R() * 0.12), R() < 0.5 ? C.green : C.leaf);
  if (hz > 0) {
    g.fillStyle = rgba(hazeColor, hz);
    g.fillRect(x - tw * 0.4, top - 30, w + tw * 0.8, h + 40);
  }
}
/** Силуэт современного города (2026): коробки, антенны, огни. */
export function boxSkyline(g, seed, baseY, n, color, o = {}) {
  const {w = W, hmin = 80, hmax = 380, windows = 0, winColor = '#FFD27A', antenna = true} = o;
  const R = rng(seed);
  let x = -20;
  while (x < w + 20) {
    const bw = 30 + R() * 90, bh = hmin + Math.pow(R(), 1.5) * (hmax - hmin);
    g.fillStyle = color;
    g.fillRect(x, baseY - bh, bw, bh + 2);
    if (antenna && R() < 0.25) g.fillRect(x + bw / 2 - 1, baseY - bh - 30 * R() - 10, 2, 40);
    if (windows > 0) {
      for (let yy = baseY - bh + 8; yy < baseY - 6; yy += 9)
        for (let xx = x + 5; xx < x + bw - 5; xx += 8)
          if (R() < windows) {
            g.fillStyle = rgba(winColor, 0.5 + R() * 0.5);
            g.fillRect(xx, yy, 3.5, 4);
          }
    }
    x += bw + R() * 6;
  }
}
export function tram(g, x, y, len, color = '#F4F1EA', stripe = C.teal, t = 0) {
  rrect(g, x, y - 26, len, 26, 9, color);
  g.fillStyle = stripe;
  g.fillRect(x + 4, y - 7, len - 8, 3);
  for (let i = 0; i < len / 24 - 1; i++) rrect(g, x + 10 + i * 24, y - 21, 17, 11, 3, rgba('#2C4A55', 0.85));
  g.fillStyle = rgba('#000000', 0.25);
  g.fillRect(x + 6, y, len - 12, 3);
}
export function windTurbine(g, x, y, h, t, color = '#F2F4F5', speed = 1, phase = 0) {
  g.strokeStyle = color;
  g.lineWidth = h * 0.025;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x, y - h);
  g.stroke();
  const a0 = t * speed * 1.4 + phase;
  g.fillStyle = color;
  for (let k = 0; k < 3; k++) {
    const a = a0 + (k * Math.PI * 2) / 3;
    g.save();
    g.translate(x, y - h);
    g.rotate(a);
    g.beginPath();
    g.moveTo(-h * 0.02, 0);
    g.quadraticCurveTo(h * 0.03, -h * 0.25, 0, -h * 0.48);
    g.lineTo(-h * 0.015, -h * 0.1);
    g.closePath();
    g.fill();
    g.restore();
  }
  circle(g, x, y - h, h * 0.025, color);
}
export function solarRow(g, x0, y, x1, h, color = '#2C4E6E', edge = '#9EC3D8') {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x0, y);
  g.lineTo(x1, y);
  g.lineTo(x1 - h * 0.3, y - h);
  g.lineTo(x0 + h * 0.3, y - h);
  g.closePath();
  g.fill();
  g.strokeStyle = edge;
  g.lineWidth = Math.max(0.5, h * 0.06);
  g.beginPath();
  g.moveTo(x0 + h * 0.3, y - h);
  g.lineTo(x1 - h * 0.3, y - h);
  g.stroke();
}
export function car(g, x, y, s, color = '#B5BCC4', dir = 1) {
  rrect(g, x - s, y - s * 0.55, s * 2, s * 0.45, s * 0.12, color);
  rrect(g, x - s * 0.55 + dir * s * 0.1, y - s * 0.9, s * 1.05, s * 0.42, s * 0.18, color);
  g.fillStyle = rgba('#24323F', 0.8);
  g.fillRect(x - s * 0.45 + dir * s * 0.1, y - s * 0.82, s * 0.85, s * 0.28);
  circle(g, x - s * 0.6, y - s * 0.1, s * 0.2, '#1C2128');
  circle(g, x + s * 0.6, y - s * 0.1, s * 0.2, '#1C2128');
}

// ---------- люди (фон) ----------
/** Маленький пешеход. phase — фаза шага, dir — направление. */
export function walker(g, x, y, s, color, phase = 0, dir = 1, head = null) {
  const sw = Math.sin(phase) * 0.28;
  g.strokeStyle = color;
  g.lineCap = 'round';
  g.lineWidth = s * 0.16;
  g.beginPath();
  g.moveTo(x, y - s * 0.48);
  g.lineTo(x + s * sw * dir, y);
  g.moveTo(x, y - s * 0.48);
  g.lineTo(x - s * sw * dir, y);
  g.stroke();
  rrect(g, x - s * 0.13, y - s * 0.95, s * 0.26, s * 0.52, s * 0.1, color);
  circle(g, x, y - s * 1.06, s * 0.11, head || color);
}
export function crowd(g, t, seed, n, x0, x1, y0, y1, colors, speed = 30) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const dir = R() < 0.5 ? 1 : -1, sp = speed * (0.6 + R() * 0.6);
    const y = lerp(y0, y1, R()), s = lerp(14, 26, (y - y0) / (y1 - y0 + 1e-6));
    const x = x0 + ((R() * (x1 - x0) + dir * sp * t) % (x1 - x0) + (x1 - x0)) % (x1 - x0);
    walker(g, x, y, s, colors[Math.floor(R() * colors.length)], t * 6 * (sp / speed) + i, dir);
  }
}
export function bird(g, x, y, s, phase, color = '#2B3640') {
  const f = Math.sin(phase) * 0.6;
  g.strokeStyle = color;
  g.lineWidth = Math.max(1, s * 0.12);
  g.beginPath();
  g.moveTo(x - s, y - s * f);
  g.quadraticCurveTo(x - s * 0.4, y - s * 0.3, x, y);
  g.quadraticCurveTo(x + s * 0.4, y - s * 0.3, x + s, y - s * f);
  g.stroke();
}

// ---------- плёнка 1920-х ----------
export function archiveFX(g, t, a = 1) {
  // мерцание, царапины, пылинки
  const fl = 0.05 * Math.sin(t * 37) + 0.04 * (rnd(Math.floor(t * 18)) - 0.5);
  g.fillStyle = fl > 0 ? rgba('#FFFFFF', fl * a) : rgba('#000000', -fl * a);
  g.fillRect(0, 0, W, H);
  const k = Math.floor(t * 18);
  for (let i = 0; i < 3; i++) {
    if (rnd(k * 7 + i) < 0.55) {
      const x = rnd(k * 13 + i) * W;
      g.fillStyle = rgba('#F0F0F0', 0.25 * a);
      g.fillRect(x, 0, 1 + rnd(k + i) * 1.5, H);
    }
  }
  for (let i = 0; i < 14; i++) {
    const x = rnd(k * 31 + i) * W, y = rnd(k * 17 + i * 3) * H;
    circle(g, x, y, 0.8 + rnd(k + i * 5) * 2.4, rgba(rnd(i + k) < 0.5 ? '#FFFFFF' : '#000000', 0.5 * a));
  }
  g.fillStyle = rgrad(g, W / 2, H / 2, W * 0.75, [[0.55, 'rgba(0,0,0,0)'], [1, rgba('#000000', 0.75 * a)]]);
  g.fillRect(0, 0, W, H);
}
