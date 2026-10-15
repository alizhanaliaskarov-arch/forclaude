import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, H, TOTAL, W, clamp, easeInOut, ip} from './theme';
import {Fonts} from './Fonts';
import {Captions, IkatWipe} from './components';
import {CUES} from './cues';
import {S01Hook} from './scenes/S01Hook';
import {S02Globe} from './scenes/S02Globe';
import {S03Numbers} from './scenes/S03Numbers';
import {S04SilkRoad} from './scenes/S04SilkRoad';
import {S05Scholars} from './scenes/S05Scholars';
import {S06Babur} from './scenes/S06Babur';
import {S07Registan} from './scenes/S07Registan';
import {S08Plov} from './scenes/S08Plov';
import {S09Tea} from './scenes/S09Tea';
import {S10Ikat} from './scenes/S10Ikat';
import {S11Nature} from './scenes/S11Nature';
import {S12Aral} from './scenes/S12Aral';
import {S13Metro} from './scenes/S13Metro';
import {S14Myths} from './scenes/S14Myths';
import {S15Quiz} from './scenes/S15Quiz';
import {S16Final} from './scenes/S16Final';

export type SceneProps = {f: number; dur: number};

type Enter = 'fade' | 'whip' | 'irisOpen' | null;
type Exit = 'whip' | 'irisClose' | null;
type Row = {
  from: number;
  dur: number;
  Comp: React.FC<SceneProps>;
  pre?: number; // frames rendered before nominal start (transition in)
  post?: number; // frames rendered after nominal end (transition out)
  enter?: Enter;
  exit?: Exit;
  z?: number;
};

const s = (x: number) => Math.round(x * FPS);

const SCENES: Row[] = [
  {from: s(0), dur: s(5), Comp: S01Hook},
  {from: s(5), dur: s(7), Comp: S02Globe},
  {from: s(12), dur: s(10), Comp: S03Numbers},
  {from: s(22), dur: s(14), Comp: S04SilkRoad, pre: 20, enter: 'fade'},
  {from: s(36), dur: s(15), Comp: S05Scholars},
  {from: s(51), dur: s(10), Comp: S06Babur},
  {from: s(61), dur: s(13), Comp: S07Registan},
  {from: s(74), dur: s(14), Comp: S08Plov, pre: 24, enter: 'fade'},
  {from: s(88), dur: s(10), Comp: S09Tea},
  {from: s(98), dur: s(12), Comp: S10Ikat, post: 6, exit: 'whip'},
  {from: s(110), dur: s(9), Comp: S11Nature, pre: 6, enter: 'whip'},
  {from: s(119), dur: s(15), Comp: S12Aral},
  {from: s(134), dur: s(13), Comp: S13Metro},
  {from: s(147), dur: s(12), Comp: S14Myths, exit: 'irisClose', z: 50},
  {from: s(159), dur: s(12), Comp: S15Quiz, pre: 12},
  {from: s(171), dur: s(9), Comp: S16Final, pre: 15, enter: 'irisOpen', z: 60},
];

const WHIP = 6;

const SceneWrap: React.FC<{row: Row}> = ({row}) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const pre = row.pre ?? 0;
  const f = frame - pre; // 0 = nominal scene start
  const {dur} = row;
  const style: React.CSSProperties = {};
  let clip: string | undefined;

  if (row.enter === 'fade') style.opacity = ip(f, [-pre, 0], [0, 1], easeInOut);
  if (row.enter === 'whip') {
    const t = clamp((f + WHIP) / (2 * WHIP));
    style.transform = `translateX(${(1 - easeInOut(t)) * W}px)`;
    style.filter = `blur(${Math.sin(Math.PI * t) * 26}px)`;
  }
  if (row.exit === 'whip') {
    const t = clamp((f - (dur - WHIP)) / (2 * WHIP));
    if (t > 0) {
      style.transform = `translateX(${-easeInOut(t) * W}px)`;
      style.filter = `blur(${Math.sin(Math.PI * t) * 26}px)`;
    }
  }
  if (row.enter === 'irisOpen') {
    const r = ip(f, [-pre, 0], [0, Math.hypot(W, H) / 2 + 10], easeInOut);
    clip = `circle(${r}px at 50% 50%)`;
  }
  if (row.exit === 'irisClose') {
    const r = ip(f, [dur - 12, dur], [Math.hypot(W, H) / 2 + 10, 0], easeInOut);
    clip = `circle(${r}px at 50% 50%)`;
  }
  return (
    <AbsoluteFill style={{...style, clipPath: clip, overflow: 'hidden', zIndex: row.z ?? 1}}>
      <row.Comp f={f} dur={dur} />
    </AbsoluteFill>
  );
};

/** Steam that rises over the cut between Registan and plov. */
const Steam: React.FC<{f: number}> = ({f}) => {
  if (f < -30 || f > 24) return null;
  const t = (f + 30) / 54;
  return (
    <AbsoluteFill style={{zIndex: 800, pointerEvents: 'none'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <filter id="steam-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={40} />
          </filter>
        </defs>
        <g filter="url(#steam-blur)" opacity={Math.sin(Math.PI * t) * 0.95}>
          {Array.from({length: 14}).map((_, i) => {
            const x = (i / 13) * W;
            const y = H + 200 - t * (H + 700) - (i % 3) * 140;
            return <ellipse key={i} cx={x + Math.sin(t * 5 + i) * 60} cy={y} rx={260} ry={340} fill="#fff" />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{f: number; color: string; inF?: number; outF?: number}> = ({f, color, inF = 4, outF = 14}) => {
  if (f < -inF || f > outF) return null;
  const o = f < 0 ? 1 + f / inF : 1 - f / outF;
  return <AbsoluteFill style={{background: color, opacity: o, zIndex: 850}} />;
};

const Video: React.FC<{captions: boolean}> = ({captions}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.paper, width: W, height: H}}>
      <Fonts />
      {SCENES.map((row, i) => {
        const pre = row.pre ?? 0;
        const post = row.post ?? 0;
        return (
          <Sequence key={i} from={row.from - pre} durationInFrames={row.dur + pre + post} layout="none">
            <SceneWrap row={row} />
          </Sequence>
        );
      })}
      {/* hard cut through black after the hook */}
      {frame >= s(5) && frame < s(5) + 4 ? <AbsoluteFill style={{background: '#000', zIndex: 860}} /> : null}
      <IkatWipe f={frame - s(36)} half={15} />
      <Steam f={frame - s(74)} />
      <IkatWipe f={frame - s(98)} half={16} angle={8} wave />
      <Flash f={frame - s(119)} color="#FFFFFF" inF={3} outF={16} />
      {captions ? <Captions frame={frame} cues={CUES} fps={FPS} /> : null}
      <Audio src={staticFile(captions ? 'soundtrack_vo.wav' : 'soundtrack.wav')} />
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition
      id="Uzbekistan"
      component={Video}
      durationInFrames={TOTAL}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{captions: true}}
    />
    {/* clean version: music only, no voice-over and no subtitles — for recording your own voice */}
    <Composition
      id="UzbekistanClean"
      component={Video}
      durationInFrames={TOTAL}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{captions: false}}
    />
  </>
);
