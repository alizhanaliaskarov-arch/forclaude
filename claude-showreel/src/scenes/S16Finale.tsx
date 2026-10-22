import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeInOut, easeOutExpo, ip, mix, rnd} from '../theme';
import {Aurora, Kinetic, Wordmark} from '../components';

// 270–290 s. Particles from every corner converge into the name; a light sweep; the line.
const P = 260;

export const S16Finale: React.FC<SceneProps> = ({f}) => {
  const conv = ip(f, [0, 70], [0, 1], easeInOut);
  const name = ip(f, [60, 80], [0, 1], easeOutExpo);
  const sweep = ip(f, [100, 160], [-0.3, 1.3]);
  const zoom = ip(f, [0, 600], [1.08, 1], easeInOut);
  return (
    <AbsoluteFill style={{background: C.night, transform: `scale(${zoom})`}}>
      <Aurora f={f} opacity={0.45 * ip(f, [60, 120], [0, 1])} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {Array.from({length: P}).map((_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const r0 = 900 + rnd(i * 3) * 700;
          const x0 = W / 2 + Math.cos(a) * r0;
          const y0 = H / 2 + Math.sin(a) * r0;
          // target: a point on the wordmark's bounding box
          const tx = W / 2 - 430 + rnd(i * 5) * 860;
          const ty = H / 2 - 110 + rnd(i * 7) * 200;
          const t = clamp(conv * 1.15 - rnd(i * 11) * 0.15);
          const x = mix(x0, tx, t);
          const y = mix(y0, ty, t);
          const o = (1 - name) * 0.9 + 0.1;
          return <circle key={i} cx={x} cy={y} r={2 + 3 * rnd(i * 13)} fill={[C.coral, C.amber, C.ivory, C.violet, C.cyan][i % 5]} opacity={t >= 1 ? o * 0.3 : o} />;
        })}
        {/* flare */}
        <circle cx={W / 2} cy={H / 2} r={ip(f, [60, 90], [0, 900])} fill="none" stroke={C.amber} strokeWidth={ip(f, [60, 90], [30, 0])} opacity={ip(f, [60, 90], [0.8, 0])} />
      </svg>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
        <div style={{position: 'relative', opacity: name, transform: `scale(${0.85 + 0.15 * name})`, filter: `blur(${(1 - name) * 16}px)`}}>
          <Wordmark f={f} size={250} />
          {/* light sweep */}
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${sweep * 100 - 12}%, rgba(255,255,255,0.75) ${sweep * 100}%, transparent ${sweep * 100 + 12}%)`, mixBlendMode: 'overlay', pointerEvents: 'none'}} />
        </div>
        <div style={{marginTop: 50}}>
          <Kinetic text="Думай шире." f={f - 140} size={78} weight={700} color={C.amber} stagger={2} />
        </div>
        <div style={{marginTop: 50, fontFamily: F.body, fontWeight: 600, fontSize: 36, color: C.mute, opacity: ip(f, [280, 320], [0, 1])}}>
          Одно слово — и всё возможно.
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: ip(f, [60, 64, 76], [0, 0.9, 0])}} />
    </AbsoluteFill>
  );
};
