import React from 'react';
import {Img, staticFile} from 'remotion';
import {Cam} from './camera';
import {SILHOUETTE} from './data';
import {C} from './theme';

const full: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1536, height: 1024};

/** Everything inside is laid out in source-image pixels (1536 x 1024) and follows the camera. */
export const CamLayer: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <div
    style={{
      ...full,
      transformOrigin: '0 0',
      transform: `translate(${960 - cam.cx * cam.s}px, ${540 - cam.cy * cam.s}px) scale(${cam.s})`,
    }}
  >
    {children}
  </div>
);

export const Photo: React.FC = () => <Img src={staticFile('img/car@2x.jpg')} style={full} />;

/** darkens what is under it (cheaper than a CSS brightness filter on the 3072 px photo) */
export const Shade: React.FC<{amount: number; color?: string}> = ({amount, color = '#000'}) =>
  amount > 0.001 ? <div style={{...full, background: color, opacity: Math.min(1, amount)}} /> : null;

/** daytime running lights: core strip + two pre-blurred bloom layers, screen-blended */
export const Drl: React.FC<{core: number; bloom: number}> = ({core, bloom}) => (
  <>
    {bloom > 0.001 ? (
      <>
        <Img src={staticFile('img/drl-glow.png')} style={{...full, opacity: Math.min(1, bloom), mixBlendMode: 'screen'}} />
        <Img src={staticFile('img/drl-bloom.png')} style={{...full, opacity: Math.min(1, bloom), mixBlendMode: 'screen'}} />
      </>
    ) : null}
    {core > 0.001 ? <Img src={staticFile('img/drl.png')} style={{...full, opacity: Math.min(1, core), mixBlendMode: 'screen'}} /> : null}
  </>
);

/** "blueprint" edges of the body, revealed left -> right up to edgeX (source px) */
export const Lines: React.FC<{opacity: number; edgeX: number}> = ({opacity, edgeX}) => {
  if (opacity < 0.001) return null;
  const e = (edgeX / 1536) * 100;
  const mask = `linear-gradient(90deg, #000 ${e - 3}%, rgba(0,0,0,0) ${e}%)`;
  return (
    <Img
      src={staticFile('img/lines.png')}
      style={{...full, opacity, mixBlendMode: 'screen', WebkitMaskImage: mask, maskImage: mask}}
    />
  );
};

/** a soft light band crossing the paint at source x (masked by the car silhouette) */
export const Sweep: React.FC<{x: number; strength: number; angle?: number; width?: number}> = ({
  x,
  strength,
  angle = 100,
  width = 120,
}) => {
  if (strength < 0.001) return null;
  // position of the point (x, 560) along the CSS gradient line, in % of its length
  const th = (angle * Math.PI) / 180;
  const L = Math.abs(1536 * Math.sin(th)) + Math.abs(1024 * Math.cos(th));
  const along = (px: number) => (((px - 768) * Math.sin(th) - (560 - 512) * Math.cos(th) + L / 2) / L) * 100;
  const pos = along(x);
  const half = (width / L) * 100;
  const mask = `url(${staticFile('img/car-mask.png')})`;
  return (
    <div
      style={{
        ...full,
        opacity: strength,
        mixBlendMode: 'screen',
        background: `linear-gradient(${angle}deg, rgba(255,255,255,0) ${pos - half}%, rgba(214,232,255,0.6) ${pos}%, rgba(255,255,255,0) ${
          pos + half
        }%)`,
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskSize: '1536px 1024px',
        maskSize: '1536px 1024px',
      }}
    />
  );
};

/** the car outline, drawn progressively; stroke width is kept constant on screen */
export const SilhouetteLine: React.FC<{cam: Cam; progress: number; opacity: number}> = ({cam, progress, opacity}) => {
  if (opacity < 0.001) return null;
  const L = SILHOUETTE.length;
  return (
    <svg width={1536} height={1024} viewBox="0 0 1536 1024" style={{...full, overflow: 'visible', opacity}}>
      <path
        d={SILHOUETTE.d}
        fill="none"
        stroke={C.ice}
        strokeWidth={6 / cam.s}
        strokeOpacity={0.25}
        strokeDasharray={L}
        strokeDashoffset={L * (1 - progress)}
        strokeLinejoin="round"
      />
      <path
        d={SILHOUETTE.d}
        fill="none"
        stroke={C.iceStrong}
        strokeWidth={2 / cam.s}
        strokeDasharray={L}
        strokeDashoffset={L * (1 - progress)}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Catmull-Rom spline through points -> SVG cubic path */
export const smoothPath = (pts: [number, number][]) => {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
};

export const polyLength = (pts: [number, number][]) =>
  pts.slice(1).reduce((acc, p, i) => acc + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0) * 1.04;
