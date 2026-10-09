import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BEAT, C, F, clamp, easeInExpo, easeInOut, easeOutBack, easeOutExpo, ip, punch} from '../theme';

const COLS = 7;
const GAP = 108;
const CX = 540;
const CY = 975;
// 47 of the 49 grid cells, removal order = farthest from centre first
const cells: {x: number; y: number; d: number}[] = [];
for (let r = 0; r < 7; r++)
  for (let c = 0; c < COLS; c++) {
    const x = (c - 3) * GAP;
    const y = (r - 3) * GAP;
    cells.push({x, y, d: Math.hypot(x, y) + (((r * 7 + c) * 37) % 11) * 0.7});
  }
cells.sort((a, b) => b.d - a.d);
const grid = cells.slice(2); // drop the two farthest corners -> 47, still ordered far->near (index 46 = centre)

const COUNTS = [47, 32, 19, 10, 5, 2, 1, 1]; // per beat
const LINES = ['', 'БЕЗ СПИСКОВ.', 'БЕЗ СПИСКОВ.', 'БЕЗ ВИНЫ.', 'БЕЗ ВИНЫ.', 'БЕЗ ХАОСА.', 'БЕЗ ХАОСА.', ''];

// 16-20s: 47 dots collapse into 1. Shape play + three-beat mantra.
export const S8Dots: React.FC<{f: number}> = ({f}) => {
  const b = Math.min(7, Math.floor(f / BEAT));
  const cnt = COUNTS[b];
  const cam = punch(f, 0.04, 4) * (1 + ip(f, [0, 120], [0, 0.05]));
  const finalGrow = easeInExpo(clamp((f - 100) / 20));

  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
        {/* counter */}
        <div style={{position: 'absolute', top: 270, width: '100%', textAlign: 'center'}}>
          <div style={{fontFamily: F.mono, fontWeight: 800, fontSize: 34, color: C.grey, letterSpacing: '0.2em'}}>ЗАДАЧ ОСТАЛОСЬ</div>
          <div
            style={{
              fontFamily: F.display,
              fontWeight: 900,
              fontSize: 250,
              lineHeight: '270px',
              color: C.ink,
              letterSpacing: '-0.05em',
              transform: `scale(${1 + 0.12 * Math.exp(-(f % BEAT) / 3)})`,
            }}
          >
            {f < BEAT ? 47 : cnt}
          </div>
        </div>

        {grid.map((g, i) => {
          // dot i leaves at beat L(i): the first (COUNTS[0]-COUNTS[1]) leave at beat 1, etc
          let leave = 99;
          for (let k = 1; k < COUNTS.length; k++) {
            if (i < 47 - COUNTS[k]) {
              leave = k;
              break;
            }
          }
          const lf = f - leave * BEAT;
          const t = clamp(lf / 10);
          const isLast = i === 46;
          const wob = Math.sin(f * 0.18 + i * 0.7) * 6 * (1 - clamp(f / 100));
          const e = easeInExpo(t);
          const x = CX + g.x * (1 - e) + wob * 0.5;
          const y = CY + g.y * (1 - e) + wob;
          const r = (isLast ? 42 : 33) * (1 - e * 0.85) * (1 + (isLast ? finalGrow * 40 : 0));
          if (!isLast && lf > 12) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x - r,
                top: y - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                background: isLast && f >= 6 * BEAT ? C.orange : C.ink,
                opacity: !isLast ? 1 - t * 0.5 : 1,
              }}
            />
          );
        })}

        {/* mantra */}
        {f >= BEAT && f < 7 * BEAT && (
          <div style={{position: 'absolute', top: 1345, width: '100%', textAlign: 'center'}}>
            <div style={{height: 150, overflow: 'hidden'}}>
              <div
                key={LINES[b]}
                style={{
                  fontFamily: F.cond,
                  fontWeight: 700,
                  fontSize: 150,
                  lineHeight: '150px',
                  color: C.ink,
                  letterSpacing: '0.02em',
                  transform: `translateY(${(1 - easeOutBack(clamp(((f % (2 * BEAT)) % (2 * BEAT)) / 6))) * 170}px)`,
                }}
              >
                {LINES[b].split(' ')[0]} <span style={{color: C.orange}}>{LINES[b].split(' ')[1]}</span>
              </div>
            </div>
          </div>
        )}
      </AbsoluteFill>
      {f < 9 && (
        <AbsoluteFill
          style={{
            background: C.ink,
            WebkitMaskImage: `radial-gradient(circle at 540px 1010px, transparent ${easeInExpo(clamp(f / 8)) * 1400}px, #000 ${easeInExpo(clamp(f / 8)) * 1400 + 2}px)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
