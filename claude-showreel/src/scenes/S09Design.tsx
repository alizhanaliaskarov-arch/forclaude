import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, easeOutBack, easeOutExpo, ip, mix} from '../theme';
import {SceneTag} from '../components';

// 126–144 s. Grey wireframes snap into a finished website, an app screen and a style guide.
type BoxProps = {x: number; y: number; w: number; h: number; t: number; fill: string; r?: number; children?: React.ReactNode; style?: React.CSSProperties; draw: number};
const Box: React.FC<BoxProps> = ({x, y, w, h, t, fill, r = 14, children, style, draw}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w * clamp(draw * 1.3),
      height: h,
      borderRadius: r,
      border: `2px dashed rgba(140,147,166,${0.7 * (1 - t)})`,
      background: t > 0 ? fill : 'transparent',
      opacity: clamp(draw * 3),
      overflow: 'hidden',
      ...style,
    }}
  >
    <div style={{opacity: t, width: w, height: h}}>{children}</div>
  </div>
);

export const S09Design: React.FC<SceneProps> = ({f}) => {
  const draw = (k: number) => ip(f, [10 + k * 6, 50 + k * 6], [0, 1], easeOutExpo);
  const snap = (k: number) => ip(f, [100 + k * 7, 118 + k * 7], [0, 1], easeOutExpo);
  // cursor path
  const cx = ip(f, [0, 90, 160, 260, 360, 540], [1700, 520, 760, 1500, 1580, 1100], easeInOut);
  const cy = ip(f, [0, 90, 160, 260, 360, 540], [900, 300, 520, 330, 760, 640], easeInOut);
  const zoom = ip(f, [200, 540], [1, 1.07], easeInOut);
  return (
    <AbsoluteFill style={{background: '#101219'}}>
      {/* canvas dots */}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 48 * 27}).map((_, i) => (
          <circle key={i} cx={(i % 48) * 40 + 20} cy={Math.floor(i / 48) * 40 + 20} r={1.6} fill="#2A2F3F" />
        ))}
      </svg>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        {/* website frame */}
        <div style={{position: 'absolute', left: 120, top: 160, fontFamily: F.mono, fontSize: 18, color: C.mute}}>Лендинг · 1440</div>
        <Box x={120} y={190} w={1000} h={640} t={snap(0)} fill="#FBF7F0" draw={draw(0)} r={18}>
          <div style={{position: 'absolute', left: 50, top: 34, display: 'flex', gap: 34, fontFamily: F.body, fontWeight: 700, fontSize: 18, color: '#1E1B16'}}>
            <span style={{fontFamily: F.display, fontWeight: 800}}>Кофейня «Зерно»</span>
            <span style={{opacity: 0.6}}>Меню</span>
            <span style={{opacity: 0.6}}>О нас</span>
            <span style={{opacity: 0.6}}>Контакты</span>
          </div>
          <div style={{position: 'absolute', left: 50, top: 140, width: 470, fontFamily: F.display, fontWeight: 800, fontSize: 48, lineHeight: 1.1, color: '#1E1B16'}}>
            Кофе, ради которого встают раньше
          </div>
          <div style={{position: 'absolute', left: 50, top: 380, width: 420, fontFamily: F.body, fontSize: 22, color: '#6B6355'}}>
            Обжариваем сами, каждое утро. Заказ — за 30 секунд.
          </div>
          <div style={{position: 'absolute', left: 50, top: 470, padding: '18px 36px', borderRadius: 999, background: C.coral, color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 22}}>
            Заказать
          </div>
          <div style={{position: 'absolute', right: 50, top: 120, width: 380, height: 440, borderRadius: 30, background: `linear-gradient(160deg, ${C.amber}, ${C.coral})`}}>
            <svg width={380} height={440}>
              <ellipse cx={190} cy={250} rx={110} ry={130} fill="#5B3A22" />
              <path d="M190,130 C150,200 230,300 190,380" stroke="#3A2414" strokeWidth={10} fill="none" />
            </svg>
          </div>
        </Box>
        {/* placeholders inside the website while wireframe */}
        {snap(0) < 1 ? (
          <div style={{opacity: draw(1) * (1 - snap(0))}}>
            <Box x={170} y={330} w={470} h={140} t={0} fill="" draw={draw(1)} />
            <Box x={170} y={500} w={400} h={40} t={0} fill="" draw={draw(2)} />
            <Box x={170} y={600} w={200} h={64} t={0} fill="" draw={draw(3)} r={40} />
            <Box x={690} y={310} w={380} h={440} t={0} fill="" draw={draw(2)} r={30} />
          </div>
        ) : null}
        {/* mobile frame */}
        <div style={{position: 'absolute', left: 1200, top: 160, fontFamily: F.mono, fontSize: 18, color: C.mute}}>Приложение · 390</div>
        <Box x={1200} y={190} w={330} h={640} t={snap(2)} fill={C.night2} draw={draw(3)} r={42} style={{boxShadow: snap(2) > 0.5 ? '0 30px 80px rgba(0,0,0,0.6)' : undefined}}>
          <div style={{padding: '50px 26px', fontFamily: F.body, color: C.ivory}}>
            <div style={{fontSize: 18, color: C.mute}}>Доброе утро, Алия</div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 34, marginTop: 6}}>Ваш заказ</div>
            <div style={{marginTop: 26, padding: 20, borderRadius: 22, background: `linear-gradient(135deg, ${C.coral}, ${C.amber})`}}>
              <div style={{fontSize: 18, opacity: 0.85}}>Капучино · овсяное</div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, marginTop: 6}}>3 мин</div>
              <div style={{height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.3)', marginTop: 14}}>
                <div style={{height: 8, width: `${ip(f, [140, 500], [10, 90])}%`, borderRadius: 4, background: '#fff'}} />
              </div>
            </div>
            {['Флэт уайт', 'Раф лаванда', 'Матча латте'].map((t, i) => (
              <div key={t} style={{marginTop: 16, padding: '16px 18px', borderRadius: 18, background: C.panel, display: 'flex', justifyContent: 'space-between', fontSize: 20}}>
                <span>{t}</span>
                <span style={{color: C.amber, fontWeight: 800}}>{[290, 340, 360][i]} ₽</span>
              </div>
            ))}
          </div>
        </Box>
        {/* style guide */}
        <div style={{position: 'absolute', left: 1600, top: 160, fontFamily: F.mono, fontSize: 18, color: C.mute}}>Стиль</div>
        <Box x={1600} y={190} w={220} h={640} t={snap(4)} fill={C.panel} draw={draw(5)} r={22}>
          <div style={{padding: 24}}>
            {[C.coral, C.amber, '#5B3A22', '#FBF7F0', C.night2].map((c, i) => (
              <div key={c} style={{height: 64, borderRadius: 14, background: c, marginBottom: 12, transform: `scale(${easeOutBack(clamp((f - 150 - i * 6) / 14))})`, border: '1px solid rgba(255,255,255,0.1)'}} />
            ))}
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 92, color: C.ivory, marginTop: 10, lineHeight: 1}}>Aa</div>
            <div style={{fontFamily: F.mono, fontSize: 15, color: C.mute, marginTop: 8}}>Unbounded / Manrope 8 pt-сетка</div>
          </div>
        </Box>
        {/* layout grid flashes when snapping */}
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: ip(f, [90, 105, 150, 180], [0, 0.5, 0.5, 0], easeInOut)}}>
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={120 + 50 + i * 77} y={190} width={60} height={640} fill={C.pink} opacity={0.12} />
          ))}
        </svg>
      </AbsoluteFill>
      {/* cursor */}
      <svg width={60} height={60} style={{position: 'absolute', left: cx, top: cy, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>
        <path d="M4,4 L4,44 L15,33 L24,52 L31,49 L22,31 L38,31 Z" fill="#fff" stroke="#000" strokeWidth={2} />
      </svg>
      <div style={{position: 'absolute', left: cx + 34, top: cy + 46, padding: '6px 14px', borderRadius: 10, background: C.pink, color: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 18}}>Claude</div>
      <div style={{position: 'absolute', right: 120, top: 70, fontFamily: F.mono, fontSize: 22, color: C.mute, opacity: ip(f, [100, 130], [0, 1])}}>
        от наброска до макета · {Math.round(mix(0, 100, ip(f, [100, 300], [0, 1])))}%
      </div>
      <SceneTag f={f} n="06" label="ДИЗАЙН" color={C.pink} />
    </AbsoluteFill>
  );
};
