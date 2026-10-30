// Город 2126: панорама со слоями для параллакса, терраса Миры, сумерки, ночь, финальный отлёт.
import {W, H, C, P, clamp, lerp, ip, ease, rnd, rng, rgba, mixc, vgrad, rgrad, circle, ellipse, poly, rrect, glow, layer, put, makeCanvas} from '../core.js';
import {sky, SKY, sun, rays, clouds, ridge, sea, shimmer, tree, terraceTower, boxSkyline, tram, windTurbine, crowd, bird, stars, bush, haze} from '../draw.js';
import {mira, aya, miraPortrait, eyeMacro} from '../characters.js';

const WW = 2400; // ширина панорамы города в логических пикселях
const MODES = {
  golden: {sky: SKY.golden, sun: [430, 430], tint: '#F2C48C', tintA: 0.12, light: 0.15, seaTop: '#B7C2B4', seaBot: '#1D5566', far: '#B9C9C2'},
  dusk: {sky: SKY.dusk, sun: [520, 610], tint: '#C77A6A', tintA: 0.22, light: 0.75, seaTop: '#8E7FA0', seaBot: '#1A2F4E', far: '#8E7E96'},
  night: {sky: SKY.night, sun: null, tint: '#1B2A55', tintA: 0.55, light: 1, seaTop: '#26365E', seaBot: '#0B1530', far: '#2A3658'},
  day: {sky: SKY.day, sun: [380, 260], tint: '#FFFFFF', tintA: 0.0, light: 0, seaTop: '#9ACFDB', seaBot: '#1E6A80', far: '#A9C7CC'},
};

/** Слои панорамы для режима освещения. res — запас разрешения под наезд камеры. */
export function cityLayers(cache, mode = 'golden', res = 1) {
  const key = `city_${mode}_${res}`;
  if (cache[key]) return cache[key];
  const M = MODES[mode];
  const mk = (h, fn) => {
    const [c, g] = makeCanvas(WW * res, h * res);
    g.scale(res, res);
    fn(g);
    return {c, w: WW, h};
  };
  const L = {};
  L.sky = mk(H, (g) => {
    sky(g, M.sky, WW, H);
    if (mode === 'night') stars(g, 7, 900, WW, H * 0.7);
    if (M.sun) {
      sun(g, M.sun[0], M.sun[1], mode === 'dusk' ? 46 : 38, mode === 'day' ? '#FFFFFF' : '#FFF1D0', mode === 'dusk' ? '#FF9A5A' : '#FFC07A');
      rays(g, M.sun[0], M.sun[1], 26, 1500, mode === 'dusk' ? '#FFB27A' : '#FFE3B0', 0.05, Math.PI * 1.1, Math.PI * 0.12, 4);
    }
    clouds(g, 3, 16, 120, 420, mode === 'night' ? '#3A4A78' : mode === 'dusk' ? '#F2A27A' : '#FFF4E2', mode === 'night' ? 0.35 : 0.7, WW, [80, 220]);
  });
  L.far = mk(H, (g) => {
    ridge(g, 11, 640, 120, mixc(M.far, '#FFFFFF', 0.15), WW, H, 0.003);
    const R = rng(21);
    for (let i = 0; i < 34; i++) {
      const x = 900 + R() * 1500, w = 30 + R() * 50, h = 90 + R() * 210;
      terraceTower(g, x, 662, w, h, {tiers: 3 + Math.floor(R() * 3), body: mixc(M.far, '#FFFFFF', 0.25), shade: M.far, glass: mixc(M.far, '#5E9AA0', 0.3), garden: 1, seed: 100 + i, light: M.light * 0.6, haze: 0.0});
    }
    g.fillStyle = vgrad(g, 0, 380, 680, [[0, rgba(M.far, 0)], [1, rgba(mixc(M.far, '#FFFFFF', 0.35), 0.55)]]);
    g.fillRect(0, 380, WW, 300);
  });
  L.mid = mk(H, (g) => {
    const R = rng(37);
    const xs = [];
    for (let x = 820; x < WW + 40; x += 95 + R() * 70) xs.push(x);
    xs.forEach((x, i) => {
      const w = 80 + R() * 70, h = 200 + R() * 300;
      const body = mixc(i % 3 === 0 ? C.timber : C.stone, M.tint, M.tintA);
      terraceTower(g, x, 732, w, h, {tiers: 4 + Math.floor(R() * 3), body, shade: mixc(body, '#5A4A3A', 0.25), glass: mixc('#5E9AA0', M.tint, M.tintA * 0.8), seed: 300 + i, light: M.light});
    });
  });
  L.near = mk(H, (g) => {
    // набережная-дамба с парком и виадук
    g.fillStyle = mixc('#5E8C55', M.tint, M.tintA);
    poly(g, [[0, 786], [WW, 770], [WW, 800], [0, 812]]);
    g.fillStyle = mixc('#C9C1AE', M.tint, M.tintA);
    g.fillRect(0, 806, WW, 6);
    for (let i = 0; i < 60; i++) {
      const x = i * 41 + rnd(i) * 20, y = 786 - (x / WW) * 16;
      tree(g, x, y, 34 + rnd(i * 3) * 22, {seed: 500 + i, leaf: mixc(C.leaf, M.tint, M.tintA), dark: mixc(C.greenDeep, M.tint, M.tintA * 0.8), light: mixc(C.greenLight, M.tint, M.tintA)});
    }
    // виадук
    const vy = 712;
    g.fillStyle = mixc('#E3DCCB', M.tint, M.tintA);
    g.fillRect(760, vy, WW - 760, 9);
    for (let x = 800; x < WW; x += 120) g.fillRect(x, vy, 8, 70);
    for (let x = 770; x < WW; x += 26) circle(g, x, vy - 2, 9, mixc(C.leaf, M.tint, M.tintA));
  });
  cache[key] = L;
  return L;
}

/** Нарисовать город. cam: {z, fx, fy, dx, dy, pan} — наезд вокруг точки фокуса в мире панорамы. */
export function drawCity(g, t, cache, mode = 'golden', cam = {}, res = 1, o = {}) {
  const {z = 1, fx = 1200, fy = 640, pan = 0, dy = 0} = cam;
  const L = cityLayers(cache, mode, res);
  const M = MODES[mode];
  const depths = {sky: 0.15, far: 0.45, mid: 0.8, near: 1.0, sea: 1.15};
  const draw = (name, extra) => {
    const d = depths[name], zz = 1 + (z - 1) * d;
    g.save();
    g.translate(W / 2, H / 2 + dy * d);
    g.scale(zz, zz);
    g.translate(-fx - pan * d, -fy);
    if (L[name]) put(g, L[name], 0, 0, WW, H);
    if (extra) extra();
    g.restore();
  };
  draw('sky');
  draw('far');
  draw('mid', () => {
    // трамвай едет по виадуку
    const tx = ((t * 70 + (o.tramPhase || 0)) % 1900) + 700;
    tram(g, tx, 712, 150, mode === 'night' ? '#D9E2EA' : '#F4F1EA', C.rust);
    if (M.light > 0.5) glow(g, tx + 75, 700, 120, '#FFD9A0', 0.25);
  });
  draw('near', () => {
    crowd(g, t, 9, 26, 0, WW, 798, 806, mode === 'night' ? ['#121A2E', '#1E2A44'] : ['#2B3640', '#6B4A3A', '#3A4A5E', '#7A3B2A'], 18);
  });
  draw('sea', () => {
    sea(g, 812, M.seaTop, M.seaBot, WW, H + 200);
    // отражение башен в воде
    g.save();
    g.globalAlpha = mode === 'night' ? 0.25 : 0.16;
    g.translate(0, 812 * 2);
    g.scale(1, -1);
    put(g, L.mid, 0, 0, WW, H);
    g.restore();
    shimmer(g, t, 815, H + 150, mode === 'night' ? '#9FB4E8' : '#FFE6B8', 260, mode === 'night' ? 0.35 : 0.55, WW, 5, 10);
    if (M.sun) {
      const sx = M.sun[0];
      for (let i = 0; i < 40; i++) {
        const yy = 818 + i * 7.5, ww = 20 + i * 5 + Math.sin(t * 2 + i) * 10;
        g.fillStyle = rgba('#FFE2B0', 0.35 * (1 - i / 40));
        g.fillRect(sx - ww / 2 + Math.sin(t * 1.3 + i * 0.7) * 8, yy, ww, 2.5);
      }
    }
  });
  // чайки
  for (let i = 0; i < 5; i++) {
    const bx = ((t * (40 + i * 7) + i * 410) % (W + 200)) - 100, by = 260 + i * 38 + Math.sin(t + i) * 12;
    bird(g, bx, by, 9 + i, t * 7 + i, mode === 'night' ? '#C9D2E8' : '#3A3A40');
  }
}

// ---------- терраса Миры ----------
function terraceLayer(cache, mode) {
  return layer(cache, `terrace_${mode}`, W, H, (g) => {
    const M = MODES[mode];
    const deck = mode === 'night' ? '#4A3A2E' : mode === 'dusk' ? '#8A5A3E' : '#A87650';
    // пол из досок в перспективе
    g.fillStyle = vgrad(g, 0, 860, H, [[0, mixc(deck, '#000000', 0.15)], [1, deck]]);
    g.fillRect(0, 860, W, H - 860);
    for (let i = -20; i < 40; i++) {
      g.strokeStyle = rgba('#000000', 0.18);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(W / 2 + i * 22, 860);
      g.lineTo(W / 2 + i * 150, H);
      g.stroke();
    }
    // стеклянное ограждение
    g.fillStyle = rgba('#DDEFF2', mode === 'night' ? 0.06 : 0.12);
    g.fillRect(0, 760, W, 100);
    g.fillStyle = mixc('#C9D4D8', M.tint, M.tintA);
    g.fillRect(0, 756, W, 6);
    g.fillRect(0, 856, W, 6);
    // оливы в кадках и скамья
    [[150, 1.0], [1760, 1.15]].forEach(([x, s], i) => {
      rrect(g, x - 46 * s, 930 - 80 * s, 92 * s, 80 * s, 10, mixc('#B8A48A', M.tint, M.tintA));
      tree(g, x, 932 - 80 * s, 210 * s, {seed: 900 + i, leaf: mixc('#7F9A62', M.tint, M.tintA), dark: mixc('#55704A', M.tint, M.tintA), light: mixc('#B8C98E', M.tint, M.tintA), trunk: '#6B5440'});
    });
    rrect(g, 1300, 900, 260, 18, 6, mixc('#8A6440', M.tint, M.tintA));
    rrect(g, 1310, 918, 12, 50, 3, mixc('#6B4A30', M.tint, M.tintA));
    rrect(g, 1538, 918, 12, 50, 3, mixc('#6B4A30', M.tint, M.tintA));
    rrect(g, 1300, 870, 260, 12, 6, mixc('#8A6440', M.tint, M.tintA));
  });
}
/** Фон террасы: город чуть размыт (глубина резкости). */
function terraceBg(cache, mode, t) {
  return layer(cache, `tbg_${mode}`, W, H, (g) => {
    drawCity(g, 0, cache, mode, {z: 1.15, fx: 1400, fy: 620}, 1);
  });
}
export function terrace(g, t, cache, mode = 'golden', o = {}) {
  const {z = 1, fx = W / 2, fy = H / 2} = o;
  g.save();
  g.translate(W / 2, H / 2);
  g.scale(z, z);
  g.translate(-fx, -fy);
  // фон — живой город (трамвай, вода), без кэша размытия, чтобы двигался
  g.save();
  g.translate(0, -60);
  drawCity(g, t, cache, mode, {z: 1.18, fx: 1450, fy: 640}, 1);
  g.restore();
  put(g, terraceLayer(cache, mode));
  g.restore();
}

// ---------- шаблоны кадров ----------
export const cityShots = {
  // S08-3/4: пролёт с моря к городу, наезд сквозь башни к террасе
  cityFly(g, t, dur, p, cache) {
    if (p.stage === 1) {
      const k = ease.inOut(clamp(t / dur));
      drawCity(g, t, cache, 'golden', {z: lerp(1.0, 1.32, k), fx: lerp(1050, 1250, k), fy: 640, dy: lerp(160, 0, ease.out(clamp(t / 6)))}, 1.4);
    } else {
      const k = ease.inOut(clamp(t / dur));
      drawCity(g, t, cache, 'golden', {z: lerp(1.32, 1.75, k), fx: lerp(1250, 1500, k), fy: lerp(640, 600, k)}, 1.4, {tramPhase: 300});
      // в конце снизу въезжает терраса с Мирой
      const r = ease.out(clamp((t - 6.5) / 5));
      if (r > 0) {
        g.save();
        g.translate(0, (1 - r) * 420);
        put(g, terraceLayer(cache, 'golden'), 0, 0, W, H, r);
        mira(g, 1180, 905, 210, {pose: 'back', t, wind: 0.6, arm: 'rail'});
        g.restore();
      }
    }
  },
  // S04-3: Мира идёт по террасе, ветер в шарфе
  terraceWalk(g, t, dur, p, cache) {
    const k = clamp(t / dur);
    terrace(g, t, cache, 'golden', {z: 1.08, fx: lerp(900, 1020, k), fy: 560});
    mira(g, lerp(560, 1060, k) - (lerp(900, 1020, k) - 960) * 1.08, 925, 330, {pose: 'walk', phase: t * 5.2, t, wind: 0.8, dir: 1});
  },
  // S02-3: глаз Миры → отъезд к террасе
  eyeToTerrace(g, t, dur, p, cache) {
    const k = ease.inOut(clamp((t - 1.6) / 4.5));
    if (k < 1) {
      g.save();
      eyeMacro(g, W / 2, H / 2, 230, {age: 'old', open: ip(t, 0, 1.4, 0.15, 1), t});
      g.restore();
    }
    if (k > 0) {
      g.save();
      g.globalAlpha = k;
      const z = lerp(4.5, 1, k);
      g.translate(W / 2, H / 2);
      g.scale(z, z);
      g.translate(-1265, -520);
      terrace(g, t, cache, 'golden', {z: 1});
      miraPortraitOnTerrace(g, t);
      g.restore();
    }
  },
  // S22-3: крупный портрет Миры, взгляд в камеру
  miraClose(g, t, dur, p, cache) {
    const z = lerp(1, 1.08, clamp(t / dur));
    layer(cache, 'bokeh', W, H, (bg) => {
      bg.filter = 'blur(14px)';
      drawCity(bg, 0, cache, 'golden', {z: 1.4, fx: 1500, fy: 600}, 1);
      bg.filter = 'none';
    });
    g.save();
    g.translate(W / 2, H / 2);
    g.scale(z, z);
    g.translate(-W / 2, -H / 2);
    put(g, cache.bokeh);
    glow(g, 300, 380, 700, '#FFC27A', 0.35);
    miraPortrait(g, 1010, 470, 330, {t, smile: 0.7, blink: t > 5.2 && t < 5.45 ? 1 : 0});
    g.restore();
  },
  // S24-1: закат, Мира отдаёт шарф Ае
  scarf(g, t, dur, p, cache) {
    terrace(g, t, cache, 'dusk', {z: 1.25, fx: 980, fy: 640});
    const k = clamp((t - 3.5) / 4.5);
    mira(g, 820, 960, 420, {pose: 'side', dir: 1, t, wind: 0.4, scarf: k < 0.5, arm: k > 0 && k < 1 ? 'hold' : 'down'});
    aya(g, 1130, 960, 280, {pose: 'side', dir: -1, t, scarf: k >= 0.5, arm: t > 9 ? 'up' : 'down'});
    if (k > 0 && k < 1) {
      // шарф в руках между ними
      const x = lerp(870, 1080, ease.inOut(k)), y = lerp(640, 760, ease.inOut(k));
      g.fillStyle = '#C8642B';
      g.beginPath();
      g.moveTo(x - 50, y);
      g.quadraticCurveTo(x, y + 40 + Math.sin(t * 3) * 6, x + 50, y + 8);
      g.lineTo(x + 46, y + 30);
      g.quadraticCurveTo(x, y + 62, x - 52, y + 22);
      g.closePath();
      g.fill();
    }
    g.fillStyle = rgba('#FF9A5A', 0.08);
    g.fillRect(0, 0, W, H);
  },
  // S24-2: силуэты у ограждения, в городе зажигаются огни
  silhouettes(g, t, dur, p, cache) {
    const k = clamp(t / dur);
    drawCity(g, t, cache, 'dusk', {z: 1.1 + 0.05 * k, fx: 1350, fy: 630}, 1);
    g.fillStyle = rgba('#0B1530', 0.25 + 0.35 * k);
    g.fillRect(0, 0, W, H);
    // огни загораются по одному
    const R = rng(77);
    for (let i = 0; i < 160; i++) {
      const x = 420 + R() * 1500, y = 380 + R() * 330, on = clamp((k * 1.3 - R()) * 6);
      if (on > 0) {
        g.fillStyle = rgba('#FFD08A', 0.9 * on);
        g.fillRect(x, y, 4, 5);
        glow(g, x + 2, y + 2, 14, '#FFC070', 0.25 * on);
      }
    }
    g.fillStyle = '#0D0F16';
    g.fillRect(0, 860, W, H - 860);
    g.fillRect(0, 852, W, 6);
    mira(g, 860, 870, 360, {pose: 'back', t, wind: 0.5, scarf: false, arm: 'rail'});
    aya(g, 1060, 870, 240, {pose: 'back', t, scarf: true});
  },
  // S11-4: город в сумерках с морскими ветряками
  cityDusk(g, t, dur, p, cache) {
    const k = clamp(t / dur);
    drawCity(g, t, cache, 'dusk', {z: 1.05 + 0.08 * k, fx: 1150 + 120 * k, fy: 640}, 1);
    for (let i = 0; i < 7; i++) windTurbine(g, 80 + i * 110, 790 - i * 4, 120 - i * 8, t, rgba('#E9E2EA', 0.85), 0.8, i);
  },
  // S25-1: финальный отлёт вверх, в облака
  pullback(g, t, dur, p, cache) {
    const k = ease.inOut(clamp(t / dur));
    g.save();
    g.translate(0, k * 260);
    drawCity(g, t, cache, 'dusk', {z: lerp(1.5, 0.95, k), fx: lerp(1380, 1250, k), fy: 640}, 1.4);
    g.restore();
    const c = clamp((t - 7) / 8);
    if (c > 0) {
      clouds(g, 41, 12, lerp(1200, 200, c), lerp(1500, 900, c), '#F7D9C4', 1.2 * c, W, [200, 420]);
      g.fillStyle = rgba('#F3D2BC', 0.6 * c);
      g.fillRect(0, 0, W, H);
    }
  },
  // S20-4 и S21-3: ночная терраса — орбитальные огни в небе или Ая у телескопа
  terraceNight(g, t, dur, p, cache) {
    terrace(g, t, cache, 'night', {z: 1.05, fx: 960, fy: 560});
    for (let i = 0; i < 4; i++) {
      const x = ((t * (14 + i * 5) + i * 520) % (W + 300)) - 150, y = 120 + i * 70 - x * 0.05;
      circle(g, x, y, 2.4, '#FFFFFF');
      glow(g, x, y, 16, '#BFD8FF', 0.6 * (0.6 + 0.4 * Math.sin(t * 3 + i)));
    }
    if (p.mode === 'telescope') {
      // латунный телескоп на треноге
      g.strokeStyle = '#6B5A3A';
      g.lineWidth = 6;
      [[1040, 960], [1120, 960], [1080, 975]].forEach(([x, y]) => {
        g.beginPath();
        g.moveTo(1080, 800);
        g.lineTo(x, y);
        g.stroke();
      });
      g.save();
      g.translate(1080, 795);
      g.rotate(-0.5);
      rrect(g, -30, -16, 190, 32, 10, '#C9A15A');
      rrect(g, 150, -20, 30, 40, 8, '#E2BE72');
      g.restore();
      const look = t > 5.5;
      aya(g, look ? 960 : 1000, 975, 270, {pose: 'side', dir: 1, t, arm: look ? 'down' : 'hold'});
      glow(g, 980, 720, 260, '#FFC88A', 0.12);
    } else {
      mira(g, 820, 960, 360, {pose: 'back', t, wind: 0.3, arm: 'rail'});
      aya(g, 1010, 960, 245, {pose: 'back', t});
    }
  },
  // S23-3/4: серый город 2026 → зелёный 2126 с того же ракурса
  cityMorph(g, t, dur, p, cache) {
    const z = 1.05 + 0.04 * (t / dur);
    if (p.stage === 0) {
      const L = layer(cache, 'grey', W, H, (bg) => {
        sky(bg, SKY.grey);
        boxSkyline(bg, 5, 700, 0, '#7C858C', {hmin: 120, hmax: 420});
        boxSkyline(bg, 9, 760, 0, '#5E666D', {hmin: 80, hmax: 300});
        bg.fillStyle = '#4A5156';
        bg.fillRect(0, 760, W, 80);
        sea(bg, 840, '#8E979B', '#5A6A70');
        bg.fillStyle = rgba('#B9B9B0', 0.35);
        bg.fillRect(0, 0, W, H);
      });
      g.save();
      g.translate(W / 2, H / 2);
      g.scale(z, z);
      g.translate(-W / 2, -H / 2);
      put(g, L);
      shimmer(g, t, 845, H, '#C9D0D2', 120, 0.3);
      g.restore();
    } else {
      drawCity(g, t, cache, 'golden', {z: 1.1 * z, fx: 1250, fy: 640}, 1);
    }
  },
  // S06-5: новая береговая линия — дамба-парк
  leveePark(g, t, dur, p, cache) {
    const k = ease.inOut(clamp(t / dur));
    drawCity(g, t, cache, 'day', {z: lerp(1.6, 1.25, k), fx: lerp(700, 900, k), fy: 720, dy: -40}, 1.4);
  },
  // S07-5: Мира у перил дамбы смотрит на море
  miraLevee(g, t, dur, p, cache) {
    const k = clamp(t / dur);
    drawCity(g, t, cache, 'golden', {z: 1.7, fx: 520 + 60 * k, fy: 700}, 1.4);
    // перила и дорожка на переднем плане
    g.fillStyle = '#6E8F5A';
    g.fillRect(0, 930, W, H - 930);
    g.fillStyle = '#D9D2C2';
    g.fillRect(0, 920, W, 14);
    g.strokeStyle = '#3B3F45';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(0, 800);
    g.lineTo(W, 800);
    g.stroke();
    for (let x = 40; x < W; x += 160) {
      g.beginPath();
      g.moveTo(x, 800);
      g.lineTo(x, 925);
      g.stroke();
    }
    mira(g, lerp(1120, 1080, k), 935, 420, {pose: k > 0.55 ? 'side' : 'back', dir: -1, t, wind: 0.9, arm: 'rail'});
  },
};

function miraPortraitOnTerrace(g, t) {
  mira(g, 1265, 925, 330, {pose: 'side', dir: -1, t, wind: 0.7});
}
