// Все звуки синтезируются на лету — без внешних файлов.
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone({ freq = 440, to = null, dur = 0.12, type = 'sine', vol = 0.2, delay = 0 }) {
  const a = ac(); if (!a || muted) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator(); const g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur = 0.3, vol = 0.3) {
  const a = ac(); if (!a || muted) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const s = a.createBufferSource(); s.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
  const g = a.createGain(); g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start();
}

export const sfx = {
  unlock: () => ac(),
  star: () => { tone({ freq: 880, to: 1320, dur: 0.1, type: 'triangle', vol: 0.15 }); tone({ freq: 1320, to: 1760, dur: 0.1, type: 'triangle', vol: 0.1, delay: 0.06 }); },
  bonus: () => [660, 880, 1100, 1320].forEach((f, i) => tone({ freq: f, dur: 0.12, type: 'square', vol: 0.06, delay: i * 0.06 })),
  hit: () => { noise(0.35, 0.4); tone({ freq: 200, to: 60, dur: 0.3, type: 'sawtooth', vol: 0.12 }); },
  over: () => [523, 392, 330, 262].forEach((f, i) => tone({ freq: f, dur: 0.22, type: 'triangle', vol: 0.15, delay: i * 0.16 })),
  click: () => tone({ freq: 600, to: 900, dur: 0.06, type: 'square', vol: 0.06 }),
  toggleMute: () => (muted = !muted),
  isMuted: () => muted,
};
