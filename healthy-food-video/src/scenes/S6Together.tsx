import React from 'react';
import {AbsoluteFill} from 'remotion';
import * as A from '../art';
import {Bokeh, Chip, SceneProps, SceneTitle, Stage, WarmLight} from '../fx';
import {H, W, easeInOut, ip, kf, lineAt, pop} from '../theme';

const TABLE = 690; // table top edge (side view)

/** a seated person seen from the front, simple and faceless (no facial features, mitten hands) */
const Person: React.FC<{x: number; f: number; shirt: string; hair: string; skin: string; seed: number; long?: boolean; lift?: number; s?: number}> = ({x, f, shirt, hair, skin, seed, long, lift = 0, s = 1}) => {
  const breathe = Math.sin(f / 45 + seed) * 2;
  const tilt = Math.sin(f / 70 + seed * 2) * 2.2;
  const nod = Math.sin(f / 55 + seed) * 2;
  const armY = -lift * 70;
  return (
    <g transform={`translate(${x} ${TABLE}) scale(${s})`}>
      {/* chair back */}
      <rect x="-120" y="-330" width="240" height="330" rx="40" fill="#8C5E33" />
      <rect x="-100" y="-310" width="200" height="300" rx="30" fill="#A06C3C" />
      {/* torso */}
      <path d={`M-110 0C-112-120-90-${190 + breathe}-60-${200 + breathe}H60C90-${190 + breathe} 112-120 110 0Z`} fill={shirt} />
      <path d={`M-30-${200 + breathe}Q0-${170 + breathe} 30-${200 + breathe}`} stroke="#000" strokeOpacity="0.12" strokeWidth="6" fill="none" />
      {/* neck + head */}
      <g transform={`translate(0 ${-200 - breathe + nod}) rotate(${tilt})`}>
        <rect x="-18" y="-40" width="36" height="46" rx="14" fill={skin} />
        <ellipse cx="0" cy="-92" rx="58" ry="66" fill={skin} />
        {long ? (
          <path d="M-62-90C-70-170 70-170 62-90C66-40 70 10 54 20C50-20 50-60 40-110C10-90-30-96-54-110C-56-60-50-20-56 20C-72 10-66-40-62-90Z" fill={hair} />
        ) : (
          <path d="M-60-96C-66-160 60-170 62-100C50-120 30-130 0-128C-30-128-48-118-60-96Z" fill={hair} />
        )}
        <ellipse cx="-56" cy="-86" rx="9" ry="14" fill={skin} />
        <ellipse cx="56" cy="-86" rx="9" ry="14" fill={skin} />
      </g>
      {/* arms resting on the table (right arm can lift a glass) */}
      <path d="M-104-120C-130-60-110-10-70 6" stroke={shirt} strokeWidth="44" strokeLinecap="round" fill="none" />
      <ellipse cx="-60" cy="8" rx="30" ry="20" fill={skin} />
      <path d={`M104-120C130-60 116 ${-10 + armY} 74 ${6 + armY}`} stroke={shirt} strokeWidth="44" strokeLinecap="round" fill="none" />
      {lift > 0.01 && <A.Glass x={70} y={-50 + armY} s={0.32} fill={0.7} id={`pg${seed}`} />}
      <ellipse cx="64" cy={8 + armY} rx="30" ry="20" fill={skin} />
    </g>
  );
};

/** ice cream sundae in a glass cup, side view, base at y=0 */
const Sundae: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="56" ry="10" fill="#2B3A30" opacity="0.15" />
      <rect x="-34" y="-14" width="68" height="14" rx="6" fill="#E3ECEF" />
      <rect x="-8" y="-62" width="16" height="50" fill="#E3ECEF" />
      <circle cx="-34" cy="-150" r="44" fill="url(#gPink)" />
      <circle cx="34" cy="-150" r="44" fill="url(#gCake)" />
      <circle cx="0" cy="-184" r="40" fill="url(#gChoc)" />
      <path d="M-30-206C-20-218 0-222 14-214" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="6" cy="-228" r="14" fill="#C8302A" />
      <path d="M6-242C8-254 16-260 24-262" stroke="#5BAA3E" strokeWidth="4" fill="none" />
      <path d="M-84-136Q-84-60 0-58Q84-60 84-136Z" fill="#F4F8F9" opacity="0.94" stroke="#C9D6DA" strokeWidth="3" />
      <path d="M-66-120Q-60-80-20-72" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
  );

/** foreshortened top-down dish on the table */
const OnTable: React.FC<{x: number; y: number; s?: number; children: React.ReactNode}> = ({x, y, s = 1, children}) => (
  <g transform={`translate(${x} ${y}) scale(${s} ${s * 0.42})`}>{children}</g>
);

export const S6Together: React.FC<SceneProps> = ({f, dur}) => {
  const L = (n: number) => lineAt('together', n);
  const tT = L(4) + 10;
  const z = kf(f, [[0, 1.0], [L(3), 1.07], [tT, 1.07], [tT + 60, 1.4], [L(6), 1.4], [dur, 1.46]], easeInOut);
  const cx = kf(f, [[0, 960], [L(3), 990], [tT, 990], [tT + 60, 1290], [dur, 1300]], easeInOut);
  const cy = kf(f, [[0, 540], [L(3), 560], [tT, 560], [tT + 60, 690], [dur, 700]], easeInOut);
  const lift = (a: number) => Math.min(ip(f, [a, a + 30], [0, 1], easeInOut), ip(f, [a + 90, a + 120], [1, 0], easeInOut));
  const tCake = L(5) + 15;
  const tChoc = L(5) + 45;
  const tIce = L(5) + 75;
  const small = ip(f, [L(6) + 50, L(6) + 80], [0, 1], easeInOut);
  return (
    <AbsoluteFill>
      <Stage cam={[z, cx, cy]} bg="#EBD9BE">
        {/* warm evening room */}
        <rect x="-600" y="-400" width="3200" height="1200" fill="#EAD6B8" />
        <rect x="1300" y="60" width="440" height="420" rx="14" fill="#D9C2A0" />
        <rect x="1324" y="84" width="392" height="372" fill="#F2B880" />
        <rect x="1324" y="84" width="392" height="372" fill="#E98E6A" opacity="0.35" />
        <circle cx="1520" cy="380" r="70" fill="#FFD9A0" opacity="0.8" />
        <rect x="1512" y="84" width="16" height="372" fill="#D9C2A0" />
        <rect x="1324" y="262" width="392" height="16" fill="#D9C2A0" />
        <rect x="200" y="120" width="300" height="220" rx="10" fill="#C9A77E" />
        <rect x="216" y="136" width="268" height="188" fill="#7FB56A" />
        <path d="M216 300C280 250 330 280 380 240C420 210 450 230 484 220V324H216Z" fill="#4E8F3D" />
        {/* pendant lamp glow */}
        <rect x="956" y="-400" width="8" height="470" fill="#5B3A23" />
        <path d="M880 70H1040L1000 0H920Z" fill="#2A5C40" />
        <ellipse cx="960" cy="78" rx="44" ry="14" fill="#FFE7A8" />
        <circle cx="960" cy="200" r="420" fill="url(#gSh)" opacity="0" />
        {/* people */}
        <Person x={560} f={f} shirt="#4E9F3D" hair="#3A2A1E" skin="#E2B48C" seed={1} lift={lift(L(1) + 30)} />
        <Person x={840} f={f} shirt="#E07A5F" hair="#1E1A16" skin="#9C6B48" seed={2} long />
        <Person x={1100} f={f} shirt="#3E58A8" hair="#6B4A2B" skin="#F0CBA8" seed={3} s={0.82} long />
        <Person x={1380} f={f} shirt="#E9C46A" hair="#2E2420" skin="#C68E62" seed={4} lift={lift(L(2) + 40)} />
        {/* table */}
        <path d={`M-200 ${TABLE}H2120L2300 1300H-380Z`} fill="#F4EFE4" />
        <path d={`M-200 ${TABLE}H2120V${TABLE + 14}H-200Z`} fill="#E2D9C6" />
        {Array.from({length: 14}, (_, i) => (
          <path key={i} d={`M${-200 + i * 170} ${TABLE}L${-380 + i * 192} 1300`} stroke="#D9CFBC" strokeOpacity="0.5" strokeWidth="3" />
        ))}
        {/* shared dishes */}
        <OnTable x={560} y={790} s={1.25}><A.Plate /><A.Salmon s={0.6} r={-20} sh={false} /><A.Broccoli x={40} y={30} s={0.4} sh={false} /></OnTable>
        <OnTable x={840} y={790} s={1.25}><A.Plate /><A.Rice brown s={0.6} x={-20} sh={false} /><A.Tomato x={40} y={10} s={0.35} sh={false} /></OnTable>
        <OnTable x={1100} y={790} s={1.25}><A.Plate /><A.Chicken s={0.55} sh={false} /><A.Lettuce x={-30} y={30} s={0.4} /></OnTable>
        <OnTable x={1380} y={790} s={1.25}><A.Plate /><A.Lettuce s={0.6} /><A.Egg x={20} y={10} s={0.5} sh={false} /></OnTable>
        <OnTable x={960} y={920} s={2.2}>
          <A.BowlTop s={0.8} color="#2A7A3E" inner="#F7F7F2">
            <A.Lettuce s={0.9} r={20} /><A.Tomato x={-30} y={20} s={0.35} sh={false} /><A.Tomato x={30} y={-20} s={0.35} sh={false} /><A.CucumberSlice x={20} y={30} s={0.4} />
          </A.BowlTop>
        </OnTable>
        <A.Glass x={700} y={760} s={0.3} fill={0.75} id="tg1" />
        <A.Glass x={1240} y={760} s={0.3} fill={0.75} id="tg2" />
        <OnTable x={300} y={900} s={1.8}><A.BowlTop s={0.7} color="#F2EFE6" inner="#F2EFE6"><A.Orange x={-20} y={-10} s={0.6} sh={false} /><A.Apple x={30} y={20} s={0.55} sh={false} /><A.Banana x={0} y={30} s={0.6} sh={false} /></A.BowlTop></OnTable>
        {/* treats */}
        <OnTable x={1240} y={880} s={1.2}><A.Plate s={0.9 - small * 0.25} /></OnTable>
        <A.CakeSlice x={1240} y={850} s={(0.95 - small * 0.35) * pop(f, tCake)} />
        <OnTable x={1420} y={890} s={1.1}><A.Chocolate s={pop(f, tChoc) * 0.9} r={10} /></OnTable>
        <Sundae x={1590} y={880} s={0.72 * pop(f, tIce)} />
      </Stage>
      <WarmLight f={f} tint="rgba(255, 196, 120, 0.36)" />
      <Bokeh f={f} seed={17} n={8} color="255, 214, 150" />
      <SceneTitle f={f} dur={dur} n="5" title="Enjoy meals together" hold={tT} />
      <Chip x={W / 2} y={170} anchor="center" size={40} o={Math.min(ip(f, [L(3) + 10, L(3) + 28], [0, 1]), ip(f, [tT - 10, tT + 4], [1, 0]))}>
        Screens off · Food and people on
      </Chip>
      <Chip x={W - 90} y={190} anchor="right" size={44} dark o={Math.min(ip(f, [tT + 50, tT + 70], [0, 1]), ip(f, [L(6) - 10, L(6) + 6], [1, 0]))}>
        Treats can fit too
      </Chip>
      <Chip x={W - 90} y={190} anchor="right" size={44} dark o={ip(f, [L(6) + 6, L(6) + 24], [0, 1])}>
        Balance, not perfection
      </Chip>
      {['Smaller portion', 'Savor it', 'No guilt'].map((t, i) => (
        <Chip key={t} x={W - 90} y={290 + i * 76} anchor="right" size={34} o={ip(f, [L(6) + 50 + i * 30, L(6) + 68 + i * 30], [0, 1])}>
          {t}
        </Chip>
      ))}
    </AbsoluteFill>
  );
};
