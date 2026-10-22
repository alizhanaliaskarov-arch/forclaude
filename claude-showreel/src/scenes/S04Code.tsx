import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeInOut, easeOutExpo, ip} from '../theme';
import {Aurora, Chip, GridFloor, SceneTag, Window} from '../components';

// 34–54 s. An editor writes itself, a bug is found and fixed, the tests turn green.
type Tok = [string, string];
const K = C.violet;
const S = C.amber;
const N = C.cyan;
const T = C.ivory;
const M = C.mute;
const LINES: Tok[][] = [
  [['def ', K], ['average_check', N], ['(orders):', T]],
  [['    ', T], ['"""Средний чек по оплаченным заказам."""', M]],
  [['    paid = [o ', T], ['for', K], [' o ', T], ['in', K], [' orders ', T], ['if', K], [' o.status == ', T], ['"paid"', S], [']', T]],
  [['    total = ', T], ['sum', N], ['(o.amount ', T], ['for', K], [' o ', T], ['in', K], [' paid)', T]],
  [['    ', T], ['return', K], [' total / ', T], ['len', N], ['(orders)', T]],
  [['', T]],
  [['', T]],
  [['def ', K], ['test_average_check', N], ['():', T]],
  [['    orders = [Order(', T], ['100', S], [', ', T], ['"paid"', S], ['), Order(', T], ['50', S], [', ', T], ['"refund"', S], [')]', T]],
  [['    ', T], ['assert', K], [' average_check(orders) == ', T], ['100', S]],
];
const BUG_LINE = 4;
const FIXED: Tok[] = [['    ', T], ['return', K], [' total / ', T], ['max', N], ['(', T], ['len', N], ['(paid), ', T], ['1', S], [')', T]];

const lineLen = (l: Tok[]) => l.reduce((a, [s]) => a + s.length, 0);
const CPF = 2.2; // chars per frame

export const S04Code: React.FC<SceneProps> = ({f, dur}) => {
  // typing schedule
  let budget = Math.max(0, (f - 20) * CPF);
  const fixAt = 330;
  const fixed = f >= fixAt;
  const rendered = LINES.map((l, li) => {
    const line = li === BUG_LINE && fixed ? FIXED : l;
    const len = lineLen(line);
    const take = Math.min(len, budget);
    budget -= len;
    let left = take;
    return (
      <div key={li} style={{display: 'flex', height: 44, alignItems: 'center', position: 'relative'}}>
        <span style={{width: 56, color: '#4A5068', textAlign: 'right', marginRight: 28}}>{li + 1}</span>
        {line.map(([s, c], ti) => {
          const part = s.slice(0, Math.max(0, left));
          left -= s.length;
          return (
            <span key={ti} style={{color: c, whiteSpace: 'pre'}}>
              {part}
            </span>
          );
        })}
      </div>
    );
  });
  const runAt = 200;
  const bugGlow = f > 250 && f < fixAt ? 0.5 + 0.5 * Math.sin(f / 4) : 0;
  const fixFlash = ip(f, [fixAt, fixAt + 30], [1, 0]);
  const passAt = 390;
  const cam = ip(f, [0, dur], [1.0, 1.08], easeInOut);
  const camX = ip(f, [0, dur], [20, -30], easeInOut);
  return (
    <AbsoluteFill style={{background: C.night}}>
      <Aurora f={f} colors={[C.violet, C.cyan, C.coral]} opacity={0.32} />
      <GridFloor f={f} opacity={0.25} />
      <AbsoluteFill style={{transform: `scale(${cam}) translateX(${camX}px)`}}>
        <Window x={120} y={170} w={1080} h={640} title="analytics.py — Claude" style={{transform: `translateY(${ip(f, [0, 30], [60, 0], easeOutExpo)}px)`, opacity: ip(f, [0, 20], [0, 1])}}>
          <div style={{padding: '22px 10px', fontFamily: F.mono, fontSize: 25}}>
            {rendered}
          </div>
          {/* bug highlight */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 22 + BUG_LINE * 44,
              height: 44,
              background: fixed ? `rgba(70,212,131,${0.25 * fixFlash + 0.08})` : `rgba(255,93,108,${0.25 * bugGlow})`,
              borderLeft: `5px solid ${fixed ? C.green : bugGlow > 0 ? C.red : 'transparent'}`,
            }}
          />
          {f > 250 && f < fixAt + 120 ? (
            <div
              style={{
                position: 'absolute',
                left: 640,
                top: 22 + BUG_LINE * 44 - 70,
                padding: '10px 18px',
                borderRadius: 12,
                background: fixed ? C.green : C.red,
                color: C.night,
                fontFamily: F.body,
                fontWeight: 800,
                fontSize: 22,
                transform: `scale(${ip(f, [250, 262], [0.6, 1], easeOutExpo)})`,
                opacity: ip(f, [fixAt + 90, fixAt + 120], [1, 0]),
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
            >
              {fixed ? '✓ Исправлено: делим на оплаченные' : '⚠ Делим на все заказы, а не на оплаченные'}
            </div>
          ) : null}
        </Window>
        <Window x={1250} y={250} w={560} h={480} title="terminal" style={{opacity: ip(f, [runAt - 20, runAt], [0, 1]), transform: `translateX(${ip(f, [runAt - 20, runAt + 10], [80, 0], easeOutExpo)}px)`}}>
          <div style={{padding: 24, fontFamily: F.mono, fontSize: 22, lineHeight: 1.75, color: C.ivory}}>
            <div style={{color: C.mute}}>$ pytest -q</div>
            {f > runAt + 15 && f < passAt ? (
              <>
                <div>
                  <span style={{color: C.green}}>{'.'.repeat(clamp(Math.floor((f - runAt - 15) / 2), 0, 22))}</span>
                  <span style={{color: C.red}}>{f > runAt + 60 ? 'F' : ''}</span>
                </div>
                {f > runAt + 70 ? (
                  <>
                    <div style={{color: C.red}}>FAILED test_average_check</div>
                    <div style={{color: C.mute}}>assert 75.0 == 100</div>
                    <div style={{color: C.red}}>1 failed, 127 passed</div>
                  </>
                ) : null}
              </>
            ) : null}
            {f >= passAt ? (
              <>
                <div style={{color: C.green}}>{'.'.repeat(clamp(Math.floor((f - passAt) / 1.5), 0, 23))}</div>
                {f > passAt + 40 ? (
                  <div style={{marginTop: 20, fontSize: 40, fontWeight: 800, color: C.green, transform: `scale(${ip(f, [passAt + 40, passAt + 52], [0.6, 1], easeOutExpo)})`, transformOrigin: 'left center'}}>
                    ✓ 128 passed
                  </div>
                ) : null}
                {f > passAt + 70 ? <div style={{color: C.mute, marginTop: 8}}>за 0.42 с · покрытие 96%</div> : null}
              </>
            ) : null}
          </div>
        </Window>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 120, bottom: 120, display: 'flex', gap: 18}}>
        {['Python', 'TypeScript', 'Rust', 'Go', 'SQL', 'Swift', 'C++'].map((l, i) => (
          <Chip key={l} text={l} f={f} at={60 + i * 10} color={[C.cyan, C.blue, C.coral, C.cyan, C.amber, C.coral, C.violet][i]} style={{fontSize: 24, padding: '10px 22px'}} />
        ))}
      </div>
      <SceneTag f={f} n="01" label="КОД" />
    </AbsoluteFill>
  );
};
