import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import type {SceneProps} from '../Root';
import {C, ip} from '../theme';
import {Title} from '../components';
import {DesertShips} from '../illustrations';

// 0:00–0:05 — the strongest frame: a ship stranded in the desert, drone pulls back
export const S01Hook: React.FC<SceneProps> = ({f}) => {
  const zoom = ip(f, [0, 150], [1.65, 1.0], Easing.out(Easing.quad));
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <DesertShips f={f} zoom={zoom} />
      <Title text="До моря — две границы" f={f} start={14} x={960} y={110} align="center" size={92} maxWidth={1700} accent="две границы" accentColor={C.brick} />
    </AbsoluteFill>
  );
};
