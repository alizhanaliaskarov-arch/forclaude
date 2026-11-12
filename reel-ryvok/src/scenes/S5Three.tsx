import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeOutExpo, ip, pop, punch, shake} from '../theme';
import {Fill, Line} from '../components';

const Num: React.FC<{n: string; color: string}> = ({n, color}) => (
  <div style={{position: 'absolute', top: 290, left: 80, fontFamily: F.display, fontWeight: 900, fontSize: 96, color, letterSpacing: '-0.03em'}}>
    {n}
    <span style={{opacity: 0.45}}>/03</span>
  </div>
);

// wipe that covers the outgoing card
const Wipe: React.FC<{f: number; at: number; color: string}> = ({f, at, color}) => (
  <div style={{position: 'absolute', top: 0, left: 0, height: '100%', width: ip(f, [at - 5, at], [0, 1080], easeOutExpo), background: color}} />
);

const Target: React.FC<{f: number}> = ({f}) => {
  const HIT = 16;
  const sh = shake(f, HIT, 34, 9);
  const fly = clamp((f - 4) / (HIT - 4));
  return (
    <Fill bg={C.ink}>
      <Num n="01" color={C.yellow} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px,${sh.y}px)`}}>
        <div style={{position: 'absolute', top: 430, left: 270, width: 540, height: 540, transform: `scale(${pop(f, 0, 9) * punch(f, 0.03)})`}}>
          {[540, 390, 240, 96].map((d, i) => (
            <div
              key={d}
              style={{
                position: 'absolute',
                left: (540 - d) / 2,
                top: (540 - d) / 2,
                width: d,
                height: d,
                borderRadius: '50%',
                background: [C.white, C.blue, C.white, C.pink][i],
              }}
            />
          ))}
        </div>
        {/* arrow flies in from top-right and sticks in the centre */}
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 700,
            width: 460,
            height: 22,
            marginTop: -11,
            background: C.yellow,
            transformOrigin: '0 50%',
            transform: `translate(${(1 - fly) * 640}px, ${(1 - fly) * -640}px) rotate(-45deg)`,
            opacity: f >= 4 ? 1 : 0,
          }}
        >
          <div style={{position: 'absolute', right: -6, top: -24, width: 90, height: 70, background: C.yellow, clipPath: 'polygon(0 50%, 100% 0, 78% 50%, 100% 100%)'}} />
        </div>
        <Line top={1050} size={170} style={{transform: `scale(${1.4 - 0.4 * pop(f, HIT, 7)})`, opacity: f >= HIT ? 1 : 0}}>
          ОДНА ЦЕЛЬ.
        </Line>
      </AbsoluteFill>
    </Fill>
  );
};

const Plan: React.FC<{f: number}> = ({f}) => (
  <Fill bg={C.yellow}>
    <Num n="02" color={C.ink} />
    <div style={{position: 'absolute', top: 450, left: 120, width: 840, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 18, transform: `scale(${punch(f, 0.015)})`}}>
      {Array.from({length: 30}).map((_, i) => {
        const on = f >= 6 + i * 1.5;
        const p = pop(f, 6 + i * 1.5, 5);
        return (
          <div
            key={i}
            style={{
              height: 100,
              borderRadius: 16,
              background: on ? C.ink : 'rgba(11,11,16,.14)',
              color: C.yellow,
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${on ? 0.7 + 0.3 * p : 1})`,
            }}
          >
            {on ? i + 1 : ''}
          </div>
        );
      })}
    </div>
    <Line top={1085} size={82} color={C.ink} style={{transform: `translateY(${(1 - pop(f, 4, 7)) * 120}px)`}}>
      ПЛАН НА КАЖДЫЙ ДЕНЬ.
    </Line>
  </Fill>
);

const Bubble: React.FC<{f: number; at: number; mine?: boolean; top: number; children: React.ReactNode}> = ({f, at, mine, top, children}) => (
  <div
    style={{
      position: 'absolute',
      top,
      ...(mine ? {right: 90} : {left: 90}),
      maxWidth: 720,
      background: mine ? C.white : C.yellow,
      color: C.ink,
      fontFamily: F.cond,
      fontWeight: mine ? 500 : 700,
      fontSize: 66,
      lineHeight: '80px',
      padding: '26px 40px 30px',
      borderRadius: 40,
      ...(mine ? {borderBottomRightRadius: 8} : {borderBottomLeftRadius: 8}),
      transformOrigin: mine ? '100% 100%' : '0 100%',
      transform: `scale(${pop(f, at, 7)})`,
      boxShadow: '0 12px 0 rgba(11,11,16,.35)',
    }}
  >
    {children}
  </div>
);

const Mentor: React.FC<{f: number}> = ({f}) => (
  <Fill bg={C.blue}>
    <Num n="03" color={C.yellow} />
    <Bubble f={f} at={5} mine top={450}>
      сегодня не успею…
    </Bubble>
    <Bubble f={f} at={24} top={640}>
      Успеешь. 20 минут.
      <br />
      Жду отчёт в 21:00.
    </Bubble>
    <Line top={990} size={112} style={{transform: `translateY(${(1 - pop(f, 8, 7)) * 120}px)`, opacity: f >= 8 ? 1 : 0}}>
      ТОТ, КТО НЕ ДАСТ
    </Line>
    <Line
      top={1120}
      size={150}
      font="display"
      weight={900}
      color={C.yellow}
      spacing="-0.03em"
      style={{transform: `scale(${pop(f, 40, 8) * punch(f, 0.035)})`, opacity: f >= 40 ? 1 : 0}}
    >
      СЛИТЬСЯ.
    </Line>
  </Fill>
);

// 13–20 s: three promises — 13.0, 15.5, 17.5
export const S5Three: React.FC<{f: number}> = ({f}) => (
  <Fill bg={C.ink}>
    {f < 75 && <Target f={f} />}
    {f >= 75 && f < 135 && <Plan f={f - 75} />}
    {f >= 135 && <Mentor f={f - 135} />}
    {f < 75 && <Wipe f={f} at={75} color={C.yellow} />}
    {f >= 75 && f < 135 && <Wipe f={f} at={135} color={C.blue} />}
    {f >= 204 && <AbsoluteFill style={{background: C.ink, opacity: ip(f, [204, 210], [0, 1])}} />}
  </Fill>
);
