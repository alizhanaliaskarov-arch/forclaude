import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, easeOutExpo, ip, mix, rnd} from '../theme';
import {SceneTag} from '../components';

// 90–108 s. One idea, rewritten in four genres; a tone slider glides from strict to bold.
const STYLES: {tab: string; font: string; size: number; lines: string[]; italic?: boolean; align?: 'left' | 'center'}[] = [
  {
    tab: 'Письмо',
    font: F.body,
    size: 40,
    lines: ['Уважаемая Анна Сергеевна!', 'Подтверждаем запуск проекта 1 ноября.', 'Все материалы — во вложении.', 'С уважением, команда'],
  },
  {
    tab: 'Стихи',
    font: "'Georgia', 'DejaVu Serif', serif",
    size: 46,
    italic: true,
    align: 'center',
    lines: ['Ноябрь откроет новую страницу,', 'и наш проект взлетит, как птица.', 'Всё собрано, всё в срок, всё в такт —', 'осталось только сделать шаг.'],
  },
  {
    tab: 'Сценарий',
    font: F.mono,
    size: 34,
    lines: ['ИНТ. ОФИС — УТРО', 'АННА (смотрит на часы)', '— Первое ноября. Мы успели?', 'КОМАНДА (хором): — Успели.'],
  },
  {
    tab: 'Тост',
    font: F.display,
    size: 40,
    align: 'center',
    lines: ['Друзья!', 'За тех, кто довёл проект до запуска', 'и не потерял чувство юмора.', 'За первое ноября!'],
  },
];
const PER = 112;
const GLYPHS = 'абвгдежзиклмнопрстуфхцчшщэюя#%&*';

const scramble = (s: string, t: number, seed: number) =>
  Array.from(s)
    .map((ch, i) => (ch === ' ' || rnd(i * 7.3 + seed) < t ? ch : GLYPHS[Math.floor(rnd(i * 3.1 + seed + t * 40) * GLYPHS.length)]))
    .join('');

export const S07Writing: React.FC<SceneProps> = ({f, dur}) => {
  const i = clamp(Math.floor((f - 10) / PER), 0, STYLES.length - 1);
  const lf = f - 10 - i * PER;
  const st = STYLES[i];
  const reveal = clamp(lf / 26);
  const tone = ip(f, [40, dur - 60], [0, 1], easeInOut);
  const words = ['строгий', 'тёплый', 'дерзкий'];
  const pen = ip(lf, [0, 60], [0, 1]);
  return (
    <AbsoluteFill style={{background: C.paper, color: '#1E1B16'}}>
      {/* paper texture lines */}
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.35}}>
        {Array.from({length: 30}).map((_, k) => (
          <line key={k} x1={0} y1={k * 40} x2={1920} y2={k * 40} stroke="#E8DFD0" />
        ))}
      </svg>
      {/* tabs */}
      <div style={{position: 'absolute', left: 360, top: 150, display: 'flex', gap: 14}}>
        {STYLES.map((s, k) => (
          <div
            key={s.tab}
            style={{
              padding: '14px 30px',
              borderRadius: 999,
              fontFamily: F.body,
              fontWeight: 800,
              fontSize: 28,
              background: k === i ? '#1E1B16' : 'transparent',
              color: k === i ? C.paper : '#7C7466',
              border: '2px solid #1E1B16',
              opacity: ip(f, [k * 6, k * 6 + 14], [0, 1]),
            }}
          >
            {s.tab}
          </div>
        ))}
      </div>
      {/* the page */}
      <div
        style={{
          position: 'absolute',
          left: 360,
          top: 250,
          width: 1200,
          height: 520,
          borderRadius: 28,
          background: '#FFFFFF',
          boxShadow: '0 30px 80px rgba(60,40,10,0.15)',
          padding: '56px 72px',
          boxSizing: 'border-box',
          transform: `rotate(${mix(-0.6, 0.4, i / 3)}deg) translateY(${ip(f, [0, 24], [80, 0], easeOutExpo)}px)`,
          opacity: ip(f, [0, 16], [0, 1]),
        }}
      >
        {st.lines.map((ln, k) => {
          const t = clamp(reveal * 1.8 - k * 0.25);
          return (
            <div
              key={k}
              style={{
                fontFamily: st.font,
                fontStyle: st.italic ? 'italic' : 'normal',
                fontSize: st.size,
                fontWeight: st.font === F.display ? 700 : st.font === F.mono ? 500 : k === 0 ? 800 : 500,
                lineHeight: 1.6,
                textAlign: st.align ?? 'left',
                opacity: 0.25 + 0.75 * t,
                color: k === 0 && st.tab === 'Сценарий' ? C.coralDeep : '#1E1B16',
              }}
            >
              {t >= 1 ? ln : scramble(ln, t, k + i * 10)}
            </div>
          );
        })}
        {/* pen underline flourish */}
        <svg width={1060} height={40} style={{position: 'absolute', left: 70, bottom: 40}}>
          <path d="M0,20 C200,0 400,40 600,18 S900,8 1050,22" fill="none" stroke={C.coral} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={`${pen} 1`} />
        </svg>
      </div>
      {/* tone slider */}
      <div style={{position: 'absolute', left: 360, top: 830, width: 1200}}>
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.2em', color: '#7C7466', marginBottom: 18}}>ТОН</div>
        <div style={{position: 'relative', height: 10, borderRadius: 5, background: '#E8DFD0'}}>
          <div style={{position: 'absolute', left: 0, top: 0, height: 10, width: `${tone * 100}%`, borderRadius: 5, background: `linear-gradient(90deg, ${C.blue}, ${C.amber}, ${C.coral})`}} />
          <div style={{position: 'absolute', left: `${tone * 100}%`, top: -15, width: 40, height: 40, marginLeft: -20, borderRadius: 20, background: '#1E1B16', boxShadow: '0 6px 16px rgba(0,0,0,0.25)'}} />
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 22, fontFamily: F.body, fontWeight: 800, fontSize: 28}}>
          {words.map((w, k) => (
            <span key={w} style={{color: Math.abs(tone * 2 - k) < 0.5 ? '#1E1B16' : '#B5AC9C'}}>{w}</span>
          ))}
        </div>
      </div>
      <SceneTag f={f} n="04" label="ТЕКСТЫ" dark color={C.coralDeep} />
    </AbsoluteFill>
  );
};
