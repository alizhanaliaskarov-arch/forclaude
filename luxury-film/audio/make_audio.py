"""
Original score + sound design for the 60-second luxury film, synthesised from scratch with numpy/scipy.
No samples and no third-party audio. 48 kHz stereo, dialogue-free.

Dark electronic-orchestral, D minor, 96 BPM (beat 0.625 s, bar 2.5 s), chords Dm – B♭ – Gm – A.
  0–10   drone, restrained sub, glassy high textures; a metallic ting when the line catches the light
  10–25  a measured pulse, delicate percussion, metallic accents; denser from 17 with cuts every two beats
  25–35  the first peak: deep impact, drums, bass, strings and brass swell
  35–43  space: pads and texture only, fine clicks while the silhouette is traced
  43–52  final climax → restrained impact at 46 → near-silence → a last pulse
  52–60  a deep sustained note, a long metallic tail for the name, clean fade to silence
Writes public/soundtrack.wav.
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 60.0
N = int(SR * DUR)
B = 60 / 96
BAR = 4 * B
rng = np.random.default_rng(3)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def bus():
    return np.zeros((2, N))


mus, drm, sfx, verb = bus(), bus(), bus(), bus()
KICK = np.zeros(N)


def put(b, x, t, g=1.0, pan=0.0, send=0.0):
    i = int(round(t * SR))
    if i >= N or len(x) == 0:
        return
    if i < 0:
        x = x[-i:]
        i = 0
    n = min(len(x), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    b[0, i:i + n] += x[:n] * g * l
    b[1, i:i + n] += x[:n] * g * r
    if send:
        verb[0, i:i + n] += x[:n] * g * send * l
        verb[1, i:i + n] += x[:n] * g * send * r


def tt(d):
    return np.arange(int(SR * d)) / SR


def lp(x, fc, o=2):
    return signal.sosfilt(signal.butter(o, min(fc, SR / 2 - 200), 'low', fs=SR, output='sos'), x)


def hp(x, fc, o=2):
    return signal.sosfilt(signal.butter(o, fc, 'high', fs=SR, output='sos'), x)


def bp(x, a, b, o=2):
    return signal.sosfilt(signal.butter(o, [a, min(b, SR / 2 - 200)], 'band', fs=SR, output='sos'), x)


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def env(n, a, r, s=1.0):
    e = np.ones(n) * s
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    e[:na] *= np.linspace(0, 1, na) ** 1.5
    e[n - nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e


# ───────────── instruments ─────────────

def strings(midis, t, dur, g=0.1, cutoff=1800, a=1.2, r=1.2, send=0.6):
    """Ensemble strings: detuned saws with slow vibrato, warm low-pass."""
    x = tt(dur)
    s = np.zeros(len(x))
    for m in midis:
        for k in range(6):
            det = (k - 2.5) * 0.06
            vib = 1 + 0.003 * np.sin(2 * np.pi * (4.8 + k * 0.3) * x + k)
            ph = 2 * np.pi * np.cumsum(mtof(m + det) * vib) / SR + rng.uniform(0, 6)
            s += signal.sawtooth(ph)
    s = lp(s / (len(midis) * 6) ** 0.6, cutoff)
    s *= env(len(x), a, r)
    put(mus, s, t, g, rng.uniform(-0.15, 0.15), send)


def brass(midis, t, dur, g=0.08, peak=2600):
    """Brass swell: saw stack whose brightness rises with the envelope."""
    x = tt(dur)
    s = np.zeros(len(x))
    for m in midis:
        for det in (-0.05, 0.05):
            s += signal.sawtooth(2 * np.pi * mtof(m + det) * x)
    e = env(len(x), dur * 0.55, dur * 0.3)
    s = lp(s, 500) * (1 - e) + lp(s, peak) * e
    put(mus, s * e / len(midis), t, g, 0.0, 0.5)


def bell(t, midi, g=0.12, dec=2.5, pan=0.0, ratio=3.5, idx=2.2):
    """FM metallic bell / resonance."""
    x = tt(dec * 2.2)
    f = mtof(midi)
    mod = np.sin(2 * np.pi * f * ratio * x) * idx * np.exp(-x / (dec * 0.4))
    s = np.sin(2 * np.pi * f * x + mod) * np.exp(-x / dec)
    s *= np.minimum(x / 0.002, 1)
    put(sfx, s, t, g, pan, 0.7)


def drone(t, dur, midis, g=0.1, cutoff=500):
    x = tt(dur)
    s = np.zeros(len(x))
    for m in midis:
        s += np.sin(2 * np.pi * mtof(m) * x + 0.4 * np.sin(2 * np.pi * 0.07 * x)) + 0.25 * signal.sawtooth(2 * np.pi * mtof(m) * 1.002 * x)
    s = lp(s / len(midis), cutoff)
    put(mus, s * env(len(x), 2.0, 2.0), t, g, 0.0, 0.3)


def sub(t, dur, midi=26, g=0.18):
    x = tt(dur)
    s = np.sin(2 * np.pi * mtof(midi) * x)
    put(mus, s * env(len(x), 1.5, 1.5), t, g)


def texture(t, dur, g=0.03, lo=6000, hi=14000):
    """Glassy high texture: band-limited noise, slowly breathing."""
    x = tt(dur)
    s = bp(rng.standard_normal(len(x)), lo, hi) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * x))
    put(sfx, s * env(len(x), 1.5, 1.5), t, g, 0.0, 0.5)
    # a few glass partials
    for k, m in enumerate((86, 93, 98)):
        p = np.sin(2 * np.pi * mtof(m) * x) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.11 + k * 0.05) * x + k))
        put(sfx, p * env(len(x), 2.0, 2.0), t, g * 0.25, (k - 1) * 0.6, 0.8)


def kick(t, g=0.5, deep=True):
    x = tt(0.6)
    f = (38 if deep else 48) + 90 * np.exp(-x / 0.028)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / (0.28 if deep else 0.16))
    put(drm, s, t, g)
    i = int(t * SR)
    n = min(int(0.3 * SR), N - i)
    if n > 0:
        KICK[i:i + n] = np.maximum(KICK[i:i + n], np.exp(-np.arange(n) / SR / 0.12))


def snare(t, g=0.2):
    x = tt(0.5)
    s = bp(rng.standard_normal(len(x)), 900, 7000) * np.exp(-x / 0.11) + 0.4 * np.sin(2 * np.pi * 180 * x) * np.exp(-x / 0.05)
    put(drm, s, t, g, 0.0, 0.55)


def tom(t, midi, g=0.25):
    x = tt(0.7)
    f = mtof(midi) * (1 + 0.6 * np.exp(-x / 0.03))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.25)
    put(drm, s, t, g, rng.uniform(-0.3, 0.3), 0.4)


def tick(t, g=0.06, pan=0.3, hi=9000):
    x = tt(0.05)
    s = hp(rng.standard_normal(len(x)), hi) * np.exp(-x / 0.008)
    put(drm, s, t, g, pan, 0.15)


def rim(t, g=0.06):
    x = tt(0.06)
    s = bp(rng.standard_normal(len(x)), 2500, 6000) * np.exp(-x / 0.01) + np.sin(2 * np.pi * 2100 * x) * np.exp(-x / 0.006) * 0.5
    put(drm, s, t, g, -0.35, 0.3)


def click(t, g=0.08, pan=0.0):
    """Precise mechanical click."""
    x = tt(0.025)
    s = bp(rng.standard_normal(len(x)), 3000, 11000) * np.exp(-x / 0.0025) + np.sin(2 * np.pi * 4200 * x) * np.exp(-x / 0.002) * 0.4
    put(sfx, s, t, g, pan, 0.2)


def bass(t, midi, dur, g=0.2):
    x = tt(dur)
    f = mtof(midi)
    s = np.sin(2 * np.pi * f * x) + 0.35 * lp(signal.sawtooth(2 * np.pi * f * x), 400)
    put(mus, s * env(len(x), 0.005, 0.06), t, g)


def whoosh(t, dur=0.8, g=0.12, rise=True, metallic=True):
    """Restrained air movement, optionally with a metallic comb resonance."""
    x = tt(dur)
    nz = rng.standard_normal(len(x))
    out = np.zeros(len(x))
    k = 20
    seg = len(x) // k
    for j in range(k):
        p = j / (k - 1)
        fc = 400 + (p if rise else 1 - p) * 5000
        sl = slice(j * seg, (j + 1) * seg if j < k - 1 else len(x))
        out[sl] = bp(nz, fc * 0.7, fc * 1.4)[sl]
    if metallic:
        d = int(SR / 1180)
        comb = out.copy()
        comb[d:] += 0.7 * comb[:-d]
        out = 0.6 * out + 0.4 * comb
    e = np.sin(np.pi * x / dur) ** 2
    put(sfx, out * e, t - dur / 2, g, 0.0, 0.3)


def impact(t, g=0.45, tail=2.5):
    x = tt(tail)
    f = 34 + 50 * np.exp(-x / 0.06)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.9)
    s += lp(rng.standard_normal(len(x)), 900) * np.exp(-x / 0.18) * 0.5
    put(sfx, s, t, g, 0.0, 0.35)
    put(sfx, hp(rng.standard_normal(len(x)), 5000) * np.exp(-x / 0.7) * 0.25, t, g, 0.0, 0.5)


def reverse_swell(t_end, dur, g=0.15):
    x = tt(dur)
    s = bp(rng.standard_normal(len(x)), 1200, 12000) * (x / dur) ** 3
    put(sfx, s, t_end - dur, g, 0.0, 0.5)


def riser(t0, t1, g=0.08):
    d = t1 - t0
    x = tt(d)
    p = x / d
    f = 150 * 2 ** (p * 4)
    s = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.3 + hp(rng.standard_normal(len(x)), 3000) * 0.5 * p
    put(sfx, lp(s, 9000) * p ** 2.5, t0, g, 0.0, 0.5)


# ───────────── harmony ─────────────
CH = [([50, 53, 57], 38), ([46, 50, 53], 34), ([43, 46, 50], 31), ([45, 49, 52], 33)]  # Dm Bb Gm A


def chord(t):
    return CH[int((t - 10) // BAR) % 4] if t >= 10 else CH[0]


def beats(a, b, step=B):
    t = a
    while t < b - 1e-6:
        yield t
        t += step


# ───────────── arrangement ─────────────
# 0–10: atmosphere
drone(0.0, 11.0, [38, 45], 0.09, 380)
sub(0.3, 10.5, 26, 0.12)
texture(1.0, 9.5, 0.025)
bell(3.05, 93, 0.05, 2.8, 0.3)
bell(3.05, 86, 0.03, 3.2, -0.3)
reverse_swell(5.0, 1.0, 0.16)
whoosh(4.6, 0.9, 0.1, rise=True)
impact(5.0, 0.22, 2.0)
bell(6.0, 98, 0.025, 1.6, 0.2, ratio=2.01, idx=1.2)  # "FORM." appears
for i in range(18):  # slivers aligning: clicks that tighten and lock
    tc = 6.2 + 2.4 * (1 - (1 - i / 17) ** 1.7)
    click(tc, 0.05 + 0.02 * (i / 17), pan=(rng.uniform(-0.6, 0.6)))
click(8.6, 0.12)
click(8.62, 0.08)
for k in range(30):
    bell(8.4 + k * 0.03, 100 + (k % 5), 0.004, 0.3, rng.uniform(-0.8, 0.8))  # dissolve sparkle

# 10–25: measured pulse
whoosh(10.0, 0.5, 0.1, rise=False)
bell(10.0, 81, 0.06, 2.0)
for t in beats(10, 25, BAR):
    notes, root = chord(t)
    strings([n + 12 for n in notes], t, BAR + 0.6, 0.075, 1500 if t < 17 else 2100, a=0.9, r=0.8)
    bass(t, root, BAR * 0.95, 0.12 if t < 17 else 0.16)
    bell(t, notes[2] + 24, 0.025, 1.6, 0.4)
for t in beats(10, 25):
    kick(t, 0.32 if t < 17 else 0.42)
for t in beats(12.5, 25, B / 2):
    if t < 17:
        tick(t + B / 4, 0.03)
    else:
        tick(t, 0.035, 0.35)
        tick(t + B / 4, 0.02, -0.35)
for t in beats(12.5, 25, BAR / 2):
    rim(t + B, 0.05)
whoosh(16.8, 0.8, 0.13, rise=True)  # the pillar
for k in range(7):  # cut accents in the motion sequence
    tc = 17 + k * 1.25
    click(tc, 0.07)
    whoosh(tc, 0.35, 0.05, rise=bool(k % 2))
    bell(tc, 74 + (k % 3) * 5, 0.018, 0.9, (k % 2) * 0.6 - 0.3, ratio=2.7)
for t in beats(17, 25, B):
    bass(t + B / 2, chord(t)[1] + 12, B * 0.4, 0.06)
riser(22.6, 25.0, 0.08)
whoosh(24.7, 0.6, 0.12, rise=True)
reverse_swell(25.0, 1.4, 0.16)

# 25–35: the peak
impact(25.0, 0.55, 3.0)
bell(25.0, 62, 0.05, 3.5, 0.0, ratio=1.41, idx=3)
for t in beats(25, 35, BAR):
    notes, root = chord(t)
    strings([n + 12 for n in notes] + [notes[0] + 24], t, BAR + 0.5, 0.1, 2600, a=0.4, r=0.6)
    brass([n for n in notes], t, BAR, 0.07, 2400)
    bass(t, root, BAR * 0.5, 0.2)
    bass(t + BAR * 0.5, root, BAR * 0.45, 0.16)
for t in beats(25, 34.8):
    i = int(round((t - 25) / B))
    kick(t, 0.5)
    if i % 2 == 1:
        snare(t, 0.17)
    tick(t + B / 2, 0.04)
for t in (29.4, 29.7, 29.85):
    tom(t, 45 if t < 29.6 else 40, 0.2)
impact(30.0, 0.4, 2.5)
riser(33.4, 35.0, 0.07)
impact(35.0, 0.35, 3.0)
for m, gg in ((86, 0.06), (93, 0.04), (79, 0.05)):
    bell(35.0, m, gg, 3.5, rng.uniform(-0.4, 0.4), ratio=1.73, idx=2.5)  # metallic resonance

# 35–43: space
drone(35.0, 8.5, [38, 45, 50], 0.08, 700)
texture(35.2, 8.0, 0.02)
for t in beats(35, 42.5, BAR):
    strings([n + 12 for n in chord(t)[0]], t, BAR + 0.8, 0.045, 1100, a=1.4, r=1.2)
    kick(t, 0.16)
for k in range(26):  # silhouette traced in light
    click(38.8 + k * 0.066, 0.025, pan=np.sin(k) * 0.5)
bell(40.5, 86, 0.03, 1.6)
bell(41.4, 81, 0.05, 2.8, 0.0, ratio=2.0, idx=1.0)  # emblem
whoosh(43.0, 1.0, 0.12, rise=True)

# 43–52: final climax → restrained impact → near-silence → last pulse
for t in beats(43, 46, BAR / 2):
    notes, root = chord(t)
    strings([n + 12 for n in notes] + [notes[0] + 24], t, BAR / 2 + 0.4, 0.1, 2800, a=0.2, r=0.4)
    brass(notes, t, BAR / 2 + 0.2, 0.06, 2800)
for t in beats(43, 45.9):
    kick(t, 0.48)
    tick(t + B / 2, 0.04)
for i, t in enumerate(beats(44.75, 45.95, B / 4)):
    tom(t, 47 - i, 0.15 + 0.02 * i)
reverse_swell(46.0, 1.2, 0.14)
impact(46.0, 0.5, 1.6)
bell(46.0, 50, 0.045, 2.2, 0.0, ratio=1.41, idx=2.5)
drone(46.2, 2.0, [26], 0.05, 200)  # near-silence: only the tail and a whisper of sub
for t in beats(47.8, 50.8):
    kick(t, 0.26)
    tick(t + B / 2, 0.025)
strings([62, 65, 69], 47.8, 3.4, 0.07, 1800, a=1.0, r=1.4)
bell(51.2, 98, 0.04, 2.0, 0.2, ratio=2.01, idx=1.0)  # the surviving highlight

# 52–60: the resolution
sub(51.8, 8.0, 26, 0.16)
drone(51.8, 8.1, [38, 45, 50], 0.1, 520)
strings([50, 57, 62], 52.2, 7.6, 0.05, 900, a=2.5, r=3.0)
whoosh(54.6, 3.2, 0.06, rise=True)  # light sweep across the surface
bell(54.2, 93, 0.015, 2.0)
bell(57.3, 74, 0.08, 4.5, 0.0, ratio=1.41, idx=1.6)  # the name: long metallic tail
bell(57.3, 86, 0.04, 4.0, 0.2, ratio=2.76, idx=1.2)

# ───────────── mix ─────────────
duck = 1 - 0.35 * KICK
musd = mus * duck
L = int(3.2 * SR)
xi = np.arange(L) / SR
ir = np.stack([rng.standard_normal(L), rng.standard_normal(L)]) * np.exp(-xi / 0.75)
ir = np.stack([lp(ir[0], 7000), lp(ir[1], 7000)])
ir[:, : int(0.012 * SR)] = 0  # pre-delay
ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
wet = np.stack([signal.fftconvolve(verb[c], ir[c])[:N] for c in range(2)]) * 0.55

mix = musd + drm * 0.85 + sfx + wet
mix = np.stack([hp(mix[c], 28) for c in range(2)])
# tame the low end (no excessive bass): gentle shelf via split
low = np.stack([lp(mix[c], 90) for c in range(2)])
mix = mix - 0.25 * low
# soft limiting
mix = mix / (np.percentile(np.abs(mix), 99.95) + 1e-9) * 0.75
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
# clean ends
fi = int(0.02 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
fo = int(1.8 * SR)
mix[:, N - int(0.15 * SR) - fo: N - int(0.15 * SR)] *= np.linspace(1, 0, fo) ** 2
mix[:, N - int(0.15 * SR):] = 0
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))

pcm = (mix.T * 32767).astype(np.int16)
os.makedirs(os.path.join(ROOT, 'public'), exist_ok=True)
with wave.open(os.path.join(ROOT, 'public', 'soundtrack.wav'), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote public/soundtrack.wav', N / SR, 's @', SR)
