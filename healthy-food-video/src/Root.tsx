import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Captions, FontLoader, SceneProps, fadeIn} from './fx';
import {FPS, H, TL, W} from './theme';
import {S1Intro} from './scenes/S1Intro';
import {S2Produce} from './scenes/S2Produce';
import {S3Plate} from './scenes/S3Plate';
import {S4Meals} from './scenes/S4Meals';
import {S5Water} from './scenes/S5Water';
import {S6Together} from './scenes/S6Together';
import {S7Habits} from './scenes/S7Habits';
import {S8Outro} from './scenes/S8Outro';

const COMPS: Record<string, React.FC<SceneProps>> = {
  intro: S1Intro,
  produce: S2Produce,
  plate: S3Plate,
  meals: S4Meals,
  water: S5Water,
  together: S6Together,
  habits: S7Habits,
  outro: S8Outro,
};
const XF = 24; // crossfade between scenes, in 30 fps frames

type Props = {captions: boolean; audio: string; fps: number};

// Scenes are animated in 30 fps "story frames"; at 60 fps they simply get fractional frames,
// so every movement is the same speed, just twice as smooth.
const SceneWrap: React.FC<{Comp: React.FC<SceneProps>; pre: number; dur: number; rate: number}> = ({Comp, pre, dur, rate}) => {
  const f = useCurrentFrame() / rate - pre;
  return (
    <AbsoluteFill style={{opacity: pre ? fadeIn(f, XF) : 1}}>
      <Comp f={f} dur={dur} />
    </AbsoluteFill>
  );
};

const Video: React.FC<Props> = ({captions, audio, fps}) => {
  const frame = useCurrentFrame();
  const rate = fps / FPS;
  return (
    <AbsoluteFill style={{background: '#FBF6EC'}}>
      <FontLoader />
      {TL.scenes.map((s, i) => {
        const from = Math.round(s.start * FPS);
        const to = Math.round(s.end * FPS);
        const pre = i === 0 ? 0 : XF;
        const post = i === TL.scenes.length - 1 ? 0 : XF;
        return (
          <Sequence key={s.id} from={Math.round((from - pre) * rate)} durationInFrames={Math.round((to - from + pre + post) * rate)} name={s.id}>
            <SceneWrap Comp={COMPS[s.id]} pre={pre} dur={to - from} rate={rate} />
          </Sequence>
        );
      })}
      {captions && <Captions t={frame / fps} />}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};

const frames = (fps: number) => Math.ceil(TL.total * fps);
const comp = (id: string, fps: number, captions: boolean, audio = 'soundtrack_master.wav') => (
  <Composition id={id} component={Video} durationInFrames={frames(fps)} fps={fps} width={W} height={H} defaultProps={{captions, audio, fps}} />
);

export const Root: React.FC = () => (
  <>
    {/* 1920x1080 compositions; render with --scale=2 for 3840x2160 */}
    {comp('HealthyFood', 30, true)}
    {comp('HealthyFood60', 60, false)}
    {comp('HealthyFood60Subs', 60, true)}
    {comp('HealthyFoodMusicOnly', 30, false, 'music.wav')}
  </>
);
