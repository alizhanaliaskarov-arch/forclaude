// 1920-е: чёрно-белая «плёнка» — мерцание, царапины, пыль, дрожание кадра. В кадре плашка «реконструкция».
import {W, H, clamp, lerp, ip, ease, rnd, rng, rgba, vgrad, rgrad, circle, ellipse, poly, rrect, layer, put, glow} from '../core.js';
import {archiveFX, walker, cloud, grass} from '../draw.js';

const G = (v) => `rgb(${v},${v},${v})`; // оттенок серого 0…255

function archive(g, t, draw, label = true) {
  const k = Math.floor(t * 18);
  g.save();
  g.translate((rnd(k) - 0.5) * 3, (rnd(k + 99) - 0.5) * 4);
  draw();
  g.restore();
  archiveFX(g, t);
  if (label && t < 3.2) {
    g.save();
    g.globalAlpha = clamp(Math.min(t / 0.4, (3.2 - t) / 0.5)) * 0.85;
    g.font = "600 20px 'Manrope'";
    g.fillStyle = '#FFFFFF';
    g.letterSpacing = '4px';
    g.fillText('РЕКОНСТРУКЦИЯ', W - 300, H - 60);
    g.letterSpacing = '0px';
    g.restore();
  }
}
function bareTree(g, x, y, h, seed, color = G(70)) {
  const R = rng(seed);
  const branch = (x0, y0, len, ang, w, d) => {
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    g.strokeStyle = color;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(x0, y0);
    g.lineTo(x1, y1);
    g.stroke();
    if (d > 0) {
      branch(x1, y1, len * 0.72, ang - 0.4 - R() * 0.3, w * 0.65, d - 1);
      branch(x1, y1, len * 0.7, ang + 0.35 + R() * 0.3, w * 0.65, d - 1);
    }
  };
  branch(x, y, h * 0.35, -Math.PI / 2 + (R() - 0.5) * 0.2, h * 0.04, 5);
}
function man1926(g, x, y, s, phase, dir = 1, tone = 40) {
  // мужчина в длинном пальто и шляпе
  const sw = Math.sin(phase) * 0.25;
  g.strokeStyle = G(tone - 10);
  g.lineWidth = s * 0.11;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x, y - s * 0.32);
  g.lineTo(x + s * sw, y);
  g.moveTo(x, y - s * 0.32);
  g.lineTo(x - s * sw, y);
  g.stroke();
  poly(g, [[x - s * 0.16, y - s * 0.86], [x + s * 0.16, y - s * 0.86], [x + s * 0.2, y - s * 0.28], [x - s * 0.2, y - s * 0.28]], G(tone));
  circle(g, x, y - s * 0.93, s * 0.075, G(150));
  ellipse(g, x, y - s * 0.995, s * 0.13, s * 0.025, G(tone - 15));
  rrect(g, x - s * 0.075, y - s * 1.06, s * 0.15, s * 0.07, s * 0.02, G(tone - 15));
}

export const archiveShots = {
  // S01: ракета Годдарда — поле в снегу, стартовая рама, запуск
  goddard(g, t, dur, p, cache) {
    const launch = p.phase === 'launch';
    const L = layer(cache, 'field', W, H, (b) => {
      b.fillStyle = vgrad(b, 0, 0, 640, [[0, G(150)], [1, G(205)]]);
      b.fillRect(0, 0, W, 640);
      for (let i = 0; i < 5; i++) cloud(b, 200 + i * 400, 160 + (i % 2) * 60, 160, G(230), 0.5, i + 3);
      b.fillStyle = G(120);
      b.fillRect(0, 600, W, 40);
      for (let i = 0; i < 26; i++) bareTree(b, 30 + i * 75 + rnd(i) * 30, 630, 90 + rnd(i * 3) * 80, i + 10, G(85));
      b.fillStyle = vgrad(b, 0, 630, H, [[0, G(215)], [1, G(240)]]);
      b.fillRect(0, 630, W, H - 630);
      for (let i = 0; i < 500; i++) circle(b, rnd(i) * W, 640 + Math.pow(rnd(i * 7), 2) * 440, 1 + rnd(i * 3) * 2.5, rgba('#8A8A8A', 0.25));
    });
    const z = launch ? 1.25 : lerp(1, 1.08, t / dur);
    archive(g, t, () => {
      g.translate(W / 2, H / 2);
      g.scale(z, z);
      g.translate(-W / 2, -H / 2);
      if (launch && t > 1.2 && t < 2.2) g.translate((rnd(Math.floor(t * 30)) - 0.5) * 10, (rnd(Math.floor(t * 30) + 5) - 0.5) * 8);
      put(g, L);
      // стартовая рама: высокая А-образная конструкция из труб
      const fx = 960, fy = 760;
      g.strokeStyle = G(45);
      g.lineWidth = 5;
      [[fx - 70, fy], [fx + 70, fy], [fx - 30, fy + 20], [fx + 30, fy + 20]].forEach(([x, y]) => {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(fx, fy - 330);
        g.stroke();
      });
      g.lineWidth = 3;
      for (let k = 1; k < 4; k++) {
        const yy = fy - k * 80, half = 70 * (1 - (k * 80) / 330);
        g.beginPath();
        g.moveTo(fx - half, yy);
        g.lineTo(fx + half, yy);
        g.stroke();
      }
      // ракета: двигатель сверху, баки снизу
      const rise = launch ? Math.max(0, t - 1.3) : 0;
      const ry = fy - 300 - rise * rise * 160;
      if (ry > -200) {
        g.save();
        g.translate(fx + rise * 30, ry);
        g.rotate(rise * 0.25);
        rrect(g, -9, -40, 18, 46, 6, G(60));
        g.strokeStyle = G(50);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(-5, 6);
        g.lineTo(-5, 90);
        g.moveTo(5, 6);
        g.lineTo(5, 90);
        g.stroke();
        rrect(g, -12, 70, 24, 40, 5, G(70));
        if (launch && t > 1.0) {
          glow(g, 0, 10, 60 + Math.sin(t * 40) * 10, '#FFFFFF', 0.9);
          poly(g, [[-6, 6], [6, 6], [0, 60 + rnd(Math.floor(t * 30)) * 30]], G(250));
        }
        g.restore();
      }
      // дым у основания
      if (launch && t > 1.0) {
        for (let i = 0; i < 18; i++) {
          const a = t - 1.0, r = 30 + a * 60 * (0.6 + rnd(i));
          circle(g, fx + (rnd(i * 3) - 0.5) * a * 260, fy - 40 - rnd(i * 5) * a * 120, r, rgba('#DADADA', clamp(0.55 - a * 0.08)));
        }
      }
      // трое людей уходят от рамы к камере
      if (!launch) {
        [[-160, 0.0], [-40, 0.6], [110, 1.2]].forEach(([dx, ph], i) => {
          const k = t / dur;
          const y = lerp(800, 960, k) + i * 12, s = lerp(150, 230, k) + i * 8;
          man1926(g, fx + dx * lerp(1, 1.6, k), y, s, t * 5 + ph, 1, 35 + i * 8);
        });
      } else {
        man1926(g, 380, 980, 260, 0, 1, 30);
        man1926(g, 1560, 1000, 280, 0, -1, 40);
      }
    });
  },
  // S03-1: улица 1926 года
  street1926(g, t, dur, p, cache) {
    const L = layer(cache, 'st', W, H, (b) => {
      b.fillStyle = G(190);
      b.fillRect(0, 0, W, H);
      const R = rng(5);
      for (let x = -40; x < W; x += 230 + R() * 60) {
        const h = 420 + R() * 260, tone = 90 + R() * 60;
        b.fillStyle = G(tone);
        b.fillRect(x, 700 - h, 240, h);
        for (let yy = 700 - h + 40; yy < 640; yy += 70)
          for (let xx = x + 24; xx < x + 220; xx += 54) {
            b.fillStyle = G(tone - 55);
            b.fillRect(xx, yy, 30, 44);
          }
        b.fillStyle = G(tone - 25);
        b.fillRect(x, 700 - h, 240, 14);
      }
      b.fillStyle = G(135);
      b.fillRect(0, 700, W, 40);
      b.fillStyle = vgrad(b, 0, 740, H, [[0, G(120)], [1, G(150)]]);
      b.fillRect(0, 740, W, H - 740);
      b.strokeStyle = G(60);
      b.lineWidth = 2;
      for (let k = 0; k < 2; k++) {
        b.beginPath();
        b.moveTo(0, 230 + k * 18);
        b.quadraticCurveTo(W / 2, 270 + k * 18, W, 225 + k * 18);
        b.stroke();
      }
      for (let x = 100; x < W; x += 600) b.fillRect(x, 230, 8, 500);
    });
    archive(g, t, () => {
      put(g, L);
      // конная повозка
      const hx = ((t * 160) % (W + 600)) - 300;
      g.fillStyle = G(45);
      rrect(g, hx, 790, 240, 70, 8, G(60));
      circle(g, hx + 40, 870, 34, G(40));
      circle(g, hx + 200, 870, 34, G(40));
      ellipse(g, hx + 330, 800, 70, 32, G(55));
      [0, 1, 2, 3].forEach((i) => {
        const a = Math.sin(t * 12 + i * 1.6) * 0.3;
        g.save();
        g.translate(hx + 290 + i * 26, 820);
        g.rotate(a);
        g.fillRect(-4, 0, 8, 70);
        g.restore();
      });
      g.save();
      g.translate(hx + 390, 780);
      g.rotate(-0.6);
      rrect(g, -12, -40, 26, 60, 10, G(55));
      g.restore();
      // «Форд Т»
      const cx = W + 300 - ((t * 230) % (W + 800));
      rrect(g, cx, 830, 220, 60, 8, G(30));
      rrect(g, cx + 40, 770, 120, 66, 6, G(35));
      g.fillStyle = G(200);
      g.fillRect(cx + 55, 782, 40, 30);
      circle(g, cx + 45, 895, 32, G(25));
      circle(g, cx + 180, 895, 32, G(25));
      // прохожие
      for (let i = 0; i < 9; i++) {
        const dir = i % 2 ? 1 : -1;
        const x = (((rnd(i) * W + dir * t * (70 + i * 6)) % W) + W) % W;
        man1926(g, x, 760 + (i % 3) * 14, 150 + (i % 3) * 10, t * 9 + i, dir, 30 + (i % 4) * 15);
      }
    });
  },
  // S03-2: керосиновая лампа, женщина шьёт
  lamp(g, t, dur, p, cache) {
    archive(g, t, () => {
      const fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3);
      g.fillStyle = G(14);
      g.fillRect(0, 0, W, H);
      g.fillStyle = rgrad(g, 900, 520, 900 * fl, [[0, rgba('#E8E2D6', 0.85)], [0.35, rgba('#9A968E', 0.45)], [1, 'rgba(0,0,0,0)']]);
      g.fillRect(0, 0, W, H);
      // стол
      g.fillStyle = G(50);
      g.fillRect(300, 700, 1300, 30);
      g.fillStyle = G(30);
      g.fillRect(320, 730, 30, 350);
      g.fillRect(1550, 730, 30, 350);
      // лампа
      ellipse(g, 900, 690, 90, 18, G(70));
      rrect(g, 850, 600, 100, 92, 30, G(95));
      rrect(g, 878, 470, 44, 135, 20, rgba('#EDEDED', 0.25));
      glow(g, 900, 540, 120 * fl, '#FFFFFF', 0.8);
      ellipse(g, 900, 548, 9, 24 * fl, G(255));
      // женщина за шитьём (силуэт в полоборота)
      g.fillStyle = G(55);
      g.beginPath();
      g.moveTo(1180, 1080);
      g.quadraticCurveTo(1150, 760, 1250, 640);
      g.quadraticCurveTo(1330, 600, 1390, 660);
      g.quadraticCurveTo(1460, 820, 1440, 1080);
      g.fill();
      circle(g, 1290, 560, 66, G(120));
      circle(g, 1335, 520, 42, G(45));
      ellipse(g, 1265, 585, 30, 40, G(150));
      const hx = 1160 + Math.sin(t * 3) * 14;
      g.strokeStyle = G(130);
      g.lineWidth = 16;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(1280, 700);
      g.lineTo(hx, 690);
      g.stroke();
      rrect(g, 1040, 680, 160, 40, 8, G(200));
    });
  },
  // S03-3: комната людей-вычислителей
  computers(g, t, dur, p, cache) {
    archive(g, t, () => {
      const dx = -t * 40;
      g.fillStyle = vgrad(g, 0, 0, H, [[0, G(170)], [1, G(110)]]);
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) {
        g.fillStyle = G(205);
        g.fillRect(80 + i * 330 + dx * 0.4, 90, 180, 300);
        g.fillStyle = G(150);
        g.fillRect(166 + i * 330 + dx * 0.4, 90, 8, 300);
      }
      for (let row = 0; row < 3; row++) {
        const y = 520 + row * 190, s = 0.7 + row * 0.25;
        for (let i = -1; i < 8; i++) {
          const x = i * 300 * s + dx * (0.6 + row * 0.3) + (row % 2) * 120;
          g.fillStyle = G(80);
          g.fillRect(x, y, 240 * s, 18 * s);
          g.fillRect(x + 10 * s, y + 18 * s, 10 * s, 100 * s);
          g.fillRect(x + 220 * s, y + 18 * s, 10 * s, 100 * s);
          rrect(g, x + 120 * s, y - 50 * s, 90 * s, 50 * s, 6, G(50));
          for (let k = 0; k < 4; k++) circle(g, x + (135 + k * 18) * s, y - 32 * s, 4 * s, G(180));
          g.fillStyle = G(235);
          g.fillRect(x + 20 * s, y - 8 * s, 80 * s, 8 * s);
          // женщина: блузка, причёска-пучок
          const bx = x + 70 * s, by = y + 10 * s;
          g.fillStyle = G(row === 2 ? 200 : 170);
          g.beginPath();
          g.moveTo(bx - 50 * s, by + 80 * s);
          g.quadraticCurveTo(bx - 48 * s, by - 60 * s, bx, by - 70 * s);
          g.quadraticCurveTo(bx + 48 * s, by - 60 * s, bx + 50 * s, by + 80 * s);
          g.fill();
          circle(g, bx, by - 100 * s, 26 * s, G(150));
          circle(g, bx - 4 * s, by - 112 * s, 24 * s, G(45));
          circle(g, bx - 18 * s, by - 128 * s, 13 * s, G(40));
          const w = Math.sin(t * 8 + i + row) * 6 * s;
          g.strokeStyle = G(150);
          g.lineWidth = 12 * s;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(bx + 20 * s, by - 40 * s);
          g.lineTo(bx + 70 * s + w, by - 12 * s);
          g.stroke();
        }
      }
    });
  },
  // S11-1: угольная электростанция, чёрный дым
  coalPlant(g, t, dur, p, cache) {
    archive(g, t, () => {
      g.fillStyle = vgrad(g, 0, 0, H, [[0, G(150)], [1, G(200)]]);
      g.fillRect(0, 0, W, H);
      // дым
      for (let c = 0; c < 4; c++) {
        const cx = 620 + c * 210;
        for (let i = 0; i < 22; i++) {
          const a = (t * 0.35 + i / 22) % 1;
          const px = cx + a * 520 + Math.sin(i + t) * 20, py = 330 - a * 420, pr = 40 + a * 170;
          g.fillStyle = rgrad(g, px, py, pr, [[0, rgba('#202020', 0.55 * (1 - a))], [0.6, rgba('#2A2A2A', 0.35 * (1 - a))], [1, 'rgba(40,40,40,0)']]);
          g.fillRect(px - pr, py - pr, pr * 2, pr * 2);
        }
      }
      g.fillStyle = G(70);
      g.fillRect(380, 560, 1180, 300);
      g.fillStyle = G(55);
      poly(g, [[380, 560], [970, 450], [1560, 560]]);
      for (let c = 0; c < 4; c++) {
        poly(g, [[600 + c * 210, 600], [640 + c * 210, 600], [632 + c * 210, 330], [608 + c * 210, 330]], G(60));
      }
      for (let i = 0; i < 9; i++) {
        g.fillStyle = G(30);
        g.fillRect(430 + i * 125, 640, 60, 120);
      }
      g.fillStyle = G(110);
      g.fillRect(0, 860, W, 220);
      g.fillStyle = G(40);
      g.fillRect(0, 900, W, 6);
      g.fillRect(0, 930, W, 6);
      const wx = ((t * 120) % (W + 800)) - 600;
      for (let i = 0; i < 4; i++) {
        poly(g, [[wx + i * 170, 900], [wx + i * 170 + 150, 900], [wx + i * 170 + 140, 840], [wx + i * 170 + 10, 840]], G(35));
        ellipse(g, wx + i * 170 + 75, 838, 60, 18, G(20));
      }
    });
  },
  // S12-1: рука с карандашом и логарифмической линейкой
  slideRule(g, t, dur, p, cache) {
    archive(g, t, () => {
      g.fillStyle = rgrad(g, 700, 300, 1400, [[0, G(215)], [1, G(90)]]);
      g.fillRect(0, 0, W, H);
      // бумага со столбцами чисел (нечитаемые штрихи)
      g.save();
      g.rotate(-0.05);
      rrect(g, 360, 160, 900, 980, 4, G(238));
      for (let r = 0; r < 18; r++)
        for (let c = 0; c < 4; c++) {
          const done = r < 14 || c < Math.floor((t * 1.4) % 4);
          if (!done) continue;
          g.strokeStyle = G(70);
          g.lineWidth = 3;
          g.beginPath();
          for (let k = 0; k < 6; k++) g.lineTo(420 + c * 210 + k * 22, 230 + r * 48 + Math.sin(k * 2.3 + r + c) * 7);
          g.stroke();
        }
      g.restore();
      // логарифмическая линейка
      g.save();
      g.translate(980, 820);
      g.rotate(0.12);
      rrect(g, -600, -50, 1300, 100, 6, G(225));
      g.fillStyle = G(190);
      g.fillRect(-600 + Math.sin(t * 0.6) * 60, -18, 1300, 36);
      for (let i = 0; i < 120; i++) {
        g.fillStyle = G(40);
        const x = -580 + Math.log10(1 + i * 0.075) * 1250;
        g.fillRect(x, -50, 2, i % 10 === 0 ? 26 : 12);
      }
      g.restore();
      // рука с карандашом
      const hx = 1020 + Math.sin(t * 6) * 18, hy = 680 + Math.cos(t * 6) * 6;
      g.save();
      g.translate(hx, hy);
      g.rotate(-0.5);
      rrect(g, 0, -12, 260, 24, 4, G(60));
      poly(g, [[0, -12], [0, 12], [-36, 0]], G(200));
      g.restore();
      ellipse(g, hx + 200, hy - 60, 120, 70, G(185));
      g.fillStyle = G(150);
      g.fillRect(hx + 240, hy - 130, 500, 140);
    });
  },
  // S14-1: семейный портрет 1920-х, семеро детей
  family1926(g, t, dur, p, cache) {
    archive(g, t, () => {
      g.fillStyle = vgrad(g, 0, 0, H, [[0, G(175)], [1, G(200)]]);
      g.fillRect(0, 0, W, H);
      g.fillStyle = G(120);
      poly(g, [[260, 520], [960, 160], [1660, 520]]);
      g.fillStyle = G(150);
      g.fillRect(320, 520, 1280, 420);
      g.fillStyle = G(80);
      g.fillRect(860, 680, 200, 260);
      [[480, 620], [1300, 620]].forEach(([x, y]) => {
        g.fillStyle = G(70);
        g.fillRect(x, y, 140, 120);
      });
      g.fillStyle = G(140);
      g.fillRect(0, 940, W, 140);
      const people = [[560, 1.0, 50], [700, 0.6, 140], [800, 0.7, 60], [900, 0.5, 170], [1180, 0.95, 70], [1040, 0.55, 150], [1320, 0.65, 90], [1430, 0.45, 160], [600, 0.38, 180]];
      people.forEach(([x, s, tone], i) => {
        const sway = Math.sin(t * 1.3 + i) * 2;
        const hh = 520 * s;
        g.save();
        g.translate(x + sway, 1000);
        poly(g, [[-hh * 0.17, -hh * 0.82], [hh * 0.17, -hh * 0.82], [hh * 0.22, 0], [-hh * 0.22, 0]], G(tone));
        circle(g, 0, -hh * 0.9, hh * 0.085, G(Math.min(225, tone + 70)));
        if (i === 0 || i === 4) rrect(g, -hh * 0.11, -hh * 1.02, hh * 0.22, hh * 0.07, 3, G(40));
        g.restore();
      });
    });
  },
};
