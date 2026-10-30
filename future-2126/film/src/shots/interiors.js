// Интерьеры и наука: термояд, квартира Миры, кухня, мастерская, лаборатория, клиники, еда, книга.
import {W, H, C, clamp, lerp, ip, ease, rnd, rng, noise1, rgba, mixc, vgrad, rgrad, circle, ellipse, poly, rrect, glow, layer, put} from '../core.js';
import {sky, SKY, tree, bush, walker, boxSkyline, terraceTower, stars} from '../draw.js';
import {mira, aya, ayaPortrait, baby, oldHand, MIRA, AYA} from '../characters.js';

const PEOPLE = ['#2B3640', '#6B4A3A', '#3A4A5E', '#7A3B2A', '#4E6B58', '#8A6A9A'];
const zoom = (g, z, cx = W / 2, cy = H / 2) => {
  g.translate(cx, cy);
  g.scale(z, z);
  g.translate(-cx, -cy);
};

/** Взрослый в полный рост, анфас/профиль, стилизованно (врачи, техники, соседи). */
function adult(g, x, y, h, o = {}) {
  const {coat = '#F4F6F8', skin = '#C99470', hair = '#2A1E14', dir = 1, arm = 'down', alpha = 1} = o;
  g.save();
  g.globalAlpha *= alpha;
  g.translate(x, y);
  g.scale((dir * h) / 100, h / 100);
  rrect(g, -6, -30, 5, 28, 2, '#3A4552');
  rrect(g, 1, -30, 5, 28, 2, '#3A4552');
  poly(g, [[-10, -78], [10, -78], [13, -26], [-13, -26]], coat);
  const fa = arm === 'scan' ? [[4, -76], [12, -64], [20, -60]] : [[6, -76], [8, -62], [8, -50]];
  g.strokeStyle = coat;
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.beginPath();
  fa.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
  g.stroke();
  circle(g, fa[2][0] + 1, fa[2][1], 2.2, skin);
  if (arm === 'scan') rrect(g, fa[2][0] + 1, fa[2][1] - 6, 9, 5, 1.5, '#2C3E50');
  circle(g, 2, -87, 6.4, skin);
  g.fillStyle = hair;
  g.beginPath();
  g.arc(2, -89, 6.8, Math.PI, 0);
  g.fill();
  g.restore();
}
/** Комната Миры: деревянные стены, окно в город, растения. light 0…1 — сколько дневного света за окном. */
function miraRoom(g, cache, light) {
  const day = layer(cache, 'roomD', W, H, (b) => room(b, 1));
  const eve = layer(cache, 'roomE', W, H, (b) => room(b, 0));
  put(g, eve);
  put(g, day, 0, 0, W, H, light);
}
function room(b, day) {
  b.fillStyle = vgrad(b, 0, 0, H, day ? [[0, '#D9C2A0'], [1, '#B89A74']] : [[0, '#4A3628'], [1, '#2E2218']]);
  b.fillRect(0, 0, W, H);
  for (let i = 0; i < 20; i++) {
    b.fillStyle = rgba('#000000', 0.06);
    b.fillRect(i * 100, 0, 3, 860);
  }
  // окно
  b.fillStyle = vgrad(b, 0, 160, 700, day ? [[0, '#9CC9E0'], [1, '#F2DCC0']] : [[0, '#1A2A55'], [0.6, '#7A4F7A'], [1, '#E98A5A']]);
  b.fillRect(980, 140, 760, 560);
  for (let i = 0; i < 7; i++) terraceTower(b, 1000 + i * 108, 700, 80, 220 + (i % 3) * 90, {tiers: 3, seed: 200 + i, light: day ? 0 : 0.9, body: day ? C.stone : '#8A7E86', shade: day ? '#C9BBA6' : '#6E6470'});
  b.strokeStyle = C.timberDark;
  b.lineWidth = 16;
  b.strokeRect(980, 140, 760, 560);
  b.beginPath();
  b.moveTo(1360, 140);
  b.lineTo(1360, 700);
  b.stroke();
  // пол, полки, растения
  b.fillStyle = day ? '#9C7450' : '#4A3424';
  b.fillRect(0, 860, W, 220);
  b.fillStyle = day ? C.timber : '#5E4430';
  b.fillRect(120, 300, 560, 18);
  b.fillRect(120, 470, 560, 18);
  const R = rng(3);
  for (let i = 0; i < 14; i++) {
    b.fillStyle = ['#C8642B', '#3E6E8A', '#E9C046', '#4E7A44', '#8A6A9A'][i % 5];
    b.fillRect(140 + i * 38, 470 - 90 - R() * 40, 30, 90 + R() * 40);
  }
  bush(b, 300, 300, 50, C.leaf, C.greenDeep, 4);
  rrect(b, 1780, 760, 100, 100, 10, '#B8A48A');
  tree(b, 1830, 760, 300, {seed: 9});
}

export const interiorShots = {
  // S11-3: зал лазерной термоядерной установки
  fusion(g, t, dur, p, cache) {
    put(g, layer(cache, 'fu', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#0B1A2A'], [1, '#132E44']]);
      b.fillRect(0, 0, W, H);
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        b.strokeStyle = rgba('#5FA8D8', 0.25);
        b.lineWidth = 10;
        b.beginPath();
        b.moveTo(W / 2 + Math.cos(a) * 340, 520 + Math.sin(a) * 340);
        b.lineTo(W / 2 + Math.cos(a) * 1400, 520 + Math.sin(a) * 1400);
        b.stroke();
      }
      b.fillStyle = rgrad(b, W / 2 - 80, 440, 380, [[0, '#9AB4C6'], [0.7, '#4E6E86'], [1, '#2A4256']]);
      circle(b, W / 2, 520, 330);
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        circle(b, W / 2 + Math.cos(a) * 240, 520 + Math.sin(a) * 240, 22, '#1E3346');
        circle(b, W / 2 + Math.cos(a) * 240, 520 + Math.sin(a) * 240, 12, '#7FD0FF');
      }
      b.fillStyle = '#22384C';
      b.fillRect(0, 900, W, 180);
    }));
    g.save();
    zoom(g, lerp(1, 1.12, ease.inOut(t / dur)), W / 2, 520);
    put(g, cache.fu);
    const pulse = Math.max(0, Math.sin(t * 2.2)) ** 6;
    glow(g, W / 2, 520, 160 + pulse * 220, '#BFE8FF', 0.5 + pulse * 0.5);
    glow(g, W / 2, 520, 30, '#FFFFFF', 0.9);
    g.restore();
    for (let i = 0; i < 3; i++) walker(g, 300 + i * 650 + Math.sin(t * 0.5 + i) * 20, 1000, 180, '#E9EEF2', t * 2 + i, i % 2 ? 1 : -1, '#E9EEF2');
  },
  // S11-5 (чтение вечером) и S12-3 (врач-проекция)
  apartment(g, t, dur, p, cache) {
    const light = p.mode === 'read' ? 1 - ease.inOut(clamp(t / dur)) : 0.7;
    miraRoom(g, cache, light);
    if (p.mode === 'read') {
      const lamp = 1 - light;
      glow(g, 760, 360, 600, '#FFC27A', 0.55 * lamp);
      g.fillStyle = rgba('#FFD9A0', 0.9);
      ellipse(g, 760, 250, 70, 20, rgba('#FFE2B0', 0.5 + 0.5 * lamp));
    }
    // кресло
    rrect(g, 560, 700, 360, 200, 40, '#6E4A3A');
    rrect(g, 540, 560, 120, 340, 40, '#7A5242');
    rrect(g, 860, 720, 90, 180, 30, '#7A5242');
    mira(g, 650, 900, 420, {pose: 'sit', dir: 1, t, book: p.mode === 'read'});
    if (p.mode === 'doctor') {
      const a = clamp((t - 0.8) / 1.5) * (0.55 + 0.05 * Math.sin(t * 7));
      adult(g, 1220, 960, 470, {coat: '#BFE6FF', skin: '#BFE6FF', hair: '#9FD6FF', dir: -1, alpha: a});
      glow(g, 1220, 700, 260, '#9FD6FF', 0.25 * a);
      g.fillStyle = rgba('#9FD6FF', 0.25 * a);
      ellipse(g, 1220, 962, 120, 18);
    }
  },
  // S12-2: кухня, световое кольцо ассистента
  kitchen(g, t, dur, p, cache) {
    miraRoom(g, cache, 1);
    g.fillStyle = '#E9E2D2';
    g.fillRect(0, 700, 1400, 40);
    g.fillStyle = C.timber;
    g.fillRect(0, 740, 1400, 340);
    for (let i = 0; i < 5; i++) {
      g.strokeStyle = rgba('#000000', 0.2);
      g.strokeRect(20 + i * 276, 770, 250, 280);
    }
    // световое кольцо — пульсирует, когда Мира говорит
    const talk = 0.5 + 0.5 * Math.sin(t * 9) * Math.sin(t * 2.3);
    glow(g, 1560, 360, 220, '#9FE0FF', 0.25 + 0.25 * talk);
    g.strokeStyle = rgba('#CFF2FF', 0.8);
    g.lineWidth = 8;
    g.beginPath();
    g.arc(1560, 360, 70, 0, Math.PI * 2);
    g.stroke();
    mira(g, 760, 1040, 520, {pose: 'side', dir: 1, t, arm: 'hold'});
    // чайник и чашка
    const pour = clamp((t - 1.5) / 1.5) * (1 - clamp((t - 6) / 1));
    g.save();
    g.translate(840, 760);
    g.rotate(pour * 0.6);
    rrect(g, -10, -70, 110, 80, 30, '#F4F1EA');
    poly(g, [[100, -40], [150, -70], [104, -20]], '#F4F1EA');
    g.restore();
    rrect(g, 960, 670, 60, 34, 8, '#E9E2D2');
    if (pour > 0.4) {
      g.strokeStyle = rgba('#C98A4A', 0.9);
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(990, 650);
      g.lineTo(990, 690);
      g.stroke();
    }
    for (let i = 0; i < 6; i++) circle(g, 990 + Math.sin(t * 2 + i) * 10, 650 - ((t * 40 + i * 20) % 120), 8, rgba('#FFFFFF', 0.15));
  },
  // S12-4: мастерская 2126 — люди и роботы-манипуляторы
  workshop(g, t, dur, p, cache) {
    put(g, layer(cache, 'ws', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#E8DCC8'], [1, '#C9B89A']]);
      b.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) {
        b.fillStyle = rgba('#FFFFFF', 0.5);
        b.fillRect(100 + i * 300, 60, 200, 260);
      }
      b.fillStyle = '#9C7450';
      b.fillRect(0, 900, W, 180);
    }));
    glow(g, 960, 200, 900, '#FFF2D8', 0.3);
    [[520, 0], [1300, 1.4]].forEach(([x, ph]) => {
      // верстак и деревянная заготовка
      rrect(g, x - 260, 720, 520, 40, 6, C.timberDark);
      g.fillStyle = '#5E4A3A';
      g.fillRect(x - 240, 760, 20, 160);
      g.fillRect(x + 220, 760, 20, 160);
      rrect(g, x - 120, 660, 240, 60, 8, C.timber);
      // манипулятор
      const a1 = -1.1 + Math.sin(t * 1.3 + ph) * 0.25, a2 = 1.2 + Math.sin(t * 1.7 + ph) * 0.3;
      g.save();
      g.translate(x + 200, 720);
      rrect(g, -30, -20, 60, 30, 8, '#4A5662');
      g.rotate(a1);
      rrect(g, -12, -170, 24, 180, 12, '#F2F4F5');
      g.translate(0, -160);
      circle(g, 0, 0, 18, '#C8642B');
      g.rotate(a2);
      rrect(g, -10, -140, 20, 150, 10, '#F2F4F5');
      g.translate(0, -140);
      rrect(g, -16, -20, 32, 24, 6, '#4A5662');
      g.restore();
      adult(g, x - 330, 920, 380, {coat: ['#3E6E8A', '#7A3B2A'][Math.round(ph) % 2], dir: 1, arm: 'scan'});
    });
  },
  // S12-5: Ая рисует на светящемся столе
  lightTable(g, t, dur, p, cache) {
    g.fillStyle = '#16141C';
    g.fillRect(0, 0, W, H);
    glow(g, W / 2, 1000, 900, '#9F7AFF', 0.35);
    ayaPortrait(g, W / 2, 420, 440, {mood: 'focus', light: 0});
    g.fillStyle = rgba('#B9A8FF', 0.25);
    g.fillRect(0, 0, W, H);
    g.fillStyle = vgrad(g, 0, 780, H, [[0, '#2A2244'], [1, '#3A2E66']]);
    poly(g, [[200, 780], [1720, 780], [1920, 1080], [0, 1080]]);
    // рисунок оживает: светящиеся линии
    g.globalCompositeOperation = 'lighter';
    const cols = ['#FF7AB8', '#7AD9FF', '#FFD27A', '#9CFF8A'];
    for (let s = 0; s < 4; s++) {
      g.strokeStyle = rgba(cols[s], 0.85);
      g.lineWidth = 8;
      g.lineCap = 'round';
      g.beginPath();
      const n = Math.floor(clamp((t - s * 1.6) / 4) * 60);
      for (let i = 0; i < n; i++) {
        const u = i / 60;
        g.lineTo(500 + u * 900 + Math.sin(u * 9 + s + t) * 40, 900 + Math.sin(u * 6 + s * 2) * 60 + s * 20);
      }
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    const fx = 500 + clamp(t / 7) * 900, fy = 900 + Math.sin(t * 3) * 30;
    glow(g, fx, fy, 60, '#FFFFFF', 0.6);
    g.save();
    g.translate(fx, fy);
    g.rotate(1.25);
    rrect(g, -46, -680, 92, 540, 40, AYA.coat); // рукав дождевика — к правому плечу Аи
    rrect(g, -46, -168, 92, 30, 12, AYA.coatDk);
    rrect(g, -9, -70, 18, 76, 9, AYA.skin); // указательный палец касается стола
    ellipse(g, 0, -110, 38, 46, AYA.skin);
    for (let i = 0; i < 3; i++) rrect(g, 10 + i * 4, -120 + i * 14, 30, 14, 7, AYA.skinSh);
    g.restore();
  },
  // S14-2: отделение для новорождённых
  incubator(g, t, dur, p, cache) {
    put(g, layer(cache, 'in', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#E3ECEF'], [1, '#C9D6DA']]);
      b.fillRect(0, 0, W, H);
      b.filter = 'blur(10px)';
      for (let i = 0; i < 4; i++) {
        rrect(b, 1400 + i * 120, 200 + i * 40, 100, 70, 8, '#2E3E48');
        b.fillStyle = '#7AE0A8';
        b.fillRect(1410 + i * 120, 230 + i * 40, 80, 4);
      }
      b.filter = 'none';
    }));
    rrect(g, 380, 520, 1160, 120, 20, '#DDE4E8');
    g.fillStyle = rgba('#FFFFFF', 0.25);
    g.beginPath();
    g.roundRect(400, 200, 1120, 340, [120, 120, 0, 0]);
    g.fill();
    g.strokeStyle = rgba('#FFFFFF', 0.8);
    g.lineWidth = 6;
    g.stroke();
    baby(g, 960, 450, 360, {eyes: 0, grip: -1, t, rot: 0.05});
    // руки медсестры в перчатках
    const k = Math.sin(t * 0.8) * 10;
    rrect(g, 600 + k, 330, 220, 60, 30, '#7FB6E0');
    rrect(g, 380 + k, 320, 240, 80, 30, '#5E8FB8');
    glow(g, 960, 300, 500, '#FFFFFF', 0.25);
  },
  // S15-1: генетическая лаборатория, пипетка
  lab(g, t, dur, p, cache) {
    g.fillStyle = vgrad(g, 0, 0, H, [[0, '#1A2E44'], [1, '#2E4A66']]);
    g.fillRect(0, 0, W, H);
    glow(g, 960, 200, 900, '#9FD8FF', 0.3);
    g.fillStyle = '#DDE4E8';
    g.fillRect(300, 760, 1320, 40);
    for (let i = 0; i < 10; i++) {
      const x = 480 + i * 100;
      g.fillStyle = rgba('#DFF2FF', 0.5);
      g.beginPath();
      g.roundRect(x, 560, 50, 200, [4, 4, 25, 25]);
      g.fill();
      const fillH = i < Math.floor(t * 1.2) % 11 ? 90 : 30;
      g.fillStyle = rgba(['#7FD0FF', '#B9F2D0', '#FFD27A'][i % 3], 0.85);
      g.fillRect(x + 4, 750 - fillH, 42, fillH);
    }
    const tx = 480 + (Math.floor(t * 1.2) % 10) * 100 + 25;
    g.save();
    g.translate(tx, 520);
    rrect(g, -14, -380, 28, 300, 10, '#E9EEF2');
    poly(g, [[-8, -80], [8, -80], [2, 10], [-2, 10]], '#F4F6F8');
    rrect(g, -60, -330, 120, 160, 50, '#5E8FB8');
    g.restore();
    const drop = (t * 1.2) % 1;
    circle(g, tx, 540 + drop * 120, 6, rgba('#9FD8FF', 0.9 * (1 - drop)));
  },
  // S15-2: абстрактная двойная спираль
  helix(g, t, dur, p, cache) {
    g.fillStyle = vgrad(g, 0, 0, H, [[0, '#06102A'], [1, '#0C2A4E']]);
    g.fillRect(0, 0, W, H);
    stars(g, 9, 200, W, H, 0.4);
    const n = 60;
    for (let i = 0; i < n; i++) {
      const x = 160 + (i / n) * 1600, a = i * 0.32 + t * 1.2;
      const y1 = H / 2 + Math.sin(a) * 200, y2 = H / 2 - Math.sin(a) * 200, z = Math.cos(a);
      g.strokeStyle = rgba('#9FD8FF', 0.25 + 0.2 * Math.abs(z));
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(x, y1);
      g.lineTo(x, y2);
      g.stroke();
      glow(g, x, y1, 24 + z * 10, '#7AD9FF', 0.5 + 0.3 * z);
      glow(g, x, y2, 24 - z * 10, '#FF9ADF', 0.5 - 0.3 * z);
      circle(g, x, y1, 8 + z * 3, '#DFF6FF');
      circle(g, x, y2, 8 - z * 3, '#FFE6F6');
    }
    for (let i = 0; i < 40; i++) circle(g, (rnd(i) * W + t * 30) % W, rnd(i * 3) * H, 2 + rnd(i) * 3, rgba('#BFE8FF', 0.5));
  },
  // S15-3 (светлая клиника) и S15-4 (переполненная, тусклая)
  clinic(g, t, dur, p, cache) {
    if (p.mode === 'bright') {
      put(g, layer(cache, 'cb', W, H, (b) => {
        b.fillStyle = vgrad(b, 0, 0, H, [[0, '#F2EEE6'], [1, '#DCD2C2']]);
        b.fillRect(0, 0, W, H);
        b.fillStyle = 'rgba(160,210,220,0.6)';
        b.fillRect(1100, 120, 700, 520);
        for (let i = 0; i < 5; i++) tree(b, 1180 + i * 130, 640, 220, {seed: i + 300});
        b.strokeStyle = C.timber;
        b.lineWidth = 14;
        b.strokeRect(1100, 120, 700, 520);
        b.fillStyle = '#C9B08A';
        b.fillRect(0, 900, W, 180);
        rrect(b, 160, 700, 140, 200, 20, '#B8A48A');
        tree(b, 230, 700, 360, {seed: 5});
      }));
      g.save();
      zoom(g, lerp(1, 1.08, t / dur), 900, 700);
      put(g, cache.cb);
      rrect(g, 520, 760, 360, 140, 30, '#7FA8A0');
      mira(g, 640, 900, 420, {pose: 'sit', dir: 1, t});
      adult(g, 1060, 920, 480, {coat: '#F4F6F8', skin: '#8E5E3E', hair: '#1A1A1A', dir: -1, arm: 'scan'});
      const sc = 0.5 + 0.5 * Math.sin(t * 4);
      glow(g, 830, 640, 70, '#7AE0FF', 0.4 + 0.3 * sc);
      g.restore();
    } else {
      put(g, layer(cache, 'cc', W, H, (b) => {
        b.fillStyle = vgrad(b, 0, 0, H, [[0, '#9AA4A0'], [1, '#6E7672']]);
        b.fillRect(0, 0, W, H);
        for (let i = 0; i < 4; i++) {
          b.fillStyle = rgba('#F2FFF8', 0.8);
          b.fillRect(200 + i * 440, 80, 280, 18);
        }
        b.fillStyle = '#5E6662';
        b.fillRect(0, 880, W, 200);
      }));
      g.save();
      g.translate(-t * 30, 0);
      for (let i = 0; i < 16; i++) {
        const x = 80 + i * 150;
        rrect(g, x - 40, 780, 90, 20, 4, '#C9584A');
        g.fillStyle = '#7A3A30';
        g.fillRect(x - 36, 800, 8, 80);
        g.fillRect(x + 40, 800, 8, 80);
        const R = rng(i + 3);
        g.fillStyle = PEOPLE[i % PEOPLE.length];
        g.beginPath();
        g.ellipse(x + 5, 760, 46, 90, 0, Math.PI, 0);
        g.fill();
        g.fillRect(x - 41, 760, 92, 30);
        circle(g, x + 5, 640, 30, ['#C99470', '#8E5E3E', '#E0B48C'][i % 3]);
        if (R() < 0.5) walker(g, x + 70, 1000, 300, PEOPLE[(i + 2) % PEOPLE.length], 0, 1);
      }
      g.restore();
      g.fillStyle = rgba('#CFFFE6', 0.12);
      g.fillRect(0, 0, W, H);
    }
  },
  // S16-1: биореакторы
  bioreactor(g, t, dur, p, cache) {
    put(g, layer(cache, 'br', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#E9EEF0'], [1, '#C9D2D6']]);
      b.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) {
        const x = 140 + i * 300;
        const gr = b.createLinearGradient(x, 0, x + 200, 0);
        gr.addColorStop(0, '#9AA6AE');
        gr.addColorStop(0.35, '#F4F7F8');
        gr.addColorStop(1, '#7A8690');
        b.fillStyle = gr;
        b.beginPath();
        b.roundRect(x, 180, 200, 640, 90);
        b.fill();
        b.fillStyle = '#5E6A74';
        b.fillRect(x + 90, 120, 20, 70);
        rrect(b, x + 70, 420, 60, 120, 12, rgba('#FFD9A0', 0.85));
      }
      b.fillStyle = '#AEB8BE';
      b.fillRect(0, 100, W, 26);
      b.fillStyle = '#9AA4AA';
      b.fillRect(0, 880, W, 200);
    }));
    g.save();
    g.translate(-t * 20, 0);
    put(g, cache.br, 0, 0, W + 200, H);
    g.restore();
    for (let i = 0; i < 3; i++) walker(g, ((t * 40 + i * 600) % (W + 200)) - 100, 980, 240, '#F4F6F8', t * 5 + i, 1, '#E0B48C');
  },
  // S16-2: вертикальная ферма под розовым светом
  vfarm(g, t, dur, p, cache) {
    put(g, layer(cache, 'vf', W, H, (b) => {
      b.fillStyle = '#1E1430';
      b.fillRect(0, 0, W, H);
      const vx = W / 2, vy = 520;
      for (let side = -1; side <= 1; side += 2)
        for (let r = 0; r < 7; r++) {
          const y0 = 120 + r * 130;
          for (let k = 0; k < 18; k++) {
            const z = k / 18;
            const x = vx + side * lerp(900, 120, z), y = lerp(y0, vy + (y0 - vy) * 0.15, z);
            const s = lerp(1, 0.15, z);
            b.fillStyle = rgba('#FF7AD9', 0.55 * s);
            b.fillRect(x - 50 * s, y - 8 * s, 100 * s, 4 * s);
            for (let q = 0; q < 4; q++) circle(b, x - 36 * s + q * 24 * s, y + 18 * s, 12 * s, mixc('#5EC95E', '#9CFF8A', q / 4));
          }
        }
      b.fillStyle = '#2E2244';
      poly(b, [[W / 2 - 60, 520], [W / 2 + 60, 520], [W / 2 + 500, H], [W / 2 - 500, H]]);
    }));
    g.save();
    zoom(g, lerp(1, 1.12, t / dur), W / 2, 520);
    put(g, cache.vf);
    g.restore();
    glow(g, W / 2, 400, 900, '#FF7AD9', 0.15);
    const k = clamp(t / dur);
    walker(g, W / 2 + 40, lerp(1000, 760, k), lerp(320, 180, k), '#F4F6F8', t * 5, 1, '#C99470');
  },
  // S16-3: семейный ужин
  dinner(g, t, dur, p, cache) {
    miraRoom(g, cache, 0.15);
    glow(g, 960, 300, 700, '#FFC27A', 0.4);
    // взрослые в расфокусе на фоне
    put(g, layer(cache, 'dbg', W, H, (b) => {
      b.filter = 'blur(10px)';
      adult(b, 1450, 860, 420, {coat: '#3E6E8A', skin: '#B57E57', dir: -1});
      adult(b, 1640, 860, 400, {coat: '#7A3B2A', skin: '#C99470', dir: -1});
      b.filter = 'none';
    }));
    mira(g, 640, 975, 470, {pose: 'side', dir: 1, t, arm: 'hold'});
    aya(g, 1160, 905, 300, {pose: 'side', dir: -1, t, arm: 'hold'});
    // стол
    rrect(g, 300, 760, 1320, 40, 8, C.timberDark);
    g.fillStyle = '#6E4A30';
    g.fillRect(320, 800, 1280, 280);
    ellipse(g, 760, 745, 120, 24, '#F4F1EA');
    ellipse(g, 760, 740, 90, 16, '#E89A4A');
    ellipse(g, 1080, 745, 100, 22, '#F4F1EA');
    for (let i = 0; i < 7; i++) circle(g, 1050 + (i % 4) * 18, 735 - Math.floor(i / 4) * 10, 9, i % 2 ? '#D8352A' : '#7FB04A');
    rrect(g, 900, 700, 120, 50, 20, '#D9A45A');
    for (let i = 0; i < 6; i++) circle(g, 760 + Math.sin(t * 2 + i) * 10, 720 - ((t * 30 + i * 18) % 90), 7, rgba('#FFFFFF', 0.12));
  },
  // S16-4: Ая откусывает помидор черри
  ayaTomato(g, t, dur, p, cache) {
    g.fillStyle = vgrad(g, 0, 0, H, [[0, '#6E4A36'], [1, '#3E2A20']]);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) glow(g, rnd(i) * W, rnd(i * 3) * 600, 140, '#FFC27A', 0.3);
    const mood = t < 2.4 ? 'smile' : t < 5 ? 'bite' : 'smile';
    ayaPortrait(g, W / 2, 470, 520, {mood, t});
    if (t < 2.4) {
      const k = ease.inOut(clamp(t / 2.4));
      circle(g, lerp(1300, 980, k), lerp(900, 640, k), 40, '#D8352A');
      circle(g, lerp(1290, 970, k), lerp(888, 628, k), 10, '#FF8A7A');
      ellipse(g, lerp(1300, 980, k), lerp(862, 602, k), 20, 6, '#4F8A3E');
    }
  },
  // S17-4: Мира и Ая листают книгу о животных
  book(g, t, dur, p, cache) {
    g.fillStyle = vgrad(g, 0, 0, H, [[0, '#7A5A44'], [1, '#4A3428']]);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 10; i++) glow(g, rnd(i) * W, rnd(i * 3) * 400, 160, '#FFC27A', 0.25);
    // затылки на переднем плане
    ellipse(g, 380, 120, 260, 230, MIRA.hair);
    for (let i = 0; i < 14; i++) circle(g, 1560 + Math.cos(i) * 170, 140 + Math.sin(i * 1.7) * 120, 70, i % 3 ? AYA.hair : AYA.hairLt);
    // раскрытая книга
    g.save();
    g.translate(W / 2, 700);
    g.rotate(-0.04);
    poly(g, [[-760, -300], [0, -330], [0, 330], [-760, 300]], '#F4EFE3');
    poly(g, [[0, -330], [760, -300], [760, 300], [0, 330]], '#F7F2E6');
    g.fillStyle = 'rgba(0,0,0,0.12)';
    g.fillRect(-20, -330, 40, 660);
    // слева — коралловый риф, справа — кит
    g.fillStyle = '#1E8FB8';
    g.fillRect(-680, -250, 560, 380);
    const R = rng(2);
    for (let i = 0; i < 26; i++) circle(g, -660 + R() * 520, -20 + R() * 140, 14 + R() * 26, ['#E8604A', '#F2A65A', '#B65FC9', '#4FC9B0', '#E8C046'][i % 5]);
    g.fillStyle = '#5E8EB0';
    g.fillRect(120, -250, 560, 380);
    ellipse(g, 400, -40, 200, 50, '#26303B', -0.2);
    ellipse(g, 260, 0, 60, 14, '#E3E7EA', 0.6);
    g.fillStyle = 'rgba(0,0,0,0.25)';
    for (let i = 0; i < 4; i++) {
      g.fillRect(-680, 170 + i * 24, 420 - i * 60, 8);
      g.fillRect(120, 170 + i * 24, 420 - i * 60, 8);
    }
    g.restore();
    // палец Аи касается фото рифа
    const k = ease.inOut(clamp((t - 2) / 2));
    g.save();
    g.translate(lerp(1300, 700, k), lerp(1100, 760, k));
    g.rotate(-0.9);
    rrect(g, -18, -10, 36, 170, 18, AYA.skin);
    rrect(g, -60, 140, 120, 200, 50, AYA.coat);
    g.restore();
    oldHand(g, 170, 900, 320, -0.3, {curl: 0.35});
  },
};
