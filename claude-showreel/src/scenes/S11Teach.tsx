import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, easeOutBack, easeOutExpo, ip, rnd} from '../theme';
import {SceneTag} from '../components';

// 162–178 s. "Why is the sky blue?" — explained for a child, then for a professor.
const KID = 'Солнечный свет — это смесь всех цветов. Синий сильнее всех отскакивает от воздуха и разлетается по небу. Поэтому мы видим его повсюду!';
const PRO = 'Рэлеевское рассеяние: интенсивность ∝ 1/λ⁴, поэтому коротковолновый синий свет рассеивается в атмосфере в 5–6 раз сильнее красного.';

export const S11Teach: React.FC<SceneProps> = ({f}) => {
  const q = ip(f, [10, 30], [0, 1], easeOutBack);
  const mode = ip(f, [230, 250], [0, 1], easeInOut);
  const text = mode < 0.5 ? KID : PRO;
  const typed = mode < 0.5 ? clamp((f - 70) * 1.4, 0, KID.length) : clamp((f - 250) * 2.2, 0, PRO.length);
  const sunX = 1450;
  const sunY = 260;
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #BFE3FF 0%, #EAF5FF 60%, ${C.paper} 100%)`}}>
      {/* sky illustration */}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="sun">
            <stop offset="0" stopColor="#FFF6C9" />
            <stop offset="0.5" stopColor={C.amber} />
            <stop offset="1" stopColor={C.amber} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={sunX} cy={sunY} r={180 + 8 * Math.sin(f / 12)} fill="url(#sun)" />
        <circle cx={sunX} cy={sunY} r={70} fill="#FFE27A" />
        {/* incoming white light splits; blue scatters everywhere */}
        {Array.from({length: 7}).map((_, i) => {
          const y0 = sunY + 40 + i * 40;
          const len = ip(f, [40 + i * 4, 110 + i * 4], [0, 1]);
          const colors = ['#FF5D6C', '#FF9F43', '#F5D547', '#46D483', '#4D8DFF', '#3D5AFE', '#8E5CFF'];
          return <line key={i} x1={sunX - 80} y1={y0} x2={sunX - 80 - 520 * len} y2={y0 + 200 * len} stroke={colors[i]} strokeWidth={6} strokeLinecap="round" opacity={0.75} />;
        })}
        {Array.from({length: 46}).map((_, i) => {
          const t = clamp((f - 110 - i * 2) / 60);
          const ox = 930 + rnd(i) * 30;
          const oy = 470 + rnd(i * 2) * 30;
          const a = rnd(i * 5) * Math.PI * 2;
          const r = t * (200 + rnd(i * 9) * 500);
          return <circle key={i} cx={ox + Math.cos(a) * r} cy={oy + Math.sin(a) * r * 0.6} r={7} fill="#3D7BFF" opacity={t > 0 ? 0.75 * (1 - t * 0.4) : 0} />;
        })}
        {/* ground with a child */}
        <path d="M0,900 C400,860 800,940 1200,890 S1700,860 1920,900 L1920,1080 L0,1080 Z" fill="#9ED79B" />
        <g transform="translate(1180 760)">
          <circle cx={0} cy={0} r={34} fill="#F2C9A0" />
          <path d="M-34,-6 C-30,-44 30,-44 34,-6 C20,-24 -20,-24 -34,-6Z" fill="#3A2414" />
          <rect x={-30} y={34} width={60} height={90} rx={24} fill={C.coral} />
          <circle cx={-11} cy={-2} r={4} fill="#1E1B16" />
          <circle cx={11} cy={-2} r={4} fill="#1E1B16" />
          <path d="M-8,14 Q0,20 8,14" stroke="#1E1B16" strokeWidth={3} fill="none" />
        </g>
      </svg>
      {/* question bubble */}
      <div style={{position: 'absolute', left: 1240, top: 600, padding: '20px 30px', borderRadius: '28px 28px 4px 28px', background: '#fff', fontFamily: F.body, fontWeight: 800, fontSize: 36, color: '#1E1B16', transform: `scale(${q})`, transformOrigin: 'right bottom', boxShadow: '0 20px 50px rgba(30,60,120,0.18)'}}>
        А почему небо голубое?
      </div>
      {/* answer card */}
      <div style={{position: 'absolute', left: 120, top: 200, width: 760, padding: '36px 44px', borderRadius: 30, background: mode < 0.5 ? '#fff' : '#101523', color: mode < 0.5 ? '#1E1B16' : C.ivory, boxShadow: '0 30px 80px rgba(30,60,120,0.2)', opacity: ip(f, [50, 70], [0, 1]), transform: `translateY(${ip(f, [50, 75], [40, 0], easeOutExpo)}px) rotateY(${Math.sin(mode * Math.PI) * 70}deg)`}}>
        {/* toggle */}
        <div style={{display: 'flex', gap: 10, marginBottom: 26}}>
          {['Ребёнку', 'Профессору'].map((t, i) => {
            const on = i === (mode < 0.5 ? 0 : 1);
            return (
              <span key={t} style={{padding: '10px 22px', borderRadius: 999, fontFamily: F.body, fontWeight: 800, fontSize: 22, background: on ? C.coral : 'transparent', color: on ? '#fff' : C.mute, border: `2px solid ${on ? C.coral : 'rgba(140,147,166,0.4)'}`}}>
                {t}
              </span>
            );
          })}
        </div>
        <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 36, lineHeight: 1.45, minHeight: 320}}>
          {text.slice(0, Math.floor(typed))}
          <span style={{display: 'inline-block', width: 4, height: 36, background: C.coral, marginLeft: 4, verticalAlign: 'middle', opacity: Math.floor(f / 10) % 2 ? 1 : 0.2}} />
        </div>
      </div>
      <SceneTag f={f} n="08" label="ОБЪЯСНЯЮ" dark color={C.coralDeep} />
    </AbsoluteFill>
  );
};
