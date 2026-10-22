import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeInOut, easeOutExpo, ip, rnd} from '../theme';
import {Aurora, Kinetic, Wordmark} from '../components';

// 8–18 s. The coral screen collapses into a point, explodes into a constellation, the name appears.
const N = 140;
const nodes = Array.from({length: N}).map((_, i) => {
  // points on a sphere (fibonacci)
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const th = i * 2.399963;
  return {x: Math.cos(th) * r, y, z: Math.sin(th) * r, burst: 0.6 + rnd(i) * 1.8, c: [C.coral, C.amber, C.violet, C.cyan, C.ivory][i % 5]};
});
const edges: [number, number][] = [];
for (let i = 0; i < N; i++)
  for (let j = i + 1; j < N; j++) {
    const a = nodes[i];
    const b = nodes[j];
    const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    if (d < 0.32) edges.push([i, j]);
  }

export const S02Bang: React.FC<SceneProps> = ({f}) => {
  const collapse = ip(f, [0, 14], [1, 0], easeInOut); // coral fill → point
  const burst = ip(f, [14, 70], [0, 1], easeOutExpo);
  const settle = ip(f, [40, 130], [0, 1], easeInOut);
  const rot = f / 140;
  const R = 330 + 40 * settle;
  const cx = W / 2;
  const cy = H / 2;
  const proj = nodes.map((p) => {
    const x = p.x * Math.cos(rot) - p.z * Math.sin(rot);
    const z = p.x * Math.sin(rot) + p.z * Math.cos(rot);
    const tilt = 0.35;
    const y = p.y * Math.cos(tilt) - z * Math.sin(tilt);
    const z2 = p.y * Math.sin(tilt) + z * Math.cos(tilt);
    const spread = burst * (p.burst * (1 - settle) + settle);
    return {X: cx + x * R * spread, Y: cy + y * R * spread, z: z2, c: p.c};
  });
  const nameIn = ip(f, [100, 150], [0, 1]);
  const netO = 1 - 0.55 * nameIn;
  return (
    <AbsoluteFill style={{background: C.night}}>
      <div style={{opacity: ip(f, [30, 120], [0, 1])}}>
        <Aurora f={f + 300} opacity={0.35} />
      </div>
      <svg width={W} height={H} style={{position: 'absolute', opacity: netO}}>
        <g stroke={C.ivory} strokeWidth={1}>
          {edges.map(([i, j], k) => {
            const a = proj[i];
            const b = proj[j];
            const o = clamp((settle - 0.2) * 1.5) * (0.12 + 0.18 * ((a.z + b.z) / 2 + 1));
            return <line key={k} x1={a.X} y1={a.Y} x2={b.X} y2={b.Y} opacity={o} />;
          })}
        </g>
        {proj.map((p, i) => (
          <circle key={i} cx={p.X} cy={p.Y} r={(2.5 + 2.5 * (p.z + 1)) * (burst > 0 ? 1 : 0)} fill={p.c} opacity={0.5 + 0.5 * (p.z + 1) / 2} />
        ))}
        {/* shockwave */}
        <circle cx={cx} cy={cy} r={ip(f, [14, 60], [0, 1300])} fill="none" stroke={C.amber} strokeWidth={ip(f, [14, 60], [40, 0])} opacity={ip(f, [14, 60], [0.9, 0])} />
      </svg>
      {/* the coral fill from the caret dive, collapsing to the centre */}
      {collapse > 0 ? (
        <AbsoluteFill style={{background: C.coral, clipPath: `circle(${collapse * 1200}px at 50% 50%)`}} />
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: nameIn, transform: `scale(${0.9 + 0.1 * nameIn})`, filter: `blur(${(1 - nameIn) * 20}px)`}}>
          <Wordmark f={f} size={220} reveal={ip(f, [100, 136], [0, 1])} />
        </div>
        <div style={{marginTop: 40}}>
          <Kinetic text="Одно слово — миллион возможностей" f={f - 160} size={46} weight={500} font={F.body} color={C.mute} stagger={0.8} spacing={0} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
