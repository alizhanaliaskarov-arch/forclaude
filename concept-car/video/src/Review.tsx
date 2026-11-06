import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {Fonts} from './Fonts';
import {FPS, ramp, SCENE_IDS, SCENES, smooth} from './data';
import {SCENE_COMPONENTS} from './scenes';
import {ChapterHeader, Credits, Grain, Letterbox, Subtitles, Vignette} from './ui';

const PAD = 0.3; // half of the cross-dissolve between scenes, s

export const Review: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Fonts />
      {SCENE_IDS.map((id) => {
        const {start, end} = SCENES[id];
        if (T < start - PAD || T > end + PAD) return null;
        const t = T - start;
        const Scene = SCENE_COMPONENTS[id];
        return (
          <AbsoluteFill key={id} style={{opacity: id === 'intro' ? 1 : smooth(ramp(t, -PAD, PAD))}}>
            <Scene t={t} len={end - start} />
          </AbsoluteFill>
        );
      })}
      <Vignette />
      <Grain />
      <Letterbox />
      <ChapterHeader />
      <Subtitles />
      <Credits />
      <Audio src={staticFile('soundtrack_vo.wav')} />
    </AbsoluteFill>
  );
};
