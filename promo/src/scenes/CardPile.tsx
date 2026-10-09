import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, easeInExpo, ip, rnd} from '../theme';
import {TaskCard} from '../components';

const TITLES = [
  'Отчёт до 18:00', 'Ответить маме', 'Купить подарок', 'Созвон 15:30', 'Оплатить налоги',
  'Спортзал', 'Презентация!!!', 'Записаться к врачу', 'Дописать диплом', 'Разобрать почту',
  'Счёт за свет', 'Забрать посылку', 'Правки от клиента', 'Позвонить в банк', 'Выучить английский',
  'Сдать документы', 'Планёрка 10:00', 'Накормить кота', 'Продлить визу', 'Купить билеты',
];
const PALETTE = [
  {bg: C.cream, fg: C.ink},
  {bg: C.ink2, fg: C.cream},
  {bg: C.orange, fg: C.ink},
  {bg: C.lime, fg: C.ink},
];

export const CARD_COUNT = 20;

// Cards rain down 3-4 per beat during the chaos scene (f = scene-local frame),
// then get sucked into a single point (collapse 0..1) in the turn.
export const CardPile: React.FC<{f: number; collapse?: number}> = ({f, collapse = 0}) => {
  const out = [];
  for (let i = 0; i < CARD_COUNT; i++) {
    const spawn = 2 + Math.floor(i / 2.5) * 6 + (i % 2) * 2; // clusters per beat
    const tx = 540 + (rnd(i * 3.3) - 0.5) * 360;
    const ty = 360 + rnd(i * 5.1) * 1050;
    const rot = (rnd(i * 7.7) - 0.5) * 36;
    const k = ip(f, [spawn, spawn + 9], [0, 1], (t) => 1 - Math.pow(1 - t, 3));
    const bounce = f >= spawn + 9 ? Math.sin((f - spawn - 9) * 0.9) * Math.exp(-(f - spawn - 9) / 5) * 22 : 0;
    const y = ty - (1 - k) * 1300 + bounce;
    const sc = 0.9 + rnd(i * 2.2) * 0.5;
    const c = PALETTE[i % PALETTE.length];
    // collapse
    const cp = easeInExpo(collapse);
    const ang = cp * 5 + i;
    const cx = tx + (540 - tx) * cp + Math.cos(ang) * 120 * (1 - cp) * cp * 4;
    const cy = y + (960 - y) * cp + Math.sin(ang) * 120 * (1 - cp) * cp * 4;
    const shrink = 1 - cp * 0.97;
    if (f < spawn) continue;
    out.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: cx - 320,
          top: cy - 75,
          transform: `rotate(${rot * k + cp * 400}deg) scale(${sc * shrink})`,
          opacity: 1,
        }}
      >
        <TaskCard title={TITLES[i]} tag={i % 3 === 0 ? 'СРОЧНО' : undefined} bg={c.bg} fg={c.fg} />
      </div>,
    );
  }
  return <AbsoluteFill style={{overflow: 'hidden'}}>{out}</AbsoluteFill>;
};
