import type {Cue} from './components';

// Scene start times, seconds (see script.md)
export const T = {
  s1: 0,
  s2: 5,
  s3: 12,
  s4: 22,
  s5: 36,
  s6: 51,
  s7: 61,
  s8: 74,
  s9: 88,
  s10: 98,
  s11: 110,
  s12: 119,
  s13: 134,
  s14: 147,
  s15: 159,
  s16: 171,
};

// Subtitles follow the synthesised voice-over line by line (written by audio/make_voice.py)
import timing from './voice-timing.json';

export const CUES: Cue[] = (timing as {start: number; end: number; text: string}[]).map((t) => [
  t.start - 0.05,
  t.end + 0.25,
  t.text,
]);
