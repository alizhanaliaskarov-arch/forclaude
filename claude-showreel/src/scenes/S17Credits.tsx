import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, easeOutExpo, ip} from '../theme';
import {STATS} from '../stats';

// 290–300 s. End card: who made what. Honest credits, including the open-source voice.
const ROWS: [string, string][] = [
  ['Сценарий', 'Claude'],
  ['Анимация и монтаж', 'Claude · React + Remotion'],
  ['Музыка и звук', 'Claude · синтез на numpy'],
  ['Голос', 'RHVoice «Александр» · CC BY-SA 4.0 · А. Карлов'],
];

export const S17Credits: React.FC<SceneProps> = ({f, dur}) => {
  const out = ip(f, [dur - 50, dur - 5], [1, 0]);
  return (
    <AbsoluteFill style={{background: C.night, alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.coral, marginBottom: 40, opacity: ip(f, [0, 20], [0, 1])}}>
        ЭТОТ РОЛИК ЦЕЛИКОМ НАПИСАН КОДОМ
      </div>
      {ROWS.map(([a, b], i) => {
        const t = ip(f, [10 + i * 10, 30 + i * 10], [0, 1], easeOutExpo);
        return (
          <div key={a} style={{display: 'flex', gap: 30, width: 1300, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', opacity: t, transform: `translateY(${(1 - t) * 20}px)`, fontFamily: F.body, fontSize: 32}}>
            <span style={{width: 380, color: C.mute, fontWeight: 600}}>{a}</span>
            <span style={{color: C.ivory, fontWeight: 800}}>{b}</span>
          </div>
        );
      })}
      <div style={{marginTop: 40, fontFamily: F.mono, fontSize: 22, color: C.mute, opacity: ip(f, [60, 80], [0, 1])}}>
        {STATS.lines.toLocaleString('ru-RU')} строк кода · {STATS.frames.toLocaleString('ru-RU')} кадров · 0 камер · 0 стоков
      </div>
    </AbsoluteFill>
  );
};
