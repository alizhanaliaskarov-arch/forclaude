import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bokeh, SceneProps, Stage, WarmLight} from '../fx';
import {C, F, H, W, easeInOut, ip, kf, lineAt} from '../theme';
import {ProduceTable} from './S1Intro';

export const S8Outro: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('outro', n);
  const z = kf(f, [[0, 1.0], [dur, 1.16]], easeInOut);
  const rot = kf(f, [[0, 2], [dur, -1.5]], easeInOut);
  const t1 = Math.min(ip(f, [20, 50], [0, 1]), ip(f, [L(1) + 10, L(1) + 30], [1, 0]));
  const q = ip(f, [L(2) - 6, L(2) + 18], [0, 1]);
  const c = ip(f, [L(3) + 10, L(3) + 30], [0, 1]);
  const end = ip(f, [dur - 45, dur], [1, 0], easeInOut);
  return (
    <AbsoluteFill>
      <Stage cam={[z, W / 2, H / 2]} rot={rot}>
        <ProduceTable f={f + 400} start={-400} />
      </Stage>
      <WarmLight f={f} />
      <Bokeh f={f} seed={3} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        {t1 > 0 && (
          <div style={{position: 'absolute', opacity: t1, background: 'rgba(251, 248, 240, 0.9)', borderRadius: 48, padding: '56px 90px 60px', boxShadow: '0 30px 80px rgba(60,35,10,0.25)', textAlign: 'center'}}>
            <div style={{fontFamily: F.display, fontSize: 120, lineHeight: 1.04, color: C.greenDeep}}>
              Healthy Food,
              <br />
              <span style={{color: C.green}}>Healthy Life</span>
            </div>
            <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 34, color: C.green, marginTop: 22}}>Variety · Balance · Enjoyment</div>
          </div>
        )}
        {q > 0 && (
          <div style={{position: 'absolute', opacity: q * end, transform: `scale(${0.94 + q * 0.06})`, textAlign: 'center'}}>
            <div style={{background: 'rgba(30, 70, 50, 0.94)', borderRadius: 48, padding: '60px 96px 64px', boxShadow: '0 30px 80px rgba(20,30,10,0.3)'}}>
              <div style={{fontFamily: F.body, fontWeight: 800, fontSize: 30, letterSpacing: 6, textTransform: 'uppercase', color: C.mint}}>Your turn</div>
              <div style={{fontFamily: F.display, fontSize: 104, lineHeight: 1.08, color: C.paper, marginTop: 16}}>
                What healthy habit
                <br />
                will you try?
              </div>
            </div>
            <div style={{opacity: c, marginTop: 34, display: 'inline-block', background: 'rgba(253,254,251,0.94)', color: C.greenDeep, fontFamily: F.body, fontWeight: 800, fontSize: 38, padding: '16px 40px', borderRadius: 999, transform: `translateY(${(1 - c) * 14}px)`}}>
              Tell me in the comments
            </div>
          </div>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: C.cream, opacity: 1 - end}} />
    </AbsoluteFill>
  );
};
