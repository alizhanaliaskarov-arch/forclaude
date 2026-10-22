import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, H, W, clamp, easeInOut, easeOutBack, easeOutExpo, ip, rnd} from '../theme';
import {Kinetic} from '../components';
import {S04Code} from './S04Code';
import {S05Data} from './S05Data';
import {S06Languages} from './S06Languages';
import {S09Design} from './S09Design';
import {S10Agents} from './S10Agents';
import {S03Manifesto} from './S03Manifesto';
import {CODE_LINES, STATS} from '../stats';

// 194–222 s. The twist: no camera, no photos, no stock audio — the whole film is code. Then: rewind.
const PREVIEW: [React.FC<{f: number; dur: number}>, number][] = [
  [S03Manifesto, 200],
  [S04Code, 420],
  [S05Data, 280],
  [S06Languages, 300],
  [S09Design, 300],
  [S10Agents, 300],
];
const CLIPS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];
const CLIP_COL = [C.coral, C.coral, C.amber, C.violet, C.amber, C.cyan, C.ivory, C.violet, C.pink, C.amber, C.blue, C.coral, C.night2, C.red, C.green, C.coral, C.mute];

const Tile: React.FC<{f: number; at: number; big: string; small: string; color: string}> = ({f, at, big, small, color}) => {
  const t = ip(f, [at, at + 18], [0, 1], easeOutBack);
  const strike = ip(f, [at + 20, at + 36], [0, 1], easeOutExpo);
  return (
    <div style={{width: 470, padding: '40px 36px', borderRadius: 30, background: 'rgba(21,24,35,0.92)', border: `2px solid ${color}`, transform: `scale(${t})`, opacity: clamp(t * 2), position: 'relative'}}>
      <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, lineHeight: 1, color}}>{big}</div>
      <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 40, color: C.ivory, marginTop: 14, position: 'relative', display: 'inline-block'}}>
        {small}
        <span style={{position: 'absolute', left: -6, right: -6, top: '55%', height: 6, background: color, transform: `scaleX(${strike})`, transformOrigin: 'left'}} />
      </div>
    </div>
  );
};

export const S13Reveal: React.FC<SceneProps> = ({f, dur}) => {
  const tilesOut = ip(f, [360, 390], [0, 1], easeInOut);
  const editor = ip(f, [370, 410], [0, 1], easeOutExpo);
  const editorOut = ip(f, [640, 670], [0, 1], easeInOut);
  const head = ip(f, [400, 640], [0, 1]);
  const [Prev, base] = PREVIEW[clamp(Math.floor(head * PREVIEW.length), 0, PREVIEW.length - 1)];
  const localPrev = base + ((f * 2) % 80);
  const codeScroll = (f - 370) * 3.2;
  // glitch in the last frames (the rewind)
  const g = ip(f, [dur - 40, dur], [0, 1]);
  const jitter = g > 0 ? (rnd(f) - 0.5) * 60 * g : 0;
  return (
    <AbsoluteFill style={{background: C.night, transform: `translateX(${jitter}px)`}}>
      {/* 1. the secret */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: ip(f, [90, 105], [1, 0])}}>
        <Kinetic text="А теперь — секрет." f={f - 8} size={120} weight={800} />
      </AbsoluteFill>
      {/* 2. zero tiles */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: 1 - tilesOut, transform: `scale(${1 - 0.2 * tilesOut})`}}>
        <div style={{display: 'flex', gap: 40}}>
          <Tile f={f} at={105} big="0" small="камер" color={C.coral} />
          <Tile f={f} at={215} big="0" small="фотографий" color={C.amber} />
          <Tile f={f} at={275} big="0" small="чужих звуков" color={C.cyan} />
        </div>
      </AbsoluteFill>
      {/* 3. the editor: preview, timeline, code */}
      {editor > 0 && editorOut < 1 ? (
        <AbsoluteFill style={{opacity: editor * (1 - editorOut), transform: `scale(${0.94 + 0.06 * editor})`}}>
          <div style={{position: 'absolute', left: 80, top: 90, width: 1056, height: 594, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 90px rgba(0,0,0,0.6)'}}>
            <div style={{width: W, height: H, transform: 'scale(0.55)', transformOrigin: 'top left'}}>
              <Prev f={localPrev} dur={600} />
            </div>
            <div style={{position: 'absolute', left: 18, top: 16, padding: '6px 14px', borderRadius: 8, background: C.red, color: '#fff', fontFamily: F.mono, fontSize: 18, fontWeight: 800}}>● ПРЕВЬЮ</div>
          </div>
          {/* code panel */}
          <div style={{position: 'absolute', left: 1170, top: 90, width: 670, height: 594, borderRadius: 18, background: C.panel, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'}}>
            <div style={{padding: '14px 20px', fontFamily: F.mono, fontSize: 18, color: C.mute, borderBottom: '1px solid rgba(255,255,255,0.06)'}}>src/ — {STATS.files} файлов</div>
            <div style={{padding: '10px 20px', fontFamily: F.mono, fontSize: 17, lineHeight: '27px', color: C.ivory, transform: `translateY(${-codeScroll % (CODE_LINES.length * 27)}px)`, whiteSpace: 'pre'}}>
              {[...CODE_LINES, ...CODE_LINES].map((l, i) => (
                <div key={i} style={{color: /^\s*(\/\/|#)/.test(l) ? C.mute : /const|return|export|import|def /.test(l) ? C.violet : C.ivory, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {l || ' '}
                </div>
              ))}
            </div>
          </div>
          {/* timeline */}
          <div style={{position: 'absolute', left: 80, right: 80, top: 720, height: 270, borderRadius: 18, background: C.panel, border: '1px solid rgba(255,255,255,0.08)', padding: '18px 24px', boxSizing: 'border-box'}}>
            {[
              ['ВИДЕО', 'кадры'],
              ['МУЗЫКА', 'синтез'],
              ['ГОЛОС', 'речь'],
            ].map(([n], row) => (
              <div key={n} style={{display: 'flex', alignItems: 'center', height: 70, gap: 14}}>
                <div style={{width: 120, fontFamily: F.mono, fontSize: 18, color: C.mute, letterSpacing: '0.1em'}}>{n}</div>
                <div style={{flex: 1, height: 52, position: 'relative', display: 'flex', gap: 4}}>
                  {row === 0
                    ? CLIPS.map((c, i) => (
                        <div key={c} style={{flex: [8, 10, 16, 20, 18, 18, 18, 18, 18, 18, 16, 16, 28, 24, 24, 20, 10][i], borderRadius: 8, background: CLIP_COL[i], opacity: 0.85, fontFamily: F.mono, fontSize: 16, color: C.night, padding: '4px 6px', fontWeight: 800, transform: `scaleY(${easeOutBack(clamp((f - 380 - i * 3) / 12))})`}}>
                          {c}
                        </div>
                      ))
                    : (
                        <svg width={1600} height={52}>
                          {Array.from({length: 220}).map((_, i) => {
                            const a = row === 1 ? 0.35 + 0.65 * Math.abs(Math.sin(i * 0.37) * Math.sin(i * 0.071 + 1)) : i % 9 < 5 ? 0.2 + 0.6 * rnd(i) : 0.05;
                            const vis = clamp((f - 390 - i * 0.6) / 6);
                            return <rect key={i} x={i * 7.2} y={26 - 24 * a * vis} width={4} height={48 * a * vis} rx={2} fill={row === 1 ? C.cyan : C.amber} />;
                          })}
                        </svg>
                      )}
                </div>
              </div>
            ))}
            {/* playhead */}
            <div style={{position: 'absolute', top: 10, bottom: 10, left: 158 + head * 1598, width: 3, background: C.red, boxShadow: `0 0 12px ${C.red}`}} />
          </div>
          {/* counters */}
          <div style={{position: 'absolute', left: 80, top: 30, display: 'flex', gap: 46, fontFamily: F.mono, fontSize: 24, color: C.ivory, letterSpacing: '0.08em'}}>
            {[
              [STATS.frames, 'кадров'],
              [STATS.scenes, 'сцен'],
              [STATS.lines, 'строк кода'],
              [1, 'автор'],
            ].map(([v, l], i) => (
              <span key={String(l)} style={{opacity: ip(f, [420 + i * 20, 440 + i * 20], [0, 1])}}>
                <b style={{color: [C.coral, C.amber, C.cyan, C.green][i]}}>{Math.round(Number(v) * ip(f, [420 + i * 20, 480 + i * 20], [0, 1])).toLocaleString('ru-RU')}</b> {l}
              </span>
            ))}
          </div>
        </AbsoluteFill>
      ) : null}
      {/* 4. written in code / myself */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: ip(f, [660, 680], [0, 1])}}>
        <div style={{opacity: ip(f, [718, 730], [1, 0])}}>
          <Kinetic text="НАПИСАНО КОДОМ." f={f - 660} size={130} weight={900} color={C.coral} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        {f >= 730 ? <Kinetic text="Вот что я умею." f={f - 730} size={120} weight={800} out={dur - 40 - 730} /> : null}
      </AbsoluteFill>
      {/* rewind glitch layer */}
      {g > 0 ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          {Array.from({length: 14}).map((_, i) => {
            const y = rnd(i + Math.floor(f / 2) * 13) * H;
            const h = 6 + rnd(i * 3 + f) * 60;
            return <div key={i} style={{position: 'absolute', left: 0, top: y, width: W, height: h, background: [C.cyan, C.red, C.ivory][i % 3], opacity: 0.25 * g, transform: `translateX(${(rnd(i + f) - 0.5) * 300}px)`}} />;
          })}
          <div style={{position: 'absolute', right: 80, top: 70, fontFamily: F.mono, fontWeight: 800, fontSize: 48, color: C.ivory, opacity: Math.floor(f / 6) % 2 ? 1 : 0.3}}>◀◀ REW</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
