import React from 'react';
import {AbsoluteFill} from 'remotion';
import {geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import type {FeatureCollection} from 'geojson';
import world from 'world-atlas/land-110m.json';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeInOut, easeOutBack, easeOutExpo, ip, mix} from '../theme';
import {Dust, SceneTag} from '../components';
import {HORIZON_Y} from './S05Data';

// 72–90 s. A globe rises out of the chart's horizon; greetings pop up in their own languages.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const topo = world as any;
const land = feature(topo, topo.objects.land) as unknown as FeatureCollection;
const grat = geoGraticule10();

const HELLO: [string, [number, number], string][] = [
  ['Привет', [37.6, 55.75], C.coral],
  ['Salom', [69.24, 41.31], C.cyan],
  ['Merhaba', [28.97, 41.0], C.amber],
  ['مرحبا', [31.24, 30.04], C.violet],
  ['Jambo', [36.82, -1.29], C.green],
  ['Hola', [-3.7, 40.42], C.coral],
  ['Olá', [-43.2, -22.9], C.green],
  ['Hello', [-74.0, 40.7], C.amber],
  ['Kia ora', [174.78, -41.29], C.cyan],
  ['こんにちは', [139.69, 35.68], C.pink],
  ['안녕하세요', [126.98, 37.57], C.violet],
  ['你好', [116.4, 39.9], C.red],
  ['नमस्ते', [77.2, 28.6], C.amber],
  ['Xin chào', [105.85, 21.03], C.cyan],
];

export const S06Languages: React.FC<SceneProps> = ({f}) => {
  const rise = ip(f, [0, 70], [0, 1], easeOutExpo);
  const R = 360;
  const cx = W / 2;
  const cy = mix(HORIZON_Y + R + 40, 560, rise);
  // spin westward→eastward so the greetings roll in one after another
  const lon = ip(f, [0, 540], [80, -200], easeInOut);
  const rot: [number, number] = [lon, -18];
  const proj = geoOrthographic().scale(R).translate([cx, cy]).rotate(rot).clipAngle(90);
  const path = geoPath(proj);
  const centre: [number, number] = [-rot[0], -rot[1]];
  const arcs: [number, number][][] = [];
  for (let i = 0; i < HELLO.length - 1; i++) arcs.push([HELLO[i][1], HELLO[(i + 3) % HELLO.length][1]]);
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 60%, #121a33 0%, ${C.night} 70%)`}}>
      <Dust f={f} n={120} color={C.ivory} speed={0.05} size={1.6} seed={4} />
      {/* horizon line carried over from the chart */}
      <svg width={W} height={H} style={{position: 'absolute'}}>
        <line x1={0} y1={HORIZON_Y} x2={W} y2={HORIZON_Y} stroke={C.coral} strokeWidth={6} opacity={ip(f, [0, 40], [1, 0])} style={{filter: `drop-shadow(0 0 14px ${C.coral})`}} />
      </svg>
      <svg width={W} height={H} style={{position: 'absolute', clipPath: rise < 1 ? `inset(0 0 ${H - HORIZON_Y - rise * (H - HORIZON_Y)}px 0)` : undefined}}>
        <defs>
          <radialGradient id="ocean" cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#253a73" />
            <stop offset="1" stopColor="#0b1430" />
          </radialGradient>
          <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
            <stop offset="0.82" stopColor={C.cyan} stopOpacity={0} />
            <stop offset="0.9" stopColor={C.cyan} stopOpacity={0.35} />
            <stop offset="1" stopColor={C.cyan} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R * 1.12} fill="url(#atmo)" />
        <circle cx={cx} cy={cy} r={R} fill="url(#ocean)" />
        <path d={path(grat) ?? ''} fill="none" stroke="#9CC3E6" strokeOpacity={0.12} strokeWidth={1} />
        <path d={path(land) ?? ''} fill="#3b5a9e" stroke="#9CC3E6" strokeOpacity={0.5} strokeWidth={1.2} />
        {arcs.map(([a, b], i) => {
          const t = clamp((f - 80 - i * 22) / 50);
          if (t <= 0) return null;
          const interp = geoInterpolate(a, b);
          const pts = Array.from({length: 33}).map((_, k) => interp((k / 32) * t));
          const d = path({type: 'LineString', coordinates: pts}) ?? '';
          return <path key={i} d={d} fill="none" stroke={C.amber} strokeWidth={2.5} strokeOpacity={0.85} strokeDasharray="2 8" strokeLinecap="round" />;
        })}
      </svg>
      {HELLO.map(([word, ll, color], i) => {
        const vis = geoDistance(ll, centre) < Math.PI / 2 - 0.15;
        const p = proj(ll);
        if (!p || !vis || rise < 0.8) return null;
        const edge = clamp((Math.PI / 2 - 0.15 - geoDistance(ll, centre)) / 0.35);
        const s = easeOutBack(edge);
        return (
          <div key={i} style={{position: 'absolute', left: p[0], top: p[1], transform: `translate(-50%, -100%) scale(${s})`, transformOrigin: '50% 100%', opacity: edge}}>
            <div
              style={{
                padding: '12px 24px',
                borderRadius: 16,
                background: 'rgba(7,8,12,0.82)',
                border: `2px solid ${color}`,
                color: C.ivory,
                fontFamily: F.intl,
                fontWeight: 700,
                fontSize: 30,
                whiteSpace: 'nowrap',
                marginBottom: 18,
                boxShadow: `0 0 30px ${color}55`,
              }}
            >
              {word}
            </div>
            <div style={{position: 'absolute', left: '50%', bottom: 0, width: 14, height: 14, marginLeft: -7, marginBottom: -7, borderRadius: 7, background: color, boxShadow: `0 0 18px ${color}`}} />
          </div>
        );
      })}
      {/* translation cards */}
      <div style={{position: 'absolute', left: 90, top: 190, display: 'flex', flexDirection: 'column', gap: 18}}>
        {[
          ['Договор', 'EN → RU', 'юридически точно'],
          ['Письмо бабушке', 'RU → UZ', 'тепло и по-родному'],
          ['Шутка', 'RU → ES', 'и она всё ещё смешная'],
        ].map(([a, b, c], i) => {
          const t = ip(f, [200 + i * 40, 230 + i * 40], [0, 1], easeOutExpo);
          return (
            <div key={a} style={{opacity: t, transform: `translateX(${(1 - t) * -80}px)`, padding: '18px 26px', width: 420, borderRadius: 18, background: 'rgba(21,24,35,0.88)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: F.body}}>
              <div style={{display: 'flex', justifyContent: 'space-between', color: C.ivory, fontSize: 30, fontWeight: 800}}>
                <span>{a}</span>
                <span style={{fontFamily: F.mono, fontSize: 20, color: C.cyan, alignSelf: 'center'}}>{b}</span>
              </div>
              <div style={{color: C.mute, fontSize: 22, marginTop: 6}}>{c}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', right: 90, top: 190, textAlign: 'right', fontFamily: F.display, fontWeight: 800, color: C.ivory, opacity: ip(f, [120, 150], [0, 1])}}>
        <div style={{fontSize: 84, lineHeight: 1, color: C.cyan}}>ДЕСЯТКИ</div>
        <div style={{fontSize: 34, marginTop: 10}}>языков — один собеседник</div>
      </div>
      <SceneTag f={f} n="03" label="ЯЗЫКИ" color={C.cyan} />
    </AbsoluteFill>
  );
};
