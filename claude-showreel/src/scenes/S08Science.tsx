import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeOutExpo, ip} from '../theme';
import {Aurora, SceneTag} from '../components';

// 108–126 s. A worked solution, a DNA helix, an atom and a wave being drawn.
const STEPS = [
  {t: 'x² − 5x + 6 = 0', note: 'ищем два числа: сумма 5, произведение 6'},
  {t: '(x − 2)(x − 3) = 0', note: 'раскладываем на множители'},
  {t: 'x = 2   или   x = 3', note: 'проверка: 4 − 10 + 6 = 0 ✓'},
];
export const ATOM: [number, number] = [1480, 360]; // the iris closes on the nucleus

export const S08Science: React.FC<SceneProps> = ({f}) => {
  const helixX = 1040;
  return (
    <AbsoluteFill style={{background: '#070B18'}}>
      <Aurora f={f} colors={[C.blue, C.violet, C.cyan]} opacity={0.22} base="#070B18" />
      {/* faint formula wallpaper */}
      <div style={{position: 'absolute', inset: 0, fontFamily: F.mono, fontSize: 26, color: C.ivory, opacity: 0.06, lineHeight: 2.4, padding: 40, whiteSpace: 'pre-wrap', transform: `translateY(${-f * 0.3}px)`}}>
        {'E = mc²   ∇·E = ρ/ε₀   F = ma   PV = nRT   e^{iπ} + 1 = 0   ∫ f(x) dx   λ = h/p   ΔS ≥ 0   a² + b² = c²   σ = √(Σ(x−μ)²/N)   '.repeat(14)}
      </div>
      {/* worked solution */}
      <div style={{position: 'absolute', left: 120, top: 200, width: 780}}>
        {STEPS.map((s, i) => {
          const at = 30 + i * 90;
          const t = ip(f, [at, at + 24], [0, 1], easeOutExpo);
          const active = f >= at && (i === STEPS.length - 1 || f < at + 90);
          return (
            <div key={i} style={{opacity: t, transform: `translateY(${(1 - t) * 30}px)`, marginBottom: 34, paddingLeft: 30, borderLeft: `5px solid ${active ? C.amber : 'rgba(255,255,255,0.12)'}`}}>
              <div style={{fontFamily: F.mono, fontSize: 22, color: C.mute, letterSpacing: '0.2em'}}>ШАГ {i + 1}</div>
              <div style={{fontFamily: F.display, fontWeight: 700, fontSize: i === 2 ? 62 : 56, color: i === 2 ? C.amber : C.ivory, margin: '6px 0'}}>{s.t}</div>
              <div style={{fontFamily: F.body, fontSize: 26, color: C.mute}}>{s.note}</div>
            </div>
          );
        })}
      </div>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {/* DNA helix */}
        {Array.from({length: 26}).map((_, i) => {
          const y = 140 + i * 32;
          const a = i * 0.45 + f / 18;
          const x1 = helixX + Math.sin(a) * 110;
          const x2 = helixX - Math.sin(a) * 110;
          const z = Math.cos(a);
          const o = clamp((f - 20 - i * 3) / 20);
          return (
            <g key={i} opacity={o}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.ivory} strokeOpacity={0.25} strokeWidth={3} />
              <circle cx={x1} cy={y} r={9 + 3 * z} fill={C.cyan} opacity={0.6 + 0.4 * z} />
              <circle cx={x2} cy={y} r={9 - 3 * z} fill={C.coral} opacity={0.6 - 0.4 * z} />
            </g>
          );
        })}
        {/* atom */}
        <g transform={`translate(${ATOM[0]} ${ATOM[1]})`} opacity={ip(f, [60, 90], [0, 1])}>
          {[0, 60, 120].map((rot, k) => {
            const e = f / 12 + k * 2.1;
            const ex = Math.cos(e) * 220;
            const ey = Math.sin(e) * 70;
            const r = (rot * Math.PI) / 180;
            return (
              <g key={rot}>
                <ellipse rx={220} ry={70} transform={`rotate(${rot})`} fill="none" stroke={C.violet} strokeWidth={3} opacity={0.7} />
                <circle cx={ex * Math.cos(r) - ey * Math.sin(r)} cy={ex * Math.sin(r) + ey * Math.cos(r)} r={12} fill={C.amber} style={{filter: `drop-shadow(0 0 10px ${C.amber})`}} />
              </g>
            );
          })}
          <circle r={34} fill={C.coral} style={{filter: `drop-shadow(0 0 30px ${C.coral})`}} />
        </g>
        {/* wave being drawn */}
        {(() => {
          const prog = ip(f, [120, 330], [0, 1]);
          let d = '';
          for (let x = 0; x <= 700 * prog; x += 6) {
            const y = Math.sin(x / 40 - f / 10) * 60 * Math.exp(-x / 900);
            d += `${x === 0 ? 'M' : 'L'}${1180 + x},${800 + y} `;
          }
          return <path d={d} fill="none" stroke={C.cyan} strokeWidth={5} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${C.cyan})`}} />;
        })()}
      </svg>
      <div style={{position: 'absolute', right: 120, bottom: 110, display: 'flex', gap: 30, fontFamily: F.mono, fontSize: 24, letterSpacing: '0.18em', color: C.ivory}}>
        {['МАТЕМАТИКА', 'ФИЗИКА', 'ХИМИЯ', 'БИОЛОГИЯ'].map((w, i) => (
          <span key={w} style={{opacity: ip(f, [150 + i * 12, 170 + i * 12], [0, 0.85])}}>{w}</span>
        ))}
      </div>
      <SceneTag f={f} n="05" label="НАУКА" color={C.violet} />
    </AbsoluteFill>
  );
};
