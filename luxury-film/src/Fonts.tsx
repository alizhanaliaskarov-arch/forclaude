import React, {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const FACES: [string, string, number[]][] = [
  ['Cormorant Garamond', 'cormorant-garamond', [300, 400, 500]],
  ['Inter', 'inter', [200, 300, 400]],
];

const css = FACES.flatMap(([fam, file, ws]) =>
  ws.map(
    (w) =>
      `@font-face{font-family:'${fam}';font-weight:${w};font-style:normal;src:url(${staticFile(`fonts/${file}-latin-${w}-normal.woff2`)}) format('woff2');}`,
  ),
).join('\n');

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(FACES.flatMap(([fam, , ws]) => ws.map((w) => document.fonts.load(`${w} 100px '${fam}'`, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ.')))).then(() =>
      continueRender(handle),
    );
  }, [handle]);
  return <style>{css}</style>;
};
