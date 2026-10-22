import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, easeOutExpo, ip} from '../theme';
import {Kinetic} from '../components';
import {S02Bang} from './S02Bang';
import {S03Manifesto} from './S03Manifesto';
import {S04Code} from './S04Code';
import {S05Data} from './S05Data';
import {S06Languages} from './S06Languages';
import {S07Writing} from './S07Writing';
import {S08Science} from './S08Science';
import {S09Design} from './S09Design';
import {S10Agents} from './S10Agents';
import {S11Teach} from './S11Teach';
import {S12Honest} from './S12Honest';

// 222–246 s. The drop: a beat-cut recap of everything so far — 12 one-second cuts, then 20 half-second cuts.
type Clip = [React.FC<SceneProps>, number, string, number];
const A: Clip[] = [
  [S04Code, 440, 'КОД', 600],
  [S05Data, 290, 'ДАННЫЕ', 540],
  [S06Languages, 330, 'ЯЗЫКИ', 540],
  [S07Writing, 150, 'ТЕКСТЫ', 540],
  [S08Science, 300, 'НАУКА', 540],
  [S09Design, 260, 'ДИЗАЙН', 540],
  [S10Agents, 300, 'АГЕНТЫ', 540],
  [S11Teach, 200, 'ОБЪЯСНЯЮ', 480],
  [S12Honest, 330, 'ЧЕСТНО', 480],
  [S03Manifesto, 245, 'МУЗЫКА', 480],
  [S02Bang, 60, 'ИДЕИ', 300],
  [S04Code, 520, 'ГОТОВО', 600],
];
const B: Clip[] = [
  [S06Languages, 200, '', 540],
  [S05Data, 350, '', 540],
  [S09Design, 420, '', 540],
  [S08Science, 120, '', 540],
  [S03Manifesto, 5, '', 480],
  [S10Agents, 200, '', 540],
  [S07Writing, 360, '', 540],
  [S04Code, 300, '', 600],
  [S11Teach, 380, '', 480],
  [S03Manifesto, 125, '', 480],
  [S06Languages, 420, '', 540],
  [S09Design, 160, '', 540],
  [S05Data, 260, '', 540],
  [S12Honest, 120, '', 480],
  [S08Science, 400, '', 540],
  [S03Manifesto, 185, '', 480],
  [S10Agents, 400, '', 540],
  [S02Bang, 200, '', 300],
  [S07Writing, 250, '', 540],
  [S03Manifesto, 425, '', 480],
];

export const S14Montage: React.FC<SceneProps> = ({f}) => {
  let clip: Clip | null = null;
  let lf = 0;
  let idx = 0;
  if (f < 360) {
    idx = Math.floor(f / 30);
    clip = A[Math.min(idx, A.length - 1)];
    lf = f - idx * 30;
  } else if (f < 660) {
    idx = Math.floor((f - 360) / 15);
    clip = B[Math.min(idx, B.length - 1)];
    lf = f - 360 - idx * 15;
  }
  if (!clip) {
    return (
      <AbsoluteFill style={{background: C.night, alignItems: 'center', justifyContent: 'center'}}>
        <Kinetic text="И это только начало." f={f - 660} size={110} weight={800} stagger={1} />
      </AbsoluteFill>
    );
  }
  const [Comp, at, word, dur] = clip;
  const punch = 1.12 - 0.12 * ip(lf, [0, 10], [0, 1], easeOutExpo);
  const split = ip(lf, [0, 6], [14, 0]);
  const tilt = ((idx % 2) * 2 - 1) * ip(lf, [0, 8], [1.5, 0]);
  return (
    <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${punch}) rotate(${tilt}deg)`}}>
        <Comp f={at + lf * 2} dur={dur} />
      </AbsoluteFill>
      {/* chromatic split on the cut */}
      {split > 0.5 ? (
        <>
          <AbsoluteFill style={{background: C.red, mixBlendMode: 'screen', opacity: 0.18, transform: `translateX(${split}px)`}} />
          <AbsoluteFill style={{background: C.cyan, mixBlendMode: 'screen', opacity: 0.18, transform: `translateX(${-split}px)`}} />
        </>
      ) : null}
      {word ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(7,8,12,0.35)'}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 210, color: C.ivory, letterSpacing: '-0.03em', transform: `scale(${1.3 - 0.3 * ip(lf, [0, 8], [0, 1], easeOutExpo)})`, textShadow: `6px 0 0 ${C.red}88, -6px 0 0 ${C.cyan}88`}}>
            {word}
          </div>
        </AbsoluteFill>
      ) : null}
      {/* beat counter */}
      <div style={{position: 'absolute', right: 80, bottom: 70, fontFamily: F.mono, fontWeight: 800, fontSize: 30, color: C.ivory, opacity: 0.8}}>
        {String((f < 360 ? idx : 12 + idx) + 1).padStart(2, '0')}
      </div>
    </AbsoluteFill>
  );
};
