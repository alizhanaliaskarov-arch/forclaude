import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {FPS, H, TOTAL, W} from './theme';

export const Root: React.FC = () => (
  <>
    {/* 9:16 for Reels / TikTok / Shorts — with voice-over */}
    <Composition id="Luxury" component={Film} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{voice: true}} />
    {/* 16:9 for YouTube — with voice-over (render with --scale=2 for 3840×2160) */}
    <Composition id="LuxuryWide" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} defaultProps={{voice: true}} />
    {/* music only, no voice */}
    <Composition id="LuxuryClean" component={Film} durationInFrames={TOTAL} fps={FPS} width={W} height={H} defaultProps={{voice: false}} />
  </>
);
