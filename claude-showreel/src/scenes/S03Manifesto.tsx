import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeOutExpo, ip, pulse} from '../theme';
import {Kinetic} from '../components';

// 18–34 s. Eight words, one per bar (60 frames), cut on the downbeat.
const CARDS: {w: string; bg: string; fg: string; sub: string; shape: 'ring' | 'grid' | 'bars' | 'wave' | 'dots' | 'tri' | 'spark' | 'heart'}[] = [
  {w: 'ПИШУ', bg: C.coral, fg: C.night, sub: 'тексты · письма · сценарии', shape: 'bars'},
  {w: 'СЧИТАЮ', bg: C.night, fg: C.amber, sub: 'цифры · модели · прогнозы', shape: 'grid'},
  {w: 'ПРОГРАММИРУЮ', bg: C.ivory, fg: C.night, sub: 'python · typescript · rust · sql', shape: 'tri'},
  {w: 'РИСУЮ', bg: C.violet, fg: C.ivory, sub: 'графика · интерфейсы · анимация', shape: 'ring'},
  {w: 'СОЧИНЯЮ', bg: C.night, fg: C.cyan, sub: 'музыка · стихи · истории', shape: 'wave'},
  {w: 'ОБЪЯСНЯЮ', bg: C.amber, fg: C.night, sub: 'сложное — простыми словами', shape: 'dots'},
  {w: 'ДУМАЮ', bg: C.night2, fg: C.ivory, sub: 'шаг за шагом', shape: 'spark'},
  {w: 'ВМЕСТЕ С ВАМИ', bg: C.coral, fg: C.ivory, sub: '', shape: 'heart'},
];

const Shape: React.FC<{k: string; f: number; color: string}> = ({k, f, color}) => {
  const t = f / 60;
  const common = {fill: 'none', stroke: color, strokeWidth: 3, opacity: 0.22} as const;
  if (k === 'ring')
    return (
      <g {...common}>
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={W / 2} cy={H / 2} r={200 + i * 130 + ((f * 3) % 130)} />
        ))}
      </g>
    );
  if (k === 'grid')
    return (
      <g {...common}>
        {Array.from({length: 26}).map((_, i) => (
          <line key={i} x1={i * 80 - (f % 80)} y1={0} x2={i * 80 - (f % 80)} y2={H} />
        ))}
        {Array.from({length: 15}).map((_, i) => (
          <line key={'h' + i} x1={0} y1={i * 80} x2={W} y2={i * 80} />
        ))}
      </g>
    );
  if (k === 'bars')
    return (
      <g fill={color} opacity={0.14}>
        {Array.from({length: 30}).map((_, i) => {
          const h = 120 + 300 * Math.abs(Math.sin(i * 0.7 + t * 6));
          return <rect key={i} x={i * 66} y={H - h} width={44} height={h} rx={6} />;
        })}
      </g>
    );
  if (k === 'wave')
    return (
      <g {...common} opacity={0.35}>
        {[0, 1, 2, 3].map((j) => {
          let d = '';
          for (let x = 0; x <= W; x += 16) d += `${x === 0 ? 'M' : 'L'}${x},${H / 2 + Math.sin(x / 120 + t * 5 + j) * (120 + j * 40)} `;
          return <path key={j} d={d} />;
        })}
      </g>
    );
  if (k === 'dots')
    return (
      <g fill={color} opacity={0.2}>
        {Array.from({length: 24 * 14}).map((_, i) => {
          const x = (i % 24) * 84 + 30;
          const y = Math.floor(i / 24) * 84 + 20;
          const r = 6 + 10 * Math.max(0, Math.sin(Math.hypot(x - W / 2, y - H / 2) / 90 - t * 6));
          return <circle key={i} cx={x} cy={y} r={r} />;
        })}
      </g>
    );
  if (k === 'tri')
    return (
      <g {...common} strokeWidth={4}>
        {Array.from({length: 6}).map((_, i) => {
          const s = 260 + i * 160;
          const a = t * 0.8 + i * 0.3;
          const pts = [0, 1, 2].map((j) => `${W / 2 + Math.cos(a + (j * 2 * Math.PI) / 3) * s},${H / 2 + Math.sin(a + (j * 2 * Math.PI) / 3) * s}`).join(' ');
          return <polygon key={i} points={pts} />;
        })}
      </g>
    );
  if (k === 'spark')
    return (
      <g {...common} opacity={0.3}>
        {Array.from({length: 48}).map((_, i) => {
          const a = (i / 48) * Math.PI * 2 + t * 0.3;
          const r1 = 260;
          const r2 = 260 + 500 * (0.5 + 0.5 * Math.sin(i * 1.7 + t * 4));
          return <line key={i} x1={W / 2 + Math.cos(a) * r1} y1={H / 2 + Math.sin(a) * r1} x2={W / 2 + Math.cos(a) * r2} y2={H / 2 + Math.sin(a) * r2} />;
        })}
      </g>
    );
  // heart: concentric pulses
  return (
    <g fill="none" stroke={color} strokeWidth={4} opacity={0.3}>
      {[0, 1, 2, 3].map((i) => {
        const s = ((f * 4 + i * 120) % 480) / 480;
        return <circle key={i} cx={W / 2} cy={H / 2} r={150 + s * 900} opacity={1 - s} />;
      })}
    </g>
  );
};

export const S03Manifesto: React.FC<SceneProps> = ({f}) => {
  const i = clamp(Math.floor(f / 60), 0, CARDS.length - 1);
  const lf = f - i * 60;
  const card = CARDS[i];
  const punch = 1 + 0.06 * ip(lf, [0, 10], [1, 0], easeOutExpo) + 0.012 * pulse(lf, 6);
  const size = card.w.length > 9 ? 150 : 210;
  const marq = (f * 6) % 2400;
  return (
    <AbsoluteFill style={{background: card.bg, overflow: 'hidden'}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <Shape k={card.shape} f={f} color={card.fg} />
      </svg>
      {/* giant outlined marquee of the word */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: -marq,
          whiteSpace: 'nowrap',
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 200,
          color: 'transparent',
          WebkitTextStroke: `2px ${card.fg}`,
          opacity: 0.16,
        }}
      >
        {(card.w + ' · ').repeat(8)}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: -((f * 4) % 2400) + 1200,
          whiteSpace: 'nowrap',
          fontFamily: F.display,
          fontWeight: 900,
          fontSize: 200,
          color: 'transparent',
          WebkitTextStroke: `2px ${card.fg}`,
          opacity: 0.12,
        }}
      >
        {(card.w + ' · ').repeat(8)}
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${punch})`}}>
        <Kinetic key={i} text={card.w} f={lf} size={size} color={card.fg} weight={900} stagger={1.2} />
        {card.sub ? (
          <div
            style={{
              marginTop: 36,
              fontFamily: F.mono,
              fontSize: 32,
              letterSpacing: '0.18em',
              color: card.fg,
              opacity: ip(lf, [8, 20], [0, 0.8]),
              transform: `translateY(${ip(lf, [8, 24], [20, 0])}px)`,
            }}
          >
            {card.sub.toUpperCase()}
          </div>
        ) : null}
      </AbsoluteFill>
      {/* counter */}
      <div style={{position: 'absolute', right: 90, top: 72, fontFamily: F.mono, fontSize: 26, color: card.fg, opacity: 0.7, letterSpacing: '0.2em'}}>
        {String(i + 1).padStart(2, '0')} / 08
      </div>
    </AbsoluteFill>
  );
};
