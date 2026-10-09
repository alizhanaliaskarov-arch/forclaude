import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, F, clamp, easeOutBack, easeOutExpo, ip, punch} from '../theme';
import {PHONE_H, PHONE_W, Phone} from '../components';

export const PhoneUI: React.FC<{hidden?: number; title?: string; sub?: string; btn?: string}> = ({
  hidden = 46,
  title = 'ОТПРАВИТЬ ОТЧЁТ',
  sub = 'до 18:00',
  btn = 'ГОТОВО',
}) => (
  <div style={{position: 'absolute', inset: 0, padding: '96px 38px 40px', display: 'flex', flexDirection: 'column'}}>
    <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 25, color: C.orange, letterSpacing: '0.12em'}}>● СЕЙЧАС</div>
    <div
      style={{
        marginTop: 34,
        fontFamily: F.cond,
        fontWeight: 700,
        fontSize: 98,
        lineHeight: '98px',
        color: C.ink,
        textTransform: 'uppercase',
        flex: 1,
      }}
    >
      {title.split(' ').map((w, i) => (
        <div key={i}>{w}</div>
      ))}
      <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 32, lineHeight: '50px', color: '#555', marginTop: 20}}>{sub}</div>
    </div>
    <div
      style={{
        background: C.orange,
        borderRadius: 40,
        height: 128,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.display,
        fontWeight: 900,
        fontSize: 40,
        color: C.ink,
      }}
    >
      {btn}
    </div>
    <div style={{textAlign: 'center', marginTop: 26, fontFamily: F.mono, fontWeight: 500, fontSize: 24, color: '#777'}}>
      ещё {hidden} — спрятаны
    </div>
  </div>
);

// 10-12s: 3D phone rises; "ОДНА ЗАДАЧА."
export const S5Phone: React.FC<{f: number}> = ({f}) => {
  const rise = easeOutExpo(clamp(f / 22));
  const ty = (1 - rise) * 1500;
  const ry = -34 + 26 * easeOutExpo(clamp(f / 40)) + f * 0.12;
  const rx = 18 - 12 * easeOutExpo(clamp(f / 40));
  const rz = -6 + 6 * easeOutExpo(clamp(f / 30));
  const t1 = easeOutBack(clamp((f - 6) / 8));
  const t2 = clamp((f - 36) / 8);
  const cam = punch(f, 0.035, 4);
  const bump = punch(f + 7, 0.03, 4);

  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${cam})`}}>
        {/* giant outlined 1 */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            top: 330,
            textAlign: 'center',
            fontFamily: F.display,
            fontWeight: 900,
            fontSize: 1500,
            lineHeight: '1500px',
            color: 'transparent',
            WebkitTextStroke: `4px rgba(243,238,227,0.18)`,
            transform: `translateX(${(f - 30) * -2}px)`,
          }}
        >
          1
        </div>
        {/* orange halo */}
        <div
          style={{
            position: 'absolute',
            left: 540 - 430,
            top: 985 - 430,
            width: 860,
            height: 860,
            borderRadius: '50%',
            background: C.orange,
            transform: `scale(${(0.2 + 0.8 * easeOutExpo(clamp(f / 18))) * bump})`,
            opacity: 0.95,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 300,
            width: '100%',
            textAlign: 'center',
            fontFamily: F.cond,
            fontWeight: 700,
            fontSize: 138,
            lineHeight: '150px',
            whiteSpace: 'nowrap',
            color: C.cream,
            letterSpacing: '0.01em',
            transform: `scale(${0.6 + 0.4 * t1})`,
            opacity: f >= 6 ? 1 : 0,
          }}
        >
          ОДНА <span style={{color: C.orange}}>ЗАДАЧА.</span>
        </div>
        <div style={{position: 'absolute', left: 540 - PHONE_W / 2, top: 985 - PHONE_H / 2, perspective: 2600}}>
          <div
            style={{
              transform: `translateY(${ty}px) rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(1.0)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <Phone>
              <PhoneUI />
            </Phone>
          </div>
        </div>
        {/* floating callouts */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 930,
            transform: `translateX(${(1 - t2) * -300}px) rotate(-6deg)`,
            opacity: t2,
            fontFamily: F.mono,
            fontWeight: 800,
            fontSize: 34,
            background: C.cream,
            color: C.ink,
            padding: '14px 26px',
            borderRadius: 999,
          }}
        >
          46 — спрятаны
        </div>
        <div
          style={{
            position: 'absolute',
            right: 40,
            top: 1130,
            transform: `translateX(${(1 - t2) * 300}px) rotate(5deg)`,
            opacity: t2,
            fontFamily: F.mono,
            fontWeight: 800,
            fontSize: 34,
            background: C.lime,
            color: C.ink,
            padding: '14px 26px',
            borderRadius: 999,
          }}
        >
          ноль шума
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
