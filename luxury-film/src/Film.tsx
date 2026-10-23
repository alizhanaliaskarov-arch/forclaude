import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {World} from './three/World';
import {Fonts} from './Fonts';
import {Caption, DepthWord, MaskWord, MetalLine, Statement, WideLine} from './Type';
import {BRAND, C, F, FPS, H, W, clamp, easeIn, easeOut, ip, linear, smooth} from './theme';

/* ───────────── finishing ───────────── */

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.09}}>
    <svg width={W} height={H}>
      <filter id="g">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 89} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#g)" />
    </svg>
  </AbsoluteFill>
);

const Vignette = () => (
  <AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 70% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.62) 100%)'}} />
);

/** Emblem: a hairline circle crossed by a vertical stroke. */
const Emblem: React.FC<{size: number; draw?: number; opacity?: number}> = ({size, draw = 1, opacity = 1}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{overflow: 'visible', opacity}}>
    <circle r={40} fill="none" stroke={C.platinum} strokeWidth={1.4} pathLength={1} strokeDasharray={`${draw} 1`} transform="rotate(-90)" />
    <line x1={0} y1={-40 * draw} x2={0} y2={40 * draw} stroke={C.platinum} strokeWidth={1.4} />
  </svg>
);

/* ───────────── transitions (2D) ───────────── */

/** 01 → 02: the silver line widens until light fills the frame, then the frame clears onto the next shot. */
const LightWipe: React.FC<{t: number}> = ({t}) => {
  if (t < 4.0 || t > 5.7) return null;
  const grow = ip(t, [4.0, 5.0], [0, 1], easeIn);
  const clear = ip(t, [5.0, 5.7], [1, 0], easeOut);
  const h = 2 + grow * H;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: clear}}>
      <div style={{width: W, height: h, background: `linear-gradient(180deg, rgba(220,224,230,0) 0%, rgba(236,238,241,${0.4 + grow * 0.6}) 35%, #F4F5F7 50%, rgba(236,238,241,${0.4 + grow * 0.6}) 65%, rgba(220,224,230,0) 100%)`, boxShadow: `0 0 ${40 + grow * 200}px rgba(240,242,245,0.8)`}} />
    </AbsoluteFill>
  );
};

/** 02 → 03 match cut: the same vertical highlight bridges both shots. */
const Streak: React.FC<{t: number; at: number; x?: number}> = ({t, at, x = W / 2}) => {
  const d = Math.abs(t - at);
  if (d > 0.22) return null;
  const o = 1 - d / 0.22;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', left: x - 2, top: 0, width: 4, height: H, background: 'linear-gradient(180deg, transparent, #fff 30%, #fff 70%, transparent)', opacity: o, boxShadow: `0 0 ${60 * o}px 10px rgba(255,255,255,${0.5 * o})`}} />
    </AbsoluteFill>
  );
};

/** 03 → 04: the pillar that covered the lens keeps travelling and uncovers the new shot. */
const PillarExit: React.FC<{t: number}> = ({t}) => {
  if (t < 17 || t > 17.45) return null;
  const x = ip(t, [17, 17.45], [0, W * 1.05], easeIn);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x, top: 0, width: W, height: H, background: 'linear-gradient(90deg, #26282c 0%, #0a0a0b 6%, #050506 100%)'}} />
    </AbsoluteFill>
  );
};

/** 04 → 05: the spinning titanium disc fills the frame, then dissolves into the peak. */
const DiscOut: React.FC<{t: number}> = ({t}) => {
  if (t < 25 || t > 25.5) return null;
  return <AbsoluteFill style={{background: 'linear-gradient(160deg, #7d8086, #b7bac0 45%, #6b6e74)', opacity: ip(t, [25, 25.5], [1, 0], easeOut)}} />;
};

/** 05 → 06: a flash of reflected light motivates the hard cut. */
const Flash: React.FC<{t: number; at: number}> = ({t, at}) => {
  if (t < at - 0.2 || t > at + 0.2) return null;
  const o = t < at ? ip(t, [at - 0.2, at], [0, 1], easeIn) : ip(t, [at, at + 0.2], [1, 0], easeOut);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle at 56% 34%, rgba(255,255,255,${o}) 0%, rgba(235,238,242,${o * 0.85}) 30%, rgba(200,204,210,${o * 0.5}) 70%)`}} />
  );
};

/* ───────────── film ───────────── */

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // 06 → 07: the emblem opens into a circular portal onto the next environment
  const portal = t >= 43 && t < 43.9 ? ip(t, [43, 43.9], [64, Math.hypot(W, H) / 2 + 20], easeIn) : null;
  // global fade at the very end
  const endFade = ip(t, [59.15, 59.95], [1, 0], linear);

  // 08: frame line around the subject, then retracts into the emblem above the name
  const fr = {x0: 300, x1: 780, y0: 270, y1: 1300};
  const frameDraw = ip(t, [54.2, 55.9], [0, 1], smooth);
  const frameRetract = ip(t, [56.5, 57.3], [0, 1], smooth);

  return (
    <AbsoluteFill style={{background: C.black}}>
      <Fonts />
      <AbsoluteFill style={{clipPath: portal !== null ? `circle(${portal}px at 50% 50%)` : undefined, opacity: endFade}}>
        <ThreeCanvas
          width={W}
          height={H}
          gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, outputColorSpace: THREE.SRGBColorSpace}}
        >
          <World t={t} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* typography — all inside the title-safe area */}
      <MaskWord t={t} text="FORM." start={6.0} dissolve={8.4} y={330} size={150} />
      <WideLine t={t} text="BEYOND ORDINARY" start={12.2} end={16.2} y={300} size={40} />
      <DepthWord t={t} text="PRECISION" start={20.7} end={24.3} y={1330} size={74} />
      <MetalLine t={t} lines={['TIMELESS', 'BY DESIGN.']} start={27.6} end={33.9} y={250} size={92} step={0.075} />
      <Caption t={t} text="SCULPTED IN LIGHT" start={35.7} end={38.3} y={1430} />
      <Caption t={t} text="OBSIDIAN · TITANIUM · CHROME" start={38.9} end={41.3} y={1560} />
      <Statement t={t} a="LESS." b="BUT BETTER." start={46.0} end={50.5} y={250} size={84} />

      {/* 06: emblem the silhouette collapses into, then the portal ring */}
      {t > 41.4 && t < 43.9 ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{transform: `scale(${portal !== null ? portal / 40 : 1})`, opacity: portal !== null ? ip(t, [43.3, 43.9], [1, 0]) : 1}}>
            <Emblem size={80} draw={ip(t, [41.4, 42.3], [0, 1], smooth)} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 08: hairline frame → emblem → name */}
      {t > 54.2 ? (
        <AbsoluteFill style={{opacity: endFade}}>
          <svg width={W} height={H} style={{position: 'absolute'}}>
            {frameRetract < 1 ? (
              <rect
                x={mix2(fr.x0, 540, frameRetract)}
                y={mix2(fr.y0, 1345, frameRetract)}
                width={mix2(fr.x1 - fr.x0, 0, frameRetract)}
                height={mix2(fr.y1 - fr.y0, 0, frameRetract)}
                fill="none"
                stroke={C.silver}
                strokeOpacity={0.85}
                strokeWidth={1.2}
                pathLength={1}
                strokeDasharray={`${frameDraw} 1`}
              />
            ) : null}
          </svg>
          {t > 57.1 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 1345 - 22, display: 'flex', justifyContent: 'center'}}>
              <Emblem size={44} draw={ip(t, [57.1, 57.8], [0, 1], smooth)} />
            </div>
          ) : null}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 1398,
              display: 'flex',
              justifyContent: 'center',
              fontFamily: F.serif,
              fontWeight: 300,
              fontSize: 70,
              letterSpacing: `${ip(t, [57.3, 59], [0.62, 0.52], easeOut)}em`,
              marginRight: '-0.5em',
              color: C.platinum,
              opacity: ip(t, [57.3, 58.2], [0, 1], smooth),
            }}
          >
            {BRAND}
          </div>
        </AbsoluteFill>
      ) : null}

      <LightWipe t={t} />
      <Streak t={t} at={10} />
      <PillarExit t={t} />
      <DiscOut t={t} />
      <Flash t={t} at={35} />
      <Grain frame={frame} />
      <Vignette />
      <Audio src={staticFile('soundtrack.wav')} />
      {/* keep the very last frames clean black */}
      {clamp(1 - endFade) > 0 ? <AbsoluteFill style={{background: '#000', opacity: clamp(1 - endFade), pointerEvents: 'none'}} /> : null}
    </AbsoluteFill>
  );
};

const mix2 = (a: number, b: number, k: number) => a + (b - a) * k;
