// Подстройка под экран: ширина игры всегда 720, высота растёт на вытянутых телефонах
// (iPhone, современные Android), чтобы не было пустых полос. Плюс безопасные зоны (вырез, «чёлка»).
export const W = 720;
export const BASE_H = 1280;

function safeInsets() {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;visibility:hidden;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)';
  document.body.appendChild(d);
  const cs = getComputedStyle(d);
  const r = { top: parseFloat(cs.paddingTop) || 0, bottom: parseFloat(cs.paddingBottom) || 0 };
  d.remove();
  return r;
}

const vw = window.innerWidth || 360, vh = window.innerHeight || 640;
export const H = Math.round(Math.min(1700, Math.max(BASE_H, (W * vh) / vw)));
const k = W / vw; // пикселей игры на CSS-пиксель (если экран не шире 9:16)
const ins = safeInsets();
export const SAFE_TOP = Math.round(ins.top * k);
export const SAFE_BOTTOM = Math.round(ins.bottom * k);
// Сдвиг, чтобы макет 720x1280 оказался по центру экрана
export const DY = Math.round((H - BASE_H) / 2);
