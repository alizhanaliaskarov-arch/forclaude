// Рисует иконку приложения, splash и графику для Google Play. Запуск: node tools/make-icons.cjs
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const RES = path.join(__dirname, '../android/app/src/main/res');

const star = (cx, cy, R, color) => {
  const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.45 : R; p.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`); }
  return `<polygon points="${p.join(' ')}" fill="${color}"/>`;
};
const ship = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><polygon points="40,0 0,88 80,88" fill="#5ef2ff"/><polygon points="40,26 22,70 58,70" fill="#1b2a6b"/><rect x="14" y="84" width="14" height="10" fill="#ff7ad9"/><rect x="52" y="84" width="14" height="10" fill="#ff7ad9"/></g>`;
const art = (bg) => `${bg ? '<rect width="108" height="108" fill="#0b0e2a"/>' : ''}
  ${star(64, 34, 14, '#ffe066')}${star(36, 44, 8, '#ff7ad9')}${star(76, 58, 6, '#ffe066')}${ship(36, 52, 0.42)}`;
const svg = (w, h, inner, vb = '0 0 108 108') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vb}">${inner}</svg>`;

(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const shot = async (html, w, h, file, round) => {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<body style="margin:0;background:transparent">${round ? `<div style="width:${w}px;height:${h}px;border-radius:50%;overflow:hidden">${html}</div>` : html}</body>`);
    await p.screenshot({ path: file, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  };
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    const L = Math.round(48 * k), F = Math.round(108 * k), dir = `${RES}/mipmap-${d}`;
    // Устаревшие иконки: обрезаем безопасную зону адаптивной иконки (18..90)
    await shot(svg(L, L, art(true), '18 18 72 72'), L, L, `${dir}/ic_launcher.png`);
    await shot(svg(L, L, art(true), '18 18 72 72'), L, L, `${dir}/ic_launcher_round.png`, true);
    await shot(svg(F, F, art(false)), F, F, `${dir}/ic_launcher_foreground.png`);
  }
  // Splash: тёмный фон с кораблём по центру
  for (const dir of fs.readdirSync(RES).filter(n => n.startsWith('drawable'))) {
    const f = `${RES}/${dir}/splash.png`; if (!fs.existsSync(f)) continue;
    const { w, h } = await p.evaluate(async (src) => { const i = new Image(); i.src = src; await i.decode(); return { w: i.width, h: i.height }; }, 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
    const s = Math.min(w, h) * 0.35;
    await shot(`<div style="width:${w}px;height:${h}px;background:#0b0e2a;display:flex;align-items:center;justify-content:center">${svg(s, s, art(false), '18 18 72 72')}</div>`, w, h, f);
  }
  // Графика для Google Play
  await shot(svg(512, 512, art(true), '14 14 80 80'), 512, 512, path.join(__dirname, '../store/icon-512.png'));
  await shot(`<div style="width:1024px;height:500px;background:linear-gradient(135deg,#0b0e2a,#2a1650);display:flex;align-items:center;gap:24px;padding-left:50px;box-sizing:border-box;font-family:system-ui,sans-serif">
    ${svg(280, 280, art(false), '18 18 72 72')}
    <div><div style="font-size:84px;font-weight:900;color:#ffe066;text-shadow:0 6px 0 #ff7ad9">ЗВЕЗДОПАД</div>
    <div style="font-size:30px;color:#b8c4ff;margin-top:16px">Лови звёзды — уклоняйся от метеоритов</div></div></div>`, 1024, 500, path.join(__dirname, '../store/feature-1024x500.png'));
  // iOS: иконка 1024x1024 (без прозрачности — иначе App Store отклонит) и splash 2732x2732
  const IOS = path.join(__dirname, '../ios/App/App/Assets.xcassets');
  if (fs.existsSync(IOS)) {
    await p.setViewportSize({ width: 1024, height: 1024 });
    await p.setContent(`<body style="margin:0;background:#0b0e2a">${svg(1024, 1024, art(true), '14 14 80 80')}</body>`);
    await p.screenshot({ path: `${IOS}/AppIcon.appiconset/AppIcon-512@2x.png`, omitBackground: false, type: 'png' });
    const S = 2732, s = S * 0.3;
    const html = `<div style="width:${S}px;height:${S}px;background:#0b0e2a;display:flex;align-items:center;justify-content:center">${svg(s, s, art(false), '18 18 72 72')}</div>`;
    for (const n of ['', '-1', '-2']) await shot(html, S, S, `${IOS}/Splash.imageset/splash-2732x2732${n}.png`);
  }
  await b.close();
})();
