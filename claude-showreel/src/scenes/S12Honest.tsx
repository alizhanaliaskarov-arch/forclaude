import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeOutBack, easeOutExpo, ip} from '../theme';
import {Aurora, SceneTag} from '../components';

// 178–194 s. Honesty: "I don't know" is a valid answer. Three principles.
const ANSWER = 'Честно? Этого не знает никто — и я тоже. Но я могу показать, как оценить риски и не вложить последнее.';

export const S12Honest: React.FC<SceneProps> = ({f}) => {
  const typed = clamp((f - 90) * 1.5, 0, ANSWER.length);
  const thinking = f > 50 && f < 90;
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Aurora f={f} colors={[C.coral, C.night2, C.violet]} opacity={0.18} />
      <div style={{position: 'absolute', left: 360, top: 150, width: 1200, display: 'flex', flexDirection: 'column', gap: 26}}>
        <div style={{alignSelf: 'flex-end', maxWidth: 760, padding: '24px 34px', borderRadius: '30px 30px 6px 30px', background: C.panel, color: C.ivory, fontFamily: F.body, fontWeight: 700, fontSize: 36, transform: `scale(${ip(f, [10, 26], [0, 1], easeOutBack)})`, transformOrigin: 'right bottom'}}>
          Какой курс акций будет завтра? Хочу вложить всё.
        </div>
        <div style={{alignSelf: 'flex-start', maxWidth: 900, padding: '26px 36px', borderRadius: '30px 30px 30px 6px', background: 'rgba(232,119,79,0.12)', border: `2px solid ${C.coral}`, color: C.ivory, fontFamily: F.body, fontWeight: 600, fontSize: 38, lineHeight: 1.45, opacity: ip(f, [45, 60], [0, 1]), minHeight: 60}}>
          {thinking ? (
            <span style={{display: 'inline-flex', gap: 12}}>
              {[0, 1, 2].map((k) => (
                <span key={k} style={{width: 16, height: 16, borderRadius: 8, background: C.coral, opacity: 0.3 + 0.7 * Math.max(0, Math.sin(f / 4 - k))}} />
              ))}
            </span>
          ) : (
            ANSWER.slice(0, Math.floor(typed))
          )}
        </div>
      </div>
      <div style={{position: 'absolute', left: 360, right: 360, top: 700, display: 'flex', gap: 30}}>
        {[
          ['Честность', 'не знаю — так и скажу', C.coral],
          ['Безопасность', 'не опция, а основа', C.cyan],
          ['Ваши данные', 'остаются вашими', C.amber],
        ].map(([a, b, c], i) => {
          const t = ip(f, [230 + i * 30, 260 + i * 30], [0, 1], easeOutExpo);
          return (
            <div key={a} style={{flex: 1, padding: '30px 32px', borderRadius: 24, background: 'rgba(21,24,35,0.9)', borderTop: `5px solid ${c}`, opacity: t, transform: `translateY(${(1 - t) * 60}px)`}}>
              <svg width={54} height={54} style={{marginBottom: 10}}>
                {i === 0 ? <circle cx={27} cy={27} r={22} fill="none" stroke={c} strokeWidth={5} /> : null}
                {i === 0 ? <path d="M16,28 l8,8 l15,-17" fill="none" stroke={c} strokeWidth={5} strokeLinecap="round" /> : null}
                {i === 1 ? <path d="M27,4 L48,12 L48,28 C48,40 38,48 27,52 C16,48 6,40 6,28 L6,12 Z" fill="none" stroke={c} strokeWidth={5} strokeLinejoin="round" /> : null}
                {i === 2 ? (
                  <>
                    <rect x={9} y={24} width={36} height={26} rx={6} fill="none" stroke={c} strokeWidth={5} />
                    <path d="M17,24 V16 a10,10 0 0 1 20,0 V24" fill="none" stroke={c} strokeWidth={5} />
                  </>
                ) : null}
              </svg>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 34, color: C.ivory}}>{a}</div>
              <div style={{fontFamily: F.body, fontSize: 26, color: C.mute, marginTop: 6}}>{b}</div>
            </div>
          );
        })}
      </div>
      <SceneTag f={f} n="09" label="ЧЕСТНОСТЬ" color={C.coral} />
    </AbsoluteFill>
  );
};
