// Земля из космоса, орбита, Луна, Марс, «бледно-голубая точка».
import {W, H, C, P, clamp, lerp, ip, ease, rnd, rng, fbm, rgba, mixc, vgrad, rgrad, circle, ellipse, poly, rrect, glow, layer, put} from '../core.js';
import {stars, ridge, sun as sunDisc} from '../draw.js';
import {LAND, WATER, LIGHTS} from '../geo.js';

const D = Math.PI / 180;
function proj(lon, lat, lon0, lat0) {
  const l = (lon - lon0) * D, p = lat * D, p0 = lat0 * D;
  const x = Math.cos(p) * Math.sin(l);
  const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
  const z = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  return [x, y, z];
}
function inPoly(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// огни городов: случайные точки на суше внутри населённых регионов
const CITY = (() => {
  const R = rng(2126), out = [];
  for (const [a, b, c, d, w] of LIGHTS) {
    const n = Math.round(w * 260);
    for (let i = 0; i < n * 3 && out.length < 6000; i++) {
      const lon = lerp(a, c, R()), lat = lerp(b, d, R());
      const cluster = Math.pow(fbm(lon * 0.35, lat * 0.35, 3), 2.2) * 2.6;
      if (R() > cluster) continue;
      if (LAND.some((pl) => inPoly(lon, lat, pl)) && !WATER.some((pl) => inPoly(lon, lat, pl))) out.push([lon, lat, 0.3 + R() * 0.7]);
      if (out.length > 0 && i > n * 2.2) break;
    }
  }
  // редкие огни повсюду на суше
  for (let i = 0; i < 2500; i++) {
    const lon = R() * 360 - 180, lat = R() * 120 - 55;
    if (LAND.some((pl) => inPoly(lon, lat, pl))) out.push([lon, lat, 0.15 + R() * 0.3]);
  }
  return out;
})();
const CLOUDS = (() => {
  const R = rng(77), out = [];
  for (let i = 0; i < 110; i++) out.push([R() * 360 - 180, (R() - 0.5) * 140, 4 + R() * 10, R()]);
  return out;
})();

// ---------- текстуры Земли (равнопромежуточная проекция), строятся один раз ----------
let TEX = null;
function vnoise(seed, nx, ny) {
  const R = rng(seed), grid = new Float32Array(nx * ny);
  for (let i = 0; i < grid.length; i++) grid[i] = R();
  return (u, v) => {
    // u, v в клетках сетки; по долготе — с переносом
    const x = Math.floor(u), y = Math.floor(v), fx = u - x, fy = v - y;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const x0 = ((x % nx) + nx) % nx, x1 = (x0 + 1) % nx, y0 = Math.min(ny - 1, Math.max(0, y)), y1 = Math.min(ny - 1, y0 + 1);
    const a = grid[y0 * nx + x0], b = grid[y0 * nx + x1], c = grid[y1 * nx + x0], d = grid[y1 * nx + x1];
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  };
}
function buildTextures() {
  const TW = 3072, TH = 1536;
  const cnv = document.createElement('canvas');
  cnv.width = TW;
  cnv.height = TH;
  const c = cnv.getContext('2d', {willReadFrequently: true});
  const X = (lon) => ((lon + 180) / 360) * TW, Y = (lat) => ((90 - lat) / 180) * TH;
  const fillPolys = (list, color) => {
    c.fillStyle = color;
    for (const pl of list) {
      c.beginPath();
      pl.forEach(([lo, la], i) => (i ? c.lineTo(X(lo), Y(la)) : c.moveTo(X(lo), Y(la))));
      c.closePath();
      c.fill();
    }
  };
  c.fillStyle = '#000';
  c.fillRect(0, 0, TW, TH);
  fillPolys(LAND, '#fff');
  fillPolys(WATER, '#000');
  const mask = c.getImageData(0, 0, TW, TH).data;
  c.fillStyle = '#000';
  c.fillRect(0, 0, TW, TH);
  for (const [lo, la, b] of CITY) {
    c.fillStyle = `rgba(255,255,255,${0.35 + b * 0.65})`;
    c.fillRect(X(lo) - 1.5, Y(la) - 1.5, 3, 3);
  }
  const lit = c.getImageData(0, 0, TW, TH).data;
  const n1 = vnoise(11, 96, 48), n2 = vnoise(12, 384, 192), n3 = vnoise(13, 1536, 768), cn = vnoise(14, 128, 64), cn2 = vnoise(15, 512, 256);
  const day = new Uint8ClampedArray(TW * TH * 3), night = new Uint8ClampedArray(TW * TH * 3), cloud = new Uint8ClampedArray(TW * TH);
  const DES = [[-16, 14, 35, 32], [38, 15, 58, 30], [118, -31, 140, -19], [75, 37, 110, 46], [-116, 30, -105, 38], [-71, -28, -66, -18], [52, 26, 68, 36]];
  const desert = (lon, lat) => {
    let w = 0;
    for (const [a, b, c, d] of DES) w = Math.max(w, clamp(Math.min(lon - a, c - lon, lat - b, d - lat) / 7));
    return w;
  };
  for (let y = 0; y < TH; y++) {
    const lat = 90 - ((y + 0.5) / TH) * 180, al = Math.abs(lat);
    for (let x = 0; x < TW; x++) {
      const lon = ((x + 0.5) / TW) * 360 - 180, i = y * TW + x, m = mask[i * 4] / 255;
      const u = x / TW, v = y / TH;
      const nz = 0.5 * n1(u * 96, v * 48) + 0.3 * n2(u * 384, v * 192) + 0.2 * n3(u * 1536, v * 768);
      // океан
      const deep = 0.55 + 0.45 * nz;
      let r = 14 + 14 * deep - al * 0.05, gg = 52 + 36 * deep - al * 0.2, b = 98 + 50 * deep - al * 0.3;
      // суша
      let lr, lg, lb;
      if (al > 72 || (lat < -60) || (lat > 59 && lon > -75 && lon < -12)) {
        lr = 235; lg = 240; lb = 245;
      } else if (al > 55) {
        lr = 96 + nz * 40; lg = 104 + nz * 30; lb = 78 + nz * 20;
      } else {
        const wet = clamp(1 - al / 50) * 0.6 + nz * 0.4;
        lr = 92 - wet * 40 + nz * 30; lg = 124 - wet * 20 + nz * 26; lb = 66 - wet * 16 + nz * 10;
        const dw = clamp(desert(lon, lat) * 1.6 - 0.35 + (nz - 0.5) * 0.9);
        lr = lr * (1 - dw) + (198 + nz * 28) * dw;
        lg = lg * (1 - dw) + (166 + nz * 24) * dw;
        lb = lb * (1 - dw) + (110 + nz * 18) * dw;
      }
      day[i * 3] = r * (1 - m) + lr * m;
      day[i * 3 + 1] = gg * (1 - m) + lg * m;
      day[i * 3 + 2] = b * (1 - m) + lb * m;
      const L = lit[i * 4] / 255;
      night[i * 3] = 6 * (1 - m) + 20 * m + 255 * L;
      night[i * 3 + 1] = 11 * (1 - m) + 27 * m + 196 * L;
      night[i * 3 + 2] = 26 * (1 - m) + 44 * m + 110 * L;
      // облака: полосы средних широт и экваториальная зона
      const band = 0.55 + 0.45 * Math.max(Math.exp(-((al - 52) ** 2) / 260), Math.exp(-((lat - 6) ** 2) / 60));
      const cv = (0.6 * cn(u * 128, v * 64) + 0.4 * cn2(u * 512, v * 256)) * band;
      cloud[i] = clamp((cv - 0.42) / 0.3) * 235;
    }
  }
  // размываем облака, чтобы при сильном приближении не было ступенек
  const tmp = new Float32Array(TW * TH), rad = 3;
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < TH; y++) {
      let acc = 0;
      for (let x = -rad; x <= rad; x++) acc += cloud[y * TW + ((x + TW) % TW)];
      for (let x = 0; x < TW; x++) {
        tmp[y * TW + x] = acc / (2 * rad + 1);
        acc += cloud[y * TW + ((x + rad + 1) % TW)] - cloud[y * TW + ((x - rad + TW) % TW)];
      }
    }
    for (let x = 0; x < TW; x++) {
      let acc = 0;
      for (let y = -rad; y <= rad; y++) acc += tmp[Math.min(TH - 1, Math.max(0, y)) * TW + x];
      for (let y = 0; y < TH; y++) {
        cloud[y * TW + x] = acc / (2 * rad + 1);
        acc += tmp[Math.min(TH - 1, y + rad + 1) * TW + x] - tmp[Math.max(0, y - rad) * TW + x];
      }
    }
  }
  return {TW, TH, day, night, cloud};
}
const BUFS = {};
function buf(w, h) {
  const key = `${w}x${h}`;
  if (!BUFS[key]) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    BUFS[key] = c;
  }
  return BUFS[key];
}
/**
 * Глобус: попиксельная ортографическая проекция по текстурам.
 * sun — направление на Солнце в координатах экрана (x вправо, y вверх, z к зрителю).
 * Вызывать без дополнительных трансформаций холста (только масштаб рендера).
 */
export function globe(g, cx, cy, R, o = {}) {
  if (!TEX) TEX = buildTextures();
  const {lon0 = 20, lat0 = 20, t = 0, sun = [-0.5, 0.35, 0.8], lights = 1, clouds = 1, cloudSpeed = 0.6, atmo = 1} = o;
  const S = P.scale;
  const x0 = Math.max(0, Math.floor(cx - R * 1.12)), y0 = Math.max(0, Math.floor(cy - R * 1.12));
  const x1 = Math.min(W, Math.ceil(cx + R * 1.12)), y1 = Math.min(H, Math.ceil(cy + R * 1.12));
  if (x1 <= x0 || y1 <= y0) return;
  const pw = Math.ceil((x1 - x0) * S), ph = Math.ceil((y1 - y0) * S);
  const cnv = buf(pw, ph), c2 = cnv.getContext('2d');
  const img = c2.createImageData(pw, ph), d = img.data;
  const {TW, TH, day, night, cloud} = TEX;
  const sl = Math.hypot(...sun), sx = sun[0] / sl, sy = sun[1] / sl, sz = sun[2] / sl;
  const p0 = lat0 * D, sp0 = Math.sin(p0), cp0 = Math.cos(p0), L0 = lon0 * D;
  const cOff = (t * cloudSpeed) / 360;
  const Rd = R * S, cxd = cx * S - x0 * S, cyd = cy * S - y0 * S;
  for (let py = 0; py < ph; py++) {
    const yy = (py + 0.5 - cyd) / Rd, v = -yy;
    if (Math.abs(yy) > 1.12) continue;
    for (let px = 0; px < pw; px++) {
      const xx = (px + 0.5 - cxd) / Rd, r2 = xx * xx + yy * yy;
      if (r2 > 1.2544) continue;
      const k = (py * pw + px) * 4;
      if (r2 > 1) {
        // атмосфера за краем диска, ярче на дневной стороне
        const r = Math.sqrt(r2), a = Math.pow(clamp((1.12 - r) / 0.12), 2.2) * atmo;
        const lamE = clamp((xx * sx + v * sy) / r * 0.8 + 0.35);
        d[k] = 90;
        d[k + 1] = 160;
        d[k + 2] = 255;
        d[k + 3] = 255 * a * (0.25 + 0.75 * lamE);
        continue;
      }
      const z = Math.sqrt(1 - r2);
      const lat = Math.asin(clamp(z * sp0 + v * cp0, -1, 1));
      const lon = L0 + Math.atan2(xx, z * cp0 - v * sp0);
      let u = (lon / (2 * Math.PI) + 0.5) % 1;
      if (u < 0) u += 1;
      const fy = Math.min(TH - 1.001, (0.5 - lat / Math.PI) * TH - 0.5 < 0 ? 0 : (0.5 - lat / Math.PI) * TH - 0.5);
      const ty = fy | 0, wy = fy - ty, ty1 = Math.min(TH - 1, ty + 1);
      const fx = u * TW - 0.5 < 0 ? u * TW - 0.5 + TW : u * TW - 0.5, tx = fx | 0, wx = fx - tx, tx1 = (tx + 1) % TW;
      const ti = ty * TW + tx;
      const i00 = ti, i10 = ty * TW + tx1, i01 = ty1 * TW + tx, i11 = ty1 * TW + tx1;
      const bl = (arr, s, ch) => (arr[i00 * s + ch] * (1 - wx) + arr[i10 * s + ch] * wx) * (1 - wy) + (arr[i01 * s + ch] * (1 - wx) + arr[i11 * s + ch] * wx) * wy;
      let uc = (u - cOff) % 1;
      if (uc < 0) uc += 1;
      const fxc = uc * TW - 0.5 < 0 ? uc * TW - 0.5 + TW : uc * TW - 0.5, cx0 = fxc | 0, wcx = fxc - cx0, cx1 = (cx0 + 1) % TW;
      const cl = (((cloud[ty * TW + cx0] * (1 - wcx) + cloud[ty * TW + cx1] * wcx) * (1 - wy) + (cloud[ty1 * TW + cx0] * (1 - wcx) + cloud[ty1 * TW + cx1] * wcx) * wy) / 255) * clouds;
      const lam = xx * sx + v * sy + z * sz;
      const dk = clamp((lam + 0.08) / 0.3);
      const diff = 0.18 + 0.82 * Math.max(0, lam);
      let r = bl(day, 3, 0) * (1 - cl) + 245 * cl, gr = bl(day, 3, 1) * (1 - cl) + 247 * cl, b = bl(day, 3, 2) * (1 - cl) + 252 * cl;
      r *= diff;
      gr *= diff;
      b *= diff;
      const nl = (1 - dk) * lights * (1 - cl * 0.7);
      r = r * dk + night[ti * 3] * nl + 6 * (1 - dk);
      gr = gr * dk + night[ti * 3 + 1] * nl + 10 * (1 - dk);
      b = b * dk + night[ti * 3 + 2] * nl + 22 * (1 - dk);
      // дымка у края
      const rim = Math.pow(1 - z, 2.5) * atmo;
      r = r * (1 - rim * 0.6) + 120 * rim * 0.6 * (0.2 + dk);
      gr = gr * (1 - rim * 0.6) + 170 * rim * 0.6 * (0.2 + dk);
      b = b * (1 - rim * 0.6) + 255 * rim * 0.6 * (0.2 + dk);
      d[k] = r;
      d[k + 1] = gr;
      d[k + 2] = b;
      d[k + 3] = r2 > 0.995 ? 255 * clamp((1 - r2) / 0.005 + 0.3) : 255;
    }
  }
  c2.putImageData(img, 0, 0);
  g.drawImage(cnv, 0, 0, pw, ph, x0, y0, x1 - x0, y1 - y0);
}

function spaceBg(g, cache, seed = 5, n = 1400) {
  put(g, layer(cache, `stars${seed}`, W, H, (b) => {
    b.fillStyle = '#02040A';
    b.fillRect(0, 0, W, H);
    stars(b, seed, n);
    b.fillStyle = rgrad(b, W * 0.7, H * 0.3, W * 0.6, [[0, 'rgba(60,70,140,0.12)'], [1, 'rgba(0,0,0,0)']]);
    b.fillRect(0, 0, W, H);
  }));
}
function astronaut(g, x, y, s, phase = 0, dir = 1) {
  g.save();
  g.translate(x, y);
  g.scale(dir * s / 100, s / 100);
  const a = Math.sin(phase) * 0.3;
  [[-6, a], [6, -a]].forEach(([dx, r]) => {
    g.save();
    g.translate(dx, -40);
    g.rotate(r);
    rrect(g, -6, 0, 12, 40, 5, '#E9ECEF');
    g.restore();
  });
  rrect(g, -18, -82, 36, 46, 12, '#F4F6F8');
  rrect(g, -26, -80, 12, 36, 4, '#C9CED4');
  circle(g, 2, -94, 15, '#F4F6F8');
  ellipse(g, 7, -94, 9, 8, '#D9A440');
  ellipse(g, 9, -97, 3, 2.5, rgba('#FFFFFF', 0.7));
  g.restore();
}

export const spaceShots = {
  // S04-2 (ночь), S05-4 (день + столбики МГЭИК), S08-2 (огни городов)
  globe(g, t, dur, p, cache) {
    spaceBg(g, cache);
    const k = clamp(t / dur);
    if (p.mode === 'night') globe(g, W / 2, H / 2, 420, {lon0: 10 + t * 4, lat0: 25, t, sun: [0.95, 0.15, -0.3]});
    else if (p.mode === 'lights') globe(g, W * 0.64, H / 2 + 20, lerp(420, 480, ease.inOut(k)), {lon0: 80 + t * 3, lat0: 28, t, sun: [0.9, 0.2, -0.4]});
    else {
      const R = lerp(380, 420, ease.inOut(k));
      globe(g, 640, H / 2, R, {lon0: -10 + t * 3, lat0: 18, t, sun: [-0.45, 0.3, 0.85]});
      if (p.chart === 'temp') tempChart(g, t);
    }
  },
  // S05-1: рассвет над краем Земли с орбиты
  orbitLimb(g, t, dur, p, cache) {
    spaceBg(g, cache, 9);
    const R = 2600, cx = W / 2 + 200, cy = H + 2180 - t * 6;
    globe(g, cx, cy, R, {lon0: 30 + t * 0.4, lat0: 62, t, sun: [0.25, 0.62, -0.75], lights: 1, clouds: 0.8});
    // слои атмосферы у края
    const k = ease.inOut(clamp((t - 1) / 7));
    const sx = W * 0.62, sy = cy - R * Math.cos(0.05) - 6;
    g.save();
    g.beginPath();
    g.arc(cx, cy, R + 60, 0, Math.PI * 2);
    g.arc(cx, cy, R - 30, 0, Math.PI * 2, true);
    g.clip();
    g.fillStyle = rgrad(g, cx, cy, R + 60, [[(R - 30) / (R + 60), 'rgba(0,0,0,0)'], [(R - 4) / (R + 60), rgba('#FF8A3A', 0.25 + 0.55 * k)], [R / (R + 60), rgba('#FFD08A', 0.4 + 0.5 * k)], [(R + 14) / (R + 60), rgba('#5FA8FF', 0.6 * (0.3 + k))], [1, 'rgba(20,40,120,0)']]);
    g.fillRect(0, 0, W, H);
    g.restore();
    // солнце выходит из-за горизонта
    glow(g, sx, sy, 900 * k + 100, '#FFB868', 0.45 * k);
    glow(g, sx, sy, 260, '#FFF4DC', 0.9 * k);
    if (k > 0.2) {
      g.globalCompositeOperation = 'lighter';
      g.fillStyle = rgba('#FFE7C0', 0.5 * k);
      g.fillRect(sx - 600 * k, sy - 2, 1200 * k, 4);
      g.fillRect(sx - 2, sy - 260 * k, 4, 520 * k);
      g.globalCompositeOperation = 'source-over';
    }
  },
  // S20-3: орбита ночью — спутники и полярное сияние
  orbitNight(g, t, dur, p, cache) {
    spaceBg(g, cache, 13);
    const R = 2300, cx = W / 2 - 200, cy = H + 1820;
    globe(g, cx, cy, R, {lon0: 10 + t * 0.8, lat0: 58, t, sun: [0.2, -0.3, -0.9], lights: 1, clouds: 0.6});
    // сияние: зелёные «занавеси» вдоль края
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 120; i++) {
      const a = -Math.PI / 2 - 0.45 + (i / 120) * 0.9;
      const x = cx + Math.cos(a) * (R + 10), y = cy + Math.sin(a) * (R + 10);
      const h = 80 + 90 * (0.5 + 0.5 * Math.sin(i * 0.7 + t * 1.3));
      const gr = g.createLinearGradient(x, y, x, y - h);
      gr.addColorStop(0, rgba('#5CFF9A', 0.12));
      gr.addColorStop(0.7, rgba('#7A5CFF', 0.08));
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - 14, y - h, 28, h);
    }
    g.globalCompositeOperation = 'source-over';
    // спутники и станция
    for (let i = 0; i < 4; i++) {
      const x = ((t * (30 + i * 12) + i * 500) % (W + 300)) - 150, y = 180 + i * 90;
      rrect(g, x - 6, y - 6, 12, 12, 2, '#C9CFD6');
      g.fillStyle = '#2C4E7E';
      g.fillRect(x - 40, y - 4, 30, 8);
      g.fillRect(x + 10, y - 4, 30, 8);
    }
    const sx = lerp(-300, W + 300, t / dur), sy = 330;
    g.fillStyle = '#B9C0C8';
    g.fillRect(sx - 220, sy - 4, 440, 8);
    for (let k = 0; k < 4; k++) {
      g.fillStyle = '#2D4C78';
      g.fillRect(sx - 210 + k * 115, sy - 70, 60, 60);
      g.fillRect(sx - 210 + k * 115, sy + 10, 60, 60);
    }
    rrect(g, sx - 60, sy - 18, 120, 36, 14, '#D7DCE2');
  },
  // S21-1: бледно-голубая точка в солнечном луче
  paleDot(g, t, dur, p, cache) {
    g.fillStyle = '#020306';
    g.fillRect(0, 0, W, H);
    stars(g, 31, 220, W, H, 0.5);
    g.save();
    g.translate(W / 2, H / 2);
    g.rotate(-0.35);
    const gr = g.createLinearGradient(0, -120, 0, 120);
    gr.addColorStop(0, 'rgba(255,220,180,0)');
    gr.addColorStop(0.5, 'rgba(255,214,170,0.16)');
    gr.addColorStop(1, 'rgba(255,220,180,0)');
    g.fillStyle = gr;
    g.fillRect(-1600, -120, 3200, 240);
    g.restore();
    const z = lerp(1, 1.5, ease.inOut(clamp(t / dur)));
    const r = 2.2 * z;
    glow(g, W / 2 + 40, H / 2 + 10, 26 * z, '#9FCBFF', 0.6);
    circle(g, W / 2 + 40, H / 2 + 10, r, '#CFE6FF');
  },
  // S21-2: восход Земли над Луной
  earthrise(g, t, dur, p, cache) {
    spaceBg(g, cache, 17, 500);
    const k = ease.inOut(clamp(t / dur));
    globe(g, W * 0.58, lerp(780, 430, k), 170, {lon0: -30 + t * 2, lat0: 10, t, sun: [-0.85, 0.1, 0.5]});
    put(g, layer(cache, 'moonfg', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 720, H, [[0, '#8C8C88'], [1, '#3E3E3C']]);
      b.beginPath();
      b.moveTo(0, H);
      for (let x = 0; x <= W; x += 10) b.lineTo(x, 760 - Math.sin(x / 260) * 30 - Math.sin(x / 90) * 8);
      b.lineTo(W, H);
      b.fill();
      const R = rng(4);
      for (let i = 0; i < 60; i++) {
        const x = R() * W, y = 800 + R() * 280, r = 6 + R() * 50;
        ellipse(b, x, y, r, r * 0.3, rgba('#2E2E2C', 0.5));
        ellipse(b, x, y - r * 0.06, r * 0.9, r * 0.24, rgba('#A8A8A2', 0.35));
      }
    }));
  },
  // S20-1: база у южного полюса Луны
  moonBase(g, t, dur, p, cache) {
    spaceBg(g, cache, 21, 900);
    globe(g, 1560, 190, 70, {lon0: 20, lat0: 10, t, sun: [-0.9, 0.05, 0.4]});
    const L = layer(cache, 'moon', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 600, H, [[0, '#9A9892'], [1, '#55534F']]);
      b.beginPath();
      b.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) b.lineTo(x, 640 - Math.sin(x / 400) * 40 - Math.sin(x / 120 + 1) * 10);
      b.lineTo(W, H);
      b.fill();
      const R = rng(8);
      for (let i = 0; i < 40; i++) {
        const x = R() * W, y = 680 + R() * 380, r = 10 + R() * 80;
        ellipse(b, x, y, r, r * 0.28, rgba('#3C3A36', 0.55));
        ellipse(b, x + r * 0.15, y - r * 0.05, r * 0.8, r * 0.2, rgba('#B2B0AA', 0.3));
      }
      // жилые модули под слоем реголита и солнечные башни
      [[560, 700, 180], [820, 720, 140], [1080, 705, 200]].forEach(([x, y, w]) => {
        b.fillStyle = rgrad(b, x - w * 0.35, y - w * 0.3, w * 1.2, [[0, '#C9C6BE'], [0.6, '#8A8780'], [1, '#5E5C57']]);
        b.beginPath();
        b.ellipse(x, y, w, w * 0.42, 0, Math.PI, 0);
        b.fill();
        ellipse(b, x, y, w, w * 0.08, '#6E6B65');
        rrect(b, x + w * 0.5, y - 20, 60, 30, 8, '#D9D6CE');
        b.fillStyle = rgba('#FFD49A', 0.9);
        b.fillRect(x + w * 0.5 + 10, y - 12, 14, 10);
      });
      [[1380, 300], [1500, 360], [300, 340]].forEach(([x, h]) => {
        b.fillStyle = '#C9C6BE';
        b.fillRect(x - 4, 690 - h, 8, h);
        b.fillStyle = '#2E4A72';
        for (let k = 0; k < 4; k++) b.fillRect(x - 40, 690 - h + k * 50, 80, 36);
      });
      // длинные тени от низкого солнца
      b.fillStyle = rgba('#000000', 0.35);
      [[560, 700, 180], [820, 720, 140], [1080, 705, 200]].forEach(([x, y, w]) => poly(b, [[x - w, y + 10], [x + w, y + 10], [x + w + 500, y + 60], [x - w + 400, y + 60]]));
    });
    g.save();
    g.translate(-t * 6, 0);
    put(g, L, 0, 0, W + 80, H);
    g.restore();
    glow(g, 0, 520, 600, '#FFF2DA', 0.4);
    astronaut(g, 700 + t * 18, 820, 120, t * 4, 1);
    astronaut(g, 1240 - t * 10, 860, 110, t * 4 + 1, -1);
  },
  // S20-2: поселение на Марсе, на горизонте пыльная буря
  mars(g, t, dur, p, cache) {
    const L = layer(cache, 'mars', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, 700, [[0, '#C98E6E'], [1, '#E8B898']]);
      b.fillRect(0, 0, W, H);
      ridge(b, 3, 640, 160, '#A85F3E', W, H, 0.0025);
      ridge(b, 7, 760, 80, '#B86A44', W, H, 0.004);
      b.fillStyle = vgrad(b, 0, 760, H, [[0, '#C0744A'], [1, '#8E4A2E']]);
      b.fillRect(0, 780, W, H - 780);
      const R = rng(12);
      for (let i = 0; i < 80; i++) ellipse(b, R() * W, 800 + R() * 280, 4 + R() * 26, 3 + R() * 10, rgba('#6E3420', 0.6));
    });
    put(g, L);
    // буря надвигается
    const k = clamp(t / dur);
    g.fillStyle = vgrad(g, 0, 300, 760, [[0, 'rgba(160,90,60,0)'], [1, rgba('#9A5A3A', 0.55 + 0.25 * k)]]);
    g.fillRect(0, 300, W, 460);
    for (let i = 0; i < 18; i++) {
      const x = ((i * 140 - t * 22) % (W + 300)) + 150;
      glow(g, x, 600 - (i % 3) * 30, 160, '#B06A44', 0.25);
    }
    // купола-оранжереи
    [[700, 840, 150], [930, 860, 110], [1160, 845, 170], [1380, 870, 90]].forEach(([x, y, r], i) => {
      ellipse(g, x, y + 6, r * 1.1, r * 0.25, rgba('#5A2A18', 0.5));
      g.fillStyle = rgrad(g, x - r * 0.3, y - r * 0.6, r * 1.2, [[0, rgba('#E9F4F2', 0.85)], [1, rgba('#9CC9C4', 0.55)]]);
      g.beginPath();
      g.arc(x, y, r, Math.PI, 0);
      g.fill();
      glow(g, x, y - r * 0.3, r * 0.8, '#9CFF9A', 0.25);
      for (let j = 0; j < 4; j++) circle(g, x - r * 0.6 + j * r * 0.4, y - r * 0.15, r * 0.12, rgba('#3E8E5A', 0.8));
      g.strokeStyle = rgba('#FFFFFF', 0.6);
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, y, r, Math.PI, 0);
      g.stroke();
    });
    g.fillStyle = '#7A4A36';
    g.fillRect(780, 852, 380, 10);
  },
};

function tempChart(g, t) {
  const x0 = 1180, base = 820;
  const bars = [[1.4, C.ok, 'зелёный'], [2.7, C.yellow, 'жёлтый'], [4.4, C.red, 'красный']];
  g.save();
  g.fillStyle = 'rgba(8,14,26,0.6)';
  g.beginPath();
  g.roundRect(x0 - 60, 210, 700, 720, 20);
  g.fill();
  g.font = "700 16px 'Manrope'";
  g.letterSpacing = '3px';
  g.fillStyle = 'rgba(255,255,255,0.72)';
  g.fillText('ПОТЕПЛЕНИЕ К 2081–2100, °C', x0, 264);
  g.letterSpacing = '0px';
  bars.forEach(([v, c, name], i) => {
    const on = clamp((t - 0.6 - i * 1.4) / 1.0);
    const h = (v / 4.6) * 470 * ease.out(on);
    g.fillStyle = c;
    g.beginPath();
    g.roundRect(x0 + i * 200, base - h, 130, h, 10);
    g.fill();
    if (on > 0.2) {
      g.globalAlpha = clamp((on - 0.2) / 0.5);
      g.font = "800 40px 'Unbounded'";
      g.fillStyle = '#FFFFFF';
      g.fillText(`+${String(v).replace('.', ',')}`, x0 + i * 200, base - h - 20);
      g.font = "600 20px 'Manrope'";
      g.fillStyle = 'rgba(255,255,255,0.8)';
      g.fillText(name, x0 + i * 200, base + 40);
      g.globalAlpha = 1;
    }
  });
  g.font = "500 16px 'Manrope'";
  g.fillStyle = 'rgba(255,255,255,0.55)';
  g.fillText('МГЭИК, AR6 (2021), лучшие оценки сценариев', x0, base + 86);
  g.restore();
}
