"""
Original background music for "Healthy Food, Healthy Life", synthesised with numpy/scipy
(no samples, nothing to license), then mixed under the voice-over with gentle ducking.

Warm acoustic pop in G major, 92 BPM, I-V-vi-IV: fingerpicked guitar (Karplus-Strong),
felt-piano melody, soft pad, round bass, light shaker + kick. Sections follow src/timeline.json.
Writes public/music.wav (music only) and public/soundtrack_vo.wav (music + voice).
"""
import json
import os
import wave

import numpy as np
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))
DUR = TL['total']
N = int(np.ceil(DUR * SR))
SC = {s['id']: (s['start'], s['end']) for s in TL['scenes']}
BPM = 92
B = 60 / BPM
BAR = 4 * B
rng = np.random.default_rng(7)

mus = np.zeros((2, N))
verb = np.zeros((2, N))


def put(sig, t, gain=1.0, pan=0.0, send=0.2):
    i = int(round(t * SR))
    if i >= N or i < 0:
        return
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    for bus, g in ((mus, 1.0), (verb, send)):
        bus[0, i:i + n] += sig[:n] * gain * g * l
        bus[1, i:i + n] += sig[:n] * gain * g * r


def tt(d):
    return np.arange(int(SR * d)) / SR


def lp(x, fc):
    return signal.sosfilt(signal.butter(2, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc):
    return signal.sosfilt(signal.butter(2, fc, 'high', fs=SR, output='sos'), x)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def env_ar(n, a, r):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[n - nr:] *= np.linspace(1, 0, nr)
    return e


def pluck(f, dur, bright=0.5, decay=0.996):
    P = max(2, int(round(SR / f)))
    total = int(dur * SR)
    burst = rng.uniform(-1, 1, P)
    burst = bright * burst + (1 - bright) * np.convolve(burst, np.ones(6) / 6, 'same')
    out = np.zeros(total + P)
    out[:P] = burst
    s = P
    while s < total + P:
        prev = out[s - P:s]
        sh = np.concatenate(([out[s - P - 1] if s - P - 1 >= 0 else 0], prev[:-1]))
        e = min(s + P, total + P)
        out[s:e] = (decay * 0.5 * (prev + sh))[:e - s]
        s += P
    y = out[P:]
    y = lp(y, 5000) + 0.3 * signal.sosfilt(signal.butter(2, [110, 300], 'band', fs=SR, output='sos'), y)
    return y * env_ar(len(y), 0.002, 0.08)


def piano(m, dur, vel=1.0):
    x = tt(dur)
    f = mtof(m)
    s = sum(a * np.sin(2 * np.pi * f * h * x) * np.exp(-x * (1.6 + h * 0.9)) for h, a in ((1, 1), (2, 0.45), (3, 0.18), (4, 0.08)))
    s = lp(s, 3200) * vel
    return s * env_ar(len(x), 0.004, 0.3)


def pad(ms, dur):
    x = tt(dur)
    s = np.zeros(len(x))
    for m in ms:
        for d in (-0.07, 0, 0.07):
            s += signal.sawtooth(2 * np.pi * mtof(m + d) * x + rng.uniform(0, 6))
    return lp(s / (3 * len(ms)), 1100) * env_ar(len(x), 1.0, 1.2)


def bass(m, dur):
    x = tt(dur)
    f = mtof(m)
    s = np.sin(2 * np.pi * f * x) + 0.25 * np.sin(4 * np.pi * f * x)
    return s * np.exp(-x * 1.2) * env_ar(len(x), 0.01, 0.15)


def kick():
    x = tt(0.35)
    f = 50 + 70 * np.exp(-x * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 12)


def shaker():
    x = tt(0.09)
    return hp(rng.standard_normal(len(x)), 6000) * np.exp(-x * 60) * env_ar(len(x), 0.012, 0.01)


def bell(m, dur=2.5):
    x = tt(dur)
    f = mtof(m)
    s = np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-x * 4)
    return s * np.exp(-x * 2.2) * env_ar(len(x), 0.002, 0.2)


# G  D/F#  Em  C   (root midi, triad notes for arpeggio)
CH = [(43, [55, 59, 62, 67]), (42, [54, 57, 62, 66]), (40, [52, 55, 59, 64]), (36, [48, 55, 60, 64])]
ARP = [0, 2, 1, 3, 2, 1, 3, 2]  # eighth-note picking pattern
MEL = [  # felt piano motif per 4-bar cycle: (beat offset, midi, beats)
    [(0, 74, 1.5), (1.5, 71, 0.5), (2, 72, 1), (3, 74, 1), (4, 76, 2), (6, 74, 2), (8, 71, 1.5), (9.5, 69, 0.5), (10, 67, 2), (12, 72, 1.5), (13.5, 71, 0.5), (14, 67, 2)],
    [(0, 71, 1), (1, 74, 1), (2, 79, 2), (4, 78, 1), (5, 74, 1), (6, 73, 2), (8, 71, 2), (10, 74, 2), (12, 72, 1), (13, 71, 1), (14, 69, 2)],
]

end_t = SC['outro'][1]
nbars = int(np.ceil(end_t / BAR))
water = SC['water']
for b in range(nbars):
    t0 = b * BAR
    if t0 > end_t - 3 * BAR:
        break
    root, notes = CH[b % 4]
    # intensity by section
    drums = SC['produce'][0] - 0.1 <= t0 < water[0] or SC['together'][0] <= t0 < SC['outro'][0] + 2 * BAR
    melody = (SC['plate'][0] <= t0 < water[0]) or (SC['habits'][0] <= t0)
    put(pad([n - 12 for n in notes[:3]] + [notes[0]], BAR + 1.0), t0, 0.10, 0, 0.5)
    for i, a in enumerate(ARP):
        put(pluck(mtof(notes[a]), 1.6), t0 + i * B / 2 + rng.uniform(0, 0.008), 0.20, -0.35 + 0.1 * (i % 3), 0.25)
    if t0 >= SC['intro'][0] + 2 * BAR:
        put(bass(root, B * 2.0), t0, 0.32, 0, 0.05)
        put(bass(root + (7 if b % 2 else 12), B * 1.6), t0 + 2.5 * B, 0.22, 0, 0.05)
    if drums:
        put(kick(), t0, 0.45, 0, 0.02)
        put(kick(), t0 + 2 * B, 0.35, 0, 0.02)
        for i in range(8):
            put(shaker(), t0 + i * B / 2 + B / 4, 0.06 if i % 2 else 0.035, 0.4, 0.1)
    if melody and b % 4 == 0:
        for off, m, beats in MEL[(b // 4) % 2]:
            put(piano(m, beats * B + 1.2, 0.9), t0 + off * B, 0.16, 0.2, 0.45)

# sparkle on every scene change
for s in TL['scenes'][1:]:
    for j, m in enumerate((79, 83, 86)):
        put(bell(m), s['start'] - 0.3 + j * 0.09, 0.05, 0.3 - j * 0.2, 0.6)
# final ringing chord
tf = (nbars - 3) * BAR if (nbars - 3) * BAR < end_t else end_t - 6
for j, m in enumerate([43, 55, 59, 62, 67, 71, 74]):
    put(pluck(mtof(m), 6.0, decay=0.9985), tf + j * 0.06, 0.2, -0.3 + 0.1 * j, 0.4)
put(pad([55, 59, 62, 67], 7.0), tf, 0.12, 0, 0.6)
put(piano(79, 6.0), tf + 0.4, 0.12, 0.2, 0.6)

# reverb: stereo exponentially-decaying noise
ir_t = tt(2.4)
ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))]) * np.exp(-ir_t * 3.0)
ir = np.stack([lp(ir[0], 6000), lp(ir[1], 6000)]) * 0.03
wet = np.stack([signal.fftconvolve(verb[c], ir[c])[:N] for c in range(2)])
music = mus + wet
fade_out = np.minimum(1, (DUR - np.arange(N) / SR) / 3.0).clip(0, 1)
music *= fade_out
music *= np.minimum(1, np.arange(N) / SR / 1.5)
music = music / (np.max(np.abs(music)) + 1e-9) * 0.8


def read_mono(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16) / 32767.0


def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1).T * 32767).astype(np.int16).tobytes())


voice = read_mono(os.path.join(ROOT, 'public', 'voiceover.wav'))
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
env = signal.sosfilt(signal.butter(1, 3, 'low', fs=SR, output='sos'), np.abs(voice))
act = np.clip((env > 0.006).astype(float), 0, 1)
k = int(0.4 * SR)
act = np.clip(np.convolve(act, np.ones(k) / k, 'same') * 2, 0, 1)
duck = 1 - 0.62 * act  # about -8.5 dB under the voice
mix = music * duck * 0.55 + np.stack([voice, voice]) * 0.95
mix *= 0.97 / max(0.97, np.max(np.abs(mix)))
write(os.path.join(ROOT, 'public', 'music.wav'), music * 0.55)
write(os.path.join(ROOT, 'public', 'soundtrack_vo.wav'), mix)
print('done', DUR)

# mastering: about -16 LUFS for YouTube / Telegram, with a look-ahead peak limiter at -1.5 dBFS
import subprocess  # noqa: E402

src = os.path.join(ROOT, 'public', 'soundtrack_vo.wav')
dst = os.path.join(ROOT, 'public', 'soundtrack_master.wav')
meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
integrated = float(meas.rsplit('I:', 1)[1].split('LUFS')[0])
gain = -16.0 - integrated
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-af',
                f'volume={gain:.2f}dB,alimiter=limit=0.84:attack=5:release=80:level=disabled', '-ar', str(SR), dst], check=True)
print(f'master: {integrated:.1f} LUFS -> gain {gain:+.1f} dB -> {dst}')
