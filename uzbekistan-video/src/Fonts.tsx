import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const LAT =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';

const FACES: [string, string, number[]][] = [
  ['Unbounded', 'unbounded', [600, 700, 800]],
  ['Manrope', 'manrope', [500, 700, 800]],
];

const css = FACES.flatMap(([fam, file, ws]) =>
  ws.flatMap((w) =>
    (['cyrillic', 'latin'] as const).map(
      (s) =>
        `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;src:url(${staticFile(
          `fonts/${file}-${s}-${w}-normal.woff2`,
        )}) format('woff2');unicode-range:${s === 'cyrillic' ? CYR : LAT};}`,
    ),
  ),
).join('\n');

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(
      FACES.flatMap(([fam, , ws]) =>
        ws.flatMap((w) => [
          document.fonts.load(`${w} 100px '${fam}'`, 'ЁАБВ'),
          document.fonts.load(`${w} 100px '${fam}'`, '0123456789'),
        ]),
      ),
    ).then(() => continueRender(handle));
  }, [handle]);
  return <style>{css}</style>;
};
