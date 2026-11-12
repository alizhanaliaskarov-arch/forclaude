import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, TOTAL, W} from './theme';
import {Fonts} from './Fonts';
import {Grain, Subtitles} from './components';
import {S1Hook} from './scenes/S1Hook';
import {S2Year} from './scenes/S2Year';
import {S3System} from './scenes/S3System';
import {S4Logo} from './scenes/S4Logo';
import {S5Three} from './scenes/S5Three';
import {S6Today} from './scenes/S6Today';
import {S7End} from './scenes/S7End';

// [from, duration, scene] — every cut sits on the 120 BPM grid (15 frames per beat)
const SCENES: [number, number, React.FC<{f: number}>][] = [
  [0, 75, S1Hook],
  [75, 135, S2Year],
  [210, 90, S3System],
  [300, 90, S4Logo],
  [390, 210, S5Three],
  [600, 90, S6Today],
  [690, 120, S7End],
];

const SceneWrap: React.FC<{Comp: React.FC<{f: number}>}> = ({Comp}) => <Comp f={useCurrentFrame()} />;

const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000', width: W, height: H}}>
      <Fonts />
      {SCENES.map(([from, dur, Comp], i) => (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <SceneWrap Comp={Comp} />
        </Sequence>
      ))}
      <Subtitles frame={frame} />
      <Grain frame={frame} opacity={0.07} />
      <Audio src={staticFile('soundtrack_vo.wav')} />
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <Composition id="Reel" component={Reel} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
