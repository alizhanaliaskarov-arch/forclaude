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

const bell = (t: number, at: number, half: number) => Math.max(0, 1 - Math.abs(t - at) / half);

/**
 * Camera-side effects applied to the rendered 3D frame: exposure blooms, zoom-blur rushes,
 * focus pulls and the small "punch" on every beat cut. All transitions below lean on it.
 */
const canvasFx = (t: number): {transform: string; filter: string} => {
  let scale = 1;
  let tx = 0;
  let blur = 0;
  let bright = 1;
  // 01: the macro opens soft and pulls into focus
  blur += ip(t, [0.4, 2.6], [7, 0], smooth);
  // 01 → 02: light overexposes the frame, the new shot settles out of the glow
  bright += ip(t, [4.3, 5.0], [0, 1.6], easeIn) * (t < 5 ? 1 : 0) + (t >= 5 ? ip(t, [5.0, 5.9], [1.6, 0], easeOut) : 0);
  blur += t >= 5 ? ip(t, [5.0, 5.7], [8, 0], easeOut) : 0;
  // 02 → 03 match cut: an exposure kiss on the shared highlight + a gentle settle
  bright += 0.9 * bell(t, 10, 0.2);
  scale += t >= 10 ? ip(t, [10, 10.6], [0.045, 0], easeOut) : 0;
  // 03 → 04: motion-blur as the pillar sweeps, the new shot slides in behind it
  blur += 5 * bell(t, 17, 0.25);
  tx += t >= 17 ? ip(t, [17, 17.45], [-60, 0], easeOut) : 0;
  // 04: a punch on every beat cut
  for (let k = 1; k <= 6; k++) {
    const c = 17 + k * 1.25;
    if (t >= c && t < c + 0.3) {
      scale += ip(t, [c, c + 0.3], [0.03, 0], easeOut);
      bright += ip(t, [c, c + 0.2], [0.35, 0], easeOut);
    }
  }
  // 04 → 05: rush into the spinning disc, then the peak resolves out of a zoom blur
  if (t >= 24.6 && t < 25) {
    scale += ip(t, [24.6, 25], [0, 0.22], easeIn);
    blur += ip(t, [24.6, 25], [0, 14], easeIn);
    bright += ip(t, [24.75, 25], [0, 0.8], easeIn);
  }
  if (t >= 25 && t < 26) {
    scale += ip(t, [25, 25.9], [0.2, 0], easeOut);
    blur += ip(t, [25, 25.6], [12, 0], easeOut);
    bright += ip(t, [25, 25.6], [0.8, 0], easeOut);
  }
  // 05 → 06: the highlight blows out, hard cut at the peak, the macro comes back from white
  bright += t < 35 ? ip(t, [34.7, 35], [0, 2.6], easeIn) : ip(t, [35, 35.45], [2.6, 0], easeOut);
  // 06: focus pulls on the macro, then a rack to the frontal frame
  blur += t >= 35 ? ip(t, [35, 36.3], [9, 0], smooth) : 0;
  blur += t >= 38.6 ? ip(t, [38.6, 39.4], [6, 0], smooth) : 0;
  // 06 → 07: inside the portal the new world eases back
  scale += t >= 43 ? ip(t, [43, 44.2], [0.14, 0], easeOut) : 0;
  return {
    transform: `translateX(${tx}px) scale(${scale})`,
    filter: `${blur > 0.05 ? `blur(${blur}px) ` : ''}brightness(${bright})`,
  };
};

/** 01 → 02: two plates of light close over the frame like a shutter of silver, then part to reveal the next shot. */
const LightSlit: React.FC<{t: number}> = ({t}) => {
  if (t < 4.1 || t > 5.75) return null;
  const close = ip(t, [4.1, 5.0], [0, 1], easeIn);
  const open = ip(t, [5.0, 5.75], [0, 1], easeOut);
  const gap = t < 5 ? (1 - close) * (H / 2) : open * (H / 2 + 120);
  const glow = t < 5 ? close : 1 - open;
  const plate = (top: boolean): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    width: W,
    height: H / 2 + 60,
    [top ? 'bottom' : 'top']: H / 2 + gap,
    background: top
      ? 'linear-gradient(0deg, #f6f7f9 0%, #d9dce0 6%, rgba(160,164,170,0.55) 40%, rgba(40,42,46,0) 100%)'
      : 'linear-gradient(180deg, #f6f7f9 0%, #d9dce0 6%, rgba(160,164,170,0.55) 40%, rgba(40,42,46,0) 100%)',
    opacity: 0.25 + 0.75 * glow,
    filter: 'blur(10px)',
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div style={plate(true)} />
      <div style={plate(false)} />
      {/* anamorphic core of the slit */}
      <div style={{position: 'absolute', left: -200, width: W + 400, top: H / 2 - gap - 3, height: 6, background: '#fff', opacity: glow, boxShadow: `0 0 ${30 + 90 * glow}px 14px rgba(255,255,255,${0.55 * glow})`}} />
      <div style={{position: 'absolute', left: -200, width: W + 400, top: H / 2 + gap - 3, height: 6, background: '#fff', opacity: glow, boxShadow: `0 0 ${30 + 90 * glow}px 14px rgba(255,255,255,${0.55 * glow})`}} />
    </AbsoluteFill>
  );
};

/** Anamorphic streak + soft bloom from a point (restrained — one streak, no ghost rings). */
const Anamorphic: React.FC<{t: number; at: number; half: number; x: number; y: number; vertical?: boolean; strength?: number}> = ({
  t,
  at,
  half,
  x,
  y,
  vertical,
  strength = 1,
}) => {
  const o = Math.pow(bell(t, at, half), 1.4) * strength;
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      <div
        style={{
          position: 'absolute',
          left: vertical ? x - 3 : -100,
          top: vertical ? -100 : y - 3,
          width: vertical ? 6 : W + 200,
          height: vertical ? H + 200 : 6,
          background: vertical ? 'linear-gradient(180deg, transparent, #fff 35%, #fff 65%, transparent)' : 'linear-gradient(90deg, transparent, #fff 35%, #fff 65%, transparent)',
          opacity: o,
          filter: 'blur(1.5px)',
          boxShadow: `0 0 ${50 * o}px 12px rgba(235,240,248,${0.5 * o})`,
        }}
      />
      <div style={{position: 'absolute', left: x - 420, top: y - 420, width: 840, height: 840, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(225,230,238,0.35) 25%, rgba(0,0,0,0) 62%)', opacity: o}} />
    </AbsoluteFill>
  );
};

/** 03 → 04: the occluding pillar keeps travelling — motion-blurred dark chrome with a moving edge highlight. */
const PillarExit: React.FC<{t: number}> = ({t}) => {
  if (t < 17 || t > 17.45) return null;
  const x = ip(t, [17, 17.45], [0, W * 1.08], easeIn);
  const speed = ip(t, [17, 17.45], [0.3, 1]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x, top: -40, width: W + 80, height: H + 80, background: 'linear-gradient(90deg, #3a3d42 0%, #121214 4%, #060607 30%, #050506 100%)', filter: `blur(${4 + speed * 22}px)`}} />
      <div style={{position: 'absolute', left: x - 6, top: 0, width: 10, height: H, background: 'linear-gradient(180deg, transparent, #e9ecf0 40%, #e9ecf0 60%, transparent)', filter: `blur(${2 + speed * 10}px)`, opacity: 0.8}} />
    </AbsoluteFill>
  );
};

/** Glowing hairline at the edge of the opening portal. */
const PortalRing: React.FC<{r: number | null; t: number}> = ({r, t}) => {
  if (r === null) return null;
  const o = ip(t, [43, 43.15, 43.6, 43.9], [0, 1, 0.7, 0]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H} style={{position: 'absolute', overflow: 'visible'}}>
        <defs>
          <filter id="pg" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={8} />
          </filter>
        </defs>
        <circle cx={W / 2} cy={H / 2} r={r} fill="none" stroke="#ffffff" strokeWidth={10} opacity={o * 0.5} filter="url(#pg)" />
        <circle cx={W / 2} cy={H / 2} r={r} fill="none" stroke={C.platinum} strokeWidth={1.6} opacity={o} />
      </svg>
    </AbsoluteFill>
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
        <AbsoluteFill style={canvasFx(t)}>
        <ThreeCanvas
          width={W}
          height={H}
          gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, outputColorSpace: THREE.SRGBColorSpace}}
        >
          <World t={t} />
        </ThreeCanvas>
        </AbsoluteFill>
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

      <LightSlit t={t} />
      <Anamorphic t={t} at={10} half={0.25} x={W / 2} y={H * 0.36} vertical />
      <Anamorphic t={t} at={10} half={0.18} x={W / 2} y={H * 0.36} strength={0.5} />
      <PillarExit t={t} />
      <Anamorphic t={t} at={25} half={0.35} x={W / 2} y={H / 2} strength={0.7} />
      <Anamorphic t={t} at={35} half={0.3} x={W * 0.56} y={H * 0.34} />
      <Anamorphic t={t} at={51.6} half={0.5} x={W / 2} y={H * 0.3} strength={0.25} />
      <PortalRing r={portal} t={t} />
      <Grain frame={frame} />
      <Vignette />
      <Audio src={staticFile('soundtrack.wav')} />
      {/* keep the very last frames clean black */}
      {clamp(1 - endFade) > 0 ? <AbsoluteFill style={{background: '#000', opacity: clamp(1 - endFade), pointerEvents: 'none'}} /> : null}
    </AbsoluteFill>
  );
};

const mix2 = (a: number, b: number, k: number) => a + (b - a) * k;
