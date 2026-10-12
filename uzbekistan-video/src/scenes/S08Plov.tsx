import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeOutBack, ip, rnd} from '../theme';
import {Pill, Title} from '../components';
import {Non} from '../illustrations';

const Flames: React.FC<{f: number; x: number; y: number; w: number}> = ({f, x, y, w}) => (
  <g>
    {Array.from({length: 9}).map((_, i) => {
      const fx = x - w / 2 + (i + 0.5) * (w / 9);
      const h = 70 + Math.sin(f * 0.6 + i * 1.7) * 22 + rnd(i) * 30;
      const sway = Math.sin(f * 0.4 + i) * 10;
      return (
        <g key={i}>
          <path d={`M${fx - 26},${y} Q${fx - 20 + sway},${y - h * 0.6} ${fx + sway},${y - h} Q${fx + 20 + sway},${y - h * 0.6} ${fx + 26},${y} Z`} fill="#F08A24" />
          <path d={`M${fx - 14},${y} Q${fx - 10 + sway},${y - h * 0.4} ${fx + sway * 0.8},${y - h * 0.65} Q${fx + 10 + sway},${y - h * 0.4} ${fx + 14},${y} Z`} fill="#FFD25A" />
        </g>
      );
    })}
  </g>
);

const Steam: React.FC<{f: number; x: number; y: number; spread: number; n?: number}> = ({f, x, y, spread, n = 8}) => (
  <g filter="url(#s8-blur)">
    {Array.from({length: n}).map((_, i) => {
      const life = ((f * 0.9 + i * (90 / n)) % 90) / 90;
      const sx = x + (rnd(i) - 0.5) * spread + Math.sin(life * 6 + i) * 30;
      const sy = y - life * 360;
      return <ellipse key={i} cx={sx} cy={sy} rx={40 + life * 60} ry={30 + life * 50} fill="#fff" opacity={(1 - life) * 0.55} />;
    })}
  </g>
);

const Kazan: React.FC<{f: number}> = ({f}) => {
  const stir = Math.sin(f * 0.12);
  return (
    <g>
      {/* hearth */}
      <rect x={430} y={640} width={860} height={440} fill={C.brick} />
      {Array.from({length: 9}).map((_, r) =>
        Array.from({length: 9}).map((__, c) => (
          <rect key={`${r}-${c}`} x={430 + c * 96 + (r % 2) * 48 - 48} y={640 + r * 50} width={92} height={46} fill="#B5683A" opacity={0.55} />
        )),
      )}
      <rect x={430} y={640} width={860} height={440} fill="none" stroke="#7E3F1F" strokeWidth={6} />
      <path d="M680,1080 L680,930 Q860,860 1040,930 L1040,1080 Z" fill="#2A140A" />
      <ellipse cx={860} cy={1000} rx={170} ry={60} fill="#FF9B3D" opacity={0.5 + 0.2 * Math.sin(f * 0.5)} />
      <Flames f={f} x={860} y={1060} w={320} />
      {/* kazan body */}
      <path d="M420,560 Q440,840 860,850 Q1280,840 1300,560 Z" fill="#1E1E22" />
      <path d="M470,600 Q520,780 760,820" stroke="#4A4A52" strokeWidth={14} fill="none" opacity={0.6} strokeLinecap="round" />
      {/* plov mound */}
      <path d="M470,566 Q520,400 860,370 Q1200,400 1250,566 Z" fill="#E1A243" />
      {Array.from({length: 220}).map((_, i) => {
        const a = rnd(i) * Math.PI;
        const rr = Math.sqrt(rnd(i + 7));
        const gx = 860 + Math.cos(a) * 370 * rr * (rnd(i + 2) > 0.5 ? 1 : -1);
        const top = 566 - (1 - Math.pow((gx - 860) / 390, 2)) * 190;
        const gy = top + rnd(i + 11) * (566 - top);
        const col = i % 7 === 0 ? '#E0682A' : i % 3 === 0 ? '#F8DE9A' : '#EDBE62';
        return (
          <ellipse key={i} cx={gx} cy={gy} rx={i % 7 === 0 ? 18 : 9} ry={i % 7 === 0 ? 4 : 3.4} fill={col} transform={`rotate(${rnd(i + 5) * 180} ${gx} ${gy})`} />
        );
      })}
      {/* meat, garlic, chickpeas */}
      {[[790, 410], [880, 395], [960, 420], [840, 450]].map(([x, y], i) => (
        <rect key={i} x={x - 36} y={y - 22} width={72} height={44} rx={16} fill="#7A3B1C" />
      ))}
      {[[650, 480], [1080, 470]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={40} ry={34} fill="#F3EBDD" />
          {[-16, 0, 16].map((d) => (
            <path key={d} d={`M${x + d},${y - 32} Q${x + d * 1.4},${y} ${x + d},${y + 32}`} stroke="#D8CBB4" strokeWidth={3} fill="none" />
          ))}
        </g>
      ))}
      {Array.from({length: 14}).map((_, i) => (
        <circle key={i} cx={620 + rnd(i + 40) * 480} cy={470 + rnd(i + 60) * 80} r={9} fill="#E8D19A" stroke="#C9AE6E" strokeWidth={2} />
      ))}
      {/* rim */}
      <ellipse cx={860} cy={562} rx={440} ry={26} fill="none" stroke="#2E2E34" strokeWidth={18} />
      {/* kapgir (skimmer) */}
      <g transform={`translate(${1010 + stir * 60}, ${430 + Math.abs(stir) * 10}) rotate(${-28 + stir * 6})`}>
        <rect x={0} y={-8} width={520} height={16} rx={8} fill="#6B4A2F" />
        <ellipse cx={-30} cy={0} rx={70} ry={26} fill="#9AA0A8" />
        {Array.from({length: 7}).map((_, i) => (
          <circle key={i} cx={-70 + i * 13} cy={(i % 2) * 8 - 4} r={3.5} fill="#5B6068" />
        ))}
      </g>
      <Steam f={f} x={860} y={420} spread={500} />
    </g>
  );
};

const Passport: React.FC<{f: number}> = ({f}) => {
  const stamp = f - 118;
  const s = stamp < 0 ? 0 : stamp < 6 ? 1.8 - (stamp / 6) * 0.8 : 1;
  return (
    <g>
      <rect x={-150} y={-200} width={300} height={400} rx={22} fill={C.azureDeep} />
      <rect x={-150} y={-200} width={300} height={400} rx={22} fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="2 10" />
      <circle cy={-50} r={64} fill="none" stroke={C.gold} strokeWidth={6} />
      <path d={`M-44,-36 L0,-96 L44,-36 Z M-50,-28 L50,-28 L50,-16 L-50,-16 Z`} fill={C.gold} />
      {[-34, -12, 10, 32].map((x) => (
        <rect key={x} x={x - 5} y={-60} width={10} height={36} fill={C.gold} opacity={0} />
      ))}
      <text y={70} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={38} fill={C.gold}>
        ЮНЕСКО
      </text>
      <text y={120} textAnchor="middle" fontFamily={F.body} fontWeight={700} fontSize={22} fill="#C7D6EE">
        нематериальное наследие
      </text>
      {stamp >= 0 ? (
        <g transform={`translate(70, 140) rotate(-16) scale(${s})`} opacity={0.92}>
          <circle r={86} fill="none" stroke={C.red} strokeWidth={8} />
          <circle r={70} fill="none" stroke={C.red} strokeWidth={3} />
          <text y={-14} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={26} fill={C.red}>
            ПЛОВ
          </text>
          <text y={34} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={44} fill={C.red}>
            2016
          </text>
        </g>
      ) : null}
    </g>
  );
};

const Tandoor: React.FC<{f: number}> = ({f}) => {
  const breads = [10, 30, 50];
  return (
    <g>
      <ellipse cx={600} cy={960} rx={330} ry={50} fill="#000" opacity={0.12} />
      <path d="M300,960 Q290,560 600,520 Q910,560 900,960 Z" fill="#C98C55" />
      <path d="M340,940 Q330,600 600,566" stroke="#E2AE77" strokeWidth={18} fill="none" opacity={0.5} />
      <ellipse cx={600} cy={560} rx={150} ry={46} fill="#2A140A" />
      <ellipse cx={600} cy={570} rx={120} ry={30} fill="#FF8A2B" opacity={0.6 + 0.2 * Math.sin(f * 0.5)} />
      {/* stack */}
      {breads.map((t0, i) => {
        const t = clamp((f - t0) / 22);
        if (f < t0) return null;
        const e = Easing.inOut(Easing.quad)(t);
        const x = 600 + (1320 - 600) * e;
        const y = 560 - Math.sin(Math.PI * e) * 300 + (860 - i * 46 - 560) * e;
        return (
          <g key={i} transform={`translate(${x}, ${y}) scale(1, ${1 - 0.62 * e})`}>
            <Non cx={0} cy={0} r={190} seed={i + 2} />
          </g>
        );
      })}
    </g>
  );
};

const BreakNon: React.FC<{f: number}> = ({f}) => {
  const t = ip(f, [16, 40], [0, 1], Easing.out(Easing.cubic));
  return (
    <g>
      <g transform={`translate(${960 - t * 110}, ${560 + t * 10}) rotate(${-t * 9})`}>
        <Non cx={0} cy={0} r={280} half="l" seed={9} />
      </g>
      <g transform={`translate(${960 + t * 110}, ${560 + t * 10}) rotate(${t * 9})`}>
        <Non cx={0} cy={0} r={280} half="r" seed={9} />
      </g>
      {t > 0
        ? Array.from({length: 18}).map((_, i) => {
            const a = rnd(i) * Math.PI * 2;
            const d = t * (60 + rnd(i + 3) * 120);
            return <circle key={i} cx={960 + Math.cos(a) * d} cy={560 + Math.sin(a) * d * 0.6 + t * t * 120} r={4 + rnd(i) * 6} fill="#D99A4A" opacity={1 - t * 0.6} />;
          })
        : null}
      {/* knife crossed out */}
      <g transform="translate(330, 520)" opacity={ip(f, [30, 40], [0, 1])}>
        <circle r={96} fill="#fff" stroke={C.red} strokeWidth={10} />
        <path d="M-56,26 L44,-34 L56,-22 L-40,42 Z" fill="#9AA0A8" />
        <rect x={34} y={-50} width={44} height={22} rx={8} fill="#6B4A2F" transform="rotate(-31 56 -39)" />
        <line x1={-66} y1={-66} x2={66} y2={66} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
      </g>
      {/* face up */}
      <g transform="translate(1590, 520)" opacity={ip(f, [66, 76], [0, 1])}>
        <circle r={96} fill="#fff" stroke={C.turq} strokeWidth={10} />
        <path d="M0,-58 L40,-10 L14,-10 L14,56 L-14,56 L-14,-10 L-40,-10 Z" fill={C.turq} />
      </g>
    </g>
  );
};

export const S08Plov: React.FC<SceneProps> = ({f}) => {
  const p1 = f < 206;
  const p2 = f >= 196 && f < 306;
  const p3 = f >= 296;
  const passIn = ip(f, [64, 86], [0, 1], easeOutBack);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="s8-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FBF1DF" />
            <stop offset="1" stopColor="#EBCB98" />
          </linearGradient>
          <filter id="s8-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={18} />
          </filter>
        </defs>
        <rect width={1920} height={1080} fill="url(#s8-bg)" />
        {p1 ? (
          <g opacity={1 - ip(f, [196, 206], [0, 1])}>
            <g transform={`translate(-60, 40) scale(${ip(f, [0, 200], [1.0, 1.06])})`}>
              <Kazan f={f} />
            </g>
            <g transform={`translate(${1560 + (1 - passIn) * 600}, 560) rotate(${6 - passIn * 6})`}>
              <Passport f={f} />
            </g>
          </g>
        ) : null}
        {p2 ? (
          <g opacity={ip(f, [196, 206], [0, 1]) * (1 - ip(f, [296, 306], [0, 1]))}>
            <Tandoor f={f - 200} />
          </g>
        ) : null}
        {p3 ? (
          <g opacity={ip(f, [296, 306], [0, 1])}>
            <BreakNon f={f - 300} />
          </g>
        ) : null}
      </svg>
      <Title text="У плова есть паспорт ЮНЕСКО" f={f} start={12} end={200} x={110} y={70} size={70} accent="ЮНЕСКО" accentColor={C.azure} />
      <Title text="Лепёшку-нон ломают руками" f={f} start={206} x={110} y={70} size={70} accent="руками" accentColor={C.brick} />
      <Pill text="не ножом" x={330} y={660} f={f} start={334} bg={C.red} size={32} />
      <Pill text="лицом вверх" x={1590} y={660} f={f} start={370} bg={C.turqDeep} size={32} />
    </AbsoluteFill>
  );
};
