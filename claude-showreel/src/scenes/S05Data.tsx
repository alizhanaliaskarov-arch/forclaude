import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeInOut, easeOutExpo, ip, mix, rnd} from '../theme';
import {Aurora, SceneTag} from '../components';

// 54–72 s. Raw digits rain down, fall into bars, bars become a line, an anomaly is found, a dashboard assembles.
const NB = 12;
const VALUES = [42, 48, 45, 53, 51, 86, 58, 63, 61, 68, 72, 79]; // index 5 = the anomaly (March, say)
const MONTHS = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
const CX0 = 260;
const CW = 1400;
const BASE = 820;
const SCALE = 6;
const bx = (i: number) => CX0 + (i + 0.5) * (CW / NB);
const by = (v: number) => BASE - v * SCALE;

export const HORIZON_Y = 640; // the line flattens here at the end — the next scene's horizon

export const S05Data: React.FC<SceneProps> = ({f, dur}) => {
  const rain = ip(f, [0, 30], [0, 1]) * ip(f, [80, 110], [1, 0]);
  const grow = ip(f, [80, 150], [0, 1], easeOutExpo);
  const toLine = ip(f, [170, 230], [0, 1], easeInOut);
  const anomaly = ip(f, [250, 270], [0, 1], easeOutExpo);
  const dash = ip(f, [320, 360], [0, 1], easeOutExpo);
  const flatten = ip(f, [dur - 40, dur], [0, 1], easeInOut);
  const chartShift = mix(0, -120, dash) * (1 - flatten);
  const pts = VALUES.map((v, i) => [bx(i), mix(by(v * grow), HORIZON_Y, flatten)] as const);
  let d = '';
  pts.forEach(([x, y], i) => (d += `${i ? 'L' : 'M'}${x},${y} `));
  const lineLenFrac = toLine;
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Aurora f={f} colors={[C.amber, C.coral, C.violet]} opacity={0.25} />
      {/* digit rain */}
      <svg width={W} height={H} style={{position: 'absolute', opacity: rain}}>
        {Array.from({length: 64}).map((_, c) => {
          const x = c * 30 + 10;
          const sp = 8 + rnd(c) * 14;
          return Array.from({length: 18}).map((__, r) => {
            const y = ((r * 64 + f * sp + rnd(c * 7) * 900) % (H + 200)) - 100;
            return (
              <text key={c + '-' + r} x={x} y={y} fill={r % 7 === 0 ? C.amber : C.ivory} opacity={0.15 + 0.5 * rnd(c * 31 + r)} fontFamily="JetBrains Mono" fontSize={22}>
                {Math.floor(rnd(c * 13 + r * 3 + Math.floor(f / 4)) * 10)}
              </text>
            );
          });
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateY(${chartShift}px)`}}>
        <svg width={W} height={H} style={{position: 'absolute'}}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.coral} stopOpacity={0.45} />
              <stop offset="1" stopColor={C.coral} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* axis */}
          <line x1={CX0} y1={BASE} x2={CX0 + CW} y2={BASE} stroke={C.line} strokeWidth={2} opacity={1 - flatten} />
          {[20, 40, 60, 80].map((v) => (
            <g key={v} opacity={grow * 0.6 * (1 - flatten)}>
              <line x1={CX0} y1={by(v)} x2={CX0 + CW} y2={by(v)} stroke={C.line} strokeDasharray="6 10" />
              <text x={CX0 - 20} y={by(v) + 8} textAnchor="end" fill={C.mute} fontFamily="JetBrains Mono" fontSize={20}>
                {v}
              </text>
            </g>
          ))}
          {/* bars */}
          {VALUES.map((v, i) => {
            const h = v * SCALE * clamp(grow * 1.4 - i * 0.03);
            const w = mix(70, 6, toLine);
            return (
              <rect
                key={i}
                x={bx(i) - w / 2}
                y={BASE - h}
                width={w}
                height={h}
                rx={mix(10, 3, toLine)}
                fill={i === 5 && anomaly > 0 ? C.red : C.amber}
                opacity={mix(0.95, 0.12, toLine) * (1 - flatten)}
              />
            );
          })}
          {/* line + area */}
          {toLine > 0 ? (
            <>
              <path d={`${d} L${bx(NB - 1)},${BASE} L${bx(0)},${BASE} Z`} fill="url(#area)" opacity={toLine * (1 - flatten)} />
              <path d={d} fill="none" stroke={C.coral} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${lineLenFrac} 1`} style={{filter: `drop-shadow(0 0 12px ${C.coral})`}} />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={9} fill={C.night} stroke={i === 5 && anomaly > 0 ? C.red : C.coral} strokeWidth={4} opacity={clamp(toLine * 12 - i) * (1 - flatten)} />
              ))}
            </>
          ) : null}
          {flatten > 0 ? (
            <line x1={mix(bx(0), 0, flatten)} y1={HORIZON_Y} x2={mix(bx(NB - 1), W, flatten)} y2={HORIZON_Y} stroke={C.coral} strokeWidth={6} style={{filter: `drop-shadow(0 0 14px ${C.coral})`}} />
          ) : null}
          {/* anomaly ring */}
          {anomaly > 0 ? (
            <g opacity={1 - flatten}>
              {[0, 1].map((k) => {
                const p = ((f - 250 + k * 20) % 40) / 40;
                return <circle key={k} cx={pts[5][0]} cy={pts[5][1]} r={14 + p * 60} fill="none" stroke={C.red} strokeWidth={3} opacity={(1 - p) * anomaly} />;
              })}
            </g>
          ) : null}
          {MONTHS.map((m, i) => (
            <text key={m} x={bx(i)} y={BASE + 42} textAnchor="middle" fill={C.mute} fontFamily="JetBrains Mono" fontSize={20} opacity={grow * (1 - flatten)}>
              {m}
            </text>
          ))}
        </svg>
        {anomaly > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: pts[5][0] + 40,
              top: pts[5][1] - 40,
              padding: '18px 26px',
              borderRadius: 18,
              background: 'rgba(21,24,35,0.95)',
              border: `2px solid ${C.red}`,
              fontFamily: F.body,
              color: C.ivory,
              transform: `scale(${anomaly})`,
              transformOrigin: 'left bottom',
              opacity: 1 - flatten,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{fontSize: 22, color: C.red, fontWeight: 800, letterSpacing: '0.1em'}}>АНОМАЛИЯ НАЙДЕНА</div>
            <div style={{fontSize: 30, fontWeight: 800, marginTop: 6}}>Июнь: +48% к тренду</div>
            <div style={{fontSize: 22, color: C.mute, marginTop: 4}}>причина — дубли заказов из одного источника</div>
          </div>
        ) : null}
      </div>
      {/* dashboard KPI cards */}
      <div style={{position: 'absolute', left: 260, right: 260, bottom: 70, display: 'flex', gap: 28, opacity: 1 - flatten}}>
        {[
          ['ВЫРУЧКА', '+24%', C.green, 'год к году'],
          ['ОТТОК', '−3,1%', C.cyan, 'после изменений'],
          ['ПРОГНОЗ Q4', '12,4 млн', C.amber, 'точность 94%'],
          ['СТРОК', '1 млн', C.violet, 'обработано за 9 с'],
        ].map(([k, v, c, s], i) => {
          const t = clamp(dash * 1.6 - i * 0.2);
          return (
            <div
              key={k}
              style={{
                flex: 1,
                padding: '24px 28px',
                borderRadius: 22,
                background: 'rgba(21,24,35,0.9)',
                border: '1px solid rgba(255,255,255,0.08)',
                transform: `translateY(${(1 - t) * 120}px)`,
                opacity: t,
                fontFamily: F.body,
              }}
            >
              <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: '0.2em', color: C.mute}}>{k}</div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 46, color: c, marginTop: 8}}>{v}</div>
              <div style={{fontSize: 20, color: C.mute, marginTop: 4}}>{s}</div>
            </div>
          );
        })}
      </div>
      <SceneTag f={f} n="02" label="ДАННЫЕ" color={C.amber} />
    </AbsoluteFill>
  );
};
