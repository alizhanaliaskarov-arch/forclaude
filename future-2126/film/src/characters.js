// Персонажи. Одни и те же функции во всех сценах — поэтому внешность и одежда не меняются.
// Мира, 100 лет (2126): серебристое каре, круглые очки в тонкой титановой оправе, родинка на правой скуле,
// угольно-серое пальто с высоким воротником, толстый рыжий вязаный шарф, серебряное кольцо.
// Ая, 8 лет: тёмные кудри с двумя пучками, веснушки, горчичный дождевик, джинсы, белые кеды.
import {clamp, lerp, rnd, rgba, mixc, rgrad, vgrad, circle, ellipse, poly, rrect} from './core.js';

export const MIRA = {
  skin: '#C9A17C', skinSh: '#AE8461', skinLt: '#DDB892',
  hair: '#E9E6E0', hairSh: '#C6C1B8',
  coat: '#3A3F47', coatLt: '#4C525C', coatDk: '#2B2F35',
  trou: '#2A2C31', shoe: '#1B1C1F',
  scarf: '#C8642B', scarfDk: '#9C4520', scarfLt: '#E58A4E',
  glass: '#B4BAC0', iris: '#6B8A4E', irisIn: '#A0702F', ring: '#DADDE0', mole: '#5A3B2A',
};
export const AYA = {
  skin: '#B57E57', skinSh: '#9A6745', skinLt: '#C99470',
  hair: '#3A2317', hairLt: '#563624',
  coat: '#E3A92F', coatDk: '#C48D1C', coatLt: '#F0C35A',
  jeans: '#2F4B70', shoe: '#F3F3EF', sole: '#C9CCD0',
  iris: '#6B8A4E', freckle: '#8A5536',
};

const stroke = (g, pts, color, lw) => {
  g.strokeStyle = color;
  g.lineWidth = lw;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.stroke();
};
const knit = (g, x0, y0, x1, y1, color, step = 1.6, lw = 0.35) => {
  g.strokeStyle = color;
  g.lineWidth = lw;
  for (let x = x0; x < x1; x += step) {
    g.beginPath();
    g.moveTo(x, y0);
    g.lineTo(x + step * 0.5, y1);
    g.stroke();
  }
};

// ============================== МИРА ==============================
/**
 * Мира в полный рост. (x, y) — точка между ступнями, h — рост в пикселях.
 * pose: side | walk | back | front | sit. dir: 1 — смотрит вправо, −1 — влево.
 * arm: down | point | touch | hold | rail. wind — сила ветра для шарфа, t — время.
 */
export function mira(g, x, y, h, o = {}) {
  const {pose = 'side', dir = 1, phase = 0, t = 0, wind = 0.3, scarf = true, arm = 'down', book = false} = o;
  g.save();
  g.translate(x, y);
  g.scale((dir * h) / 100, h / 100);
  if (pose === 'back') miraBack(g, t, wind, scarf, arm);
  else if (pose === 'front') miraFront(g, t, wind, scarf, arm);
  else if (pose === 'sit') miraSit(g, t, scarf, arm, book);
  else miraSide(g, pose === 'walk' ? phase : null, t, wind, scarf, arm);
  g.restore();
}

function leg(g, hx, hy, ang, len, color, shoe) {
  g.save();
  g.translate(hx, hy);
  g.rotate(ang);
  rrect(g, -2.3, 0, 4.6, len, 2, color);
  ellipse(g, 1.6, len - 0.4, 3.6, 1.7, shoe);
  g.restore();
}
function miraHeadSide(g, cx, cy) {
  // шея под воротником, голова, черты лица
  ellipse(g, cx, cy, 6.1, 6.6, MIRA.skin);
  poly(g, [[cx + 5.4, cy - 1.2], [cx + 7.3, cy + 1.6], [cx + 5.3, cy + 2.1]], MIRA.skin); // нос
  ellipse(g, cx + 2.2, cy + 3.9, 3.6, 2.2, MIRA.skin); // подбородок
  g.fillStyle = rgba(MIRA.skinSh, 0.5);
  g.beginPath();
  g.ellipse(cx - 1.2, cy + 1.5, 4.4, 5, 0, 0, Math.PI * 2);
  g.fill();
  // волосы — каре до линии челюсти, с чёлкой
  g.fillStyle = MIRA.hair;
  g.beginPath();
  g.moveTo(cx + 5.2, cy - 2.6);
  g.quadraticCurveTo(cx + 5.6, cy - 7.4, cx, cy - 7.6);
  g.quadraticCurveTo(cx - 7.4, cy - 7.2, cx - 7.2, cy + 0.5);
  g.quadraticCurveTo(cx - 7.0, cy + 5.6, cx - 3.6, cy + 6.4);
  g.quadraticCurveTo(cx - 1.4, cy + 6.2, cx - 1.6, cy + 3.4);
  g.quadraticCurveTo(cx - 1.2, cy - 2.4, cx + 2.4, cy - 3.6);
  g.quadraticCurveTo(cx + 4.4, cy - 3.6, cx + 5.2, cy - 2.6);
  g.fill();
  stroke(g, [[cx - 4.6, cy - 4.4], [cx - 5.6, cy + 3.8]], MIRA.hairSh, 0.5);
  stroke(g, [[cx - 2.4, cy - 5.6], [cx - 3.4, cy + 4.6]], MIRA.hairSh, 0.4);
  // глаз, бровь, очки, родинка, губы
  circle(g, cx + 3.9, cy - 0.5, 0.55, '#2A2622');
  stroke(g, [[cx + 2.7, cy - 2.3], [cx + 4.8, cy - 2.1]], '#BDB7AE', 0.5);
  g.strokeStyle = MIRA.glass;
  g.lineWidth = 0.42;
  g.beginPath();
  g.arc(cx + 4.1, cy - 0.4, 1.95, 0, Math.PI * 2);
  g.stroke();
  stroke(g, [[cx + 2.15, cy - 0.6], [cx - 2.4, cy - 0.9]], MIRA.glass, 0.38);
  circle(g, cx + 2.6, cy + 2.0, 0.34, MIRA.mole);
  stroke(g, [[cx + 4.3, cy + 3.9], [cx + 5.4, cy + 3.7]], '#8E5E4A', 0.45);
  stroke(g, [[cx + 2.8, cy + 0.9], [cx + 3.5, cy + 2.6]], rgba(MIRA.skinSh, 0.8), 0.3); // морщинка
}
function miraScarfSide(g, t, wind) {
  const fl = Math.sin(t * 3.1) * 0.5 + Math.sin(t * 5.3 + 1) * 0.3;
  // хвост за спиной, развевается
  const tx = -10 - wind * 9 - fl * wind * 3, ty = -76 + fl * wind * 2.5;
  g.fillStyle = MIRA.scarfDk;
  g.beginPath();
  g.moveTo(-3, -81);
  g.quadraticCurveTo(-7, -79 + fl * wind, tx, ty);
  g.lineTo(tx + 1.2, ty + 4.6);
  g.quadraticCurveTo(-6, -75, -2, -77);
  g.closePath();
  g.fill();
  // обмотка вокруг шеи
  rrect(g, -5, -83.5, 12.5, 6.2, 3, MIRA.scarf);
  knit(g, -4.4, -83, 7, -77.8, rgba(MIRA.scarfDk, 0.7), 1.5);
  // хвост спереди
  g.fillStyle = MIRA.scarf;
  g.beginPath();
  g.moveTo(3.4, -78.5);
  g.lineTo(7.8, -78.5);
  g.lineTo(8.6 + fl * wind * 1.4, -61);
  g.lineTo(4.4 + fl * wind * 1.4, -61.4);
  g.closePath();
  g.fill();
  knit(g, 4, -77.5, 8, -62, rgba(MIRA.scarfDk, 0.55), 1.6);
  for (let i = 0; i < 4; i++) stroke(g, [[4.8 + i * 1.1 + fl * wind * 1.4, -61.2], [4.9 + i * 1.1 + fl * wind * 1.6, -59.2]], MIRA.scarfLt, 0.55);
}
function miraArm(g, kind, side, phase) {
  // side: 'front' | 'back'
  const col = side === 'front' ? MIRA.coatLt : MIRA.coatDk;
  let pts;
  const sw = phase == null ? 0 : Math.sin(phase) * (side === 'front' ? -1 : 1) * 6;
  if (kind === 'point') pts = side === 'front' ? [[3, -76], [12, -70], [22, -71]] : [[0, -76], [1 + sw, -62], [3, -50]];
  else if (kind === 'touch') pts = side === 'front' ? [[3, -76], [10, -66], [17, -64]] : [[0, -76], [1, -62], [3, -50]];
  else if (kind === 'hold') pts = side === 'front' ? [[3, -76], [8, -63], [13, -58]] : [[0, -76], [5, -63], [11, -59]];
  else if (kind === 'rail') pts = side === 'front' ? [[3, -76], [8, -64], [14, -60]] : [[0, -76], [5, -64], [12, -61]];
  else pts = [[2, -76], [3 + sw * 0.5, -63], [4 + sw, -51]];
  stroke(g, pts, col, 5.4);
  const [hx, hy] = pts[pts.length - 1];
  circle(g, hx + 0.8, hy + 0.4, 2.1, MIRA.skin);
  if (side === 'front' && kind !== 'down') circle(g, hx + 0.4, hy + 1.6, 0.55, MIRA.ring);
}
function miraSide(g, phase, t, wind, scarf, arm) {
  const a = phase == null ? 0.05 : Math.sin(phase) * 0.34;
  miraArm(g, arm === 'point' ? 'down' : arm, 'back', phase);
  leg(g, -1.5, -25, phase == null ? 0.06 : -a, 22.5, MIRA.trou, MIRA.shoe);
  leg(g, 1.5, -25, phase == null ? -0.04 : a, 22.5, mixc(MIRA.trou, '#000000', 0.15), MIRA.shoe);
  // пальто
  g.fillStyle = MIRA.coat;
  g.beginPath();
  g.moveTo(-8.6, -78);
  g.quadraticCurveTo(0, -80.5, 7.2, -78);
  g.lineTo(11.4, -25.5);
  g.quadraticCurveTo(0, -23.2, -12.4, -24.6);
  g.closePath();
  g.fill();
  g.fillStyle = MIRA.coatLt;
  g.beginPath();
  g.moveTo(5.6, -78);
  g.lineTo(7.2, -78);
  g.lineTo(11.4, -25.5);
  g.lineTo(9.2, -25.3);
  g.closePath();
  g.fill();
  stroke(g, [[-2, -60], [-2.6, -26]], rgba(MIRA.coatDk, 0.9), 0.5);
  rrect(g, -3.6, -84.8, 8.8, 7.6, 2.4, MIRA.coatDk); // высокий воротник
  miraHeadSide(g, 1.8, -89.2);
  if (scarf) miraScarfSide(g, t, wind);
  miraArm(g, arm, 'front', phase);
}
function miraBack(g, t, wind, scarf, arm) {
  leg(g, -3, -25, 0.03, 22.5, MIRA.trou, MIRA.shoe);
  leg(g, 3, -25, -0.03, 22.5, MIRA.trou, MIRA.shoe);
  g.fillStyle = MIRA.coat;
  g.beginPath();
  g.moveTo(-10, -78);
  g.quadraticCurveTo(0, -81, 10, -78);
  g.lineTo(13, -25);
  g.quadraticCurveTo(0, -23, -13, -25);
  g.closePath();
  g.fill();
  stroke(g, [[0, -62], [0, -25.5]], rgba(MIRA.coatDk, 0.9), 0.55);
  g.fillStyle = rgba(MIRA.coatLt, 0.6);
  g.fillRect(-10.5, -76, 3, 50);
  const arms = arm === 'rail' ? [[[-8, -76], [-11, -64], [-9, -58]], [[8, -76], [11, -64], [9, -58]]] : [[[-8.5, -76], [-11, -63], [-11, -51]], [[8.5, -76], [11, -63], [11, -51]]];
  arms.forEach((p) => stroke(g, p, MIRA.coatLt, 5.2));
  rrect(g, -4.5, -84.5, 9, 7, 2.4, MIRA.coatDk);
  // голова сзади — одни волосы
  ellipse(g, 0, -89.4, 6.6, 7.0, MIRA.hair);
  g.fillStyle = MIRA.hair;
  g.beginPath();
  g.moveTo(-6.8, -90);
  g.quadraticCurveTo(-7.4, -82.4, -3.6, -82);
  g.lineTo(3.6, -82);
  g.quadraticCurveTo(7.4, -82.4, 6.8, -90);
  g.closePath();
  g.fill();
  for (let i = -3; i <= 3; i++) stroke(g, [[i * 1.5, -95], [i * 1.9, -83]], MIRA.hairSh, 0.35);
  stroke(g, [[-6.3, -88.6], [-8, -88.9]], MIRA.glass, 0.4);
  stroke(g, [[6.3, -88.6], [8, -88.9]], MIRA.glass, 0.4);
  if (scarf) {
    const fl = Math.sin(t * 3.1) * 0.5 + Math.sin(t * 5.3 + 1) * 0.3;
    rrect(g, -6.5, -83.8, 13, 6.4, 3, MIRA.scarf);
    knit(g, -6, -83.3, 6, -77.8, rgba(MIRA.scarfDk, 0.7), 1.5);
    g.fillStyle = MIRA.scarf;
    g.beginPath();
    g.moveTo(3, -79);
    g.quadraticCurveTo(9 + wind * 6, -77 + fl * wind * 2, 13 + wind * 10 + fl * wind * 3, -73 + fl * wind * 3);
    g.lineTo(13 + wind * 10 + fl * wind * 3, -68.5 + fl * wind * 3);
    g.quadraticCurveTo(8, -72, 3, -75);
    g.closePath();
    g.fill();
  }
}
function miraFront(g, t, wind, scarf, arm) {
  leg(g, -3, -25, 0.02, 22.5, MIRA.trou, MIRA.shoe);
  leg(g, 3, -25, -0.02, 22.5, MIRA.trou, MIRA.shoe);
  g.fillStyle = MIRA.coat;
  g.beginPath();
  g.moveTo(-10, -78);
  g.quadraticCurveTo(0, -80, 10, -78);
  g.lineTo(13, -25);
  g.quadraticCurveTo(0, -23, -13, -25);
  g.closePath();
  g.fill();
  stroke(g, [[0.6, -76], [1.2, -25.5]], MIRA.coatDk, 0.7);
  for (let i = 0; i < 4; i++) circle(g, 2.8, -68 + i * 10, 0.75, MIRA.coatDk);
  stroke(g, [[-8.5, -76], [-11, -63], [-11, -51]], MIRA.coatLt, 5.2);
  stroke(g, arm === 'hold' ? [[8.5, -76], [9, -63], [3, -58]] : [[8.5, -76], [11, -63], [11, -51]], MIRA.coatLt, 5.2);
  circle(g, -11, -50, 2.1, MIRA.skin);
  circle(g, arm === 'hold' ? 3 : 11, arm === 'hold' ? -57.5 : -50, 2.1, MIRA.skin);
  rrect(g, -4.5, -84.5, 9, 7, 2.4, MIRA.coatDk);
  miraHeadFront(g, 0, -89.3, 1);
  if (scarf) {
    const fl = Math.sin(t * 3.1) * 0.5;
    rrect(g, -6.6, -83.6, 13.2, 6.2, 3, MIRA.scarf);
    knit(g, -6, -83.1, 6, -77.8, rgba(MIRA.scarfDk, 0.7), 1.5);
    poly(g, [[-3.5, -78.5], [0.5, -78.5], [0.2 + fl * wind, -60], [-3.8 + fl * wind, -60.5]], MIRA.scarf);
    poly(g, [[0.8, -78.5], [4.4, -78.5], [5.6 + fl * wind, -63], [2.2 + fl * wind, -63]], MIRA.scarfDk);
  }
}
/** Голова анфас; s — масштаб (1 = в составе фигуры). */
function miraHeadFront(g, cx, cy, s) {
  g.save();
  g.translate(cx, cy);
  g.scale(s, s);
  ellipse(g, 0, 0.4, 5.9, 6.9, MIRA.skin);
  g.fillStyle = MIRA.hair;
  g.beginPath();
  g.moveTo(-6.9, 5.6);
  g.quadraticCurveTo(-7.8, -7.8, 0, -7.6);
  g.quadraticCurveTo(7.8, -7.8, 6.9, 5.6);
  g.quadraticCurveTo(5.2, 6.3, 4.6, 3);
  g.quadraticCurveTo(4.8, -3.5, 1, -4.2);
  g.quadraticCurveTo(-3.4, -4.6, -4.8, -1);
  g.lineTo(-4.6, 3);
  g.quadraticCurveTo(-5.2, 6.3, -6.9, 5.6);
  g.fill();
  circle(g, -2.2, -0.2, 0.55, '#2A2622');
  circle(g, 2.2, -0.2, 0.55, '#2A2622');
  g.strokeStyle = MIRA.glass;
  g.lineWidth = 0.4;
  [-2.25, 2.25].forEach((x) => {
    g.beginPath();
    g.arc(x, -0.1, 1.85, 0, Math.PI * 2);
    g.stroke();
  });
  stroke(g, [[-0.45, -0.3], [0.45, -0.3]], MIRA.glass, 0.4);
  circle(g, -3.0, 2.3, 0.32, MIRA.mole);
  g.strokeStyle = '#8E5E4A';
  g.lineWidth = 0.45;
  g.beginPath();
  g.arc(0, 2.6, 1.6, 0.25 * Math.PI, 0.75 * Math.PI);
  g.stroke();
  g.restore();
}
function miraSit(g, t, scarf, arm, book) {
  // начало координат — пол под тазом; таз (0,−42), колено (17,−42), стопа (18,−2)
  stroke(g, [[0, -42], [17, -42], [18, -4]], MIRA.trou, 5.2);
  ellipse(g, 20, -2, 3.6, 1.7, MIRA.shoe);
  g.fillStyle = MIRA.coat;
  g.beginPath();
  g.moveTo(-6.6, -76);
  g.quadraticCurveTo(1, -78.5, 7.4, -76);
  g.lineTo(9, -46);
  g.lineTo(16, -45.5);
  g.lineTo(17, -38.5);
  g.lineTo(-7.5, -38.5);
  g.closePath();
  g.fill();
  rrect(g, -1.6, -82.8, 8.8, 7.6, 2.4, MIRA.coatDk);
  miraHeadSide(g, 3.6, -87.4);
  if (scarf) {
    rrect(g, -3, -81.6, 12.5, 6.2, 3, MIRA.scarf);
    knit(g, -2.4, -81, 9, -75.8, rgba(MIRA.scarfDk, 0.7), 1.5);
    poly(g, [[5.4, -76.4], [9.4, -76.4], [9.8, -60], [5.8, -60.4]], MIRA.scarf);
  }
  if (book) {
    poly(g, [[9, -64], [20, -67], [21, -55], [10, -52]], '#F4EFE3');
    poly(g, [[9, -64], [10, -52], [8.6, -52.4], [7.8, -63.6]], '#7C3B2A');
    stroke(g, [[11, -61.6], [19, -64.2]], '#CFC6B5', 0.4);
    stroke(g, [[11.2, -59.2], [19.2, -61.8]], '#CFC6B5', 0.4);
  }
  stroke(g, [[3, -74], [9, -62], [14, -58]], MIRA.coatLt, 5.2);
  circle(g, 14.8, -57.6, 2.1, MIRA.skin);
  circle(g, 14.4, -56.4, 0.55, MIRA.ring);
}

/** Крупный портрет Миры анфас. (cx, cy) — центр лица, s — высота лица. look — смещение взгляда. */
export function miraPortrait(g, cx, cy, s, o = {}) {
  const {t = 0, light = 1, smile = 0.6, blink = 0, scarf = true} = o;
  const u = s / 14;
  g.save();
  g.translate(cx, cy);
  g.scale(u, u);
  // плечи, пальто, воротник
  g.fillStyle = MIRA.coat;
  g.beginPath();
  g.moveTo(-24, 40);
  g.quadraticCurveTo(-22, 13, -7, 10);
  g.lineTo(7, 10);
  g.quadraticCurveTo(22, 13, 24, 40);
  g.closePath();
  g.fill();
  rrect(g, -5.4, 4.5, 10.8, 9, 3, MIRA.coatDk);
  rrect(g, -3, 3.5, 6, 6, 2, MIRA.skinSh); // шея
  // волосы сзади
  g.fillStyle = MIRA.hairSh;
  g.beginPath();
  g.moveTo(-8.4, 6.5);
  g.quadraticCurveTo(-10.2, -9.6, 0, -9.8);
  g.quadraticCurveTo(10.2, -9.6, 8.4, 6.5);
  g.closePath();
  g.fill();
  // лицо
  g.fillStyle = vgrad(g, 0, -8, 8, [[0, MIRA.skinLt], [1, MIRA.skin]]);
  g.beginPath();
  g.ellipse(0, 0, 6.3, 7.8, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = rgrad(g, 4.2, 1.5, 6.5, [[0, rgba(MIRA.skinSh, 0.32)], [1, rgba(MIRA.skinSh, 0)]]);
  g.fillRect(-7, -9, 14, 18);
  ellipse(g, -3.6, 2.9, 1.5, 0.9, rgba('#D9776A', 0.18));
  ellipse(g, 3.6, 2.9, 1.5, 0.9, rgba('#D9776A', 0.18));
  // глаза
  const open = clamp(1 - blink);
  [-2.35, 2.35].forEach((x) => {
    ellipse(g, x, -0.6, 1.25, 0.72 * open, '#F4EEE6');
    if (open > 0.15) {
      circle(g, x + 0.05, -0.6, 0.58, MIRA.iris);
      circle(g, x + 0.05, -0.6, 0.3, MIRA.irisIn);
      circle(g, x + 0.05, -0.6, 0.2, '#1E1B18');
      circle(g, x - 0.18, -0.85, 0.12, '#FFFFFF');
    }
    stroke(g, [[x - 1.35, -0.75], [x, -1.45 * open - 0.1], [x + 1.35, -0.75]], '#7A5A45', 0.28);
    stroke(g, [[x - 1.3, -2.15], [x + 1.2, -2.35]], '#C9C3BA', 0.42); // бровь
    stroke(g, [[x + (x > 0 ? 1.6 : -1.6), -0.3], [x + (x > 0 ? 2.3 : -2.3), 0.3]], rgba(MIRA.skinSh, 0.9), 0.18); // «гусиные лапки»
  });
  // очки
  g.strokeStyle = MIRA.glass;
  g.lineWidth = 0.3;
  [-2.4, 2.4].forEach((x) => {
    g.beginPath();
    g.arc(x, -0.55, 1.95, 0, Math.PI * 2);
    g.stroke();
  });
  stroke(g, [[-0.45, -0.8], [0.45, -0.8]], MIRA.glass, 0.3);
  g.fillStyle = rgba('#FFFFFF', 0.1);
  g.beginPath();
  g.arc(-2.4, -0.55, 1.9, 0, Math.PI * 2);
  g.arc(2.4, -0.55, 1.9, 0, Math.PI * 2);
  g.fill();
  // нос, морщины, губы, родинка (на правой скуле — слева для зрителя)
  stroke(g, [[0.3, 0.1], [0.6, 2.4], [-0.3, 2.7]], rgba(MIRA.skinSh, 0.9), 0.3);
  stroke(g, [[-1.6, 2.6], [-2.2, 4.3]], rgba(MIRA.skinSh, 0.7), 0.22);
  stroke(g, [[1.6, 2.6], [2.2, 4.3]], rgba(MIRA.skinSh, 0.7), 0.22);
  g.strokeStyle = '#9A5F4C';
  g.lineWidth = 0.4;
  g.beginPath();
  g.moveTo(-1.5, 4.3);
  g.quadraticCurveTo(0, 4.3 + smile * 0.9, 1.5, 4.3);
  g.stroke();
  circle(g, -3.4, 1.6, 0.22, MIRA.mole);
  // каре и чёлка
  g.fillStyle = MIRA.hair;
  g.beginPath();
  g.moveTo(-8.2, 6.4);
  g.quadraticCurveTo(-9.6, -9.2, 0, -9.4);
  g.quadraticCurveTo(9.6, -9.2, 8.2, 6.4);
  g.quadraticCurveTo(6.6, 7.2, 6.1, 3.5);
  g.quadraticCurveTo(6.4, -3.8, 2.6, -5.4);
  g.quadraticCurveTo(-1.4, -6.8, -4.6, -4.2);
  g.quadraticCurveTo(-6.4, -2.6, -6.1, 3.5);
  g.quadraticCurveTo(-6.6, 7.2, -8.2, 6.4);
  g.fill();
  // пряди — только по бокам и на макушке, не поверх лица
  for (let i = 0; i < 4; i++) {
    stroke(g, [[-7.6 + i * 0.55, -4 + i * 0.3], [-7.9 + i * 0.6, 5.6]], rgba(MIRA.hairSh, 0.6), 0.16);
    stroke(g, [[7.6 - i * 0.55, -4 + i * 0.3], [7.9 - i * 0.6, 5.6]], rgba(MIRA.hairSh, 0.6), 0.16);
  }
  for (let i = 0; i < 7; i++) stroke(g, [[-5 + i * 1.6, -9], [-4.2 + i * 1.5, -5.6 - Math.abs(i - 3) * 0.2]], rgba(MIRA.hairSh, 0.55), 0.16);
  if (scarf) {
    g.fillStyle = MIRA.scarf;
    g.beginPath();
    g.moveTo(-9.5, 8);
    g.quadraticCurveTo(0, 4.8, 9.5, 8);
    g.quadraticCurveTo(10.4, 12.6, 8.6, 14.4);
    g.quadraticCurveTo(0, 11.6, -8.6, 14.4);
    g.quadraticCurveTo(-10.4, 12.6, -9.5, 8);
    g.fill();
    for (let i = 0; i < 12; i++) stroke(g, [[-8.6 + i * 1.55, 7.8 + Math.abs(i - 5.5) * 0.12], [-8.2 + i * 1.5, 13.4]], rgba(MIRA.scarfDk, 0.55), 0.25);
    poly(g, [[-2.6, 12.4], [2.2, 12.4], [2.8, 30], [-2.4, 30]], MIRA.scarf);
    for (let i = 0; i < 4; i++) stroke(g, [[-1.9 + i * 1.3, 13], [-1.7 + i * 1.3, 29.5]], rgba(MIRA.scarfDk, 0.5), 0.25);
  }
  // тёплый свет слева
  if (light > 0) {
    g.globalCompositeOperation = 'soft-light';
    const lg = g.createLinearGradient(-26, 0, 14, 0);
    lg.addColorStop(0, rgba('#FFB866', 0.45 * light));
    lg.addColorStop(1, rgba('#FFB866', 0));
    g.fillStyle = lg;
    g.fillRect(-26, -12, 52, 52);
    g.globalCompositeOperation = 'source-over';
  }
  g.restore();
}

// ============================== АЯ ==============================
export function aya(g, x, y, h, o = {}) {
  const {pose = 'side', dir = 1, phase = 0, t = 0, arm = 'down', scarf = false} = o;
  g.save();
  g.translate(x, y);
  g.scale((dir * h) / 100, h / 100);
  const run = pose === 'run', walk = pose === 'walk';
  const a = run ? Math.sin(phase) * 0.6 : walk ? Math.sin(phase) * 0.32 : 0.05;
  const lift = run ? Math.abs(Math.cos(phase)) * 4 : 0;
  g.translate(0, -lift);
  if (pose === 'back') {
    leg(g, -3.5, -33, 0.02, 29, AYA.jeans, AYA.shoe);
    leg(g, 3.5, -33, -0.02, 29, AYA.jeans, AYA.shoe);
  } else {
    leg(g, -1.5, -33, run || walk ? -a : 0.06, 29, AYA.jeans, AYA.shoe);
    leg(g, 1.5, -33, run || walk ? a : -0.05, 29, mixc(AYA.jeans, '#000000', 0.15), AYA.shoe);
  }
  // дождевик
  g.fillStyle = AYA.coat;
  g.beginPath();
  g.moveTo(-10, -70);
  g.quadraticCurveTo(0, -73, 10, -70);
  g.lineTo(14, -32);
  g.quadraticCurveTo(0, -29.5, -14, -32);
  g.closePath();
  g.fill();
  g.fillStyle = AYA.coatDk;
  g.beginPath();
  g.moveTo(6, -70);
  g.lineTo(10, -70);
  g.lineTo(14, -32);
  g.lineTo(10, -31.5);
  g.closePath();
  g.fill();
  if (pose !== 'back') for (let i = 0; i < 3; i++) circle(g, 4.5, -62 + i * 9, 0.9, AYA.coatDk);
  // руки
  const sw = run ? Math.sin(phase) * 14 : walk ? Math.sin(phase) * 6 : 0;
  const front = arm === 'up' ? [[3, -67], [10, -78], [13, -88]] : arm === 'hold' ? [[3, -67], [9, -57], [14, -56]] : arm === 'reach' ? [[3, -67], [12, -62], [20, -63]] : [[3, -67], [5 + sw * 0.4, -56], [6 + sw, -46]];
  const back = arm === 'up' ? [[-3, -67], [-10, -78], [-13, -88]] : [[-3, -67], [-4 - sw * 0.4, -56], [-4 - sw, -46]];
  stroke(g, back, AYA.coatDk, 6.2);
  stroke(g, front, AYA.coatLt, 6.2);
  circle(g, back[2][0], back[2][1] + 1, 2.6, AYA.skin);
  circle(g, front[2][0] + 0.6, front[2][1] + 0.6, 2.6, AYA.skin);
  // капюшон, сложенный на шее
  rrect(g, -7, -75, 14, 7, 3.4, AYA.coatDk);
  if (scarf) {
    rrect(g, -7.4, -76.4, 15, 6.6, 3, MIRA.scarf);
    knit(g, -6.8, -76, 7, -70.4, rgba(MIRA.scarfDk, 0.7), 1.5);
    poly(g, [[2.6, -71], [7, -71], [7.6, -55], [3.2, -55.4]], MIRA.scarf);
  }
  ayaHead(g, pose === 'back' ? 0 : 2, -84, pose === 'back' ? 'back' : pose === 'front' ? 'front' : 'side', t);
  g.restore();
}
function ayaHead(g, cx, cy, view, t) {
  const curls = (pts, r) => pts.forEach(([x, y], i) => circle(g, cx + x, cy + y, r * (0.8 + rnd(i * 7.7) * 0.4), i % 3 ? AYA.hair : AYA.hairLt));
  // пучки
  curls([[-8, -9], [-6, -12], [-9.5, -12.5], [-5, -9.5], [-8, -15]], 3.4);
  curls([[8, -9], [6.5, -12], [9.5, -12.5], [5, -9.5], [8, -15]], 3.4);
  if (view === 'back') {
    circle(g, cx, cy, 9.4, AYA.hair);
    curls(Array.from({length: 14}, (_, i) => [Math.cos(i * 0.45 + 2.5) * 8.6, Math.sin(i * 0.45 + 2.5) * 8.6 - 1]), 2.4);
    return;
  }
  circle(g, cx, cy, 9.2, AYA.skin);
  if (view === 'side') {
    poly(g, [[cx + 8.6, cy - 0.6], [cx + 10.4, cy + 1.8], [cx + 8.4, cy + 2.6]], AYA.skin);
    g.fillStyle = AYA.hair;
    g.beginPath();
    g.moveTo(cx + 7.6, cy - 4.2);
    g.quadraticCurveTo(cx + 6.4, cy - 10.6, cx - 1, cy - 10.2);
    g.quadraticCurveTo(cx - 10.8, cy - 9, cx - 9.8, cy + 2.6);
    g.quadraticCurveTo(cx - 8, cy + 6.4, cx - 5.4, cy + 4.4);
    g.quadraticCurveTo(cx - 3.6, cy - 4.6, cx + 2.6, cy - 5.6);
    g.closePath();
    g.fill();
    curls([[-9, -3], [-8.4, 2], [-6, -8.6], [-1.6, -10], [3.6, -9], [6.8, -6.6]], 2.3);
    circle(g, cx + 5.6, cy - 0.4, 0.95, '#241A14');
    circle(g, cx + 5.9, cy - 0.8, 0.3, '#FFFFFF');
    [[4.6, 2.2], [6, 2.6], [5.2, 3.4]].forEach(([x, y]) => circle(g, cx + x, cy + y, 0.25, AYA.freckle));
    g.strokeStyle = '#7A3F2E';
    g.lineWidth = 0.6;
    g.beginPath();
    g.arc(cx + 6.2, cy + 4.2, 1.5, 0.15 * Math.PI, 0.7 * Math.PI);
    g.stroke();
  } else {
    g.fillStyle = AYA.hair;
    g.beginPath();
    g.arc(cx, cy - 1, 9.8, Math.PI * 1.02, Math.PI * 1.98);
    g.quadraticCurveTo(cx + 4, cy - 6.6, cx, cy - 6.4);
    g.quadraticCurveTo(cx - 4, cy - 6.6, cx - 9.6, cy - 2);
    g.fill();
    curls(Array.from({length: 11}, (_, i) => [Math.cos(Math.PI + (i * Math.PI) / 10) * 9.4, Math.sin(Math.PI + (i * Math.PI) / 10) * 9.4 - 1]), 2.3);
    [-3.2, 3.2].forEach((x) => {
      circle(g, cx + x, cy, 1.05, '#241A14');
      circle(g, cx + x + 0.3, cy - 0.4, 0.32, '#FFFFFF');
    });
    [[-4.4, 2.6], [-3.4, 3.2], [-4, 3.8], [4.4, 2.6], [3.4, 3.2], [4, 3.8], [0, 2.2]].forEach(([x, y]) => circle(g, cx + x, cy + y, 0.25, AYA.freckle));
    g.strokeStyle = '#7A3F2E';
    g.lineWidth = 0.6;
    g.beginPath();
    g.arc(cx, cy + 3.6, 2, 0.15 * Math.PI, 0.85 * Math.PI);
    g.stroke();
  }
}
/** Крупный план лица Аи. mood: smile | wow | focus | bite. */
export function ayaPortrait(g, cx, cy, s, o = {}) {
  const {mood = 'smile', t = 0, light = 1} = o;
  const u = s / 20;
  g.save();
  g.translate(cx, cy);
  g.scale(u, u);
  g.fillStyle = AYA.coat;
  g.beginPath();
  g.moveTo(-26, 44);
  g.quadraticCurveTo(-24, 16, -8, 12);
  g.lineTo(8, 12);
  g.quadraticCurveTo(24, 16, 26, 44);
  g.closePath();
  g.fill();
  rrect(g, -9, 8, 18, 8, 4, AYA.coatDk);
  const curls = (pts, r) => pts.forEach(([x, y], i) => circle(g, x, y, r * (0.8 + rnd(i * 3.3) * 0.45), i % 3 ? AYA.hair : AYA.hairLt));
  curls([[-11, -11], [-9, -15], [-13, -15.5], [-7, -12], [-11, -19], [-14, -12]], 4.4);
  curls([[11, -11], [9, -15], [13, -15.5], [7, -12], [11, -19], [14, -12]], 4.4);
  g.fillStyle = vgrad(g, 0, -10, 10, [[0, AYA.skinLt], [1, AYA.skin]]);
  g.beginPath();
  g.ellipse(0, 0, 9.6, 10.4, 0, 0, Math.PI * 2);
  g.fill();
  curls(Array.from({length: 13}, (_, i) => [Math.cos(Math.PI * 1.02 + (i * Math.PI * 0.96) / 12) * 10.2, Math.sin(Math.PI * 1.02 + (i * Math.PI * 0.96) / 12) * 10.6 - 1.4]), 2.6);
  const wow = mood === 'wow';
  [-3.6, 3.6].forEach((x) => {
    ellipse(g, x, -0.4, 1.9, wow ? 1.7 : 1.35, '#FBF6F0');
    circle(g, x, -0.3, 1.15, AYA.iris);
    circle(g, x, -0.3, 0.55, '#1C1714');
    circle(g, x - 0.4, -0.8, 0.35, '#FFFFFF');
    stroke(g, [[x - 1.6, wow ? -3.6 : -2.8], [x + 1.4, wow ? -3.9 : -3.0]], AYA.hair, 0.6);
  });
  [[-5.2, 2.8], [-4.0, 3.5], [-5.0, 4.3], [-3.2, 4.0], [5.2, 2.8], [4.0, 3.5], [5.0, 4.3], [3.2, 4.0], [0.4, 2.4], [-0.5, 2.9]].forEach(([x, y]) => circle(g, x, y, 0.28, AYA.freckle));
  stroke(g, [[0.2, 0.8], [0.6, 2.6], [-0.4, 2.9]], rgba(AYA.skinSh, 0.9), 0.35);
  if (wow) ellipse(g, 0, 5.6, 1.5, 1.8, '#6E2F26');
  else if (mood === 'bite') {
    ellipse(g, 0, 5.4, 2.4, 1.6, '#6E2F26');
    circle(g, 0.6, 5.2, 2.2, '#D8352A');
    circle(g, 0.2, 4.4, 0.4, '#FF8A7A');
  } else if (mood === 'focus') stroke(g, [[-1.4, 5.4], [1.4, 5.2]], '#7A3F2E', 0.55);
  else {
    g.fillStyle = '#7A3F2E';
    g.beginPath();
    g.moveTo(-2.6, 4.6);
    g.quadraticCurveTo(0, 7.6, 2.6, 4.6);
    g.closePath();
    g.fill();
  }
  ellipse(g, -6.2, 3.6, 1.6, 1, rgba('#E07A6A', 0.25));
  ellipse(g, 6.2, 3.6, 1.6, 1, rgba('#E07A6A', 0.25));
  if (light > 0) {
    g.globalCompositeOperation = 'soft-light';
    const lg = g.createLinearGradient(-28, 0, 16, 0);
    lg.addColorStop(0, rgba('#FFC27A', 0.4 * light));
    lg.addColorStop(1, rgba('#FFC27A', 0));
    g.fillStyle = lg;
    g.fillRect(-28, -24, 56, 70);
    g.globalCompositeOperation = 'source-over';
  }
  g.restore();
}

// ============================== МЛАДЕНЕЦ, ГЛАЗ, РУКИ ==============================
/** Младенец в рыжем вязаном одеяле. (cx, cy) — центр свёртка, s — его ширина. */
export function baby(g, cx, cy, s, o = {}) {
  const {eyes = 0, t = 0, grip = 0, rot = -0.12} = o; // eyes: 0 — спит, 1 — открыты
  const u = s / 100;
  g.save();
  g.translate(cx, cy);
  g.rotate(rot);
  g.scale(u, u);
  ellipse(g, 6, 8, 52, 34, rgba('#000000', 0.12));
  // одеяло
  g.fillStyle = vgrad(g, 0, -34, 34, [[0, MIRA.scarfLt], [1, MIRA.scarfDk]]);
  g.beginPath();
  g.ellipse(0, 0, 50, 32, 0, 0, Math.PI * 2);
  g.fill();
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 18; c++) {
      const x = -46 + c * 5.4 + (r % 2) * 2.7, y = -26 + r * 6.2;
      if ((x * x) / 2500 + (y * y) / 1024 > 0.92) continue;
      g.strokeStyle = rgba(MIRA.scarfDk, 0.55);
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(x - 2, y - 1.6);
      g.lineTo(x, y + 1.6);
      g.lineTo(x + 2, y - 1.6);
      g.stroke();
    }
  // складка-капюшон вокруг лица
  ellipse(g, -26, -4, 23, 21, MIRA.scarf);
  // лицо
  g.fillStyle = vgrad(g, 0, -20, 12, [[0, '#F2C9A8'], [1, '#E2AD88']]);
  g.beginPath();
  g.ellipse(-27, -4, 15.5, 16.5, 0.1, 0, Math.PI * 2);
  g.fill();
  ellipse(g, -36, 1, 4, 2.6, rgba('#E7786A', 0.35));
  ellipse(g, -19, 2, 4, 2.6, rgba('#E7786A', 0.35));
  stroke(g, [[-30, -18], [-28, -15.5], [-25, -18.5]], rgba('#5B3A2A', 0.8), 0.9); // пара волосков
  if (eyes > 0.5) {
    [-33, -22].forEach((x) => {
      circle(g, x, -5, 2, '#3E2C22');
      circle(g, x + 0.6, -5.6, 0.6, '#FFFFFF');
    });
  } else
    [-33, -22].forEach((x) => {
      g.strokeStyle = '#6B4636';
      g.lineWidth = 1;
      g.beginPath();
      g.arc(x, -5.6, 2.4, 0.15 * Math.PI, 0.85 * Math.PI);
      g.stroke();
    });
  ellipse(g, -27.5, 0.4, 1.6, 1.1, rgba('#C98A6A', 0.8));
  g.strokeStyle = '#B4685A';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(-27.5, 4.6, 2.2, 0.2 * Math.PI, 0.8 * Math.PI);
  g.stroke();
  // ручка: кулачок, пальчики сжимаются вокруг пальца мамы (grip 0 → 1)
  if (grip >= 0) {
    const hx = -2, hy = -14;
    circle(g, hx, hy, 6, '#EDBC98');
    for (let i = 0; i < 4; i++) {
      const a = lerp(-0.4, 1.25, grip) + i * 0.08;
      g.save();
      g.translate(hx - 3 + i * 2.4, hy - 3);
      g.rotate(-a);
      rrect(g, -1.1, -6, 2.2, 6.4, 1.1, '#E9B48F');
      g.restore();
    }
  }
  g.restore();
}
/** Палец взрослого, входящий в кадр справа. */
export function adultFinger(g, x, y, s, rot = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.fillStyle = vgrad(g, 0, -s * 0.12, s * 0.12, [[0, '#E3B38E'], [1, '#C9946E']]);
  g.beginPath();
  g.roundRect(0, -s * 0.11, s * 1.6, s * 0.22, s * 0.11);
  g.fill();
  g.fillStyle = '#F0CFB5';
  g.beginPath();
  g.ellipse(s * 0.12, -s * 0.03, s * 0.08, s * 0.06, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
/** Глаз крупным планом: age — 'baby' | 'old', open — раскрытие век 0…1. */
export function eyeMacro(g, cx, cy, r, o = {}) {
  const {age = 'baby', open = 1, t = 0} = o;
  const skin = age === 'old' ? MIRA.skin : '#EFC3A2', skinSh = age === 'old' ? MIRA.skinSh : '#D9A381';
  g.save();
  g.fillStyle = vgrad(g, 0, cy - r * 3, cy + r * 3, [[0, skin], [1, skinSh]]);
  g.fillRect(cx - r * 6, cy - r * 4, r * 12, r * 8);
  if (age === 'old') {
    for (let i = 0; i < 5; i++) stroke(g, [[cx + r * 2.4, cy - r * 0.4 + i * r * 0.35], [cx + r * 3.6, cy - r * 0.9 + i * r * 0.55]], rgba(MIRA.skinSh, 0.9), r * 0.03);
    for (let i = 0; i < 3; i++) stroke(g, [[cx - r * 1.6, cy + r * 1.3 + i * r * 0.22], [cx + r * 1.4, cy + r * 1.4 + i * r * 0.25]], rgba(MIRA.skinSh, 0.6), r * 0.025);
    g.strokeStyle = MIRA.glass;
    g.lineWidth = r * 0.08;
    g.beginPath();
    g.arc(cx + r * 0.2, cy, r * 3.4, -0.9, 0.6);
    g.stroke();
  }
  const ap = r * 1.15 * clamp(open);
  g.save();
  g.beginPath();
  g.moveTo(cx - r * 2.3, cy);
  g.quadraticCurveTo(cx, cy - ap * 1.6, cx + r * 2.3, cy);
  g.quadraticCurveTo(cx, cy + ap * 1.2, cx - r * 2.3, cy);
  g.closePath();
  g.clip();
  g.fillStyle = rgrad(g, cx, cy, r * 2.4, [[0, '#FBF7F2'], [1, '#E8D6CF']]);
  g.fillRect(cx - r * 3, cy - r * 2, r * 6, r * 4);
  // радужка: орехово-зелёная, янтарь у зрачка
  const ix = cx + Math.sin(t * 0.7) * r * 0.05;
  g.fillStyle = rgrad(g, ix, cy, r, [[0, '#2A1A10'], [0.3, '#A0702F'], [0.5, '#8C8A44'], [0.8, '#5E8A4E'], [0.94, '#3E5A34'], [1, '#22301E']]);
  circle(g, ix, cy, r);
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2 + rnd(i) * 0.05;
    g.strokeStyle = rgba(rnd(i * 3) < 0.5 ? '#C9A35A' : '#2E4A2A', 0.35);
    g.lineWidth = r * 0.02;
    g.beginPath();
    g.moveTo(ix + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42);
    g.lineTo(ix + Math.cos(a) * r * (0.82 + rnd(i * 7) * 0.15), cy + Math.sin(a) * r * (0.82 + rnd(i * 7) * 0.15));
    g.stroke();
  }
  circle(g, ix, cy, r * 0.36, '#0B0806');
  circle(g, ix - r * 0.32, cy - r * 0.34, r * 0.16, rgba('#FFFFFF', 0.9));
  circle(g, ix + r * 0.25, cy + r * 0.28, r * 0.06, rgba('#FFFFFF', 0.6));
  g.restore();
  // веко и ресницы
  g.strokeStyle = age === 'old' ? '#6E5040' : '#8A5E48';
  g.lineWidth = r * 0.09;
  g.beginPath();
  g.moveTo(cx - r * 2.3, cy);
  g.quadraticCurveTo(cx, cy - ap * 1.6, cx + r * 2.3, cy);
  g.stroke();
  for (let i = 0; i < 14; i++) {
    const u = (i + 0.5) / 14, x = lerp(cx - r * 2.1, cx + r * 2.1, u);
    const y = cy - ap * 1.6 * 2 * u * (1 - u) * 1.0;
    stroke(g, [[x, y], [x + (u - 0.5) * r * 0.6, y - r * (age === 'old' ? 0.35 : 0.45)]], '#3A2A20', r * 0.04);
  }
  stroke(g, [[cx - r * 2.0, cy - ap * 1.6 * 0.5 - r * 0.7], [cx + r * 2.0, cy - ap * 1.6 * 0.5 - r * 0.6]], rgba(skinSh, 0.8), r * 0.06);
  g.restore();
}
/** Пожилая рука с серебряным кольцом (стилизованно). (x, y) — запястье, s — длина кисти. */
export function oldHand(g, x, y, s, rot = 0, o = {}) {
  const {skin = MIRA.skin, sh = MIRA.skinSh, ring = true, curl = 0.3, sleeve = MIRA.coat} = o;
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  const u = s / 10;
  g.scale(u, u);
  rrect(g, -6, -3.4, 7, 6.8, 2, sleeve);
  g.fillStyle = skin;
  g.beginPath();
  g.ellipse(4.2, 0, 4.6, 3.2, 0, 0, Math.PI * 2);
  g.fill();
  for (let i = 0; i < 4; i++) {
    g.save();
    g.translate(7.6, -2.1 + i * 1.45);
    g.rotate(curl * (0.6 + i * 0.15));
    rrect(g, 0, -0.65, 4.6 - Math.abs(i - 1.2) * 0.5, 1.3, 0.65, i % 2 ? skin : mixc(skin, sh, 0.25));
    if (ring && i === 2) rrect(g, 1.0, -0.8, 0.8, 1.6, 0.3, MIRA.ring);
    g.restore();
  }
  g.save();
  g.translate(5, -2.6);
  g.rotate(-0.9);
  rrect(g, 0, -0.7, 3.6, 1.45, 0.7, mixc(skin, sh, 0.2));
  g.restore();
  for (let i = 0; i < 3; i++) stroke(g, [[3 + i * 1.2, -1.6], [3.4 + i * 1.2, 1.6]], rgba(sh, 0.55), 0.18);
  g.restore();
}
