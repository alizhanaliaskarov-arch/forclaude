// Ядро: размеры кадра, математика, шум, цвета, кэш слоёв, камера.
// Все рисуется в логических координатах 1920×1080; P.scale переводит их в реальные пиксели
// (2 → 3840×2160 для финального рендера, 0.5 → 960×540 для превью).

export const W = 1920;
export const H = 1080;
export const P = {scale: 2, fps: 30};

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => t * t * (3 - 2 * t);
export const ease = {
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t) => 1 - Math.pow(1 - t, 3),
  in: (t) => t * t * t,
  sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  lin: (t) => t,
  back: (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};
/** Значение v0→v1, пока t идёт от a до b (с ограничением по краям). */
export const ip = (t, a, b, v0, v1, e = ease.inOut) => lerp(v0, v1, e(clamp((t - a) / (b - a))));
/** Плавное появление и исчезновение: 0 → 1 на [a, a+fi], 1 → 0 на [b-fo, b]. */
export const fade = (t, a, b, fi = 0.5, fo = 0.5) => Math.min(ip(t, a, a + fi, 0, 1, ease.sine), ip(t, b - fo, b, 1, 0, ease.sine));

// детерминированный «случай»: одинаковый на каждом кадре и в каждом процессе рендера
export const rnd = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}
export const noise1 = (x) => {
  const i = Math.floor(x);
  return lerp(rnd(i), rnd(i + 1), smooth(x - i));
};
export const noise2 = (x, y) => {
  const i = Math.floor(x), j = Math.floor(y), u = smooth(x - i), v = smooth(y - j);
  const r = (a, b) => rnd(a * 57.3 + b * 131.7);
  return lerp(lerp(r(i, j), r(i + 1, j), u), lerp(r(i, j + 1), r(i + 1, j + 1), u), v);
};
export const fbm = (x, y = 0, oct = 4) => {
  let s = 0, a = 0.5, f = 1;
  for (let k = 0; k < oct; k++) {
    s += a * noise2(x * f, y * f);
    f *= 2;
    a *= 0.5;
  }
  return s / (1 - Math.pow(0.5, oct));
};

// цвета
const parse = (c) => {
  if (c.startsWith('#')) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  return c.match(/[\d.]+/g).slice(0, 3).map(Number);
};
export const rgba = (c, a = 1) => {
  const [r, g, b] = parse(c);
  return `rgba(${r},${g},${b},${a})`;
};
export const mixc = (c1, c2, t) => {
  const a = parse(c1), b = parse(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], clamp(t)))).join(',')})`;
};

// палитра фильма: тёплый янтарь против глубокой бирюзы и зелени, рыжий — цвет Миры
export const C = {
  ink: '#0E1622',
  night: '#0B1530',
  deep: '#0F2A3A',
  teal: '#1E6F78',
  tealLight: '#5FB3B0',
  sea: '#1B5F7A',
  seaLight: '#7CC3D6',
  green: '#3E8E5A',
  greenDeep: '#24603F',
  greenLight: '#9BCB7C',
  leaf: '#5DA35F',
  amber: '#F2A65A',
  amberLight: '#FFD9A0',
  gold: '#E8B04B',
  rust: '#C8642B',
  rustDeep: '#9C4520',
  stone: '#E9E1D3',
  timber: '#C99A6B',
  timberDark: '#8E6440',
  paper: '#F6F1E7',
  white: '#FFFFFF',
  grey: '#8A939C',
  red: '#D9483B',
  yellow: '#E9C046',
  ok: '#4DB36B',
  sky: '#9FD3E8',
};

// кэш слоёв: статичные части кадра рисуются один раз на «плёнку» нужного размера
export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * P.scale);
  c.height = Math.ceil(h * P.scale);
  const g = c.getContext('2d');
  g.setTransform(P.scale, 0, 0, P.scale, 0, 0);
  return [c, g];
}
export function layer(cache, key, w, h, fn) {
  if (!cache[key]) {
    const [c, g] = makeCanvas(w, h);
    fn(g, w, h);
    cache[key] = {c, w, h};
  }
  return cache[key];
}
export function put(ctx, L, x = 0, y = 0, w = L.w, h = L.h, alpha = 1) {
  if (alpha <= 0) return;
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * alpha;
  ctx.drawImage(L.c, x, y, w, h);
  ctx.globalAlpha = a;
}
/** Камера: увеличение z вокруг точки (cx, cy) и сдвиг кадра на (dx, dy). Вызывать между save/restore. */
export function camera(ctx, z = 1, cx = W / 2, cy = H / 2, dx = 0, dy = 0) {
  ctx.translate(W / 2 + dx, H / 2 + dy);
  ctx.scale(z, z);
  ctx.translate(-cx, -cy);
}
export function fill(ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(-W, -H, W * 3, H * 3);
}
export function vgrad(ctx, x0, y0, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x0, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
export function rgrad(ctx, x, y, r, stops, r0 = 0) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
export function circle(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2);
  if (color) ctx.fillStyle = color;
  ctx.fill();
}
export function ellipse(ctx, x, y, rx, ry, color, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, Math.PI * 2);
  if (color) ctx.fillStyle = color;
  ctx.fill();
}
export function poly(ctx, pts, color) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  if (color) ctx.fillStyle = color;
  ctx.fill();
}
export function rrect(ctx, x, y, w, h, r, color) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (color) ctx.fillStyle = color;
  ctx.fill();
}
/** Мягкое световое пятно (аддитивно). */
export function glow(ctx, x, y, r, color, a = 1) {
  const op = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rgrad(ctx, x, y, r, [[0, rgba(color, a)], [1, rgba(color, 0)]]);
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalCompositeOperation = op;
}
