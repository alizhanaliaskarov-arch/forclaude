import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeOutExpo, ip, rnd} from '../theme';
import {Aurora, Kinetic} from '../components';

// 246–270 s. "What will you create?" Prompts type and erase in one input; past ideas drift by in depth.
const PROMPTS = [
  'Составь бизнес-план кофейни к утру',
  'Помоги подготовиться к экзамену',
  'Напиши песню на мамин юбилей',
  'Найди ошибку в моём коде',
  'Спланируй поездку в Самарканд',
  'Объясни квантовую физику на пальцах',
];
const PER = 90;
const FLOAT = ['резюме', 'стартап', 'диплом', 'сказка на ночь', 'бюджет семьи', 'сайт', 'игра', 'перевод', 'тренировки', 'рецепт', 'подкаст', 'исследование', 'презентация', 'письмо', 'расписание', 'логотип'];

export const S15You: React.FC<SceneProps> = ({f}) => {
  const p0 = 150;
  const i = clamp(Math.floor((f - p0) / PER), 0, PROMPTS.length - 1);
  const lf = f - p0 - i * PER;
  const s = PROMPTS[i];
  const typeN = clamp(Math.floor(lf * 1.4), 0, s.length);
  const eraseN = i < PROMPTS.length - 1 ? clamp(Math.floor((lf - 66) * 3), 0, s.length) : 0;
  const shown = f < p0 ? '' : s.slice(0, Math.max(0, typeN - eraseN));
  const box = ip(f, [100, 130], [0, 1], easeOutExpo);
  const send = i === PROMPTS.length - 1 && lf > 60 ? ip(lf, [60, 70], [0, 1]) : 0;
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Aurora f={f} colors={[C.coral, C.amber, C.violet]} opacity={0.35} />
      {/* floating ideas in depth */}
      {FLOAT.map((w, k) => {
        const z = ((rnd(k) + f / 600) % 1);
        const sc = 0.4 + z * 1.6;
        const x = W / 2 + (rnd(k * 3) < 0.5 ? -1 : 1) * (380 + rnd(k * 5) * 700) * z * 1.4;
        const y = H / 2 + (rnd(k * 7) - 0.5) * 1300 * z;
        return (
          <div key={w} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${sc})`, opacity: Math.sin(z * Math.PI) * 0.32, padding: '12px 26px', borderRadius: 999, border: '1.5px solid rgba(244,239,230,0.35)', color: C.ivory, fontFamily: F.body, fontWeight: 700, fontSize: 28, whiteSpace: 'nowrap', filter: `blur(${Math.abs(z - 0.5) * 4}px)`}}>
            {w}
          </div>
        );
      })}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `translateY(${-140 * box}px)`}}>
          <Kinetic text="А что создадите вы?" f={f - 10} size={104} weight={800} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 560,
            width: 1240,
            padding: '34px 40px',
            borderRadius: 34,
            background: 'rgba(21,24,35,0.95)',
            border: `2px solid ${send > 0 ? C.coral : 'rgba(255,255,255,0.12)'}`,
            boxShadow: `0 30px 90px rgba(0,0,0,0.5), 0 0 ${60 * send}px ${C.coral}`,
            display: 'flex',
            alignItems: 'center',
            opacity: box,
            transform: `scale(${0.9 + 0.1 * box})`,
          }}
        >
          <div style={{flex: 1, fontFamily: F.body, fontWeight: 600, fontSize: 42, color: shown ? C.ivory : C.mute, minHeight: 58}}>
            {shown || 'Напишите что угодно…'}
            <span style={{display: 'inline-block', width: 4, height: 44, marginLeft: 6, background: C.coral, verticalAlign: 'middle', opacity: Math.floor(f / 12) % 2 ? 1 : 0.2}} />
          </div>
          <div style={{width: 76, height: 76, borderRadius: 24, background: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.2 * Math.sin(send * Math.PI)})`}}>
            <svg width={36} height={36}>
              <path d="M18,30 V6 M7,16 L18,5 L29,16" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div style={{position: 'absolute', top: 760, fontFamily: F.mono, fontSize: 24, color: C.mute, letterSpacing: '0.2em', opacity: ip(f, [560, 600], [0, 1])}}>
          Я — ИНСТРУМЕНТ. ИДЕЯ — ВАША.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
