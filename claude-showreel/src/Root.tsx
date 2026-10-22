import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, H, TOTAL, W, clamp, easeIn, easeInOut, ip, rnd} from './theme';
import {Fonts} from './Fonts';
import {Captions, Grain, Vignette, type Cue} from './components';
import timing from './voice-timing.json';
import {S01Cursor} from './scenes/S01Cursor';
import {S02Bang} from './scenes/S02Bang';
import {S03Manifesto} from './scenes/S03Manifesto';
import {S04Code} from './scenes/S04Code';
import {S05Data} from './scenes/S05Data';
import {S06Languages} from './scenes/S06Languages';
import {S07Writing} from './scenes/S07Writing';
import {ATOM, S08Science} from './scenes/S08Science';
import {S09Design} from './scenes/S09Design';
import {S10Agents} from './scenes/S10Agents';
import {S11Teach} from './scenes/S11Teach';
import {S12Honest} from './scenes/S12Honest';
import {S13Reveal} from './scenes/S13Reveal';
import {S14Montage} from './scenes/S14Montage';
import {S15You} from './scenes/S15You';
import {S16Finale} from './scenes/S16Finale';
import {S17Credits} from './scenes/S17Credits';

export type SceneProps = {f: number; dur: number};

type Enter = 'fade' | 'whip' | 'zoomIn' | 'irisOpen' | 'pushUp' | null;
type Exit = 'whip' | 'zoomOut' | 'irisClose' | 'pushUp' | null;
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

// scene start times in seconds — the soundtrack (audio/make_audio.py) and voice (audio/make_voice.py) use the same grid
export const SCENE_SECONDS = [0, 8, 18, 34, 54, 72, 90, 108, 126, 144, 162, 178, 194, 222, 246, 270, 290, 300];

const COMPS: React.FC<SceneProps>[] = [
  S01Cursor, S02Bang, S03Manifesto, S04Code, S05Data, S06Languages, S07Writing, S08Science, S09Design,
  S10Agents, S11Teach, S12Honest, S13Reveal, S14Montage, S15You, S16Finale, S17Credits,
];
const TRANS: Partial<Row>[] = [
  {}, // 01 cursor — dives into the caret (inside the scene)
  {}, // 02 bang — the caret's coral collapses into the big bang
  {}, // 03 manifesto — white flash in
  {post: 10, exit: 'zoomOut'}, // 04 code — slash wipe in, zoom-through out
  {pre: 10, enter: 'zoomIn'}, // 05 data — ends on a horizon line (match cut)
  {post: 8, exit: 'whip'}, // 06 languages — the globe rises out of the horizon
  {pre: 8, enter: 'whip', z: 5}, // 07 writing — ink wipe out
  {exit: 'irisClose', z: 50}, // 08 science — iris closes on the nucleus
  {enter: 'irisOpen', z: 60}, // 09 design — tile flip out
  {}, // 10 agents — implodes into a white flash
  {post: 30}, // 11 teach — cross-dissolve
  {pre: 30, enter: 'fade', z: 70}, // 12 honest — hard cut through black
  {}, // 13 reveal — tape rewind out
  {exit: 'pushUp'}, // 14 montage
  {pre: 14, enter: 'pushUp', z: 80}, // 15 you — light leak out
  {pre: 20, enter: 'fade', z: 90}, // 16 finale
  {pre: 24, enter: 'fade', z: 95}, // 17 credits
];
const SCENES: Row[] = COMPS.map((Comp, i) => ({
  from: s(SCENE_SECONDS[i]),
  dur: s(SCENE_SECONDS[i + 1]) - s(SCENE_SECONDS[i]),
  Comp,
  ...TRANS[i],
}));
const at = (i: number) => s(SCENE_SECONDS[i]);

const WHIP = 8;

const SceneWrap: React.FC<{row: Row}> = ({row}) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const pre = row.pre ?? 0;
  const post = row.post ?? 0;
  const f = frame - pre; // 0 = nominal scene start
  const {dur} = row;
  const style: React.CSSProperties = {};
  let clip: string | undefined;
  const tf: string[] = [];
  const filters: string[] = [];

  if (row.enter === 'fade') style.opacity = ip(f, [-pre, 0], [0, 1], easeInOut);
  if (row.enter === 'whip') {
    const t = clamp((f + WHIP) / (2 * WHIP));
    tf.push(`translateX(${(1 - easeInOut(t)) * W}px)`);
    filters.push(`blur(${Math.sin(Math.PI * t) * 30}px)`);
  }
  if (row.exit === 'whip') {
    const t = clamp((f - (dur - WHIP)) / (2 * WHIP));
    if (t > 0) {
      tf.push(`translateX(${-easeInOut(t) * W}px)`);
      filters.push(`blur(${Math.sin(Math.PI * t) * 30}px)`);
    }
  }
  if (row.enter === 'zoomIn' && f < 0) {
    const t = clamp((f + pre) / pre);
    tf.push(`scale(${0.4 + 0.6 * easeInOut(t)})`);
    filters.push(`blur(${(1 - t) * 30}px)`);
    style.opacity = t;
  }
  if (row.exit === 'zoomOut' && f > dur - post) {
    const t = clamp((f - (dur - post)) / (2 * post));
    tf.push(`scale(${1 + 6 * easeIn(t)})`);
    filters.push(`blur(${t * 40}px)`);
    style.opacity = 1 - t;
  }
  if (row.enter === 'pushUp' && f < 0) tf.push(`translateY(${(-f / pre) * H}px)`);
  if (row.exit === 'pushUp' && f > dur - 14) tf.push(`translateY(${-((f - (dur - 14)) / 14) * H}px)`);
  if (row.enter === 'irisOpen') {
    const r = ip(f, [0, 18], [0, Math.hypot(W, H) + 10], easeInOut);
    clip = `circle(${r}px at ${ATOM[0]}px ${ATOM[1]}px)`;
  }
  if (row.exit === 'irisClose') {
    const r = ip(f, [dur - 16, dur], [Math.hypot(W, H) + 10, 0], easeInOut);
    clip = `circle(${r}px at ${ATOM[0]}px ${ATOM[1]}px)`;
  }
  if (tf.length) style.transform = tf.join(' ');
  if (filters.length) style.filter = filters.join(' ');
  return (
    <AbsoluteFill style={{...style, clipPath: clip, overflow: 'hidden', zIndex: row.z ?? 1}}>
      <row.Comp f={f} dur={dur} />
    </AbsoluteFill>
  );
};

/* ───────────── transition overlays ───────────── */

const Flash: React.FC<{f: number; color: string; inF?: number; outF?: number}> = ({f, color, inF = 4, outF = 14}) => {
  if (f < -inF || f > outF) return null;
  const o = f < 0 ? 1 + f / inF : 1 - f / outF;
  return <AbsoluteFill style={{background: color, opacity: o, zIndex: 850}} />;
};

/** A coral slab slashes across diagonally, the cut happens behind it. */
const SlashWipe: React.FC<{f: number; half?: number}> = ({f, half = 10}) => {
  if (f < -half || f > half) return null;
  const t = (f + half) / (2 * half);
  const x = -1.4 * W + easeInOut(t) * 2.8 * W;
  return (
    <AbsoluteFill style={{zIndex: 850, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: -400, left: x, width: W * 0.9, height: H + 800, transform: 'skewX(-18deg)', background: C.coral}} />
      <div style={{position: 'absolute', top: -400, left: x - 160, width: 120, height: H + 800, transform: 'skewX(-18deg)', background: C.amber}} />
      <div style={{position: 'absolute', top: -400, left: x + W * 0.9 + 40, width: 60, height: H + 800, transform: 'skewX(-18deg)', background: C.ivory}} />
    </AbsoluteFill>
  );
};

/** Ink blots bloom over the page, then drain away to reveal the next scene. */
const InkWipe: React.FC<{f: number; half?: number}> = ({f, half = 16}) => {
  if (f < -half || f > half) return null;
  const grow = clamp((f + half) / half);
  const shrink = clamp(f / half);
  return (
    <AbsoluteFill style={{zIndex: 850, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <defs>
          <filter id="ink">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={3} />
            <feDisplacementMap in="SourceGraphic" scale={120} />
          </filter>
        </defs>
        <g filter="url(#ink)" fill="#070B18">
          {Array.from({length: 9}).map((_, i) => {
            const cx = rnd(i * 4.1) * W;
            const cy = rnd(i * 2.7 + 1) * H;
            const r = easeIn(clamp(grow * 1.3 - i * 0.04)) * 1100 * (1 - easeInOut(shrink));
            return <circle key={i} cx={cx} cy={cy} r={r} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** A grid of tiles flips over (shows the night colour mid-way), sweeping left→right. */
const TileWipe: React.FC<{f: number; half?: number}> = ({f, half = 16}) => {
  if (f < -half || f > half) return null;
  const cols = 16;
  const rows = 9;
  const tw = W / cols;
  const th = H / rows;
  return (
    <AbsoluteFill style={{zIndex: 850, pointerEvents: 'none'}}>
      {Array.from({length: cols * rows}).map((_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const delay = (c / cols) * half * 0.8 + rnd(i) * 3;
        const tin = clamp((f + half - delay) / (half * 0.5));
        const tout = clamp((f - delay * 0.6) / (half * 0.5));
        const s = tin * (1 - tout);
        if (s <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: c * tw, top: r * th, width: tw + 1, height: th + 1, background: (c + r) % 2 ? C.night : C.panel, transform: `scaleY(${s}) rotateX(${(1 - s) * 90}deg)`, borderTop: `2px solid ${C.pink}55`}} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Warm light leak with a horizontal anamorphic streak. */
const LightLeak: React.FC<{f: number; half?: number}> = ({f, half = 22}) => {
  if (f < -half || f > half) return null;
  const t = (f + half) / (2 * half);
  const o = Math.sin(Math.PI * t);
  return (
    <AbsoluteFill style={{zIndex: 850, pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', left: -600 + t * 2400, top: -300, width: 1400, height: 1400, borderRadius: '50%', background: `radial-gradient(circle, ${C.amber} 0%, ${C.coral}88 35%, transparent 65%)`, opacity: o}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: H / 2 - 6, height: 12, background: `linear-gradient(90deg, transparent, ${C.ivory}, transparent)`, opacity: o, filter: 'blur(4px)'}} />
      <AbsoluteFill style={{background: C.ivory, opacity: o * 0.5}} />
    </AbsoluteFill>
  );
};

const Black: React.FC<{f: number; len: number}> = ({f, len}) => (f >= 0 && f < len ? <AbsoluteFill style={{background: '#000', zIndex: 860}} /> : null);

const Video: React.FC<{captions: boolean}> = ({captions}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.night, width: W, height: H}}>
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
      <Flash f={frame - at(2)} color="#FFFFFF" inF={3} outF={18} />
      <SlashWipe f={frame - at(3)} />
      <InkWipe f={frame - at(7)} />
      <TileWipe f={frame - at(9)} />
      <Flash f={frame - at(10)} color={C.ivory} inF={1} outF={16} />
      <Black f={frame - at(12)} len={6} />
      <Flash f={frame - at(13)} color="#FFFFFF" inF={2} outF={8} />
      <LightLeak f={frame - at(15)} />
      <Grain f={frame} />
      <Vignette />
      {captions ? <Captions frame={frame} cues={timing as Cue[]} fps={FPS} /> : null}
      <Audio src={staticFile(captions ? 'soundtrack_vo.wav' : 'soundtrack.wav')} />
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition id="Showreel" component={Video} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{captions: true}} />
    {/* clean version: music only, no voice-over and no subtitles */}
    <Composition id="ShowreelClean" component={Video} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{captions: false}} />
  </>
);
