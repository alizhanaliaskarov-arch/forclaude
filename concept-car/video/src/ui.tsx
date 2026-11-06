import React from 'react';
import {staticFile, useCurrentFrame} from 'remotion';
import {Cam, toScreen} from './camera';
import {CalloutDef, CHAPTERS, CUES, EV, FPS, SceneId, SCENES, Side, clamp01, easeOut, ramp, smooth} from './data';
import {BAR, C, FONT_TITLE, FONT_UI, H, W} from './theme';

const abs: React.CSSProperties = {position: 'absolute'};

// ----------------------------------------------------------------------------- callouts
const DIRS: Record<Side, [number, number]> = {ur: [1, -1], ul: [-1, -1], dr: [1, 1], dl: [-1, 1]};

/** marker + leader + label in screen space, following a point on the car */
export const Callout: React.FC<{cam: Cam; camAppear: Cam; c: CalloutDef; t: number; sceneLen: number}> = ({
  cam,
  camAppear,
  c,
  t,
  sceneLen,
}) => {
  const age = t - c.t;
  if (age < 0) return null;
  let out = 1 - ramp(t, sceneLen - 0.55, sceneLen - 0.15);
  if (c.life !== undefined) out = Math.min(out, 1 - ramp(age, c.life, c.life + 0.4));
  if (out <= 0) return null;
  const p = toScreen(cam, c.x, c.y);
  if (p.y < BAR + 16 || p.y > H - BAR - 16 || p.x < 20 || p.x > W - 20) return null;
  let [dx, dy] = DIRS[c.side];
  // keep the label inside the frame: decided once, where the point was when the callout appeared
  const p0 = toScreen(camAppear, c.x, c.y);
  const labelW = c.label.length * 15.5 + 24;
  const tip = p0.x + dx * (58 + 74 + 12);
  if (dx > 0 && tip + labelW > W - 40) dx = -1;
  else if (dx < 0 && tip - labelW < 40) dx = 1;
  if (dy < 0 && p0.y - 58 < BAR + 24) dy = 1;
  else if (dy > 0 && p0.y + 58 > H - BAR - 24) dy = -1;
  // if the camera later pushes the label against the frame edge, let it go instead of cutting it
  const tipNow = p.x + dx * (58 + 74 + 12);
  const room = dx > 0 ? W - 24 - (tipNow + labelW) : tipNow - labelW - 24;
  out = Math.min(out, clamp01(1 + room / 50));
  if (out <= 0) return null;
  const ring = easeOut(age / 0.28);
  const line = easeOut((age - 0.12) / 0.35);
  const text = easeOut((age - 0.3) / 0.4);
  const elbow = {x: p.x + dx * 58, y: p.y + dy * 58};
  const end = {x: elbow.x + dx * 74, y: elbow.y};
  // leader drawn progressively: first the diagonal, then the horizontal
  const l1 = Math.min(1, line * 1.8);
  const l2 = clamp01(line * 1.8 - 0.8);
  const a = {x: p.x + dx * 9 * 0.707, y: p.y + dy * 9 * 0.707};
  const m = {x: a.x + (elbow.x - a.x) * l1, y: a.y + (elbow.y - a.y) * l1};
  const e = {x: elbow.x + (end.x - elbow.x) * l2, y: elbow.y};
  const pulse = (age * 0.9) % 1;
  return (
    <div style={{...abs, inset: 0, opacity: out}}>
      <svg width={W} height={H} style={{...abs, left: 0, top: 0, overflow: 'visible'}}>
        <circle cx={p.x} cy={p.y} r={7 + 18 * pulse} fill="none" stroke={C.iceStrong} strokeWidth={1.2} opacity={(1 - pulse) * 0.6 * ring} />
        <circle cx={p.x} cy={p.y} r={7 * ring} fill="rgba(232,245,255,0.18)" stroke={C.iceStrong} strokeWidth={2} />
        <circle cx={p.x} cy={p.y} r={2.2 * ring} fill={C.iceStrong} />
        {line > 0 ? (
          <polyline
            points={`${a.x},${a.y} ${m.x},${m.y} ${l2 > 0 ? `${e.x},${e.y}` : ''}`}
            fill="none"
            stroke={C.iceStrong}
            strokeWidth={1.6}
            style={{filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))'}}
          />
        ) : null}
      </svg>
      {text > 0 ? (
        <div
          style={{
            ...abs,
            top: end.y - 15,
            ...(dx > 0 ? {left: end.x + 12} : {right: W - end.x + 12}),
            fontFamily: FONT_UI,
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: '0.16em',
            lineHeight: '30px',
            color: C.white,
            whiteSpace: 'nowrap',
            textShadow: '0 0 12px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.9)',
            clipPath: dx > 0 ? `inset(0 ${100 - text * 100}% 0 0)` : `inset(0 0 0 ${100 - text * 100}%)`,
            opacity: Math.min(1, text * 1.5),
          }}
        >
          {c.label}
        </div>
      ) : null}
    </div>
  );
};

// ----------------------------------------------------------------------------- frame furniture
export const Letterbox: React.FC = () => (
  <>
    <div style={{...abs, left: 0, top: 0, width: W, height: BAR, background: '#000'}} />
    <div style={{...abs, left: 0, top: H - BAR, width: W, height: BAR, background: '#000'}} />
  </>
);

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <div
    style={{
      ...abs,
      left: 0,
      top: BAR,
      width: W,
      height: H - 2 * BAR,
      background: `radial-gradient(ellipse 75% 85% at 50% 52%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const i = f % 6;
  const ox = (f * 131) % 512;
  const oy = (f * 197) % 512;
  return (
    <div
      style={{
        ...abs,
        left: 0,
        top: BAR,
        width: W,
        height: H - 2 * BAR,
        backgroundImage: `url(${staticFile(`img/grain-${i}.png`)})`,
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: 'overlay',
        opacity: 0.09,
      }}
    />
  );
};

/** anamorphic streak + core glow at a screen point (for the headlights) */
export const Flare: React.FC<{x: number; y: number; o: number; w?: number}> = ({x, y, o, w = 1700}) => {
  if (o < 0.002) return null;
  return (
    <>
      <div
        style={{
          ...abs,
          left: x - w / 2,
          top: y - 30,
          width: w,
          height: 60,
          opacity: o,
          mixBlendMode: 'screen',
          background:
            'radial-gradient(ellipse 50% 9% at 50% 50%, rgba(236,246,255,0.95) 0%, rgba(150,200,255,0.45) 38%, rgba(90,150,255,0) 72%)',
        }}
      />
      <div
        style={{
          ...abs,
          left: x - 160,
          top: y - 160,
          width: 320,
          height: 320,
          opacity: o * 0.8,
          mixBlendMode: 'screen',
          background: 'radial-gradient(circle, rgba(225,240,255,0.55) 0%, rgba(140,190,255,0.18) 30%, rgba(0,0,0,0) 65%)',
        }}
      />
    </>
  );
};

// ----------------------------------------------------------------------------- chapter header (top bar)
export const ChapterHeader: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const until = (id: SceneId) => (id === 'verdict' ? SCENES.verdict.start + EV.verdict.lightsOff + 0.4 : SCENES[id].end);
  const idx = CHAPTERS.findIndex(([id]) => t >= SCENES[id].start + (EV[id].chapter ?? 0.3) - 0.01 && t < until(id));
  if (idx < 0) return null;
  const [id, num, title] = CHAPTERS[idx];
  const a = SCENES[id].start + (EV[id].chapter ?? 0.3);
  const o = Math.min(easeOut((t - a) / 0.45), 1 - ramp(t, until(id) - 0.4, until(id) - 0.05));
  const slide = (1 - easeOut((t - a) / 0.6)) * 18;
  const chapterCount = 5;
  const done = Math.min(idx + 1, chapterCount);
  return (
    <div style={{...abs, left: 0, top: 0, width: W, height: BAR, opacity: o}}>
      <div
        style={{
          ...abs,
          left: 96 + slide,
          top: 0,
          height: BAR,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: FONT_UI,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: '0.32em',
          color: C.white,
        }}
      >
        {num ? <span style={{color: C.amber}}>{num}</span> : null}
        {num ? <span style={{width: 34, height: 1.5, background: C.faint, display: 'inline-block'}} /> : null}
        <span>{title}</span>
      </div>
      <div style={{...abs, right: 96, top: BAR / 2 - 1, display: 'flex', gap: 8}}>
        {Array.from({length: chapterCount}).map((_, k) => (
          <div key={k} style={{width: 44, height: 2, background: k < done ? C.amber : 'rgba(238,241,245,0.22)'}} />
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------- subtitles (bottom bar)
export const Subtitles: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  let idx = -1;
  for (let i = 0; i < CUES.length; i++) if (CUES[i][0] - 0.06 <= t) idx = i;
  if (idx < 0) return null;
  const [a, b, text] = CUES[idx];
  if (t > b + 0.18) return null;
  const o = Math.min(clamp01((t - (a - 0.06)) / 0.12), clamp01((b + 0.18 - t) / 0.14));
  return (
    <div
      style={{
        ...abs,
        left: 0,
        top: H - BAR,
        width: W,
        height: BAR,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_UI,
        fontWeight: 600,
        fontSize: 34,
        color: C.white,
        opacity: o,
      }}
    >
      {text}
    </div>
  );
};

// ----------------------------------------------------------------------------- titles
export const BigTitle: React.FC<{t: number; text: string; sub?: string; align?: 'left' | 'center'; x: number; y: number}> = ({
  t,
  text,
  sub,
  align = 'left',
  x,
  y,
}) => {
  if (t < 0) return null;
  const letters = easeOut(t / 1.3);
  const spacing = 0.62 - 0.3 * letters;
  const lineW = easeOut((t - 0.5) / 0.8);
  const subO = easeOut((t - 0.8) / 0.7);
  return (
    <div
      style={{
        ...abs,
        top: y,
        ...(align === 'left' ? {left: x} : {left: 0, width: W}),
        textAlign: align,
        color: C.white,
      }}
    >
      <div
        style={{
          fontFamily: FONT_TITLE,
          fontWeight: 300,
          fontSize: 76,
          letterSpacing: `${spacing}em`,
          lineHeight: 1,
          opacity: letters,
          textShadow: '0 0 30px rgba(0,0,0,0.6)',
          ...(align === 'center' ? {marginRight: `-${spacing}em`} : {}),
        }}
      >
        {text}
      </div>
      <div
        style={{
          height: 1.5,
          width: 150 * lineW,
          background: C.amber,
          margin: align === 'center' ? '30px auto 0' : '30px 0 0',
        }}
      />
      {sub ? (
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_UI,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '0.42em',
            color: C.dim,
            opacity: subO,
            ...(align === 'center' ? {marginRight: '-0.42em'} : {}),
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

export const Swatch: React.FC<{t: number; x: number; y: number; out: number}> = ({t, x, y, out}) => {
  if (t < 0) return null;
  const o = Math.min(easeOut(t / 0.5), out);
  const d = easeOut(t / 0.7);
  return (
    <div
      style={{
        ...abs,
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        opacity: o,
        padding: '18px 26px 18px 18px',
        background: 'rgba(5,6,8,0.55)',
        border: '1px solid rgba(238,241,245,0.14)',
        transform: `translateY(${(1 - d) * 14}px)`,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: 'radial-gradient(circle at 34% 30%, #9aa1aa 0%, #4a4f56 22%, #23262a 55%, #121315 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.18)',
        }}
      />
      <div style={{fontFamily: FONT_UI, color: C.white}}>
        <div style={{fontWeight: 600, fontSize: 15, letterSpacing: '0.34em', color: C.dim}}>ЦВЕТ КУЗОВА</div>
        <div style={{fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', marginTop: 6}}>ГРАФИТ МЕТАЛЛИК</div>
      </div>
    </div>
  );
};

export const Credits: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const v = SCENES.verdict.start;
  const o = smooth(ramp(T, v + EV.verdict.endcard + 1.0, v + EV.verdict.endcard + 1.7)) * (1 - smooth(ramp(T, v + EV.verdict.lightsOff, v + EV.verdict.lightsOff + 0.5)));
  if (o <= 0.001) return null;
  return (
    <div
      style={{
        ...abs,
        left: 0,
        top: H - BAR,
        width: W,
        height: BAR,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT_UI,
        fontWeight: 500,
        fontSize: 17,
        letterSpacing: '0.06em',
        color: C.dim,
        opacity: o,
      }}
    >
      Изображение: Canva AI · Голос: RHVoice «Александр» (CC BY-SA 4.0) · Музыка и звук: синтезированы с нуля
    </div>
  );
};
