import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, TOTAL, W} from './theme';
import {Fonts} from './Fonts';
import {Grain} from './components';
import {S1Hook} from './scenes/S1Hook';
import {S2Chaos} from './scenes/S2Chaos';
import {S3Turn} from './scenes/S3Turn';
import {S4Logo} from './scenes/S4Logo';
import {S5Phone} from './scenes/S5Phone';
import {S6Swipe} from './scenes/S6Swipe';
import {S7Timer} from './scenes/S7Timer';
import {S8Dots} from './scenes/S8Dots';
import {S9Marquee} from './scenes/S9Marquee';
import {S10End} from './scenes/S10End';

// every scene starts on a beat (15 frames @ 120 BPM)
const SCENES: [number, number, React.FC<{f: number}>][] = [
  [0, 60, S1Hook],
  [60, 120, S2Chaos],
  [180, 60, S3Turn],
  [240, 60, S4Logo],
  [300, 60, S5Phone],
  [360, 60, S6Swipe],
  [420, 60, S7Timer],
  [480, 120, S8Dots],
  [600, 60, S9Marquee],
  [660, 90, S10End],
];

const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000', width: W, height: H}}>
      <Fonts />
      {SCENES.map(([from, dur, Comp], i) => (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <SceneWrap Comp={Comp} from={from} />
        </Sequence>
      ))}
      <Grain frame={frame} opacity={0.08} />
      <Audio src={staticFile('soundtrack.wav')} />
    </AbsoluteFill>
  );
};

const SceneWrap: React.FC<{Comp: React.FC<{f: number}>; from: number}> = ({Comp, from}) => {
  const frame = useCurrentFrame(); // inside Sequence => already local
  return <Comp f={frame} />;
};

export const Root: React.FC = () => (
  <Composition id="Promo" component={Promo} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
