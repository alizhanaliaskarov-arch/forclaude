// Города 2026 и 2126 на уровне улиц: толпа, ночной мегаполис, метро, улицы под кронами, вода в городе, транспорт, рынок.
import {W, H, C, clamp, lerp, ip, ease, rnd, rng, noise1, fbm, rgba, mixc, vgrad, rgrad, circle, ellipse, poly, rrect, glow, layer, put} from '../core.js';
import {sky, SKY, sun, rays, cloud, clouds, ridge, haze, sea, shimmer, waveLine, tree, grass, bush, bird, walker, crowd, boxSkyline, terraceTower, tram, car, solarRow} from '../draw.js';
import {mira, aya, MIRA, AYA} from '../characters.js';
import {drawCity} from './city.js';

const zoom = (g, z, cx = W / 2, cy = H / 2) => {
  g.translate(cx, cy);
  g.scale(z, z);
  g.translate(-cx, -cy);
};
const PEOPLE = ['#2B3640', '#6B4A3A', '#3A4A5E', '#7A3B2A', '#4E6B58', '#8A6A9A', '#C9A04A', '#2F5E8A'];

/** Ребёнок (фон): разные цвета одежды. */
function kid(g, x, y, h, phase, dir, seed) {
  const R = rng(seed);
  const top = ['#E8604A', '#4FA3D9', '#6FBF6A', '#F2C046', '#B65FC9', '#F27A9A'][Math.floor(R() * 6)];
  const skin = ['#F2C9A8', '#C99470', '#8E5E3E', '#E0B48C'][Math.floor(R() * 4)];
  const hair = ['#2A1E14', '#6B4A2A', '#C9A04A', '#1A1A1A'][Math.floor(R() * 4)];
  g.save();
  g.translate(x, y - Math.abs(Math.sin(phase)) * h * 0.04);
  g.scale((dir * h) / 100, h / 100);
  const a = Math.sin(phase) * 0.6;
  [[-2, -a], [2, a]].forEach(([dx, r]) => {
    g.save();
    g.translate(dx, -36);
    g.rotate(r);
    rrect(g, -3.5, 0, 7, 34, 3, '#2F4A6E');
    g.restore();
  });
  rrect(g, -11, -70, 22, 38, 8, top);
  [[-1, a], [1, -a]].forEach(([d, r]) => {
    g.save();
    g.translate(d * 8, -66);
    g.rotate(r * 0.8);
    rrect(g, -3, 0, 6, 26, 3, top);
    g.restore();
  });
  circle(g, 0, -82, 11, skin);
  g.fillStyle = hair;
  g.beginPath();
  g.arc(0, -84, 11.5, Math.PI, 0);
  g.fill();
  g.restore();
}
function rain(g, t, n = 220, a = 0.35) {
  g.strokeStyle = rgba('#DDE8EE', a);
  g.lineWidth = 1.5;
  for (let i = 0; i < n; i++) {
    const x = (rnd(i) * W + t * 200) % W, y = (rnd(i * 3) * H + t * 1300) % H;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 8, y + 30);
    g.stroke();
  }
}
function canopy(g, t, seed, y0 = 0, y1 = 360, n = 70) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = R() * W, y = lerp(y0, y1, R()), r = 60 + R() * 110, sw = Math.sin(t * 0.8 + i) * 4;
    circle(g, x + sw, y, r, R() < 0.5 ? C.greenDeep : C.green);
  }
  for (let i = 0; i < 30; i++) circle(g, R() * W + Math.sin(t + i) * 3, lerp(y0, y1, R()) + 20, 30 + R() * 50, rgba(C.greenLight, 0.6));
}
function dapple(g, t, y0, y1, n = 40, seed = 3) {
  const op = g.globalCompositeOperation;
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = rnd(i * 7 + seed) * W + Math.sin(t * 0.7 + i) * 12, y = lerp(y0, y1, rnd(i * 13 + seed));
    g.fillStyle = rgba('#FFE7B0', 0.16 + 0.08 * Math.sin(t * 2 + i));
    g.beginPath();
    g.ellipse(x, y, 30 + rnd(i) * 40, 8 + rnd(i * 3) * 10, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.globalCompositeOperation = op;
}

export const urbanShots = {
  // S08-1: толпа на перекрёстке сверху
  crowd(g, t, dur, p, cache) {
    put(g, layer(cache, 'cr', W, H, (b) => {
      b.fillStyle = '#4A4E52';
      b.fillRect(0, 0, W, H);
      b.fillStyle = '#7A7E80';
      [[0, 0, 520, 300], [1400, 0, 520, 300], [0, 780, 520, 300], [1400, 780, 520, 300]].forEach(([x, y, w, h]) => b.fillRect(x, y, w, h));
      b.fillStyle = '#E9E9E4';
      for (let i = 0; i < 14; i++) {
        b.fillRect(560 + i * 58, 320, 30, 90);
        b.fillRect(560 + i * 58, 670, 30, 90);
        b.fillRect(420, 360 + i * 26, 90, 14);
        b.fillRect(1410, 360 + i * 26, 90, 14);
      }
      b.save();
      b.translate(W / 2, H / 2);
      b.rotate(0.6);
      for (let i = -9; i < 10; i++) b.fillRect(i * 50, -14, 26, 28);
      b.rotate(-1.2);
      for (let i = -9; i < 10; i++) b.fillRect(i * 50, -14, 26, 28);
      b.restore();
    }));
    const R = rng(4);
    for (let i = 0; i < 260; i++) {
      const ang = Math.floor(R() * 4) * (Math.PI / 2) + (R() - 0.5) * 0.9, sp = 40 + R() * 40;
      const L = 900, s0 = R() * L;
      const s = ((s0 + t * sp) % L) - L / 2;
      const x = W / 2 + Math.cos(ang) * s + (R() - 0.5) * 300, y = H / 2 + Math.sin(ang) * s * 0.7 + (R() - 0.5) * 200;
      if (R() < 0.15) circle(g, x, y, 18, ['#C8372D', '#2F5E8A', '#E9C046', '#1E1E1E'][i % 4]);
      else {
        ellipse(g, x, y, 11, 7, PEOPLE[i % PEOPLE.length], ang);
        circle(g, x, y, 5, ['#2A1E14', '#6B4A2A', '#1A1A1A', '#C9A04A'][i % 4]);
      }
    }
  },
  // S03-4: ночной мегаполис 2026, таймлапс
  city2026night(g, t, dur, p, cache) {
    put(g, layer(cache, 'cn', W, H, (b) => {
      sky(b, [[0, '#0A1024'], [1, '#2A2A48']]);
      boxSkyline(b, 3, 620, 0, '#1A2034', {hmin: 160, hmax: 480, windows: 0.35, winColor: '#BFD8FF'});
      boxSkyline(b, 7, 760, 0, '#121828', {hmin: 120, hmax: 380, windows: 0.5, winColor: '#FFD27A'});
      b.fillStyle = '#0A0E18';
      b.fillRect(0, 760, W, H - 760);
    }));
    clouds(g, 5, 8, 100, 300, '#3A3A5A', 0.4 * (0.6 + 0.4 * Math.sin(t)), W, [120, 260]);
    g.lineCap = 'round';
    for (let lane = 0; lane < 4; lane++) {
      const y = 860 + lane * 50, dir = lane < 2 ? 1 : -1;
      for (let i = 0; i < 9; i++) {
        const x = (((rnd(lane * 20 + i) * W + dir * t * 900) % (W + 400)) + W + 400) % (W + 400) - 200;
        g.strokeStyle = dir > 0 ? rgba('#FF4A3A', 0.8) : rgba('#FFF2D8', 0.85);
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x - dir * 260, y);
        g.stroke();
      }
    }
    glow(g, W / 2, 900, 900, '#FF9A4A', 0.12);
  },
  // S03-5: метро, лица в свете смартфонов
  subway(g, t, dur, p, cache) {
    g.fillStyle = '#1C232C';
    g.fillRect(0, 0, W, H);
    g.save();
    g.translate(-t * 30, 0);
    for (let i = 0; i < 6; i++) {
      const x = i * 420 + 40;
      rrect(g, x, 150, 300, 230, 20, '#0C1016');
      for (let k = 0; k < 3; k++) {
        const lx = x + ((t * 600 + k * 120 + i * 50) % 300);
        g.fillStyle = rgba('#FFE2A8', 0.5);
        g.fillRect(lx, 230 + k * 40, 40, 4);
      }
    }
    g.fillStyle = '#3A4552';
    g.fillRect(-200, 700, W + 600, 40);
    for (let i = 0; i < 7; i++) {
      g.fillStyle = '#9AA6B0';
      g.fillRect(i * 380 + 180, 0, 10, 760);
    }
    for (let i = 0; i < 8; i++) {
      const x = i * 300 + 120;
      g.fillStyle = PEOPLE[i % PEOPLE.length];
      g.beginPath();
      g.ellipse(x, 760, 95, 200, 0, Math.PI, 0);
      g.fill();
      circle(g, x + 6, 470, 52, mixc('#C99470', '#000000', 0.55));
      g.fillStyle = rgrad(g, x + 30, 520, 120, [[0, rgba('#BFDFFF', 0.55)], [1, 'rgba(160,200,255,0)']]);
      g.fillRect(x - 100, 400, 260, 260);
      rrect(g, x + 10, 560, 34, 56, 6, '#0A0C10');
      g.fillStyle = rgba('#DFF0FF', 0.9);
      g.fillRect(x + 14, 564, 26, 4);
    }
    g.restore();
  },
  // S09-1: пешеходная улица под кронами
  street2126(g, t, dur, p, cache) {
    put(g, layer(cache, 'sb', W, H, (b) => {
      sky(b, SKY.day);
      for (let i = 0; i < 6; i++) terraceTower(b, 80 + i * 330, 640, 200, 420, {tiers: 4, seed: 40 + i, body: i % 2 ? C.stone : C.timber});
      b.fillStyle = '#C9BFAE';
      b.fillRect(0, 640, W, H - 640);
      b.fillStyle = '#B5AA98';
      for (let i = 0; i < 20; i++) b.fillRect(0, 660 + i * i * 1.2, W, 2);
    }));
    g.save();
    zoom(g, lerp(1, 1.08, t / dur), 960, 700);
    put(g, cache.sb);
    tram(g, ((t * 120) % (W + 600)) - 300, 640, 260, '#F4F1EA', C.rust);
    crowd(g, t, 12, 34, 0, W, 700, 1000, PEOPLE, 34);
    for (let i = 0; i < 4; i++) {
      const x = ((t * (90 + i * 20) + i * 500) % (W + 300)) - 150, y = 760 + i * 60;
      circle(g, x - 18, y, 14, '#2B3640');
      circle(g, x + 18, y, 14, '#2B3640');
      walker(g, x, y - 8, 36, PEOPLE[(i + 3) % PEOPLE.length], 0, 1);
    }
    canopy(g, t, 5, -40, 300, 60);
    g.restore();
    dapple(g, t, 650, 1080, 50);
  },
  // S09-2: дети играют в тени, туманный фонтан
  shadePark(g, t, dur, p, cache) {
    put(g, layer(cache, 'sp', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#9CC78A'], [1, '#6E9A55']]);
      b.fillRect(0, 0, W, H);
      b.fillStyle = '#D9CDB4';
      b.beginPath();
      b.ellipse(W / 2, 820, 700, 200, 0, 0, Math.PI * 2);
      b.fill();
    }));
    for (let i = 0; i < 9; i++) {
      const ang = t * 0.7 + i * 0.7, r = 300 + (i % 3) * 120;
      kid(g, W / 2 + Math.cos(ang) * r, 820 + Math.sin(ang) * r * 0.25, 150, t * 10 + i, Math.sin(ang) > 0 ? -1 : 1, i + 3);
    }
    for (let i = 0; i < 80; i++) {
      const a = (t * 0.6 + rnd(i)) % 1;
      circle(g, W / 2 + (rnd(i * 3) - 0.5) * 120 * (1 + a), 780 - a * 260, 6 + a * 30, rgba('#FFFFFF', 0.22 * (1 - a)));
    }
    canopy(g, t, 9, -60, 260, 70);
    dapple(g, t, 600, 1080, 60, 7);
  },
  // S09-3: светлые крыши с панелями и садами сверху
  rooftops(g, t, dur, p, cache) {
    const L = layer(cache, 'rt', W * 1.5, H * 1.5, (b) => {
      b.fillStyle = '#8E9A92';
      b.fillRect(0, 0, W * 1.5, H * 1.5);
      const R = rng(5);
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 12; c++) {
          const x = c * 245 + 10, y = r * 185 + 10, w = 225, h = 165;
          b.fillStyle = R() < 0.5 ? '#F2F0EA' : '#DCDAD4';
          b.fillRect(x, y, w, h);
          if (R() < 0.6) for (let k = 0; k < 6; k++) {
            b.fillStyle = '#2E4E72';
            b.fillRect(x + 12 + (k % 3) * 70, y + 14 + Math.floor(k / 3) * 46, 60, 38);
          }
          else for (let k = 0; k < 8; k++) circle(b, x + 20 + R() * (w - 40), y + 20 + R() * (h - 40), 14 + R() * 18, mixc(C.green, C.greenLight, R()));
        }
    });
    g.save();
    g.translate(W / 2, H / 2);
    g.rotate(t * 0.012);
    g.scale(1.05, 1.05);
    put(g, L, -W * 0.75, -H * 0.75, W * 1.5, H * 1.5);
    g.restore();
  },
  // S09-4/5: интерьер деревянной высотки; Мира касается колонны
  timber(g, t, dur, p, cache) {
    put(g, layer(cache, 'tb', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#E8D5B8'], [1, '#C9AE88']]);
      b.fillRect(0, 0, W, H);
      b.fillStyle = '#F7EEDC';
      b.fillRect(300, 120, 1320, 600);
      b.fillStyle = 'rgba(160,200,210,0.5)';
      b.fillRect(320, 140, 1280, 560);
      for (let i = 0; i < 8; i++) {
        b.fillStyle = C.timberDark;
        b.fillRect(320 + i * 183, 140, 10, 560);
      }
      for (let i = 0; i < 7; i++) {
        const y = 40 + i * 18;
        b.fillStyle = mixc(C.timber, C.timberDark, i / 7);
        poly(b, [[0, y], [W, y], [W - i * 40, y + 14], [i * 40, y + 14]]);
      }
      [[150, 140], [560, 90], [1360, 90], [1770, 140]].forEach(([x, w]) => {
        b.fillStyle = vgrad(b, x, 0, 0, [[0, C.timber], [1, C.timber]]);
        const gr = b.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
        gr.addColorStop(0, '#D9AE7E');
        gr.addColorStop(1, '#9C7048');
        b.fillStyle = gr;
        b.fillRect(x - w / 2, 0, w, H);
        for (let k = 0; k < 6; k++) {
          b.strokeStyle = rgba('#7A5232', 0.35);
          b.lineWidth = 2;
          b.beginPath();
          b.moveTo(x - w / 2 + 10 + k * (w / 6), 0);
          b.lineTo(x - w / 2 + 14 + k * (w / 6), H);
          b.stroke();
        }
      });
      b.fillStyle = '#B89A74';
      b.fillRect(0, 900, W, 180);
    }));
    glow(g, 960, 400, 900, '#FFE2A8', 0.25);
    if (!p.mira) {
      for (let i = 0; i < 5; i++) walker(g, ((t * (60 + i * 15) + i * 400) % (W + 200)) - 100, 960 + (i % 2) * 40, 150, PEOPLE[i], t * 6 + i, 1);
    } else {
      mira(g, 700, 1010, 520, {pose: 'side', dir: -1, t, arm: 'touch', wind: 0});
    }
  },
  // S10-1: парк в ливень превращается в озеро
  spongePark(g, t, dur, p, cache) {
    put(g, layer(cache, 'spg', W, H, (b) => {
      sky(b, SKY.storm);
      boxSkyline(b, 4, 520, 0, '#6E7880', {hmin: 100, hmax: 300});
      b.fillStyle = '#5E8A50';
      b.fillRect(0, 520, W, H - 520);
      b.fillStyle = '#4E7A44';
      b.beginPath();
      b.ellipse(W / 2, 800, 780, 220, 0, 0, Math.PI * 2);
      b.fill();
    }));
    const lv = ease.inOut(clamp(t / dur));
    g.save();
    g.beginPath();
    g.ellipse(W / 2, 800, 760 * (0.3 + 0.7 * lv), 210 * (0.3 + 0.7 * lv), 0, 0, Math.PI * 2);
    g.fillStyle = rgba('#7FA8BC', 0.92);
    g.fill();
    g.clip();
    shimmer(g, t, 600, 1000, '#E6F2F6', 80, 0.4);
    for (let i = 0; i < 30; i++) {
      const x = W / 2 + (rnd(i) - 0.5) * 1400, y = 700 + rnd(i * 3) * 200, r = ((t * 2 + rnd(i * 5)) % 1) * 30;
      g.strokeStyle = rgba('#FFFFFF', 0.5 * (1 - r / 30));
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(x, y, r, r * 0.3, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.restore();
    for (let i = 0; i < 12; i++) tree(g, 200 + i * 140, 700 + (i % 3) * 50, 120, {seed: i + 20});
    rain(g, t, 260, 0.4);
  },
  // S10-2: плавучий квартал сверху
  floating(g, t, dur, p, cache) {
    const L = layer(cache, 'fl', 1400, 1400, (b) => {
      b.fillStyle = '#1E6A80';
      b.fillRect(0, 0, 1400, 1400);
      const hex = (cx, cy, r) => {
        b.fillStyle = '#E6E0D2';
        b.beginPath();
        for (let k = 0; k < 6; k++) b.lineTo(cx + Math.cos((k * Math.PI) / 3) * r, cy + Math.sin((k * Math.PI) / 3) * r);
        b.closePath();
        b.fill();
        b.strokeStyle = '#B9B2A2';
        b.lineWidth = 6;
        b.stroke();
        for (let k = 0; k < 7; k++) circle(b, cx + Math.cos(k) * r * 0.55, cy + Math.sin(k * 1.3) * r * 0.55, r * 0.14, k % 2 ? C.green : C.leaf);
        for (let k = 0; k < 3; k++) {
          b.fillStyle = C.timber;
          b.fillRect(cx - r * 0.4 + k * r * 0.3, cy - r * 0.15, r * 0.22, r * 0.3);
          b.fillStyle = '#2E4E72';
          b.fillRect(cx - r * 0.38 + k * r * 0.3, cy - r * 0.13, r * 0.18, r * 0.12);
        }
      };
      const pts = [[700, 700]];
      for (let k = 0; k < 6; k++) pts.push([700 + Math.cos((k * Math.PI) / 3 + Math.PI / 6) * 330, 700 + Math.sin((k * Math.PI) / 3 + Math.PI / 6) * 330]);
      b.strokeStyle = '#C9C1AE';
      b.lineWidth = 16;
      pts.slice(1).forEach(([x, y]) => {
        b.beginPath();
        b.moveTo(700, 700);
        b.lineTo(x, y);
        b.stroke();
      });
      pts.forEach(([x, y]) => hex(x, y, 140));
    });
    g.fillStyle = '#1E6A80';
    g.fillRect(0, 0, W, H);
    shimmer(g, t, 0, H, '#BFE3EE', 160, 0.3);
    g.save();
    g.translate(W / 2, H / 2);
    g.rotate(t * 0.03);
    g.scale(lerp(0.75, 0.85, t / dur), lerp(0.75, 0.85, t / dur));
    put(g, L, -700, -700, 1400, 1400);
    g.restore();
    for (let i = 0; i < 3; i++) {
      const a = t * 0.2 + i * 2;
      ellipse(g, W / 2 + Math.cos(a) * 640, H / 2 + Math.sin(a) * 400, 22, 9, '#F4F1EA', a + Math.PI / 2);
    }
  },
  // S10-3: лагуна на месте старого района
  lagoon(g, t, dur, p, cache) {
    put(g, layer(cache, 'lg', W * 1.3, H, (b) => lagoonBg(b, W * 1.3)));
    g.save();
    g.translate(-t * 22, 0);
    put(g, cache.lg, 0, 0, W * 1.3, H);
    g.restore();
    shimmer(g, t, 640, H, '#FFFFFF', 140, 0.35);
    for (let i = 0; i < 3; i++) {
      const x = ((t * (40 + i * 15) + i * 600) % (W + 300)) - 150, y = 760 + i * 80;
      ellipse(g, x, y, 70, 16, '#F4F1EA');
      rrect(g, x - 20, y - 26, 40, 20, 6, '#E9E2D2');
      waveLine(g, t, y + 14, 2, 20, rgba('#FFFFFF', 0.4), 2);
    }
    for (let i = 0; i < 5; i++) {
      g.fillStyle = rgba('#FFFFFF', 0.1);
      g.beginPath();
      g.ellipse(((i * 450 + t * 15) % (W + 800)) - 300, 560 + i * 30, 500, 40, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
  // S10-4: Ая бежит по мелкой воде (замедленно)
  ayaSplash(g, t, dur, p, cache) {
    put(g, layer(cache, 'asb', W, H, (b) => {
      b.filter = 'blur(8px)';
      lagoonBg(b, W);
      b.filter = 'none';
    }));
    g.fillStyle = vgrad(g, 0, 760, H, [[0, rgba('#9CC9D6', 0.85)], [1, rgba('#5E9AAE', 0.95)]]);
    g.fillRect(0, 760, W, H);
    shimmer(g, t, 770, H, '#FFFFFF', 120, 0.4);
    const sl = 0.35; // замедленная съёмка
    const x = lerp(300, 1500, t / dur), ph = t * 9 * sl * 3;
    aya(g, x, 990, 420, {pose: 'run', phase: ph, t, dir: 1});
    for (let i = 0; i < 90; i++) {
      const a = ((t * sl * 2 + rnd(i)) % 1), ang = Math.PI * (0.15 + rnd(i * 3) * 0.7);
      const sp = 260 + rnd(i * 5) * 260;
      const bx = x + (rnd(i * 7) - 0.6) * 160 + Math.cos(ang) * sp * a * (rnd(i * 9) < 0.5 ? -1 : 1);
      const by = 1000 - Math.sin(ang) * sp * a * 1.2 + 500 * a * a;
      if (by < 1040) circle(g, bx, by, 3 + rnd(i) * 6, rgba('#FFFFFF', 0.75 * (1 - a)));
    }
    for (let k = 0; k < 3; k++) {
      const r = ((t * 0.6 + k / 3) % 1) * 200;
      g.strokeStyle = rgba('#FFFFFF', 0.5 * (1 - r / 200));
      g.lineWidth = 3;
      g.beginPath();
      g.ellipse(x, 1000, r, r * 0.18, 0, 0, Math.PI * 2);
      g.stroke();
    }
  },
  // S10-5: затопленная дверь под водой → Мира на мостике
  doorway(g, t, dur, p, cache) {
    const k = ease.inOut(clamp((t - 2) / 5));
    g.save();
    g.translate(0, lerp(-900, 0, k));
    // над водой: Мира на мостике
    put(g, layer(cache, 'db', W, H, (b) => lagoonBg(b, W)));
    g.fillStyle = '#8A6A4A';
    g.fillRect(500, 900, 1000, 26);
    for (let i = 0; i < 6; i++) g.fillRect(520 + i * 190, 820, 8, 80);
    g.fillRect(500, 820, 1000, 8);
    mira(g, 980, 905, 330, {pose: 'side', dir: 1, t, wind: 0.2, arm: 'rail'});
    // под водой: старая дверь и окно
    g.fillStyle = vgrad(g, 0, 940, 1980, [[0, '#4E8A9A'], [1, '#163E4E']]);
    g.fillRect(0, 940, W, 1100);
    g.fillStyle = '#7A8A84';
    g.fillRect(560, 1240, 800, 760);
    g.fillStyle = '#3E4A44';
    g.fillRect(840, 1500, 220, 400);
    rrect(g, 1120, 1450, 160, 180, 8, '#2E3A36');
    for (let i = 0; i < 20; i++) {
      g.strokeStyle = rgba('#5E9A5E', 0.8);
      g.lineWidth = 4;
      g.beginPath();
      const x = 560 + rnd(i) * 800;
      g.moveTo(x, 2000);
      for (let y = 2000; y > 1700 - rnd(i) * 300; y -= 20) g.lineTo(x + Math.sin(y / 30 + t * 1.5 + i) * 10, y);
      g.stroke();
    }
    g.restore();
    // блики преломления
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 30; i++) {
      g.fillStyle = rgba('#BFEFFF', 0.06);
      g.beginPath();
      g.ellipse((rnd(i) * W + Math.sin(t + i) * 30) % W, (rnd(i * 3) * H + t * 10) % H, 80, 14, Math.sin(t * 0.5 + i), 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
  },
  // S11-2: солнечная ферма на рассвете
  solarFarm(g, t, dur, p, cache) {
    put(g, layer(cache, 'sf', W, H, (b) => {
      sky(b, SKY.dawn);
      sun(b, 960, 410, 44, '#FFF0D8', '#FFAA6A');
      rays(b, 960, 410, 30, 1400, '#FFD7A8', 0.05, Math.PI * 1.2, -Math.PI / 2, 2);
      ridge(b, 4, 470, 40, '#6E5A6A');
      b.fillStyle = '#5E5048';
      b.fillRect(0, 470, W, H - 470);
    }));
    g.save();
    zoom(g, lerp(1, 1.15, ease.inOut(t / dur)), 960, 560);
    const vp = [960, 440];
    for (let r = 0; r < 22; r++) {
      const y = 480 + Math.pow(r / 22, 1.8) * 640, k = (y - 470) / 610;
      for (let c = -12; c <= 12; c++) {
        const x0 = vp[0] + (c - 0.45) * 30 * (0.2 + k * 6), x1 = vp[0] + (c + 0.45) * 30 * (0.2 + k * 6);
        solarRow(g, x0, y, x1, 6 + k * 40, mixc('#2C4E6E', '#E89A6A', 0.25 * (1 - k)), '#FFC89A');
      }
    }
    g.restore();
  },
  // S13-1: ретрофутуризм 1950-х — летающие машины над игрушечным городом
  retroCars(g, t, dur, p, cache) {
    put(g, layer(cache, 'rc', W, H, (b) => {
      sky(b, [[0, '#7FC3D6'], [1, '#F2E2B8']]);
      const R = rng(6);
      for (let i = 0; i < 14; i++) {
        const x = 60 + i * 135, h = 180 + R() * 320;
        b.fillStyle = ['#E8C8A0', '#F2E8D8', '#D9A47E', '#BFD8D6'][i % 4];
        b.fillRect(x, 900 - h, 100, h);
        b.fillStyle = '#E8604A';
        circle(b, x + 50, 900 - h - 20, 30);
        b.fillStyle = rgba('#3E6E8A', 0.6);
        for (let k = 0; k < 5; k++) b.fillRect(x + 14, 920 - h + k * 50, 72, 16);
      }
      b.fillStyle = '#9CC07A';
      b.fillRect(0, 900, W, 180);
    }));
    for (let i = 0; i < 6; i++) {
      const x = ((t * (90 + i * 25) + i * 360) % (W + 400)) - 200, y = 220 + i * 90 + Math.sin(t * 2 + i) * 14;
      g.save();
      g.translate(x, y);
      ellipse(g, 0, 0, 80, 22, ['#E8604A', '#4FA3D9', '#F2C046', '#B65FC9'][i % 4]);
      g.fillStyle = rgba('#DFF4FF', 0.8);
      g.beginPath();
      g.ellipse(-6, -14, 34, 22, 0, Math.PI, 0);
      g.fill();
      poly(g, [[-80, 0], [-110, -26], [-60, -6]], '#C9CED4');
      glow(g, -86, 6, 30, '#FFB050', 0.6);
      g.restore();
    }
    // тилт-шифт
    g.fillStyle = vgrad(g, 0, 0, 240, [[0, rgba('#FFFFFF', 0.35)], [1, 'rgba(255,255,255,0)']]);
    g.fillRect(0, 0, W, 240);
    g.fillStyle = vgrad(g, 0, 880, H, [[0, 'rgba(255,240,210,0)'], [1, rgba('#FFF0D2', 0.4)]]);
    g.fillRect(0, 880, W, 200);
    g.fillStyle = rgba('#E8B868', 0.08);
    g.fillRect(0, 0, W, H);
  },
  // S13-2/4: парковка сверху (2026) → сад на месте парковки (2126)
  parking(g, t, dur, p, cache) {
    const L = layer(cache, `pk${p.garden}`, W * 1.2, H * 1.2, (b) => {
      const R = rng(8);
      if (!p.garden) {
        b.fillStyle = '#5A5E62';
        b.fillRect(0, 0, W * 1.2, H * 1.2);
        for (let r = 0; r < 7; r++)
          for (let c = 0; c < 26; c++) {
            const x = 30 + c * 88, y = 40 + r * 180;
            b.fillStyle = '#D9D9D2';
            b.fillRect(x, y, 3, 120);
            if (R() < 0.9) rrect(b, x + 12, y + 10, 62, 100, 12, ['#B5BCC4', '#C8483C', '#2F5E8A', '#E9E4DA', '#1E1E1E', '#7A8E6A'][Math.floor(R() * 6)]);
          }
        b.fillStyle = '#3E4246';
        b.fillRect(0, H * 1.2 - 120, W * 1.2, 120);
      } else {
        b.fillStyle = '#6E9A55';
        b.fillRect(0, 0, W * 1.2, H * 1.2);
        for (let r = 0; r < 7; r++)
          for (let c = 0; c < 26; c++) {
            b.fillStyle = rgba('#D9D9D2', 0.18);
            b.fillRect(30 + c * 88, 40 + r * 180, 3, 120);
          }
        for (let i = 0; i < 5; i++) ellipse(b, 300 + R() * 1700, 200 + R() * 900, 140 + R() * 120, 80 + R() * 60, '#7FB6C9');
        for (let i = 0; i < 160; i++) circle(b, R() * W * 1.2, R() * H * 1.2, 20 + R() * 40, mixc(C.greenDeep, C.greenLight, R()));
        b.fillStyle = '#D9CDB4';
        b.fillRect(0, 600, W * 1.2, 30);
        b.fillRect(1000, 0, 30, H * 1.2);
        for (let i = 0; i < 6; i++) circle(b, 300 + i * 260, 400 + (i % 2) * 300, 26, ['#E8604A', '#F2C046', '#4FA3D9'][i % 3]);
      }
    });
    g.save();
    zoom(g, lerp(1, 1.08, t / dur));
    put(g, L, -W * 0.1 - t * 8, -H * 0.1, W * 1.2, H * 1.2);
    g.restore();
    if (!p.garden) {
      g.fillStyle = rgba('#FFE9C8', 0.12);
      g.fillRect(0, 0, W, H);
    } else for (let i = 0; i < 12; i++) kid(g, ((t * 50 + i * 170) % (W + 100)) - 50, 610 + (i % 2) * 20, 50, t * 9 + i, 1, i);
  },
  // S13-3: к Мире подъезжает беспилотная капсула
  pod(g, t, dur, p, cache) {
    put(g, layer(cache, 'pd', W, H, (b) => {
      sky(b, SKY.day);
      for (let i = 0; i < 5; i++) terraceTower(b, 60 + i * 400, 700, 260, 520, {tiers: 4, seed: 70 + i, body: i % 2 ? C.timber : C.stone});
      b.fillStyle = '#C9BFAE';
      b.fillRect(0, 700, W, 150);
      b.fillStyle = '#8E9298';
      b.fillRect(0, 850, W, H - 850);
      b.fillStyle = '#D9D2C2';
      for (let i = 0; i < 12; i++) b.fillRect(i * 180, 960, 90, 8);
    }));
    canopy(g, t, 3, -80, 200, 40);
    const arrive = ease.out(clamp(t / 3.5));
    const px = lerp(W + 300, 1180, arrive);
    const door = clamp((t - 3.8) / 1);
    // капсула
    rrect(g, px - 190, 760, 380, 170, 80, '#F4F1EA');
    rrect(g, px - 150, 780, 300, 80, 40, rgba('#2C4A55', 0.85));
    g.fillStyle = C.teal;
    g.fillRect(px - 170, 900, 340, 6);
    circle(g, px - 110, 935, 26, '#2A2C31');
    circle(g, px + 110, 935, 26, '#2A2C31');
    if (door > 0) {
      g.fillStyle = rgba('#0E1622', 0.9 * door);
      rrect(g, px - 60, 785, 120 * door, 140, 20);
      g.fill();
    }
    // Мира идёт к двери и садится
    const mk = clamp((t - 5) / 3.5);
    const mx = lerp(700, px - 20, mk);
    if (mk < 1) mira(g, mx, 960, 330, {pose: mk > 0 && mk < 1 ? 'walk' : 'side', phase: t * 5, t, dir: 1, wind: 0.2});
  },
  // S13-5: вид из капсулы — проспект под деревьями
  avenuePOV(g, t, dur, p, cache) {
    sky(g, SKY.day);
    const vx = W / 2, vy = 470;
    g.fillStyle = '#9A9EA4';
    poly(g, [[vx - 20, vy], [vx + 20, vy], [W + 300, H], [-300, H]]);
    g.fillStyle = '#6E9A55';
    poly(g, [[0, vy], [vx - 20, vy], [-300, H], [0, H]]);
    poly(g, [[W, vy], [vx + 20, vy], [W + 300, H], [W, H]]);
    g.fillStyle = '#E9E4DA';
    for (let i = 0; i < 12; i++) {
      const z = ((i / 12 + t * 0.35) % 1), s = Math.pow(z, 2.2);
      const y = vy + s * (H - vy), w = 4 + s * 40;
      g.fillRect(vx - w / 2, y, w, 6 + s * 60);
    }
    for (let side = -1; side <= 1; side += 2)
      for (let i = 0; i < 10; i++) {
        const z = ((i / 10 + t * 0.35) % 1), s = Math.pow(z, 2.2);
        const x = vx + side * (40 + s * 1300), y = vy + s * (H - vy);
        tree(g, x, y + 20, 40 + s * 700, {seed: i + (side > 0 ? 50 : 0)});
      }
    for (let i = 0; i < 2; i++) {
      const z = 0.3 + 0.15 * i + Math.sin(t * 0.5 + i) * 0.02, s = Math.pow(z, 2.2);
      walker(g, vx + (i ? 1 : -1) * (120 + s * 600), vy + s * (H - vy), 30 + s * 300, PEOPLE[i + 2], t * 6, 1);
    }
    // рамка окна капсулы
    g.fillStyle = '#E9E4DA';
    g.fillRect(0, 0, W, 40);
    g.fillRect(0, H - 120, W, 120);
    rrect(g, 0, 0, 60, H, 0, '#E9E4DA');
    rrect(g, W - 60, 0, 60, H, 0, '#E9E4DA');
    g.fillStyle = rgba('#FFFFFF', 0.06);
    g.fillRect(60, 40, W - 120, H - 160);
  },
  // S14-3: Мира идёт на рынок (камера рядом)
  miraWalk(g, t, dur, p, cache) {
    const L = layer(cache, 'mw', W * 2, H, (b) => {
      sky(b, SKY.golden, W * 2, H);
      for (let i = 0; i < 12; i++) terraceTower(b, i * 330, 720, 240, 500 + (i % 3) * 80, {tiers: 4, seed: 90 + i, body: i % 2 ? C.timber : C.stone});
      b.fillStyle = '#C9BFAE';
      b.fillRect(0, 720, W * 2, H - 720);
    });
    put(g, L, -t * 90, 0, W * 2, H);
    for (let i = 0; i < 10; i++) {
      const x = ((i * 260 - t * 180) % (W + 400) + W + 400) % (W + 400) - 200;
      tree(g, x, 1000, 520, {seed: i + 30});
    }
    mira(g, 860, 1000, 470, {pose: 'walk', phase: t * 5, t, dir: 1, wind: 0.3});
    for (let i = 0; i < 6; i++) {
      const x = ((i * 380 - t * 260) % (W + 400) + W + 400) % (W + 400) - 200;
      walker(g, x, 1060, 220, PEOPLE[i], t * 6 + i, i % 2 ? 1 : -1);
    }
  },
  // S14-4: рынок, Мира выбирает персик
  market(g, t, dur, p, cache) {
    put(g, layer(cache, 'mk', W, H, (b) => {
      sky(b, SKY.golden);
      for (let i = 0; i < 6; i++) terraceTower(b, i * 340, 560, 220, 420, {tiers: 4, seed: 120 + i, haze: 0.2, hazeColor: '#F2DCC0'});
      b.fillStyle = '#C9BFAE';
      b.fillRect(0, 560, W, H - 560);
      const R = rng(4);
      [[180, '#E8604A'], [760, '#4FA3D9'], [1340, '#F2C046']].forEach(([x, col]) => {
        for (let k = 0; k < 6; k++) {
          b.fillStyle = k % 2 ? col : '#F4F1EA';
          b.fillRect(x + k * 80, 470, 80, 70);
        }
        b.fillStyle = C.timber;
        b.fillRect(x, 700, 480, 40);
        b.fillRect(x + 10, 540, 12, 300);
        b.fillRect(x + 458, 540, 12, 300);
        for (let k = 0; k < 40; k++) circle(b, x + 30 + R() * 420, 680 + R() * 24, 16, ['#F59A55', '#D9533A', '#7FB04A', '#F2C046', '#B65FC9'][Math.floor(R() * 5)]);
      });
    }));
    for (let i = 0; i < 3; i++) walker(g, 300 + i * 600, 900, 240, PEOPLE[i + 4], t * 2 + i, i % 2 ? 1 : -1);
    mira(g, 1000, 1000, 470, {pose: 'side', dir: -1, t, arm: t > 3 ? 'hold' : 'down', wind: 0.1});
    if (t > 3) {
      const px = 925, py = 712;
      g.fillStyle = rgrad(g, px - 6, py - 6, 26, [[0, '#FFD08A'], [0.6, '#F59A55'], [1, '#D9533A']]);
      circle(g, px, py, 20);
    }
  },
  // S22-2: школьный двор сегодня
  schoolyard(g, t, dur, p, cache) {
    put(g, layer(cache, 'sy', W, H, (b) => {
      sky(b, SKY.day);
      b.fillStyle = '#E3D2B8';
      b.fillRect(200, 300, 1500, 360);
      b.fillStyle = '#C9584A';
      b.fillRect(180, 280, 1540, 40);
      for (let i = 0; i < 12; i++) {
        b.fillStyle = '#7FB0C9';
        b.fillRect(260 + i * 120, 380, 70, 90);
        b.fillRect(260 + i * 120, 520, 70, 90);
      }
      b.fillStyle = '#B9B2A2';
      b.fillRect(0, 660, W, H - 660);
      b.strokeStyle = '#F2F0EA';
      b.lineWidth = 6;
      b.beginPath();
      b.arc(W / 2, 880, 160, 0, Math.PI * 2);
      b.stroke();
    }));
    const sl = 0.5;
    for (let i = 0; i < 14; i++) {
      const dir = i % 2 ? 1 : -1;
      const x = (((rnd(i) * W + dir * t * 140 * sl) % (W + 200)) + W + 200) % (W + 200) - 100;
      kid(g, x, 760 + rnd(i * 3) * 280, 140 + rnd(i * 3) * 120, t * 9 * sl + i, dir, i + 11);
    }
    glow(g, 1600, 120, 700, '#FFF2C8', 0.3);
  },
};

function lagoonBg(b, w) {
  sky(b, [[0, '#9CC3D6'], [1, '#F2E8D6']], w, H);
  for (let i = 0; i < 9; i++) terraceTower(b, 100 + i * (w / 9), 520, 120, 240, {tiers: 3, seed: 150 + i, haze: 0.35, hazeColor: '#DDEAEE'});
  // старые фасады наполовину в воде, увитые зеленью
  const R = rng(14);
  for (let i = 0; i < 7; i++) {
    const x = 60 + i * (w / 7), h = 260 + R() * 140, bw = 200;
    b.fillStyle = ['#D9B79A', '#C9C1AE', '#E3C9A8', '#BFA88A'][i % 4];
    b.fillRect(x, 700 - h, bw, h + 100);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      b.fillStyle = '#4A5A62';
      b.fillRect(x + 24 + c * 60, 720 - h + 30 + r * 70, 34, 46);
    }
    for (let k = 0; k < 14; k++) circle(b, x + R() * bw, 700 - h + R() * h, 14 + R() * 20, mixc(C.green, C.leaf, R()));
  }
  sea(b, 640, '#8FC0CC', '#2E6E80', w, H);
  b.fillStyle = '#8A6A4A';
  b.fillRect(0, 610, w, 12);
  for (let x = 20; x < w; x += 140) b.fillRect(x, 560, 8, 60);
  b.fillRect(0, 560, w, 6);
}
