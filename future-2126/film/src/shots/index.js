// Все шаблоны кадров. Шаблон: (g, t, dur, p, cache, shot) — t в секундах от начала кадра (может выходить за [0, dur] на переходах).
import {W, H, rgba, vgrad} from '../core.js';
import {cityShots} from './city.js';
import {archiveShots} from './archive.js';
import {peopleShots} from './people.js';
import {spaceShots} from './space.js';
import {natureShots} from './nature.js';
import {urbanShots} from './urban.js';
import {interiorShots} from './interiors.js';

const todo = (g, t, dur, p, cache, shot) => {
  g.fillStyle = vgrad(g, 0, 0, H, [[0, '#1B2A3A'], [1, '#3A2A2A']]);
  g.fillRect(0, 0, W, H);
  g.fillStyle = rgba('#FFFFFF', 0.8);
  g.font = "700 60px 'Manrope'";
  g.fillText(`${shot.id} · ${shot.tpl}`, 120, H / 2);
};

export const TEMPLATES = {todo, ...cityShots, ...archiveShots, ...peopleShots, ...spaceShots, ...natureShots, ...urbanShots, ...interiorShots};
