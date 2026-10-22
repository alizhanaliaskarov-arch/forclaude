import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeIn, easeInOut, easeOutBack, easeOutExpo, ip, mix} from '../theme';
import {Aurora, SceneTag} from '../components';

// 144–162 s. One big task splits into parallel helpers; they report back; everything collapses into "done".
const AGENTS = [
  {n: 'Исследование', c: C.cyan, a: -150},
  {n: 'Код', c: C.violet, a: -90},
  {n: 'Тексты', c: C.coral, a: -30},
  {n: 'Дизайн', c: C.pink, a: 30},
  {n: 'Тесты', c: C.green, a: 90},
  {n: 'Запуск', c: C.amber, a: 150},
];
const TASKS = ['Изучить конкурентов', 'Собрать страницу', 'Написать тексты', 'Нарисовать баннеры', 'Прогнать 214 тестов', 'Выложить и проверить'];
const CX = 760;
const CY = 560;
const RAD = 330;

export const S10Agents: React.FC<SceneProps> = ({f, dur}) => {
  const split = ip(f, [60, 110], [0, 1], easeOutExpo);
  const implode = ip(f, [dur - 36, dur - 6], [0, 1], easeIn);
  const spread = split * (1 - implode);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Aurora f={f} colors={[C.violet, C.amber, C.cyan]} opacity={0.25} />
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {AGENTS.map((a, i) => {
          const r = (a.a * Math.PI) / 180;
          const x = CX + Math.cos(r) * RAD * spread;
          const y = CY + Math.sin(r) * RAD * spread;
          const prog = clamp((f - 130 - i * 8) / (170 + i * 18));
          return (
            <g key={a.n} opacity={split}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke={a.c} strokeOpacity={0.35} strokeWidth={2} />
              {/* data pulses travelling along the link */}
              {[0, 1, 2].map((k) => {
                const p = ((f / 30 + k / 3 + i * 0.13) % 1);
                const back = prog >= 1;
                const q = back ? 1 - p : p;
                return <circle key={k} cx={mix(CX, x, q)} cy={mix(CY, y, q)} r={5} fill={a.c} opacity={spread > 0.9 ? 0.9 : 0} />;
              })}
              <circle cx={x} cy={y} r={62} fill={C.panel} stroke={a.c} strokeOpacity={0.4} strokeWidth={2} />
              <circle cx={x} cy={y} r={62} fill="none" stroke={a.c} strokeWidth={7} pathLength={1} strokeDasharray={`${prog} 1`} transform={`rotate(-90 ${x} ${y})`} strokeLinecap="round" />
              {prog >= 1 ? (
                <path d={`M${x - 20},${y} l14,14 l26,-30`} fill="none" stroke={a.c} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <text x={x} y={y + 10} textAnchor="middle" fill={C.ivory} fontFamily="JetBrains Mono" fontSize={26} fontWeight={800}>
                  {Math.round(prog * 100)}%
                </text>
              )}
              <text x={x} y={y + 100} textAnchor="middle" fill={C.ivory} fontFamily="Manrope" fontWeight={800} fontSize={26} opacity={spread}>
                {a.n}
              </text>
            </g>
          );
        })}
        {/* core */}
        <circle cx={CX} cy={CY} r={mix(120, 90, split) * (1 - implode * 0.85) + 10 * Math.sin(f / 8) * (1 - implode)} fill={C.coral} style={{filter: `drop-shadow(0 0 ${40 + implode * 80}px ${C.coral})`}} />
      </svg>
      <div style={{position: 'absolute', left: CX - 200, top: CY - 40, width: 400, textAlign: 'center', fontFamily: F.body, fontWeight: 800, fontSize: 26, color: C.night, opacity: 1 - implode, lineHeight: 1.2}}>
        {split < 0.5 ? 'Запустить лендинг к понедельнику' : 'Claude'}
      </div>
      {/* the task as a prompt, before it splits */}
      <div style={{position: 'absolute', left: CX - 360, top: 180, width: 720, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.mute, opacity: ip(f, [0, 20], [0, 1]) * ip(f, [70, 100], [1, 0])}}>
        &gt; запусти лендинг к понедельнику
      </div>
      {/* checklist */}
      <div style={{position: 'absolute', left: 1240, top: 230, width: 560, padding: '30px 34px', borderRadius: 26, background: 'rgba(21,24,35,0.9)', border: '1px solid rgba(255,255,255,0.08)', opacity: ip(f, [100, 130], [0, 1]) * (1 - implode), transform: `translateX(${ip(f, [100, 130], [60, 0], easeOutExpo)}px)`}}>
        <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.mute, marginBottom: 18}}>ПЛАН</div>
        {TASKS.map((t, i) => {
          const done = clamp((f - 130 - i * 8) / (170 + i * 18)) >= 1;
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 18, padding: '12px 0', fontFamily: F.body, fontWeight: 700, fontSize: 28, color: done ? C.ivory : C.mute}}>
              <span style={{width: 34, height: 34, borderRadius: 10, border: `3px solid ${AGENTS[i].c}`, background: done ? AGENTS[i].c : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.night, fontSize: 22, fontWeight: 900}}>
                {done ? '✓' : ''}
              </span>
              <span style={{textDecoration: done ? 'line-through' : 'none', textDecorationColor: 'rgba(255,255,255,0.4)'}}>{t}</span>
            </div>
          );
        })}
      </div>
      {/* done toast */}
      {(() => {
        const t = ip(f, [440, 460], [0, 1], easeOutBack) * (1 - implode);
        return (
          <div style={{position: 'absolute', left: 1240, top: 820, width: 560, padding: '22px 30px', borderRadius: 20, background: C.green, color: C.night, fontFamily: F.body, fontWeight: 800, fontSize: 28, transform: `scale(${t})`, transformOrigin: 'left center', opacity: clamp(t * 2)}}>
            ✓ Готово. Отчёт отправлен · сайт онлайн
          </div>
        );
      })()}
      {/* flash on implode */}
      <AbsoluteFill style={{background: C.ivory, opacity: ip(f, [dur - 8, dur - 2], [0, 1], easeInOut)}} />
      <SceneTag f={f} n="07" label="АГЕНТЫ" color={C.amber} />
    </AbsoluteFill>
  );
};
