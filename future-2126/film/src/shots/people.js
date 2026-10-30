// Крупные планы людей: младенец, глаз, руки.
import {W, H, C, clamp, lerp, ip, ease, rnd, rng, rgba, mixc, vgrad, rgrad, circle, ellipse, poly, rrect, glow, layer, put} from '../core.js';
import {baby, adultFinger, eyeMacro, oldHand, MIRA, AYA} from '../characters.js';

/** Мягкий фон с боке: светлая комната утром. */
function bokehRoom(g, cache, key, base, spots, seed = 1) {
  const L = layer(cache, key, W, H, (b) => {
    b.fillStyle = vgrad(b, 0, 0, H, base);
    b.fillRect(0, 0, W, H);
    const R = rng(seed);
    spots.forEach(([color, n, rmin, rmax, a]) => {
      for (let i = 0; i < n; i++) {
        const x = R() * W, y = R() * H, r = lerp(rmin, rmax, R());
        b.fillStyle = rgrad(b, x, y, r, [[0, rgba(color, a)], [0.7, rgba(color, a * 0.6)], [1, rgba(color, 0)]]);
        b.fillRect(x - r, y - r, r * 2, r * 2);
      }
    });
  });
  put(g, L);
}
const zoomAround = (g, z, cx = W / 2, cy = H / 2) => {
  g.translate(cx, cy);
  g.scale(z, z);
  g.translate(-cx, -cy);
};

export const peopleShots = {
  // S02-1: роддом 2026, младенец сжимает палец мамы
  babyGrip(g, t, dur, p, cache) {
    bokehRoom(g, cache, 'ward', [[0, '#F5EEE6'], [1, '#E7DCD2']], [['#FFFFFF', 18, 60, 180, 0.6], ['#BFD8E6', 10, 80, 200, 0.35], ['#FFE2B8', 8, 60, 160, 0.4]], 3);
    glow(g, 1500, 200, 700, '#FFF3DC', 0.5);
    g.save();
    zoomAround(g, lerp(1, 1.1, clamp(t / dur)), 820, 560);
    const grip = ease.inOut(clamp((t - 1.6) / 1.6));
    adultFinger(g, 1700 - ease.out(clamp(t / 1.6)) * 700, 330, 320, 0.08);
    baby(g, 820, 620, 1100, {eyes: 0, grip, t, rot: -0.1});
    g.restore();
  },
  // S02-2: глаз младенца открывается
  eye(g, t, dur, p, cache) {
    g.save();
    zoomAround(g, lerp(1, 1.12, clamp(t / dur)));
    eyeMacro(g, W / 2, H / 2, 230, {age: 'baby', open: ip(t, 0.3, 2.4, 0.08, 1), t});
    g.restore();
  },
  // S22-1: спящий младенец сверху
  babySleep(g, t, dur, p, cache) {
    bokehRoom(g, cache, 'crib', [[0, '#EDE6DE'], [1, '#DCD2C8']], [['#FFFFFF', 14, 60, 160, 0.5], ['#FFE2B8', 8, 50, 140, 0.35]], 9);
    g.save();
    zoomAround(g, lerp(1, 1.12, clamp(t / dur)));
    ellipse(g, W / 2, H / 2 + 20, 760, 430, '#F7F4EF');
    ellipse(g, W / 2, H / 2 + 20, 700, 380, '#E9E1D6');
    const br = 1 + Math.sin(t * 2.2) * 0.008;
    g.translate(W / 2, H / 2);
    g.scale(br, br);
    g.translate(-W / 2, -H / 2);
    baby(g, W / 2 + 30, H / 2 + 20, 1000, {eyes: 0, grip: -1, t, rot: 0.15});
    g.restore();
    glow(g, 400, 150, 800, '#FFE9C8', 0.35);
  },
  // S03-6: руки Миры держат старую фотографию младенца
  photoHands(g, t, dur, p, cache) {
    bokehRoom(g, cache, 'home', [[0, '#7A5A44'], [1, '#3E2E26']], [['#FFC98A', 14, 60, 200, 0.4], ['#9CBF8A', 8, 80, 200, 0.25]], 5);
    glow(g, 300, 200, 900, '#FFC27A', 0.35);
    const ph = layer(cache, 'photo', 760, 560, (b) => {
      b.fillStyle = '#F2EBDD';
      b.fillRect(0, 0, 760, 560);
      b.fillStyle = '#E7DCC8';
      b.fillRect(36, 36, 688, 440);
      b.save();
      b.beginPath();
      b.rect(36, 36, 688, 440);
      b.clip();
      b.fillStyle = vgrad(b, 0, 36, 476, [[0, '#EFE6DA'], [1, '#D9CBB8']]);
      b.fillRect(36, 36, 688, 440);
      baby(b, 400, 270, 560, {eyes: 0, grip: -1, rot: -0.1});
      b.restore();
      b.fillStyle = 'rgba(214,190,150,0.28)';
      b.fillRect(0, 0, 760, 560);
    });
    g.save();
    zoomAround(g, lerp(1.04, 1.12, clamp(t / dur)), 960, 520);
    g.translate(960, 500 + Math.sin(t * 0.8) * 4);
    g.rotate(-0.06 + Math.sin(t * 0.5) * 0.01);
    g.filter = 'saturate(0.65) sepia(0.25)';
    put(g, ph, -380, -280, 760, 560);
    g.filter = 'none';
    g.restore();
    oldHand(g, 420, 820, 300, -0.55, {curl: 0.2});
    g.save();
    g.translate(1500, 820);
    g.scale(-1, 1);
    oldHand(g, 0, 0, 300, -0.55, {curl: 0.25 + Math.sin(t * 0.9) * 0.05, ring: false});
    g.restore();
  },
  // S14-5: руки поворачивают персик
  peach(g, t, dur, p, cache) {
    bokehRoom(g, cache, 'market', [[0, '#E8C9A0'], [1, '#B48E6A']], [['#FFE2A8', 14, 60, 180, 0.45], ['#7FB06A', 10, 60, 160, 0.35], ['#E8704A', 6, 50, 120, 0.3]], 12);
    glow(g, 260, 180, 800, '#FFD9A0', 0.45);
    const a = Math.sin(t * 0.7) * 0.25;
    g.save();
    g.translate(980, 520);
    g.rotate(a);
    const R = 210;
    g.fillStyle = rgrad(g, -60, -70, R * 1.3, [[0, '#FFD08A'], [0.45, '#F59A55'], [0.8, '#D9533A'], [1, '#A63A2A']]);
    circle(g, 0, 0, R);
    g.strokeStyle = rgba('#B0442E', 0.5);
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(10, -R);
    g.quadraticCurveTo(-40, 0, 6, R * 0.95);
    g.stroke();
    glow(g, -70, -90, 140, '#FFF3D8', 0.35);
    g.save();
    g.translate(30, -R + 10);
    g.rotate(-0.6);
    ellipse(g, 60, -10, 80, 26, '#4F8A3E');
    g.strokeStyle = '#3A6A2E';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(130, -12);
    g.stroke();
    g.restore();
    g.restore();
    oldHand(g, 640, 820, 330, -0.6, {curl: 0.45});
    g.save();
    g.translate(1330, 840);
    g.scale(-1, 1);
    oldHand(g, 0, 0, 330, -0.6, {curl: 0.5, ring: false});
    g.restore();
  },
  // S22-4: рука Миры держит руку Аи, они идут
  handsHold(g, t, dur, p, cache) {
    g.fillStyle = vgrad(g, 0, 0, H, [[0, '#9CC08A'], [0.6, '#C9B48A'], [1, '#A88A66']]);
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 30; i++) {
      const x = (((rnd(i) * W * 1.5 - t * (160 + rnd(i * 3) * 120)) % (W + 400)) + W + 400) % (W + 400) - 200;
      const y = rnd(i * 7) * H, r = 40 + rnd(i * 5) * 120;
      g.fillStyle = rgrad(g, x, y, r, [[0, rgba(i % 3 ? '#FFF2D0' : '#6FA060', 0.35)], [1, rgba('#FFF2D0', 0)]]);
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const sw = Math.sin(t * 3.4) * 14;
    g.save();
    g.translate(0, sw);
    // рукав Аи (жёлтый) и её ладонь
    g.save();
    g.translate(1250, 640);
    g.rotate(0.35);
    rrect(g, 0, -60, 520, 120, 50, AYA.coat);
    g.restore();
    ellipse(g, 1150, 620, 110, 80, AYA.skin);
    // рука Миры обхватывает сверху
    g.save();
    g.translate(830, 500);
    g.rotate(0.42);
    rrect(g, -760, -80, 790, 160, 60, MIRA.coat);
    rrect(g, -40, -84, 46, 168, 20, MIRA.coatDk);
    g.restore();
    g.save();
    g.translate(980, 560);
    g.rotate(0.35);
    ellipse(g, 0, 0, 190, 110, MIRA.skin);
    for (let i = 0; i < 4; i++) {
      rrect(g, 120 - i * 10, -70 + i * 44, 170 - Math.abs(i - 1.4) * 16, 40, 20, i % 2 ? MIRA.skin : mixc(MIRA.skin, MIRA.skinSh, 0.25));
      if (i === 2) rrect(g, 170, -76 + i * 44, 22, 52, 6, MIRA.ring);
    }
    for (let i = 0; i < 4; i++) {
      g.strokeStyle = rgba(MIRA.skinSh, 0.55);
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(-60 + i * 38, -70);
      g.lineTo(-40 + i * 38, 60);
      g.stroke();
    }
    g.restore();
    g.restore();
    glow(g, 1500, 120, 700, '#FFE9B8', 0.35);
  },
};
