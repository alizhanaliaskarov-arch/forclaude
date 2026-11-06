import React from 'react';
import {Composition} from 'remotion';
import {Review} from './Review';
import {FPS, TOTAL} from './data';

export const Root: React.FC = () => (
  <Composition id="Review" component={Review} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
