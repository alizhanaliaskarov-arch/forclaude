import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, easeInOut, ip, rnd} from '../theme';
import {IkatMotif, Pill, Stars, Title} from '../components';

const N = 30;
const TOP = 320;
const LEN = 520;
const MID = TOP + LEN / 2;
// resist (tied) zone per thread forms a diamond across the warp — that is how the ikat motif appears
const halfH = (i: number) => 210 * (1 - Math.abs(i - (N - 1) / 2) / (N / 2));

const Thread: React.FC<{i: number; x: number; dyed: number; dip: number}> = ({i, x, dyed, dip}) => {
  const h = halfH(i);
  const j1 = (rnd(i * 3) - 0.5) * 34;
  const j2 = (rnd(i * 7) - 0.5) * 34;
  const a = MID - h + j1;
  const b = MID + h + j2;
  const inner = h * 0.5;
  const c = MID - inner + j2 * 0.6;
  const d = MID + inner + j1 * 0.6;
  // dye colour climbs up from the bottom as threads come out of the vat
  const reveal = TOP + LEN - dyed * (LEN + 40);
  const segs: [number, number, string][] = [
    [TOP, a, C.turq],
    [a, c, '#FFFFFF'],
    [c, d, C.gold],
    [d, b, '#FFFFFF'],
    [b, TOP + LEN, C.turq],
  ];
  return (
    <g transform={`translate(0, ${dip})`}>
      {segs.map(([y0, y1, col], k) => {
        const showColor = dyed > 0;
        const y0c = Math.max(y0, showColor ? reveal : y1);
        const visible = showColor && y1 > y0c;
        return (
          <g key={k}>
            <rect x={x - 7} y={Math.min(y0, y1)} width={14} height={Math.abs(y1 - y0)} fill="#F7F3EA" />
            {visible ? <rect x={x - 7} y={y0c} width={14} height={y1 - y0c} fill={col} /> : null}
          </g>
        );
      })}
      {/* resist ties before dyeing */}
      {dyed < 0.02 ? (
        <>
          <rect x={x - 9} y={a} width={18} height={b - a} fill="none" stroke={C.ochre} strokeWidth={3} strokeDasharray="6 10" />
        </>
      ) : null}
    </g>
  );
};

const Suzani: React.FC = () => (
  <g>
    <rect x={-330} y={-330} width={660} height={660} fill="#F4EAD7" />
    <rect x={-330} y={-330} width={660} height={660} fill="none" stroke="#8E1F2B" strokeWidth={26} />
    {[
      [-150, -150],
      [150, -150],
      [-150, 150],
      [150, 150],
    ].map(([x, y], i) => (
      <g key={i} transform={`translate(${x}, ${y})`}>
        <circle r={110} fill="#B3263A" />
        <circle r={78} fill="#F4EAD7" />
        <circle r={58} fill="#B3263A" />
        {Array.from({length: 12}).map((_, k) => (
          <ellipse key={k} cx={0} cy={-92} rx={12} ry={22} fill="#2B3F7A" transform={`rotate(${k * 30})`} />
        ))}
        <circle r={20} fill={C.gold} />
      </g>
    ))}
    <circle r={60} fill="#2B3F7A" />
    <circle r={30} fill={C.gold} />
  </g>
);

export const S10Ikat: React.FC<SceneProps> = ({f}) => {
  const dip = ip(f, [12, 36], [0, 330], easeInOut) - ip(f, [52, 80], [0, 330], easeInOut);
  const dyed = ip(f, [54, 92], [0, 1], (t) => t);
  const vat = 1 - ip(f, [86, 104], [0, 1]);
  const weave = ip(f, [104, 150], [0, 1], (t) => t);
  const zoomOut = ip(f, [146, 196], [1, 0.36], Easing.inOut(Easing.cubic));
  const slide = ip(f, [196, 214], [0, 1], easeInOut);
  const night = f >= 226;
  const nightIn = ip(f, [226, 240], [0, 1]);
  const x0 = 960 - ((N - 1) * 22) / 2;

  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {!night || nightIn < 1 ? (
          <g>
            <rect width={1920} height={1080} fill="#E9D6B4" />
            <g transform={`translate(${960 - slide * 470}, ${MID}) scale(${zoomOut * (1 - slide * 0.1)}) translate(-960, ${-MID})`}>
              {/* neighbouring repeats appear as we pull back */}
              {zoomOut < 0.99
                ? [-2, -1, 1, 2].flatMap((dx) =>
                    [-1, 0, 1].map((dy) => (
                      <g key={`${dx}${dy}`} opacity={ip(zoomOut, [0.7, 1], [1, 0])}>
                        <rect x={x0 - 22 + dx * 680} y={TOP + dy * LEN} width={680} height={LEN} fill={C.turq} />
                        <IkatMotif
                          cx={960 + dx * 680}
                          cy={MID + dy * LEN}
                          w={640}
                          h={430}
                          seed={dx * 5 + dy * 11 + 40}
                          layers={['#FFFFFF', C.gold, '#FFFFFF', C.azure]}
                        />
                      </g>
                    )),
                  )
                : null}
              {zoomOut < 0.99
                ? [-1, 1].map((dy) => (
                    <g key={dy} opacity={ip(zoomOut, [0.7, 1], [1, 0])}>
                      <rect x={x0 - 22} y={TOP + dy * LEN} width={680} height={LEN} fill={C.turq} />
                      <IkatMotif cx={960} cy={MID + dy * LEN} w={640} h={430} seed={dy * 3 + 90} layers={['#FFFFFF', C.gold, '#FFFFFF', C.azure]} />
                    </g>
                  ))
                : null}
              {/* warp threads */}
              <rect x={x0 - 60} y={TOP - 40} width={(N - 1) * 22 + 120} height={30} rx={10} fill="#6B4A2F" opacity={1 - weave} />
              {Array.from({length: N}).map((_, i) => (
                <Thread key={i} i={i} x={x0 + i * 22} dyed={dyed} dip={dip} />
              ))}
              {/* weft rows */}
              {weave > 0
                ? Array.from({length: Math.floor(weave * 52)}).map((_, r) => (
                    <rect key={r} x={x0 - 8} y={TOP + LEN - (r + 1) * 10} width={(N - 1) * 22 + 16} height={4} fill="#000" opacity={0.08} />
                  ))
                : null}
              {/* shuttle */}
              {weave > 0 && weave < 1 ? (
                <rect x={x0 - 60 + Math.sin(f * 0.6) * 340 + 320} y={TOP + LEN - weave * 520 - 12} width={90} height={22} rx={11} fill={C.ochre} />
              ) : null}
            </g>
            {/* dye vat */}
            <g transform={`translate(0, ${(1 - vat) * 500})`}>
              <path d="M520,690 L1400,690 L1340,1080 L580,1080 Z" fill="#7A5236" />
              <ellipse cx={960} cy={700} rx={440} ry={40} fill={C.turqDeep} />
              <ellipse cx={960} cy={700} rx={400} ry={30} fill={C.turq} />
            </g>
            {/* suzani slides in */}
            {slide > 0 ? (
              <g transform={`translate(${1920 + 400 - slide * 940}, 560) scale(0.78)`}>
                <Suzani />
              </g>
            ) : null}
          </g>
        ) : null}
        {night ? (
          <g opacity={nightIn}>
            <rect width={1920} height={1080} fill={C.night} />
            <Stars f={f} n={160} seed={8} />
            {/* string lights */}
            <path d="M0,140 Q480,260 960,150 Q1440,260 1920,140" stroke="#3A4A6B" strokeWidth={3} fill="none" />
            {Array.from({length: 22}).map((_, i) => {
              const x = (i + 0.5) * (1920 / 22);
              const tt = (x % 960) / 960;
              const y = 140 + Math.sin(Math.PI * tt) * 85 + (x > 960 ? 0 : 0);
              return <circle key={i} cx={x} cy={y + 10} r={9} fill={[C.gold, C.turq, '#F08A24'][i % 3]} opacity={0.6 + 0.4 * Math.sin(f * 0.2 + i)} />;
            })}
            {/* fire + kazan with sumalak */}
            <ellipse cx={960} cy={1000} rx={420} ry={50} fill="#F08A24" opacity={0.35} />
            {Array.from({length: 7}).map((_, i) => {
              const fx = 760 + i * 66;
              const h = 80 + Math.sin(f * 0.6 + i * 1.3) * 26;
              return <path key={i} d={`M${fx - 28},1040 Q${fx},${1040 - h * 1.4} ${fx + 28},1040 Z`} fill={i % 2 ? '#FFD25A' : '#F08A24'} />;
            })}
            <path d="M560,700 Q580,960 960,970 Q1340,960 1360,700 Z" fill="#1E1E22" />
            <ellipse cx={960} cy={702} rx={400} ry={38} fill="#5A2E17" />
            {Array.from({length: 10}).map((_, i) => {
              const ph = ((f * 0.05 + i * 0.37) % 1);
              return <circle key={i} cx={680 + rnd(i) * 560} cy={700 + (rnd(i + 3) - 0.5) * 40} r={6 + ph * 12} fill="none" stroke="#8A4A2B" strokeWidth={3} opacity={1 - ph} />;
            })}
            <ellipse cx={960} cy={702} rx={420} ry={44} fill="none" stroke="#2E2E34" strokeWidth={16} />
            {/* long paddle + two women stirring in turns */}
            <g transform={`translate(${960 + Math.sin(f * 0.1) * 120}, 700) rotate(${-50 + Math.sin(f * 0.1) * 8})`}>
              <rect x={-10} y={-460} width={20} height={480} rx={10} fill="#8A5A34" />
              <ellipse cx={0} cy={20} rx={34} ry={60} fill="#8A5A34" />
            </g>
            {[
              [430, 1],
              [1490, -1],
            ].map(([x, dir]) => (
              <g key={x} transform={`translate(${x}, 960) scale(${dir}, 1)`}>
                <path d="M-70,0 Q-60,-220 0,-240 Q60,-220 70,0 Z" fill={dir > 0 ? '#B3263A' : C.turqDeep} />
                <circle cy={-280} r={44} fill="#C98E5C" />
                <path d="M-50,-280 Q-50,-340 0,-342 Q50,-340 50,-280 L56,-200 L-56,-200 Z" fill={dir > 0 ? C.gold : '#F4EAD7'} opacity={0.95} />
                <circle cy={-276} r={36} fill="#C98E5C" />
              </g>
            ))}
          </g>
        ) : null}
      </svg>
      <Title text="Узор появляется раньше ткани" f={f} start={10} end={226} x={110} y={70} size={72} maxWidth={1800} />
      <Pill text="атлас · икат" x={490} y={870} f={f} start={204} end={228} bg={C.turqDeep} size={32} />
      <Pill text="сюзане" x={1380} y={870} f={f} start={210} end={228} bg="#8E1F2B" size={32} />
      <Title text="Навруз: сумаляк всю ночь" f={f} start={240} x={110} y={70} size={72} color="#fff" accent="Навруз:" accentColor={C.goldLight} />
    </AbsoluteFill>
  );
};
