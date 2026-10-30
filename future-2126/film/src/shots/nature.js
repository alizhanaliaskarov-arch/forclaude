// Природа и климат: засуха, лёд, шторм, наводнения, долина, риф, животные, леса, болота, развилка реки.
import {W, H, C, clamp, lerp, ip, ease, rnd, rng, noise1, fbm, rgba, mixc, vgrad, rgrad, circle, ellipse, poly, rrect, glow, layer, put} from '../core.js';
import {sky, SKY, sun, rays, cloud, clouds, ridge, haze, sea, shimmer, waveLine, tree, pine, grass, bush, bird, walker, boxSkyline, car, terraceTower} from '../draw.js';
import {mira, aya, ayaPortrait, MIRA, AYA} from '../characters.js';

const zoom = (g, z, cx = W / 2, cy = H / 2) => {
  g.translate(cx, cy);
  g.scale(z, z);
  g.translate(-cx, -cy);
};

// ---------- развилка реки (сценарии) ----------
function riverPath(g, pts, w0, w1) {
  // широкая лента по точкам, сужается к концу
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    g.lineWidth = lerp(w0, w1, i / (pts.length - 1));
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
  }
}
const BR = {
  trunk: [[960, 1150], [955, 1000], [940, 900], [950, 820], [960, 760]],
  green: [[960, 760], [900, 700], [760, 640], [560, 600], [300, 560], [0, 540]],
  yellow: [[960, 760], [968, 690], [990, 620], [1000, 560], [1010, 500], [1020, 470]],
  red: [[960, 760], [1040, 700], [1200, 650], [1440, 600], [1700, 570], [1960, 550]],
};
function valleyFork(g, cache) {
  put(g, layer(cache, 'fork', W, H, (b) => {
    sky(b, SKY.dawn);
    sun(b, 1010, 430, 30, '#FFF0D8', '#FFB27A');
    ridge(b, 4, 500, 90, '#6E6A8A');
    ridge(b, 6, 560, 70, '#55607A');
    b.fillStyle = vgrad(b, 0, 540, H, [[0, '#4E6B58'], [1, '#2F4A3A']]);
    b.fillRect(0, 560, W, H - 560);
    const R = rng(3);
    for (let i = 0; i < 160; i++) {
      const x = R() * W, y = 580 + Math.pow(R(), 0.8) * 500, s = 14 + ((y - 560) / 520) * 50;
      tree(b, x, y, s, {seed: i, leaf: '#4F7A55', dark: '#2F5240', light: '#7FA27A'});
    }
    b.strokeStyle = '#C9D9E6';
    b.lineCap = 'round';
    riverPath(b, BR.trunk, 90, 40);
    riverPath(b, BR.green, 40, 14);
    riverPath(b, BR.yellow, 34, 8);
    riverPath(b, BR.red, 40, 14);
    haze(b, 420, 720, '#F2D2C0', 0.55);
  }));
}
function glowPath(g, pts, color, a, w) {
  g.save();
  g.globalAlpha = a;
  g.strokeStyle = color;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.shadowColor = color;
  g.shadowBlur = 30;
  g.lineWidth = w;
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.stroke();
  g.restore();
}
function label(g, text, x, y, color, a) {
  if (a <= 0) return;
  g.save();
  g.globalAlpha = a;
  g.font = "800 34px 'Unbounded'";
  g.textAlign = 'center';
  g.shadowColor = 'rgba(0,0,0,0.6)';
  g.shadowBlur = 18;
  g.fillStyle = color;
  g.fillText(text, x, y);
  g.restore();
}

export const natureShots = {
  riverFork(g, t, dur, p, cache) {
    if (p.mode === 'reveal') {
      g.save();
      zoom(g, lerp(1, 1.12, ease.inOut(t / dur)), 960, 700);
      valleyFork(g, cache);
      const gA = clamp((t - 3.6) / 0.8), yA = clamp((t - 5.4) / 0.8), rA = clamp((t - 7.0) / 0.8);
      glowPath(g, BR.green, C.ok, gA, 10);
      glowPath(g, BR.yellow, C.yellow, yA, 10);
      glowPath(g, BR.red, C.red, rA, 10);
      g.restore();
      label(g, 'ЗЕЛЁНЫЙ', 330, 500, C.ok, gA);
      label(g, 'ЖЁЛТЫЙ', 1010, 420, C.yellow, yA);
      label(g, 'КРАСНЫЙ', 1620, 500, C.red, rA);
    } else {
      // камера разворачивается и летит вдоль зелёного рукава
      const k = ease.inOut(clamp(t / dur));
      g.save();
      zoom(g, lerp(1.1, 1.9, k), lerp(960, 520, k), lerp(700, 610, k));
      valleyFork(g, cache);
      glowPath(g, BR.green, C.ok, 1, 10);
      glowPath(g, BR.yellow, C.yellow, 1 - clamp(t / 2.5), 10);
      glowPath(g, BR.red, C.red, 1 - clamp(t / 2.5), 10);
      g.restore();
      label(g, 'ЗЕЛЁНЫЙ', 960, 300, C.ok, clamp((t - 2.5) / 1) * (1 - clamp((t - 8.5) / 1)));
    }
  },
  // S05-2: засуха, трещины, марево
  drought(g, t, dur, p, cache) {
    const L = layer(cache, 'dr', W, H, (b) => {
      sky(b, [[0, '#B7C4C9'], [0.6, '#E9DCC0'], [1, '#F4E3C2']]);
      sun(b, 1400, 170, 46, '#FFFFFF', '#FFE9B8');
      ridge(b, 2, 560, 50, '#BFA582');
      b.fillStyle = vgrad(b, 0, 560, H, [[0, '#C9A877'], [1, '#9C7A50']]);
      b.fillRect(0, 560, W, H - 560);
      // сеть трещин в перспективе
      const R = rng(9);
      b.strokeStyle = rgba('#5C4630', 0.8);
      for (let i = 0; i < 520; i++) {
        const y = 580 + Math.pow(R(), 1.7) * 500, k = (y - 560) / 520;
        const x = R() * W, len = 20 + k * 120;
        b.lineWidth = 0.6 + k * 2.6;
        b.beginPath();
        b.moveTo(x, y);
        b.lineTo(x + (R() - 0.5) * len * 2, y + (R() - 0.3) * len * 0.35);
        b.lineTo(x + (R() - 0.5) * len * 2.4, y + (R() - 0.3) * len * 0.5);
        b.stroke();
      }
      // засохшие стебли
      for (let i = 0; i < 70; i++) {
        const x = R() * W, y = 900 + R() * 180, h = 60 + R() * 140;
        b.strokeStyle = rgba('#6E5636', 0.9);
        b.lineWidth = 2.5;
        b.beginPath();
        b.moveTo(x, y);
        b.quadraticCurveTo(x + 10, y - h * 0.6, x + 30 * (R() - 0.3), y - h);
        b.stroke();
        ellipse(b, x + 14, y - h * 0.6, 14, 4, rgba('#8A6A40', 0.9), -0.6);
      }
    });
    g.save();
    zoom(g, lerp(1, 1.1, t / dur), 960, 700);
    put(g, L);
    g.restore();
    // марево: дрожащие полосы у горизонта
    for (let i = 0; i < 16; i++) {
      const y = 540 + i * 9;
      g.fillStyle = rgba('#FFF4DA', 0.07 + 0.05 * Math.sin(t * 6 + i * 1.7));
      g.fillRect(0, y + Math.sin(t * 4 + i) * 3, W, 5);
    }
    g.fillStyle = rgba('#FFE7B0', 0.12);
    g.fillRect(0, 0, W, H);
  },
  // S05-3: обрушение ледника
  glacier(g, t, dur, p, cache) {
    const L = layer(cache, 'gl', W, H, (b) => {
      sky(b, [[0, '#7FA3BC'], [1, '#D7E3EA']]);
      ridge(b, 5, 360, 120, '#B9CCD8');
      // фронт ледника
      b.fillStyle = vgrad(b, 0, 300, 760, [[0, '#F4F8FB'], [0.6, '#BFDCEB'], [1, '#7FB2CC']]);
      b.beginPath();
      b.moveTo(0, 760);
      for (let x = 0; x <= W; x += 20) b.lineTo(x, 330 + Math.sin(x / 70) * 14 + noise1(x / 40) * 30);
      b.lineTo(W, 760);
      b.fill();
      const R = rng(2);
      for (let i = 0; i < 90; i++) {
        const x = R() * W;
        b.strokeStyle = rgba('#5E93B2', 0.35 + R() * 0.3);
        b.lineWidth = 2 + R() * 4;
        b.beginPath();
        b.moveTo(x, 360 + R() * 60);
        b.lineTo(x + (R() - 0.5) * 30, 760);
        b.stroke();
      }
    });
    put(g, L);
    // откалывающийся блок
    const k = clamp((t - 2.6) / 4.4), fall = ease.in(k);
    g.save();
    g.translate(1180 + fall * 60, 520 + fall * 420);
    g.rotate(fall * 0.5);
    poly(g, [[-140, -200], [120, -210], [150, 230], [-160, 240]], k < 1 ? '#DDEEF7' : 'rgba(0,0,0,0)');
    g.fillStyle = rgba('#7FB2CC', 0.5);
    g.fillRect(-160, 40, 300, 200);
    g.restore();
    if (k < 0.05) {
      g.strokeStyle = rgba('#3E6E8A', 0.7);
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(1040, 320);
      g.lineTo(1060, 760);
      g.stroke();
    }
    // море
    sea(g, 760, '#2E5A70', '#0F2A3A');
    shimmer(g, t, 765, H, '#BFD9E6', 120, 0.4);
    // всплеск
    if (t > 5.6) {
      const a = t - 5.6;
      for (let i = 0; i < 70; i++) {
        const ang = Math.PI * (0.1 + rnd(i) * 0.8), sp = 300 + rnd(i * 3) * 500;
        const x = 1220 + Math.cos(ang) * sp * a * 0.6 * (rnd(i * 7) < 0.5 ? -1 : 1), y = 770 - Math.sin(ang) * sp * a + 400 * a * a;
        if (y < 780) circle(g, x, y, 3 + rnd(i) * 8, rgba('#FFFFFF', clamp(1 - a / 3)));
      }
      waveLine(g, t, 790 + a * 10, 10 + a * 6, 60, rgba('#FFFFFF', clamp(0.8 - a * 0.2)), 4);
    }
  },
  // S06-3: край антарктического шельфа сверху
  iceShelf(g, t, dur, p, cache) {
    const L = layer(cache, 'is', W * 1.6, H, (b) => {
      b.fillStyle = '#0E2A3E';
      b.fillRect(0, 0, W * 1.6, H);
      const R = rng(4);
      for (let i = 0; i < 40; i++) ellipse(b, R() * W * 1.6, 600 + R() * 480, 10 + R() * 40, 5 + R() * 16, rgba('#DDEFF6', 0.8));
      b.fillStyle = vgrad(b, 0, 0, 560, [[0, '#F4F8FA'], [1, '#DCE8EE']]);
      b.beginPath();
      b.moveTo(0, 0);
      b.lineTo(W * 1.6, 0);
      for (let x = W * 1.6; x >= 0; x -= 24) b.lineTo(x, 470 + noise1(x / 90) * 70);
      b.fill();
      b.fillStyle = '#9CC4D8';
      for (let x = 0; x <= W * 1.6; x += 24) b.fillRect(x, 470 + noise1(x / 90) * 70, 25, 26);
      for (let i = 0; i < 60; i++) {
        b.strokeStyle = rgba('#B9D2DE', 0.6);
        b.lineWidth = 2;
        const x = R() * W * 1.6;
        b.beginPath();
        b.moveTo(x, R() * 300);
        b.lineTo(x + 80, R() * 450);
        b.stroke();
      }
    });
    put(g, L, -t * 60, 0, W * 1.6, H);
    shimmer(g, t, 560, H, '#9FC3D6', 80, 0.3);
  },
  // S18-3: Антарктида, перламутровые облака
  antarctica(g, t, dur, p, cache) {
    const L = layer(cache, 'an', W * 1.3, H, (b) => {
      sky(b, [[0, '#0F3B78'], [0.7, '#4D86C2'], [1, '#B9D6EE']], W * 1.3, H);
      for (let i = 0; i < 5; i++) {
        const gr = b.createLinearGradient(200 + i * 400, 0, 600 + i * 400, 0);
        gr.addColorStop(0, 'rgba(255,190,220,0)');
        gr.addColorStop(0.3, 'rgba(255,200,230,0.35)');
        gr.addColorStop(0.6, 'rgba(170,230,255,0.35)');
        gr.addColorStop(1, 'rgba(200,255,220,0)');
        b.fillStyle = gr;
        b.beginPath();
        b.ellipse(400 + i * 420, 230 + (i % 2) * 70, 260, 34, -0.08, 0, Math.PI * 2);
        b.fill();
      }
      ridge(b, 9, 640, 220, '#E9F1F7', W * 1.3, H, 0.003);
      ridge(b, 12, 760, 120, '#D5E5EF', W * 1.3, H, 0.004);
      b.fillStyle = vgrad(b, 0, 760, H, [[0, '#F6FAFC'], [1, '#C9DDE8']]);
      b.fillRect(0, 780, W * 1.3, 300);
    });
    put(g, L, -t * 30, 0, W * 1.3, H);
    glow(g, 300, 700, 600, '#FFFFFF', 0.25);
  },
  // S06-1: шторм у набережной
  stormWall(g, t, dur, p, cache) {
    put(g, layer(cache, 'st', W, H, (b) => {
      sky(b, SKY.storm);
      clouds(b, 3, 18, 60, 420, '#3C4650', 1, W, [120, 260]);
      b.fillStyle = '#7A7F84';
      poly(b, [[1250, 1080], [1400, 560], [1920, 560], [1920, 1080]]);
      b.fillStyle = '#5E6368';
      b.fillRect(1250, 540, 670, 26);
      for (let x = 1300; x < 1920; x += 90) b.fillRect(x, 470, 8, 72);
      b.fillRect(1300, 470, 620, 6);
    }));
    sea(g, 640, '#4A5A62', '#1F2C33', W, H);
    for (let i = 0; i < 6; i++) waveLine(g, t * 1.6, 680 + i * 70, 14 + i * 4, 90 - i * 6, rgba('#C9D2D6', 0.5), 3, i);
    // удар волны о стену
    const ph = (t % 2.6) / 2.6;
    const hh = Math.sin(ph * Math.PI) * 420;
    for (let i = 0; i < 60; i++) {
      const a = rnd(i) * Math.PI * 0.8 + Math.PI * 0.6;
      const r = hh * (0.4 + rnd(i * 3) * 0.6);
      circle(g, 1260 + Math.cos(a) * r * 0.5, 620 - Math.abs(Math.sin(a)) * r, 8 + rnd(i * 5) * 24, rgba('#E9EEF0', 0.55 * Math.sin(ph * Math.PI)));
    }
    // дождь
    g.strokeStyle = rgba('#D9E2E6', 0.35);
    g.lineWidth = 1.5;
    for (let i = 0; i < 260; i++) {
      const x = (rnd(i) * W + t * 300) % W, y = (rnd(i * 3) * H + t * 1400) % H;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - 10, y + 34);
      g.stroke();
    }
  },
  // S06-2: дельта реки сверху, дома у воды
  delta(g, t, dur, p, cache) {
    const L = layer(cache, 'de', W * 1.4, H, (b) => {
      b.fillStyle = '#6E9A55';
      b.fillRect(0, 0, W * 1.4, H);
      const R = rng(6);
      for (let i = 0; i < 300; i++) {
        b.fillStyle = mixc('#7FAE5C', '#B9C96E', R());
        b.fillRect(R() * W * 1.4, R() * H, 40 + R() * 90, 30 + R() * 60);
      }
      b.strokeStyle = '#C9DCE4';
      b.lineCap = 'round';
      for (let k = 0; k < 9; k++) {
        b.lineWidth = 50 - k * 4;
        b.beginPath();
        let x = 200 + k * 290, y = -20;
        b.moveTo(x, y);
        while (y < H + 40) {
          x += (noise1(y / 120 + k * 5) - 0.5) * 80;
          y += 30;
          b.lineTo(x, y);
        }
        b.stroke();
      }
      b.fillStyle = '#9CC2D2';
      b.fillRect(0, 920, W * 1.4, 200);
      for (let i = 0; i < 380; i++) {
        const x = R() * W * 1.4, y = R() * H;
        rrect(b, x, y, 8, 8, 1.5, R() < 0.5 ? '#C9584A' : '#D9D2C4');
      }
    });
    put(g, L, -t * 50, 0, W * 1.4, H);
    shimmer(g, t, 920, H, '#FFFFFF', 60, 0.4);
    clouds(g, 21, 6, 100, 900, '#FFFFFF', 0.25, W, [120, 220]);
  },
  // S06-4: прилив затапливает улицу (таймлапс)
  floodStreet(g, t, dur, p, cache) {
    put(g, layer(cache, 'fs', W, H, (b) => {
      sky(b, SKY.day);
      const cols = ['#E8D9C0', '#D9B79A', '#C9D6DC', '#E3C9A8', '#BFD0BE'];
      for (let i = 0; i < 6; i++) {
        const x = i * 330 - 40, h = 360 + (i % 3) * 60;
        b.fillStyle = cols[i % 5];
        b.fillRect(x, 760 - h, 330, h);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          b.fillStyle = '#3E5562';
          b.fillRect(x + 40 + c * 95, 760 - h + 50 + r * 100, 50, 64);
        }
        b.fillStyle = '#6B4A30';
        b.fillRect(x + 140, 640, 54, 120);
      }
      b.fillStyle = '#9A9D9E';
      b.fillRect(0, 760, W, 30);
      b.fillStyle = '#5E6264';
      b.fillRect(0, 790, W, H - 790);
      ['#B5BCC4', '#C8483C', '#2F5E8A', '#E9E4DA'].forEach((c, i) => car(b, 260 + i * 430, 900, 70, c));
    }));
    const lv = ease.inOut(clamp(t / dur)) * 170;
    g.fillStyle = vgrad(g, 0, 940 - lv, H, [[0, rgba('#6E8F98', 0.75)], [1, rgba('#3E5A64', 0.9)]]);
    g.fillRect(0, 940 - lv, W, H);
    for (let i = 0; i < 4; i++) waveLine(g, t, 945 - lv + i * 30, 3, 40, rgba('#DCEBEE', 0.5), 2, i);
    shimmer(g, t, 950 - lv, H, '#FFFFFF', 80, 0.35);
  },
  // S07-1/2: долина — зелёная и в засуху (сплит-скрин)
  valley(g, t, dur, p, cache) {
    const draw = (b, dry) => {
      sky(b, dry ? [[0, '#9AA9B0'], [1, '#E8D9BC']] : SKY.day);
      ridge(b, 3, 470, 140, dry ? '#A88E6E' : '#5E8A70');
      ridge(b, 5, 600, 110, dry ? '#B89A6E' : '#4E8A55');
      b.fillStyle = vgrad(b, 0, 620, H, dry ? [[0, '#C9A877'], [1, '#9C7A50']] : [[0, '#6FA45A'], [1, '#3E7A42']]);
      b.fillRect(0, 640, W, H - 640);
      b.strokeStyle = dry ? '#8E6E48' : '#7FC3E0';
      b.lineWidth = 40;
      b.lineCap = 'round';
      b.beginPath();
      b.moveTo(820, 640);
      b.bezierCurveTo(900, 760, 700, 860, 980, 1100);
      b.stroke();
      const R = rng(7);
      for (let i = 0; i < 46; i++) {
        const x = 120 + R() * 1700, y = 690 + R() * 360, s = 30 + (y - 640) / 4;
        if (dry) {
          b.strokeStyle = '#6E5636';
          b.lineWidth = 3;
          b.beginPath();
          b.moveTo(x, y);
          b.lineTo(x, y - s * 0.7);
          b.lineTo(x - s * 0.25, y - s);
          b.moveTo(x, y - s * 0.6);
          b.lineTo(x + s * 0.3, y - s * 0.95);
          b.stroke();
        } else tree(b, x, y, s, {seed: i + 40});
      }
      [[1480, 600], [1560, 610], [1640, 598]].forEach(([x, y]) => {
        rrect(b, x, y - 40, 60, 40, 3, dry ? '#BFA98A' : '#E9DCC6');
        poly(b, [[x - 6, y - 40], [x + 66, y - 40], [x + 30, y - 66]], '#A8584A');
      });
    };
    const A = layer(cache, 'vg', W, H, (b) => draw(b, false));
    const B = layer(cache, 'vd', W, H, (b) => draw(b, true));
    g.save();
    zoom(g, lerp(1, 1.05, t / dur));
    if (p.stage === 1) {
      put(g, A);
      const k = ease.inOut(clamp((t - 5.5) / 2.5));
      if (k > 0) {
        const x = lerp(W, W / 2, k);
        g.beginPath();
        g.rect(x, 0, W, H);
        g.save();
        g.clip();
        put(g, B);
        g.restore();
      }
    } else {
      const x = lerp(W / 2, 0, ease.inOut(clamp((t - 4.5) / 3)));
      put(g, A);
      g.save();
      g.beginPath();
      g.rect(x, 0, W, H);
      g.clip();
      put(g, B);
      g.restore();
    }
    g.restore();
    const sx = p.stage === 1 ? lerp(W, W / 2, ease.inOut(clamp((t - 5.5) / 2.5))) : lerp(W / 2, 0, ease.inOut(clamp((t - 4.5) / 3)));
    g.fillStyle = '#FFFFFF';
    g.fillRect(sx - 2, 0, 4, H);
  },
  // S07-3: дамбы и польдеры
  polder(g, t, dur, p, cache) {
    put(g, layer(cache, 'po', W * 1.3, H, (b) => {
      sky(b, SKY.day, W * 1.3, 300);
      b.fillStyle = '#3E7FA0';
      b.fillRect(0, 230, W * 1.3, 220);
      b.fillStyle = '#8FB07A';
      poly(b, [[0, 450], [W * 1.3, 430], [W * 1.3, 470], [0, 490]]);
      b.fillStyle = '#C9C1A8';
      poly(b, [[0, 470], [W * 1.3, 452], [W * 1.3, 462], [0, 480]]);
      const R = rng(3);
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 14; c++) {
          const y = 495 + r * 66 + r * r * 2, x = c * 190 - r * 20;
          b.fillStyle = mixc('#6FA45A', '#B9C96E', R());
          b.fillRect(x, y, 186, 62 + r * 4);
          b.fillStyle = '#5E9AB8';
          b.fillRect(x, y + 62 + r * 4, 190, 4);
        }
    }));
    g.save();
    g.translate(-t * 26, 0);
    put(g, cache.po, 0, 0, W * 1.3, H);
    for (let i = 0; i < 9; i++) {
      const x = 120 + i * 270;
      g.save();
      g.translate(x, 470 - x * 0.0105);
      // мачта
      g.fillStyle = '#F2F4F5';
      g.fillRect(-3, -170, 6, 170);
      for (let k = 0; k < 3; k++) {
        g.save();
        g.translate(0, -170);
        g.rotate(t * 1.6 + i + (k * Math.PI * 2) / 3);
        g.beginPath();
        g.moveTo(-4, 0);
        g.quadraticCurveTo(6, -40, 0, -80);
        g.lineTo(-3, -12);
        g.closePath();
        g.fill();
        g.restore();
      }
      g.restore();
    }
    g.restore();
    shimmer(g, t, 240, 440, '#DDEFF6', 80, 0.35, W, 2, 6);
  },
  // S07-4: стройка морской защиты, краны
  construction(g, t, dur, p, cache) {
    put(g, layer(cache, 'co', W, H, (b) => {
      sky(b, [[0, '#7FA9C6'], [1, '#DDE6E8']]);
      sea(b, 600, '#5E8EA4', '#2A4E60');
      b.fillStyle = '#A9A49A';
      poly(b, [[0, 820], [W, 700], [W, H], [0, H]]);
      const R = rng(5);
      for (let i = 0; i < 40; i++) {
        const x = R() * W, y = 700 + R() * 120 - x * 0.06;
        b.fillStyle = mixc('#C9C4B8', '#8E897E', R());
        b.fillRect(x, y, 70, 50);
      }
    }));
    [[520, 640, 0], [1340, 600, 1.5]].forEach(([x, y, ph]) => {
      g.strokeStyle = '#E2A72E';
      g.lineWidth = 6;
      g.strokeRect(x - 16, y - 420, 32, 420);
      for (let k = 0; k < 14; k++) {
        g.beginPath();
        g.moveTo(x - 16, y - k * 30);
        g.lineTo(x + 16, y - k * 30 - 30);
        g.stroke();
      }
      const ang = Math.sin(t * 0.3 + ph) * 0.25;
      g.save();
      g.translate(x, y - 420);
      g.rotate(ang * 0.2);
      g.fillStyle = '#E2A72E';
      g.fillRect(-120, -10, 520, 18);
      const hx = 140 + Math.sin(t * 0.5 + ph) * 120;
      g.strokeStyle = '#333';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(hx, 8);
      g.lineTo(hx, 260 + Math.sin(t * 0.8 + ph) * 40);
      g.stroke();
      g.fillStyle = '#A9A49A';
      g.fillRect(hx - 30, 260 + Math.sin(t * 0.8 + ph) * 40, 60, 40);
      g.restore();
    });
    for (let i = 0; i < 9; i++) walker(g, ((rnd(i) * W + t * 20 * (i % 2 ? 1 : -1)) % W + W) % W, 860 + (i % 3) * 30, 34, '#E8662E', t * 5 + i, i % 2 ? 1 : -1);
    shimmer(g, t, 610, 760, '#E9F3F6', 60, 0.3);
  },
  // S17-1/2: коралловый риф — живой и обесцвеченный (одинаковая композиция)
  reef(g, t, dur, p, cache) {
    const bl = p.bleach;
    const L = layer(cache, `reef${bl}`, W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, bl ? [[0, '#5E8A96'], [1, '#2A4048']] : [[0, '#1E8FB8'], [1, '#0B3550']]);
      b.fillRect(0, 0, W, H);
      b.fillStyle = bl ? '#B9B2A2' : '#D9C28E';
      b.beginPath();
      b.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) b.lineTo(x, 880 + noise1(x / 160) * 60);
      b.lineTo(W, H);
      b.fill();
      const R = rng(8);
      const cols = ['#E8604A', '#F2A65A', '#B65FC9', '#E8C046', '#4FC9B0', '#F27A9A'];
      for (let i = 0; i < 60; i++) {
        const x = R() * W, y = 760 + R() * 300, s = 30 + R() * 90;
        const col = bl ? mixc('#F2EEE6', '#C9C4BA', R()) : cols[Math.floor(R() * cols.length)];
        if (R() < 0.5) {
          // ветвистый коралл
          b.strokeStyle = col;
          b.lineCap = 'round';
          const br = (x0, y0, len, ang, w, d) => {
            const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
            b.lineWidth = w;
            b.beginPath();
            b.moveTo(x0, y0);
            b.lineTo(x1, y1);
            b.stroke();
            if (d > 0) {
              br(x1, y1, len * 0.75, ang - 0.45, w * 0.75, d - 1);
              br(x1, y1, len * 0.75, ang + 0.4, w * 0.75, d - 1);
            }
          };
          br(x, y, s * 0.5, -Math.PI / 2, s * 0.14, 4);
        } else {
          ellipse(b, x, y, s * 0.7, s * 0.45, col);
          for (let k = 0; k < 6; k++) {
            b.strokeStyle = rgba('#000000', 0.12);
            b.lineWidth = 2;
            b.beginPath();
            b.ellipse(x, y, s * 0.7 * (k / 6), s * 0.45 * (k / 6), 0, Math.PI, 0);
            b.stroke();
          }
        }
      }
    });
    put(g, L);
    // лучи и каустика
    const op = g.globalCompositeOperation;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = 200 + i * 260 + Math.sin(t * 0.4 + i) * 40;
      const gr = g.createLinearGradient(x, 0, x + 200, H);
      gr.addColorStop(0, rgba('#FFFFFF', bl ? 0.05 : 0.12));
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      poly(g, [[x, 0], [x + 70, 0], [x + 320, H], [x + 180, H]]);
    }
    g.globalCompositeOperation = op;
    // рыбы
    const n = bl ? 4 : 26;
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? 1 : -1, sp = 40 + rnd(i) * 70;
      const x = (((rnd(i * 3) * W + dir * t * sp) % (W + 200)) + W + 200) % (W + 200) - 100, y = 300 + rnd(i * 5) * 500 + Math.sin(t * 2 + i) * 10;
      const s = 14 + rnd(i * 7) * 22, col = bl ? '#8E9A9E' : ['#F2C046', '#E8604A', '#4FC9E0', '#FFFFFF'][i % 4];
      ellipse(g, x, y, s, s * 0.45, col);
      poly(g, [[x - dir * s * 0.9, y], [x - dir * s * 1.5, y - s * 0.4], [x - dir * s * 1.5, y + s * 0.4]], col);
    }
    for (let i = 0; i < 20; i++) circle(g, (rnd(i) * W + Math.sin(t + i) * 10) % W, H - ((t * 60 + rnd(i * 3) * H) % H), 3 + rnd(i) * 4, rgba('#FFFFFF', 0.35));
  },
  // S18-2: прыжок горбатого кита
  whale(g, t, dur, p, cache) {
    put(g, layer(cache, 'wh', W, H, (b) => {
      sky(b, SKY.golden);
      sun(b, 1500, 470, 40);
      sea(b, 620, '#9FB8B0', '#1D4E60');
    }));
    shimmer(g, t, 625, H, '#FFE6B8', 200, 0.45);
    const k = clamp((t - 0.8) / 6.4);
    if (k > 0 && k < 1) {
      // горбатый кит выходит из воды под углом и заваливается на бок
      const rise = Math.sin(k * Math.PI);
      g.save();
      g.beginPath();
      g.rect(0, 0, W, 621);
      g.clip();
      g.translate(940 + k * 140, 660 - rise * 300);
      g.rotate(lerp(-0.55, 0.75, ease.inOut(k)));
      // тело: голова вверху, хвост в воде
      g.fillStyle = '#26303B';
      g.beginPath();
      g.moveTo(0, -330);
      g.bezierCurveTo(70, -300, 95, -120, 80, 60);
      g.bezierCurveTo(70, 200, 30, 300, 0, 360);
      g.bezierCurveTo(-30, 300, -70, 200, -80, 60);
      g.bezierCurveTo(-95, -120, -70, -300, 0, -330);
      g.fill();
      // светлое горло с бороздами
      g.fillStyle = '#D9DEE2';
      g.beginPath();
      g.moveTo(10, -300);
      g.bezierCurveTo(60, -260, 72, -100, 60, 40);
      g.bezierCurveTo(40, 0, 25, -150, 10, -300);
      g.fill();
      g.strokeStyle = 'rgba(80,90,100,0.6)';
      g.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.moveTo(18 + i * 7, -270 + i * 10);
        g.quadraticCurveTo(40 + i * 5, -120, 46 + i * 2, 10);
        g.stroke();
      }
      // бугорки на голове
      for (let i = 0; i < 7; i++) circle(g, -8 + (i % 2) * 14, -300 + i * 22, 5, '#3A4552');
      // длинные белые грудные плавники
      const flap = Math.sin(t * 2.2) * 0.12;
      [[1, 0.9 + flap], [-1, -1.0 - flap]].forEach(([d, r]) => {
        g.save();
        g.translate(d * 60, -120);
        g.rotate(r);
        g.fillStyle = '#E3E7EA';
        g.beginPath();
        g.ellipse(0, 150, 26, 160, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#2E3944';
        g.lineWidth = 3;
        g.beginPath();
        g.ellipse(0, 150, 26, 160, 0, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      });
      circle(g, 38, -230, 6, '#0E1216');
      g.restore();
      // вода стекает с тела
      for (let i = 0; i < 30; i++) {
        const x = 940 + k * 140 + (rnd(i) - 0.5) * 160, y = 640 - ((t * 300 + rnd(i * 3) * 400) % (rise * 320 + 1));
        g.fillStyle = 'rgba(255,255,255,0.55)';
        g.fillRect(x, y, 2, 14);
      }
    }
    const sp = clamp((t - 1.2) / 2) + clamp((t - 6.2) / 1.5);
    for (let i = 0; i < 90; i++) {
      const a = Math.PI * (0.15 + rnd(i) * 0.7), r = (t < 6 ? t - 1 : t - 6.2) * (200 + rnd(i * 3) * 300);
      if (sp <= 0 || r < 0) continue;
      const x = (t < 6 ? 960 : 1100) + Math.cos(a) * r * 0.8 * (rnd(i * 5) < 0.5 ? 1 : -1), y = 640 - Math.sin(a) * r + 120 * r * r / 40000;
      if (y < 650) circle(g, x, y, 3 + rnd(i) * 7, rgba('#FFFFFF', 0.6));
    }
  },
  // S18-1: стая волков в снежной долине
  wolves(g, t, dur, p, cache) {
    put(g, layer(cache, 'wo', W, H, (b) => {
      sky(b, [[0, '#9CB4C9'], [1, '#E3ECF1']]);
      ridge(b, 3, 520, 220, '#C9D6E0');
      ridge(b, 5, 640, 120, '#E3EBF0');
      for (let i = 0; i < 30; i++) pine(b, 40 + i * 64 + rnd(i) * 30, 650 + rnd(i * 3) * 20, 90 + rnd(i) * 60, '#3E5A50', 0.6);
      b.fillStyle = vgrad(b, 0, 660, H, [[0, '#EEF3F6'], [1, '#D9E3EA']]);
      b.fillRect(0, 670, W, H - 670);
    }));
    for (let i = 0; i < 5; i++) {
      const x = -200 + ((t * 120 + i * 170) % (W + 400)), y = 830 + (i % 2) * 40 + Math.sin(i) * 20, s = 1 + (i % 2) * 0.08;
      wolf(g, x, y, 130 * s, t * 9 + i * 1.3, i);
    }
    for (let i = 0; i < 40; i++) circle(g, (rnd(i) * W + t * 20) % W, (rnd(i * 3) * H + t * 40) % H, 2 + rnd(i) * 2, rgba('#FFFFFF', 0.7));
  },
  // S18-4: восстановленная петляющая река, бобровая плотина
  meander(g, t, dur, p, cache) {
    put(g, layer(cache, 'me', W * 1.3, H, (b) => {
      b.fillStyle = '#5E8A50';
      b.fillRect(0, 0, W * 1.3, H);
      const R = rng(4);
      for (let i = 0; i < 400; i++) circle(b, R() * W * 1.3, R() * H, 10 + R() * 30, mixc('#4E7A44', '#8FB86A', R()));
      b.strokeStyle = '#7FB6C9';
      b.lineWidth = 46;
      b.lineCap = 'round';
      b.beginPath();
      for (let y = -40, i = 0; y <= H + 40; y += 10, i++) b.lineTo(W * 0.65 + Math.sin(y / 120) * 260 + Math.sin(y / 47) * 40, y);
      b.stroke();
      b.strokeStyle = '#7A5A3A';
      b.lineWidth = 16;
      b.beginPath();
      b.moveTo(W * 0.65 + Math.sin(540 / 120) * 260 - 60, 540);
      b.lineTo(W * 0.65 + Math.sin(540 / 120) * 260 + 60, 548);
      b.stroke();
      ellipse(b, W * 0.65 + Math.sin(480 / 120) * 260, 470, 130, 70, '#6FA8BC');
    }));
    put(g, cache.me, -t * 28, 0, W * 1.3, H);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = rgba('#FFFFFF', 0.12);
      g.beginPath();
      g.ellipse(((i * 380 + t * 20) % (W + 600)) - 300, 200 + i * 140, 420, 60, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
  // S18-5: лес растёт на бывшей вырубке
  regrow(g, t, dur, p, cache) {
    g.fillStyle = '#7A6A4A';
    g.fillRect(0, 0, W, H);
    const k = clamp(t / dur);
    g.save();
    zoom(g, lerp(1.15, 1, ease.inOut(k)));
    const R = rng(11);
    for (let i = 0; i < 420; i++) {
      const x = R() * W, y = R() * H, ph = R();
      const grow = clamp((k * 1.5 - ph * 0.5) * 1.4);
      const r = (10 + R() * 26) * (0.25 + 0.75 * grow);
      circle(g, x, y, r, mixc('#3E6E3E', '#8FC06A', R()));
      circle(g, x - r * 0.25, y - r * 0.25, r * 0.4, rgba('#B9E08A', 0.35));
    }
    g.restore();
    glow(g, 300, 200, 900, '#FFE9B8', 0.25);
  },
  // S17-3: граница вырубки тропического леса
  deforest(g, t, dur, p, cache) {
    put(g, layer(cache, 'df', W * 1.5, H, (b) => {
      b.fillStyle = '#A8563A';
      b.fillRect(0, 0, W * 1.5, H);
      const R = rng(13);
      for (let i = 0; i < 300; i++) circle(b, R() * W * 1.5, R() * H, 3 + R() * 6, rgba('#5A3A28', 0.7));
      b.save();
      b.beginPath();
      b.rect(0, 0, W * 1.5, 470);
      b.clip();
      for (let i = 0; i < 1400; i++) circle(b, R() * W * 1.5, R() * 520 - 40, 16 + R() * 34, mixc('#1F5A32', '#5E9A4E', R()));
      b.restore();
      b.fillStyle = rgba('#000000', 0.25);
      b.fillRect(0, 470, W * 1.5, 18);
    }));
    put(g, cache.df, -t * 50, 0, W * 1.5, H);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = rgba('#FFFFFF', 0.08);
      g.beginPath();
      g.ellipse(((i * 600 - t * 30) % (W + 800)) + 200, 300 + i * 160, 380, 50, 0, 0, Math.PI * 2);
      g.fill();
    }
  },
  // S19-1: болото на окраине города, деревянный настил
  wetland(g, t, dur, p, cache) {
    put(g, layer(cache, 'wl', W, H, (b) => wetlandBg(b)));
    for (let i = 0; i < 6; i++) bird(g, ((t * 60 + i * 300) % (W + 200)) - 100, 200 + i * 30 + Math.sin(t + i) * 10, 10, t * 8 + i);
    shimmer(g, t, 640, 1000, '#FFFFFF', 60, 0.3);
  },
  // S19-2: старая эстакада, заросшая лианами
  overpass(g, t, dur, p, cache) {
    const k = t / dur;
    put(g, layer(cache, 'ov', W, H, (b) => {
      sky(b, SKY.day);
      ridge(b, 3, 700, 60, '#7FA27A');
      b.fillStyle = '#6E9A55';
      b.fillRect(0, 720, W, H - 720);
    }));
    g.save();
    zoom(g, lerp(1, 1.18, k), 960, 600);
    for (let i = 0; i < 5; i++) {
      const x = 260 + i * 360;
      g.fillStyle = '#9A9A92';
      g.fillRect(x, 300, 60, 480);
      for (let v = 0; v < 8; v++) {
        g.strokeStyle = rgba('#3E7A3E', 0.9);
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(x + v * 8, 300);
        for (let yy = 300; yy < 760; yy += 20) g.lineTo(x + v * 8 + Math.sin(yy / 30 + v) * 6, yy);
        g.stroke();
      }
    }
    g.fillStyle = '#8A8A82';
    g.fillRect(0, 230, W, 80);
    for (let i = 0; i < 70; i++) circle(g, rnd(i) * W, 230 + rnd(i * 3) * 40, 18 + rnd(i * 5) * 26, mixc('#3E7A3E', '#7FB06A', rnd(i * 7)));
    for (let i = 0; i < 40; i++) {
      const x = rnd(i * 11) * W;
      g.strokeStyle = rgba('#3E7A3E', 0.9);
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x, 300);
      g.lineTo(x + Math.sin(t + i) * 6, 300 + 60 + rnd(i) * 160);
      g.stroke();
    }
    for (let i = 0; i < 12; i++) tree(g, 100 + i * 160, 820 + (i % 2) * 40, 120 + rnd(i) * 80, {seed: i + 70});
    g.restore();
    for (let i = 0; i < 4; i++) bird(g, ((t * 80 + i * 400) % (W + 200)) - 100, 420 + i * 20, 9, t * 9 + i);
  },
  // S19-3: Мира и Ая на настиле, Мира показывает на эстакаду
  boardwalk(g, t, dur, p, cache) {
    put(g, layer(cache, 'wl', W, H, (b) => wetlandBg(b)));
    g.fillStyle = '#9A9A92';
    g.fillRect(1500, 520, 420, 40);
    for (let i = 0; i < 3; i++) g.fillRect(1560 + i * 130, 560, 26, 120);
    for (let i = 0; i < 20; i++) circle(g, 1500 + rnd(i) * 420, 520 + rnd(i * 3) * 30, 14 + rnd(i) * 14, mixc('#3E7A3E', '#7FB06A', rnd(i * 7)));
    const k = clamp(t / dur);
    const x = lerp(560, 760, Math.min(k, 0.55) / 0.55);
    const walking = k < 0.55;
    mira(g, x, 1000, 420, {pose: walking ? 'walk' : 'side', phase: t * 5, t, dir: 1, arm: !walking && t > 5.5 ? 'point' : 'down', wind: 0.3});
    aya(g, x - 170, 1000, 280, {pose: walking ? 'walk' : 'side', phase: t * 6 + 1, t, dir: 1, arm: 'down'});
  },
  // S19-4: лягушка на тростнике и лицо Аи (перевод фокуса)
  frog(g, t, dur, p, cache) {
    const f = ease.inOut(clamp((t - 3.5) / 1.5));
    const AF = layer(cache, 'ayaS', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#9CC08A'], [1, '#5E8A50']]);
      b.fillRect(0, 0, W, H);
      ayaPortrait(b, 1280, 470, 520, {mood: 'wow'});
    });
    const AB = layer(cache, 'ayaB', W, H, (b) => {
      b.filter = 'blur(18px)';
      b.drawImage(AF.c, 0, 0, W, H);
      b.filter = 'none';
    });
    put(g, AB);
    put(g, AF, 0, 0, W, H, f);
    const FR = layer(cache, 'frog', W, H, (b) => frogDraw(b, 0));
    const FB = layer(cache, 'frogB', W, H, (b) => {
      b.filter = 'blur(14px)';
      b.drawImage(FR.c, 0, 0, W, H);
      b.filter = 'none';
    });
    put(g, FR, 0, 0, W, H, 1 - f);
    put(g, FB, 0, 0, W, H, f);
    // горловой мешок раздувается
    const sac = Math.max(0, Math.sin(t * 3)) * (1 - f);
    if (sac > 0) circle(g, 600, 660, 40 + sac * 30, rgba('#E9E2B0', 0.9));
  },
  // S23-2: руки сажают саженец
  planting(g, t, dur, p, cache) {
    put(g, layer(cache, 'pl', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, H, [[0, '#BFD8A8'], [0.5, '#E8D6B0'], [1, '#6E4E36']]);
      b.fillRect(0, 0, W, H);
      for (let i = 0; i < 20; i++) glow(b, rnd(i) * W, rnd(i * 3) * 500, 120, '#FFF2C8', 0.35);
      b.fillStyle = '#4A3424';
      b.beginPath();
      b.ellipse(W / 2, 900, 700, 220, 0, 0, Math.PI * 2);
      b.fill();
      for (let i = 0; i < 200; i++) circle(b, W / 2 + (rnd(i) - 0.5) * 1300, 900 + (rnd(i * 3) - 0.5) * 360, 3 + rnd(i * 5) * 6, rgba('#2E2018', 0.6));
    }));
    const k = ease.inOut(clamp(t / 6));
    // саженец
    g.strokeStyle = '#5E4A30';
    g.lineWidth = 12;
    g.beginPath();
    g.moveTo(W / 2, 860);
    g.lineTo(W / 2, 520);
    g.stroke();
    [[0, 560, -1], [0, 620, 1], [0, 690, -1], [0, 750, 1]].forEach(([, y, d], i) => ellipse(g, W / 2 + d * 60, y, 70, 28, i % 2 ? C.leaf : C.green, d * -0.4));
    // руки придерживают и прихлопывают землю
    const handY = lerp(760, 820, k) + Math.sin(t * 3) * 4;
    [[-1, 0.4], [1, -0.4]].forEach(([d, r]) => {
      g.save();
      g.translate(W / 2 + d * 230, handY);
      g.rotate(r);
      ellipse(g, 0, 0, 130, 70, '#C9946E');
      for (let i = 0; i < 4; i++) rrect(g, -d * 100 - 30, -50 + i * 28, 80, 24, 12, '#D9A47E');
      g.restore();
      g.save();
      g.translate(W / 2 + d * 520, handY + 150);
      g.rotate(r);
      rrect(g, -200, -70, 400, 140, 60, '#5E7FA0');
      g.restore();
    });
    for (let i = 0; i < 16; i++) circle(g, W / 2 + (rnd(i) - 0.5) * 300, 860 - ((t * 40 + rnd(i * 3) * 100) % 100), 4, rgba('#3A2A1E', 0.7));
  },
};

function wetlandBg(b) {
  sky(b, SKY.day);
  // зелёные башни на горизонте
  for (let i = 0; i < 9; i++) terraceTower(b, 1100 + i * 90, 600, 50, 120 + (i % 3) * 50, {tiers: 3, seed: i + 5, haze: 0.35, hazeColor: '#CFE3EA'});
  ridge(b, 3, 610, 20, '#7FA27A');
  b.fillStyle = '#6E9A5A';
  b.fillRect(0, 610, W, H - 610);
  const R = rng(9);
  for (let i = 0; i < 12; i++) ellipse(b, R() * W, 660 + R() * 300, 120 + R() * 200, 30 + R() * 50, rgba('#8FC3D9', 0.9));
  b.strokeStyle = '#4E7A3E';
  for (let i = 0; i < 700; i++) {
    const x = R() * W, y = 640 + R() * 440, h = 20 + ((y - 620) / 460) * 90;
    b.lineWidth = 1.5;
    b.beginPath();
    b.moveTo(x, y);
    b.lineTo(x + (R() - 0.5) * 10, y - h);
    b.stroke();
  }
  // настил
  b.fillStyle = '#A8865E';
  poly(b, [[200, H], [760, 640], [820, 640], [700, H]]);
  b.strokeStyle = rgba('#5E4A30', 0.6);
  b.lineWidth = 2;
  for (let i = 0; i < 30; i++) {
    const y = 650 + i * i * 0.5;
    const a = (y - 640) / 440;
    b.beginPath();
    b.moveTo(lerp(760, 200, a), y);
    b.lineTo(lerp(820, 700, a), y);
    b.stroke();
  }
  b.fillStyle = '#A8865E';
  b.fillRect(0, 990, W, 90);
}
function wolf(g, x, y, s, ph, i) {
  const c = ['#5E5A56', '#7A7068', '#4A4642', '#8A8078', '#66605A'][i % 5];
  g.save();
  g.translate(x, y);
  g.scale(s / 100, s / 100);
  for (let k = 0; k < 4; k++) {
    const a = Math.sin(ph + (k % 2 ? Math.PI : 0) + (k > 1 ? 0.6 : 0)) * 0.45;
    g.save();
    g.translate(-32 + k * 20, -30);
    g.rotate(a);
    rrect(g, -4, 0, 8, 34, 3, c);
    g.restore();
  }
  ellipse(g, 0, -42, 44, 18, c);
  ellipse(g, 44, -54, 16, 12, c);
  poly(g, [[52, -50], [74, -46], [56, -42]], c);
  poly(g, [[38, -62], [42, -76], [48, -62]], c);
  g.save();
  g.translate(-42, -46);
  g.rotate(0.6 + Math.sin(ph) * 0.1);
  ellipse(g, -14, 6, 20, 7, c);
  g.restore();
  ellipse(g, 6, -34, 30, 8, rgba('#D9D2C8', 0.5));
  g.restore();
}
function frogDraw(b, sac) {
  b.strokeStyle = '#4E7A3E';
  b.lineWidth = 22;
  b.beginPath();
  b.moveTo(420, H);
  b.quadraticCurveTo(520, 700, 640, 520);
  b.stroke();
  ellipse(b, 600, 640, 170, 110, '#5E9A3E');
  ellipse(b, 560, 600, 120, 80, '#7FBE4E');
  circle(b, 520, 540, 34, '#7FBE4E');
  circle(b, 640, 540, 34, '#7FBE4E');
  circle(b, 520, 536, 20, '#2A1E10');
  circle(b, 640, 536, 20, '#2A1E10');
  circle(b, 512, 528, 6, '#FFFFFF');
  circle(b, 632, 528, 6, '#FFFFFF');
  b.strokeStyle = '#2E4A1E';
  b.lineWidth = 4;
  b.beginPath();
  b.arc(580, 610, 70, 0.2 * Math.PI, 0.8 * Math.PI);
  b.stroke();
  ellipse(b, 470, 720, 50, 26, '#5E9A3E', 0.4);
  ellipse(b, 720, 720, 50, 26, '#5E9A3E', -0.4);
}
