import React from 'react';
import {AbsoluteFill} from 'remotion';
import {camAt, Key, toScreen} from './camera';
import {calloutsFor, clamp01, EV, easeOut, ramp, SceneId, smooth} from './data';
import {CamLayer, Drl, Lines, Photo, polyLength, Shade, SilhouetteLine, smoothPath, Sweep} from './layers';
import {BAR, C, FONT_UI, H, W} from './theme';
import {BigTitle, Callout, Flare, Swatch} from './ui';

type SceneProps = {t: number; len: number};

const easeInOut = (x: number) => {
  const c = clamp01(x);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

/** LED ignition: a few quick flickers, then steady */
const FLICKER = [0, 0.8, 0.15, 0.95, 0.3, 1, 0.85, 1];
const ignite = (t: number, at: number) => {
  const n = (t - at) * 30;
  if (n < 0) return 0;
  return n >= FLICKER.length ? 1 : FLICKER[Math.floor(n)];
};

const Callouts: React.FC<{id: SceneId; keys: Key[]; t: number; len: number}> = ({id, keys, t, len}) => {
  const cam = camAt(keys, t);
  return (
    <>
      {calloutsFor(id).map((c) => (
        <Callout key={c.label} cam={cam} camAppear={camAt(keys, c.t)} c={c} t={t} sceneLen={len} />
      ))}
    </>
  );
};

const NEAR_DRL = {x: 668, y: 590};
const FAR_DRL = {x: 206, y: 576};

// ------------------------------------------------------------------------------------- intro
export const Intro: React.FC<SceneProps> = ({t, len}) => {
  const e = EV.intro;
  const cam = camAt([{t: 0, cx: 770, cy: 566, z: 1.05}, {t: len + 0.4, cx: 752, cy: 560, z: 1.15}], t);
  const photo = easeInOut(ramp(t, e.photoIn, e.photoIn + 2.6));
  const core = ignite(t, e.drlOn);
  const bloom = core * (1 - 0.65 * photo);
  const near = toScreen(cam, NEAR_DRL.x, NEAR_DRL.y);
  const far = toScreen(cam, FAR_DRL.x, FAR_DRL.y);
  const flare = core * (0.12 + 0.75 * Math.exp(-Math.max(0, t - e.drlOn) * 1.1)) * (1 - 0.7 * photo);
  const titleO = smooth(ramp(t, e.title - 0.6, e.title + 0.4)) * (1 - smooth(ramp(t, len - 1.0, len - 0.35)));
  return (
    <AbsoluteFill>
      <CamLayer cam={cam}>
        <Photo />
        <Shade amount={1 - photo} />
        <Drl core={core} bloom={bloom} />
      </CamLayer>
      <Flare x={near.x} y={near.y} o={flare} />
      <Flare x={far.x} y={far.y} o={flare * 0.45} w={700} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: titleO,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.5) 32%, rgba(0,0,0,0) 58%)',
        }}
      />
      <div style={{position: 'absolute', inset: 0, opacity: titleO}}>
        <BigTitle t={t - e.title} text="КОНЦЕПТ-КУПЕ" sub="ОБЗОР ДИЗАЙНА" x={118} y={330} />
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------- 01 silhouette
export const Silhouette: React.FC<SceneProps> = ({t, len}) => {
  const e = EV.silhouette;
  const keys: Key[] = [{t: 0, cx: 735, cy: 560, z: 1.12}, {t: len + 0.4, cx: 800, cy: 556, z: 1.2}];
  const cam = camAt(keys, t);
  const dim = smooth(ramp(t, 0.45, 1.3)) * (1 - smooth(ramp(t, e.restore, e.restore + 1.3)));
  const u = easeInOut(ramp(t, e.draw, e.drawEnd));
  const edgeX = 140 + (1400 - 140) * u;
  const scanO = u > 0 && u < 1 ? Math.sin(Math.PI * u) : 0;
  const sx = toScreen(cam, edgeX, 0).x;
  return (
    <AbsoluteFill>
      <CamLayer cam={cam}>
        <Photo />
        <Shade amount={0.7 * dim} color="#04070c" />
        <Lines opacity={0.95 * dim} edgeX={edgeX} />
        <SilhouetteLine cam={cam} progress={u} opacity={dim} />
      </CamLayer>
      {scanO > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            left: sx - 60,
            top: BAR,
            width: 120,
            height: H - 2 * BAR,
            opacity: scanO * dim,
            mixBlendMode: 'screen',
            background:
              'linear-gradient(90deg, rgba(120,190,255,0) 0%, rgba(120,190,255,0.12) 45%, rgba(230,245,255,0.75) 50%, rgba(120,190,255,0.12) 55%, rgba(120,190,255,0) 100%)',
          }}
        />
      ) : null}
      <Callouts id="silhouette" keys={keys} t={t} len={len} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------- 02 light
export const Light: React.FC<SceneProps> = ({t, len}) => {
  const e = EV.light;
  const keys: Key[] = [{t: 0, cx: 640, cy: 592, z: 1.75}, {t: len + 0.4, cx: 662, cy: 590, z: 2.4}];
  const cam = camAt(keys, t);
  const dark = smooth(ramp(t, e.dark, e.dark + 0.55)) * (1 - smooth(ramp(t, e.restore, e.restore + 1.5)));
  const on = ignite(t, e.ignite);
  // before the ignition the lamps are "off" (the shade dims the photo's own LEDs as well)
  const core = on * (0.55 + 0.45 * dark);
  const bloom = on * (0.35 + 0.65 * dark);
  const near = toScreen(cam, NEAR_DRL.x, NEAR_DRL.y);
  const flare = on * (0.1 + 0.8 * Math.exp(-Math.max(0, t - e.ignite) * 1.3)) * (0.35 + 0.65 * dark);
  return (
    <AbsoluteFill>
      <CamLayer cam={cam}>
        <Photo />
        <Shade amount={0.82 * dark} />
        <Drl core={core} bloom={bloom} />
      </CamLayer>
      <Flare x={near.x - 60} y={near.y} o={flare} w={2000} />
      <Callouts id="light" keys={keys} t={t} len={len} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------- 03 aero
type Flow = {pts: [number, number][]; speed: number; phase: number; d: string; L: number};
const flow = (pts: [number, number][], speed: number, phase: number): Flow => ({
  pts,
  speed,
  phase,
  d: smoothPath(pts),
  L: polyLength(pts),
});
const FLOWS: Flow[] = [
  // over the nose, the bonnet and the roof
  flow([[30, 585], [180, 545], [330, 505], [500, 468], [640, 418], [780, 352], [960, 318], [1140, 336], [1320, 420]], 300, 0),
  flow([[40, 632], [230, 590], [420, 552], [610, 520], [780, 492], [980, 470], [1180, 466], [1360, 478]], 270, 110),
  flow([[30, 548], [170, 512], [320, 478], [470, 450], [600, 396], [760, 336], [940, 314]], 320, 50),
  // out of the arch, through the gill behind the front wheel, along the door
  flow([[840, 512], [930, 528], [992, 548], [1100, 560], [1240, 562], [1380, 560]], 240, 30),
  // along the sill
  flow([[690, 792], [850, 802], [955, 760], [1060, 712], [1200, 694], [1380, 696]], 280, 80),
  // under the nose into the splitter
  flow([[30, 722], [190, 716], [330, 716], [470, 742], [620, 774], [780, 792]], 300, 150),
];

export const Aero: React.FC<SceneProps> = ({t, len}) => {
  const e = EV.aero;
  const keys: Key[] = [{t: 0, cx: 520, cy: 612, z: 1.62}, {t: len + 0.4, cx: 745, cy: 606, z: 1.62}];
  const cam = camAt(keys, t);
  const o = smooth(ramp(t, e.flow, e.flow + 0.9)) * (1 - smooth(ramp(t, len - 0.7, len - 0.15)));
  return (
    <AbsoluteFill>
      <CamLayer cam={cam}>
        <Photo />
        <Shade amount={0.22 * smooth(ramp(t, 0.2, 1.0))} color="#03060b" />
        {o > 0.001 ? (
          <svg width={1536} height={1024} viewBox="0 0 1536 1024" style={{position: 'absolute', overflow: 'visible', opacity: o}}>
            {FLOWS.map((f, i) => {
              const x = f.speed * t + f.phase; // distance travelled by the leading dash
              const P = 300; // pattern period along the path, source px
              const tail = 120;
              const head = 34;
              return (
                <g key={i}>
                  <path d={f.d} fill="none" stroke={C.ice} strokeOpacity={0.24} strokeWidth={1.2 / cam.s} />
                  <path
                    d={f.d}
                    fill="none"
                    stroke={C.ice}
                    strokeOpacity={0.35}
                    strokeWidth={2.4 / cam.s}
                    strokeLinecap="round"
                    strokeDasharray={`${tail} ${P - tail}`}
                    strokeDashoffset={-x}
                  />
                  <path
                    d={f.d}
                    fill="none"
                    stroke={C.ice}
                    strokeOpacity={0.3}
                    strokeWidth={8 / cam.s}
                    strokeLinecap="round"
                    strokeDasharray={`${head} ${P - head}`}
                    strokeDashoffset={-(x + tail - head)}
                  />
                  <path
                    d={f.d}
                    fill="none"
                    stroke={C.iceStrong}
                    strokeWidth={2.6 / cam.s}
                    strokeLinecap="round"
                    strokeDasharray={`${head} ${P - head}`}
                    strokeDashoffset={-(x + tail - head)}
                  />
                </g>
              );
            })}
          </svg>
        ) : null}
      </CamLayer>
      <Callouts id="aero" keys={keys} t={t} len={len} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------- 04 wheels
const WHEEL = {cx: 884, cy: 673, rx: 94, ry: 164, rot: -3};

export const Wheels: React.FC<SceneProps> = ({t, len}) => {
  const e = EV.wheels;
  const keys: Key[] = [{t: 0, cx: 880, cy: 668, z: 1.95}, {t: len + 0.4, cx: 888, cy: 670, z: 2.15}];
  const cam = camAt(keys, t);
  const p = easeOut(ramp(t, e.ring, e.ring + 1.0));
  const o = Math.min(1, p * 1.5) * (1 - smooth(ramp(t, len - 0.7, len - 0.15)));
  const per1 = 2 * Math.PI * Math.sqrt((WHEEL.rx ** 2 + WHEEL.ry ** 2) / 2);
  const per2 = 2 * Math.PI * Math.sqrt(((WHEEL.rx + 16) ** 2 + (WHEEL.ry + 18) ** 2) / 2);
  const spin = Math.max(0, t - e.ring);
  return (
    <AbsoluteFill>
      <CamLayer cam={cam}>
        <Photo />
        <Shade amount={0.15 * smooth(ramp(t, 0.2, 1.0))} color="#03060b" />
        {o > 0.001 ? (
          <svg width={1536} height={1024} viewBox="0 0 1536 1024" style={{position: 'absolute', overflow: 'visible', opacity: o}}>
            <g transform={`rotate(${WHEEL.rot} ${WHEEL.cx} ${WHEEL.cy})`}>
              {/* main ring draws in, then its dashes keep turning */}
              <ellipse
                cx={WHEEL.cx}
                cy={WHEEL.cy}
                rx={WHEEL.rx}
                ry={WHEEL.ry}
                fill="none"
                stroke={C.iceStrong}
                strokeWidth={2 / cam.s}
                strokeDasharray={p < 1 ? `${per1 * p} ${per1}` : `${per1 / 36 - 6} 6`}
                strokeDashoffset={p < 1 ? 0 : -spin * 38}
              />
              <ellipse
                cx={WHEEL.cx}
                cy={WHEEL.cy}
                rx={WHEEL.rx + 16}
                ry={WHEEL.ry + 18}
                fill="none"
                stroke={C.ice}
                strokeOpacity={0.55}
                strokeWidth={1.6 / cam.s}
                strokeDasharray={`2 ${per2 / 72 - 2}`}
                strokeDashoffset={spin * 22}
              />
              <ellipse
                cx={WHEEL.cx}
                cy={WHEEL.cy}
                rx={WHEEL.rx}
                ry={WHEEL.ry}
                fill="none"
                stroke={C.ice}
                strokeOpacity={0.22}
                strokeWidth={8 / cam.s}
                strokeDasharray={`${per1 * p} ${per1}`}
              />
            </g>
          </svg>
        ) : null}
      </CamLayer>
      <Callouts id="wheels" keys={keys} t={t} len={len} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------- 05 colour & details
export const Details: React.FC<SceneProps> = ({t, len}) => {
  const e = EV.details;
  const keys: Key[] = [{t: 0, cx: 1100, cy: 520, z: 1.9}, {t: len + 0.4, cx: 1165, cy: 532, z: 2.05}];
  const cam = camAt(keys, t);
  const s1 = ramp(t, e.sweep1, e.sweep1 + 2.4);
  const s2 = ramp(t, e.sweep2, e.sweep2 + 2.4);
  return (
    <AbsoluteFill>
      <CamLayer cam={cam}>
        <Photo />
        {s1 > 0 && s1 < 1 ? <Sweep x={640 + 760 * easeInOut(s1)} strength={0.6 * Math.sin(Math.PI * s1)} /> : null}
        {s2 > 0 && s2 < 1 ? <Sweep x={1400 - 760 * easeInOut(s2)} strength={0.5 * Math.sin(Math.PI * s2)} angle={80} /> : null}
      </CamLayer>
      <Swatch t={t - 0.9} x={112} y={BAR + 46} out={1 - smooth(ramp(t, e.swatchOut, e.swatchOut + 0.5))} />
      <Callouts id="details" keys={keys} t={t} len={len} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------- verdict + end card
const NameField: React.FC<{t: number}> = ({t}) => {
  if (t < 0) return null;
  const o = easeOut(t / 0.6);
  const w = easeOut((t - 0.2) / 0.8);
  const blink = Math.floor(t * 2.2) % 2 === 0 ? 1 : 0;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: 372, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, fontFamily: FONT_UI, color: C.white}}>
        <div style={{fontWeight: 700, fontSize: 22, letterSpacing: '0.4em', color: 'rgba(238,241,245,0.85)', paddingBottom: 12}}>ИМЯ</div>
        <div style={{position: 'relative', width: 360, height: 54}}>
          <div style={{position: 'absolute', left: 8, bottom: 12, width: 3, height: 34, background: C.amber, opacity: 0.25 + 0.75 * blink}} />
          <div style={{position: 'absolute', left: 0, bottom: 0, width: 360 * w, height: 2, background: 'rgba(238,241,245,0.55)'}} />
        </div>
      </div>
    </div>
  );
};

export const Verdict: React.FC<SceneProps> = ({t, len}) => {
  const e = EV.verdict;
  const cam = camAt(
    [
      {t: 0, cx: 860, cy: 575, z: 1.55},
      {t: e.endcard, cx: 760, cy: 562, z: 1.06},
      {t: len + 0.4, cx: 758, cy: 562, z: 1.1},
    ],
    t,
  );
  const card = smooth(ramp(t, e.endcard, e.endcard + 0.9));
  const off = smooth(ramp(t, e.lightsOff, e.lightsOff + 0.5));
  const drlOff = smooth(ramp(t, e.lightsOff + 0.35, e.lightsOff + 0.95));
  const sweep = ramp(t, 0.9, 3.6);
  const near = toScreen(cam, NEAR_DRL.x, NEAR_DRL.y);
  const far = toScreen(cam, FAR_DRL.x, FAR_DRL.y);
  const flare = card * 0.32 * (1 - drlOff);
  const textO = card * (1 - off);
  return (
    <AbsoluteFill>
      <CamLayer cam={cam}>
        <Photo />
        {sweep > 0 && sweep < 1 ? <Sweep x={120 + 1300 * easeInOut(sweep)} strength={0.45 * Math.sin(Math.PI * sweep)} width={150} /> : null}
        <Shade amount={0.6 * card + 0.4 * off} />
        <Drl core={(0.35 + 0.65 * card) * (1 - drlOff)} bloom={card * 0.8 * (1 - drlOff)} />
      </CamLayer>
      <Flare x={near.x} y={near.y} o={flare} />
      <Flare x={far.x} y={far.y} o={flare * 0.5} w={700} />
      <div style={{position: 'absolute', inset: 0, opacity: textO}}>
        <BigTitle t={t - e.endcard - 0.15} text="КОНЦЕПТ-КУПЕ" align="center" x={0} y={236} />
        <NameField t={t - e.endcard - 0.9} />
      </div>
    </AbsoluteFill>
  );
};

export const SCENE_COMPONENTS: Record<SceneId, React.FC<SceneProps>> = {
  intro: Intro,
  silhouette: Silhouette,
  light: Light,
  aero: Aero,
  wheels: Wheels,
  details: Details,
  verdict: Verdict,
};
