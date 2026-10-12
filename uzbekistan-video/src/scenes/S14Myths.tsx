import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, F, clamp, easeOutBack, ip, rnd} from '../theme';
import {IkatStrip, MajolicaCorners, Sun} from '../components';

const STAMPS = [60, 42, 27]; // local frame per card
const CARD = 120;

const Ski: React.FC<{t: number}> = ({t}) => {
  const p = clamp((t - 50) / 70);
  const sx = 120 + p * 520;
  const sy = 230 + p * 330;
  return (
    <g>
      <rect width={820} height={760} fill="#9DCBF0" />
      <path d="M0,260 L260,120 L420,230 L600,90 L820,260 L820,760 L0,760 Z" fill="#F4F8FC" />
      <path d="M260,120 L330,190 L300,260 L420,230 Z M600,90 L660,170 L620,240 L820,260 Z" fill="#C9DBEE" />
      <path d="M0,520 Q400,300 820,700 L820,760 L0,760 Z" fill="#FFFFFF" />
      {/* gondola */}
      <line x1={0} y1={160} x2={820} y2={40} stroke="#3A4A6B" strokeWidth={4} />
      <g transform={`translate(${200 + t * 2}, ${130 - t * 0.3})`}>
        <line x1={0} y1={0} x2={0} y2={40} stroke="#3A4A6B" strokeWidth={4} />
        <rect x={-34} y={40} width={68} height={56} rx={12} fill={C.red} />
        <rect x={-24} y={50} width={48} height={22} rx={4} fill="#DDEBF7" />
      </g>
      {/* skier */}
      <g transform={`translate(${sx}, ${sy}) rotate(28)`}>
        <rect x={-50} y={36} width={110} height={8} rx={4} fill={C.ink} />
        <path d="M-6,34 L-16,0 L10,-20 L22,6 L14,34 Z" fill={C.azure} />
        <rect x={-14} y={-56} width={30} height={40} rx={10} fill={C.turq} />
        <circle cx={2} cy={-70} r={14} fill="#C98E5C" />
        <path d="M-12,-76 Q2,-96 16,-76 Z" fill={C.red} />
        <line x1={-12} y1={-40} x2={-46} y2={30} stroke={C.ink} strokeWidth={4} />
      </g>
      {Array.from({length: 40}).map((_, i) => (
        <circle key={i} cx={(rnd(i) * 820 + t * 1.2) % 820} cy={(rnd(i + 4) * 760 + t * (2 + rnd(i) * 2)) % 760} r={3 + rnd(i) * 3} fill="#fff" />
      ))}
    </g>
  );
};

const Sign: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect width={820} height={760} fill="#F1E6D2" />
    <IkatStrip x={0} y={600} width={820} height={160} seed={11} bg={C.turqDeep} />
    <rect x={396} y={420} width={28} height={180} fill="#55606F" />
    <g transform={`translate(410, 300) rotate(${Math.sin(t * 0.08) * 1.2})`}>
      <rect x={-330} y={-170} width={660} height={300} rx={26} fill={C.azure} stroke="#fff" strokeWidth={10} />
      <text y={-30} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={76} fill="#fff">
        Xush kelibsiz!
      </text>
      <text y={60} textAnchor="middle" fontFamily={F.body} fontWeight={800} fontSize={54} fill={C.goldLight}>
        Toshkent
      </text>
    </g>
  </g>
);

const SunrisePlov: React.FC<{t: number}> = ({t}) => (
  <g>
    <defs>
      <linearGradient id="s14-dawn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5A7FC0" />
        <stop offset="0.55" stopColor="#F2A07A" />
        <stop offset="1" stopColor="#FCD9A0" />
      </linearGradient>
    </defs>
    <rect width={820} height={760} fill="url(#s14-dawn)" />
    <g transform={`translate(0, ${-t * 0.6})`}>
      <Sun cx={410} cy={470} r={110} color="#FFE7B0" glow="#FFC680" />
    </g>
    <rect x={0} y={480} width={820} height={280} fill="#7A4A2B" />
    <path d="M190,500 Q210,690 410,700 Q610,690 630,500 Z" fill="#1E1E22" />
    <path d="M220,505 Q260,410 410,395 Q560,410 600,505 Z" fill="#E1A243" />
    <ellipse cx={410} cy={502} rx={226} ry={16} fill="none" stroke="#2E2E34" strokeWidth={12} />
    {Array.from({length: 6}).map((_, i) => {
      const life = ((t * 0.9 + i * 15) % 90) / 90;
      return <ellipse key={i} cx={330 + i * 30 + Math.sin(life * 6 + i) * 20} cy={380 - life * 260} rx={30 + life * 40} ry={22 + life * 30} fill="#fff" opacity={(1 - life) * 0.5} />;
    })}
  </g>
);

const MYTHS = [
  {myth: '«Там всегда жарко»', Art: Ski},
  {myth: '«Пишут кириллицей»', Art: Sign},
  {myth: '«Плов — на ужин»', Art: SunrisePlov},
];

const Stamp: React.FC<{t: number}> = ({t}) => {
  if (t < 0) return null;
  const s = t < 6 ? 2.2 - (t / 6) * 1.2 : 1;
  return (
    <g transform={`translate(470, 640) rotate(-12) scale(${s})`} opacity={t < 2 ? 0.6 : 0.92}>
      <rect x={-170} y={-70} width={340} height={140} rx={18} fill="none" stroke={C.red} strokeWidth={12} />
      <text y={36} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={96} fill={C.red}>
        МИФ
      </text>
    </g>
  );
};

const Card: React.FC<{idx: number; t: number}> = ({idx, t}) => {
  const st = STAMPS[idx];
  const shake = t >= st && t < st + 8 ? Math.sin((t - st) * 3) * (8 - (t - st)) * 1.5 : 0;
  const art = easeOutBack(clamp((t - st - 4) / 14));
  const {myth, Art} = MYTHS[idx];
  return (
    <g transform={`translate(${shake}, 0)`}>
      <rect width={1920} height={1080} fill={C.paper} />
      <MajolicaCorners s={48} />
      <text x={110} y={250} fontFamily={F.body} fontWeight={800} fontSize={40} fill={C.inkSoft}>
        {`Миф ${idx + 1} из 3`}
      </text>
      <foreignObject x={100} y={330} width={820} height={300}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 82, lineHeight: 1.1, color: C.ink}}>{myth}</div>
      </foreignObject>
      <Stamp t={t - st} />
      {art > 0 ? (
        <g transform={`translate(1410, 520) scale(${art}) translate(-410, -380)`}>
          <defs>
            <clipPath id={`s14-clip-${idx}`}>
              <rect width={820} height={760} rx={40} />
            </clipPath>
          </defs>
          <g clipPath={`url(#s14-clip-${idx})`}>
            <Art t={t - st} />
          </g>
          <rect width={820} height={760} rx={40} fill="none" stroke="#fff" strokeWidth={12} />
        </g>
      ) : null}
    </g>
  );
};

export const S14Myths: React.FC<SceneProps> = ({f}) => {
  const idx = Math.min(2, Math.floor(f / CARD));
  const t = f - idx * CARD;
  const enter = idx === 0 ? 1 : ip(t, [0, 14], [0, 1], Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
        {enter < 1 ? (
          <g transform={`translate(0, ${-enter * 300})`} opacity={1 - enter * 0.6}>
            <Card idx={idx - 1} t={t + CARD} />
          </g>
        ) : null}
        <g transform={`translate(0, ${(1 - enter) * 1080})`}>
          <Card idx={idx} t={t} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
