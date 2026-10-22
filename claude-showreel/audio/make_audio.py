"""
Original soundtrack + sound design for the Claude showreel, synthesised from scratch with numpy/scipy.
No samples and no third-party audio: every sound is generated here.

120 BPM (1 beat = 0.5 s = 15 frames, 1 bar = 2 s), D minor, chords Dm–B♭–F–C.
Sections follow the scene grid in src/Root.tsx (seconds):
  0 dark drone + typing        8 big bang, arps rise          18 beat drops (manifesto)
  34 code / 54 data groove     72 lighter half-time (languages, writing)   108 science arps
  126 groove back (design)     144 build (agents)             162 breakdown: piano (teach, honesty)
  194 the reveal: clock, tension, riser, tape rewind          222 THE DROP (montage)
  246 piano + pulse (you)      270 finale: anthem chord       290 tail
Writes public/soundtrack.wav (stereo, 44.1 kHz, 300 s).
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 44100
DUR = 300.0
N = int(SR * DUR)
B = 0.5  # beat
BAR = 2.0
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def bus():
    return np.zeros((2, N))


music, drums, fx, verb, pads = bus(), bus(), bus(), bus(), bus()


def put(b, sig, t, gain=1.0, pan=0.0, send=0.0):
    i = int(round(t * SR))
    if i >= N or len(sig) == 0:
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    n = min(len(sig), N - i)
    l = np.cos((pan + 1) * np.pi / 4) * 1.414
    r = np.sin((pan + 1) * np.pi / 4) * 1.414
    b[0, i:i + n] += sig[:n] * gain * l
    b[1, i:i + n] += sig[:n] * gain * r
    if send:
        verb[0, i:i + n] += sig[:n] * gain * send * l
        verb[1, i:i + n] += sig[:n] * gain * send * r


def tt(d):
    return np.arange(int(SR * d)) / SR


def lp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, min(fc, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, min(hi, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n, a=0.01, d=0.1, s=0.7, r=0.2):
    x = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    x[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na)
    x[na:na + nd] = np.linspace(1, s, nd)
    nr = min(nr, n)
    x[-nr:] *= np.linspace(1, 0, nr)
    return x


def saw(f, x, phase=0.0):
    return signal.sawtooth(2 * np.pi * f * x + phase)


# ───────────── instruments ─────────────

def supersaw(midis, dur, cutoff=2500, gain=0.12, t=0.0, a=0.02, r=0.4, b=pads, send=0.35, voices=5):
    x = tt(dur)
    s = np.zeros(len(x))
    for m in midis:
        for k in range(voices):
            det = (k - (voices - 1) / 2) * 0.09
            s += saw(mtof(m + det), x, rng.uniform(0, 6.28))
    s /= (len(midis) * voices) ** 0.6
    s = lp(s, cutoff, 2)
    s *= env_adsr(len(x), a, 0.2, 0.85, r)
    put(b, s, t, gain, rng.uniform(-0.2, 0.2), send)


def pluck(midi, t, dur=0.25, gain=0.18, cutoff=3000, pan=0.0, send=0.3):
    x = tt(dur)
    f = mtof(midi)
    s = saw(f, x) * 0.6 + signal.square(2 * np.pi * f * 2 * x) * 0.2
    fenv = cutoff * np.exp(-x / 0.06) + 300
    # time-varying lowpass approximated by blending two filters
    s = lp(s, cutoff) * np.exp(-x / 0.05) + lp(s, 600) * (1 - np.exp(-x / 0.05))
    s *= np.exp(-x / (dur * 0.35))
    del fenv
    put(music, s, t, gain, pan, send)


def marimba(midi, t, gain=0.22, pan=0.0):
    x = tt(0.6)
    f = mtof(midi)
    s = np.sin(2 * np.pi * f * x) * np.exp(-x / 0.18) + 0.35 * np.sin(2 * np.pi * f * 4 * x) * np.exp(-x / 0.05)
    put(music, s, t, gain, pan, 0.35)


def piano(midis, t, dur=2.2, gain=0.16, send=0.45):
    x = tt(dur)
    s = np.zeros(len(x))
    for m in midis:
        f = mtof(m)
        for h, amp, dec in ((1, 1.0, 1.2), (2, 0.45, 0.7), (3, 0.22, 0.45), (4, 0.12, 0.3), (5.02, 0.06, 0.2)):
            s += amp * np.sin(2 * np.pi * f * h * x * (1 + 0.0004 * h * h)) * np.exp(-x / dec)
    s *= np.minimum(x / 0.004, 1)
    s /= len(midis) ** 0.7
    put(music, s, t, gain, 0.0, send)


def bass(midi, t, dur, gain=0.3, cutoff=500):
    x = tt(dur)
    f = mtof(midi)
    s = np.sin(2 * np.pi * f * x) + 0.5 * lp(saw(f, x), cutoff)
    s *= env_adsr(len(x), 0.005, 0.08, 0.8, 0.05)
    put(music, s, t, gain)


def sub_hit(t, gain=0.6, f0=55):
    x = tt(1.6)
    f = f0 + 40 * np.exp(-x / 0.08)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.6)
    put(fx, s, t, gain)


KICK_ENV = np.zeros(N)


def kick(t, gain=0.6):
    x = tt(0.45)
    f = 45 + 110 * np.exp(-x / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.18)
    s += 0.25 * hp(rng.standard_normal(len(x)), 3000) * np.exp(-x / 0.004)
    put(drums, s, t, gain)
    i = int(t * SR)
    n = min(int(0.25 * SR), N - i)
    if n > 0:
        KICK_ENV[i:i + n] = np.maximum(KICK_ENV[i:i + n], np.exp(-np.arange(n) / SR / 0.09))


def clap(t, gain=0.3, pan=0.0):
    x = tt(0.3)
    nz = bp(rng.standard_normal(len(x)), 900, 5000)
    e = np.exp(-x / 0.06)
    for d in (0.0, 0.011, 0.022):
        e += 0.6 * np.exp(-np.maximum(x - d, 0) / 0.006) * (x >= d)
    put(drums, nz * e * 0.5, t, gain, pan, 0.25)


def snare(t, gain=0.28):
    x = tt(0.25)
    s = bp(rng.standard_normal(len(x)), 1500, 8000) * np.exp(-x / 0.07) + 0.5 * np.sin(2 * np.pi * 190 * x) * np.exp(-x / 0.05)
    put(drums, s, t, gain, 0.0, 0.2)


def hat(t, gain=0.08, open_=False, pan=0.25):
    x = tt(0.3 if open_ else 0.06)
    s = hp(rng.standard_normal(len(x)), 7000) * np.exp(-x / (0.09 if open_ else 0.015))
    put(drums, s, t, gain, pan)


def crash(t, gain=0.22):
    x = tt(2.5)
    s = hp(rng.standard_normal(len(x)), 4000) * np.exp(-x / 0.8)
    put(fx, s, t, gain, 0.0, 0.3)


def rim(t, gain=0.12):
    x = tt(0.05)
    s = bp(rng.standard_normal(len(x)), 1800, 4000) * np.exp(-x / 0.01) + np.sin(2 * np.pi * 1700 * x) * np.exp(-x / 0.008)
    put(drums, s, t, gain, -0.3, 0.2)


def whoosh(t, dur=0.6, gain=0.25, up=True, pan_sweep=True):
    x = tt(dur)
    nz = rng.standard_normal(len(x))
    k = 24
    out = np.zeros(len(x))
    seg = len(x) // k
    for j in range(k):
        p = j / (k - 1)
        fc = 300 + (p if up else 1 - p) * 6000
        sl = slice(j * seg, (j + 1) * seg if j < k - 1 else len(x))
        out[sl] = bp(nz, fc * 0.7, fc * 1.3)[sl]
    e = np.sin(np.pi * x / dur) ** 2
    s = out * e
    if pan_sweep:
        half = len(s) // 2
        put(fx, s[:half], t - dur / 2, gain, -0.7, 0.2)
        put(fx, s[half:], t - dur / 2 + half / SR, gain, 0.7, 0.2)
    else:
        put(fx, s, t - dur / 2, gain, 0.0, 0.2)


def riser(t0, t1, gain=0.18):
    d = t1 - t0
    x = tt(d)
    p = x / d
    f = 200 * (2 ** (p * 4))
    s = saw(1, np.cumsum(f) / SR) * 0.3
    nz = rng.standard_normal(len(x))
    s += hp(nz, 2000) * p * 0.6
    s *= p ** 2
    put(fx, s, t0, gain, 0.0, 0.4)


def reverse_swell(t_end, dur=1.5, gain=0.3):
    x = tt(dur)
    s = hp(rng.standard_normal(len(x)), 1500) * (x / dur) ** 3
    put(fx, s, t_end - dur, gain, 0.0, 0.5)


def impact(t, gain=0.5):
    sub_hit(t, gain)
    crash(t, gain * 0.45)
    x = tt(0.8)
    s = lp(rng.standard_normal(len(x)), 800) * np.exp(-x / 0.15)
    put(fx, s, t, gain * 0.6, 0.0, 0.5)


def click(t, gain=0.12):
    x = tt(0.03)
    s = bp(rng.standard_normal(len(x)), 2000, 7000) * np.exp(-x / 0.004)
    put(fx, s, t, gain, rng.uniform(-0.3, 0.3))


def chime(t, midis, gain=0.14, step=0.07):
    for k, m in enumerate(midis):
        x = tt(1.2)
        s = (np.sin(2 * np.pi * mtof(m) * x) + 0.3 * np.sin(2 * np.pi * mtof(m) * 2.01 * x)) * np.exp(-x / 0.35)
        put(fx, s, t + k * step, gain, 0.1 * k, 0.5)


def buzz(t, dur=0.35, gain=0.12):
    x = tt(dur)
    s = signal.square(2 * np.pi * 110 * x) * lp(np.ones(len(x)), 50) * np.exp(-x / 0.25)
    s = lp(s, 1200)
    put(fx, s, t, gain)
    put(fx, s, t + dur + 0.05, gain)


def tape_rewind(t, dur=1.4, gain=0.22):
    x = tt(dur)
    f = 300 + 2200 * (x / dur) ** 1.5 + 200 * np.sin(2 * np.pi * 14 * x)
    s = saw(1, np.cumsum(f) / SR) * 0.4 + bp(rng.standard_normal(len(x)), 1500, 6000) * 0.4
    s *= np.minimum(x / 0.05, 1) * (1 - (x / dur) ** 6)
    # stutter
    s *= 0.6 + 0.4 * (np.sin(2 * np.pi * 24 * x) > 0)
    put(fx, lp(s, 7000), t, gain)


def tick(t, gain=0.1, hi=True):
    x = tt(0.04)
    s = np.sin(2 * np.pi * (2400 if hi else 1800) * x) * np.exp(-x / 0.006)
    put(fx, s, t, gain, 0.4 if hi else -0.4, 0.2)


def heartbeat(t, gain=0.35):
    for d, g in ((0, 1.0), (0.22, 0.7)):
        x = tt(0.3)
        s = np.sin(2 * np.pi * (50 + 30 * np.exp(-x / 0.03)) * x) * np.exp(-x / 0.09)
        put(fx, s, t + d, gain * g)


# ───────────── harmony ─────────────
# Dm, Bb, F, C — voiced around D4; bass roots
PROG = [([50, 53, 57, 62], 38), ([46, 50, 53, 58], 34), ([53, 57, 60, 65], 41), ([48, 52, 55, 60], 36)]
WARM = [([53, 57, 60, 65], 41), ([48, 52, 55, 60], 36), ([50, 53, 57, 62], 38), ([46, 50, 53, 58], 34)]


def chord_at(t, prog=PROG):
    return prog[int(t // BAR) % 4]


def bars(t0, t1):
    t = t0
    while t < t1 - 1e-6:
        yield t
        t += BAR


def beats(t0, t1, step=B):
    t = t0
    while t < t1 - 1e-6:
        yield t
        t += step


def groove(t0, t1, kick_g=0.6, clap_g=0.28, hat_g=0.07, bass_g=0.28, half=False, sixteenth=False):
    for t in beats(t0, t1):
        bi = int(round((t - t0) / B)) % 4
        if not half or bi in (0, 2):
            kick(t, kick_g)
        if half:
            if bi == 2:
                snare(t, clap_g * 0.8)
        elif bi in (1, 3):
            clap(t, clap_g)
        hat(t + B / 2, hat_g * 1.3, open_=(bi == 3), pan=0.3)
        if sixteenth:
            hat(t + B / 4, hat_g * 0.6, pan=-0.3)
            hat(t + 3 * B / 4, hat_g * 0.6, pan=-0.3)
    for t in beats(t0, t1, B / 2):
        _, root = chord_at(t)
        if bass_g:
            bass(root, t, B / 2 * 0.9, bass_g * (1.0 if int(round((t - t0) / (B / 2))) % 2 == 0 else 0.75))


def arp(t0, t1, step=B / 4, gain=0.12, octave=12, cutoff=3500, pattern=(0, 1, 2, 3, 2, 1), prog=PROG):
    k = 0
    for t in beats(t0, t1, step):
        notes, _ = chord_at(t, prog)
        m = notes[pattern[k % len(pattern)]] + octave
        pluck(m, t, 0.22, gain, cutoff, pan=0.35 * np.sin(k * 0.7))
        k += 1


def pads_over(t0, t1, cutoff=1800, gain=0.1, prog=PROG, octave=0):
    for t in bars(t0, t1):
        notes, _ = chord_at(t, prog)
        supersaw([n + octave for n in notes], BAR + 0.3, cutoff, gain, t, a=0.08, r=0.35)


def stabs(t0, t1, gain=0.12):
    for t in bars(t0, t1):
        notes, _ = chord_at(t)
        supersaw([n + 12 for n in notes], 0.35, 4000, gain, t, a=0.003, r=0.25, b=music, send=0.4)


# ───────────── arrangement ─────────────
# A 0–8: drone, heartbeat, typing
supersaw([38, 45, 50], 8.5, 500, 0.12, 0.0, a=2.5, r=1.0)
for t in (0.5, 2.5, 4.5, 6.5):
    heartbeat(t, 0.28)
for k in range(7):
    click(1.2 + k * 0.2, 0.22)
reverse_swell(8.47, 2.2, 0.35)
whoosh(7.8, 1.2, 0.22, up=True, pan_sweep=False)

# B 8–18: big bang, rising arps
impact(8.47, 0.75)
chime(8.6, [74, 81, 86, 89], 0.08, 0.09)
pads_over(8, 18, 1400, 0.1)
for t in beats(10, 18, B / 4):
    k = int(round((t - 10) / (B / 4)))
    notes, _ = chord_at(t)
    pluck(notes[k % 4] + 12, t, 0.2, 0.05 + 0.07 * (t - 10) / 8, 1500 + 300 * (t - 10), pan=0.4 * np.sin(k))
for t in beats(16, 18, B / 4):
    snare(t, 0.06 + 0.12 * (t - 16) / 2)
riser(14, 18, 0.16)

# C 18–34: the beat drops (manifesto, one word per bar)
crash(18, 0.25)
impact(18, 0.35)
groove(18, 34)
stabs(18, 34, 0.11)
pads_over(18, 34, 2200, 0.07)
for t in bars(20, 34):
    whoosh(t, 0.3, 0.08, pan_sweep=False)

# D 34–54: code
whoosh(34, 0.7, 0.3)
groove(34, 54, sixteenth=True)
arp(34, 54, gain=0.08, cutoff=2800, pattern=(0, 2, 1, 3))
pads_over(34, 54, 1500, 0.06)
buzz(34 + 250 / 30, 0.18, 0.1)
chime(34 + 330 / 30, [74, 78, 81], 0.1)
chime(34 + 430 / 30, [74, 78, 81, 86, 90], 0.12, 0.06)
for k in range(30):
    click(34.7 + k * 0.17, 0.05)

# E 54–72: data
whoosh(53.7, 0.9, 0.3, up=False)
sub_hit(54, 0.3)
groove(54, 72, sixteenth=True)
arp(54, 72, gain=0.08, cutoff=3200, pattern=(0, 1, 2, 3, 3, 2, 1, 0))
pads_over(54, 72, 1700, 0.06)
chime(54 + 250 / 30, [86, 81], 0.1, 0.12)  # anomaly ping
for k in range(4):
    whoosh(54 + (320 + k * 18) / 30, 0.25, 0.06, pan_sweep=False)

# F 72–108: languages + writing — lighter half-time
whoosh(72.2, 1.4, 0.18, up=True, pan_sweep=False)
groove(72, 108, kick_g=0.45, clap_g=0.22, hat_g=0.06, bass_g=0.2, half=True)
pads_over(72, 108, 1500, 0.07)
MEL = [74, 77, 81, 79, 77, 74, 72, 74]
for i, t in enumerate(beats(72, 108, B)):
    notes, _ = chord_at(t)
    marimba(notes[(i * 3) % 4] + 24 if i % 2 else MEL[(i // 2) % 8], t, 0.13, 0.4 * np.sin(i))
for t in beats(74, 108, B * 2):
    rim(t + B * 1.5, 0.1)
whoosh(90, 0.5, 0.3)

# H 108–126: science — mysterious arps
whoosh(108, 0.8, 0.22, up=False, pan_sweep=False)
pads_over(108, 126, 1200, 0.09, octave=-12)
arp(108, 126, step=B / 4, gain=0.09, cutoff=2000, pattern=(0, 2, 3, 1, 3, 2), octave=12)
for t in beats(108, 126):
    kick(t, 0.35) if int((t - 108) / B) % 4 == 0 else None
    hat(t + B / 2, 0.05)
for t in beats(110, 126, B * 4):
    tick(t, 0.06)
whoosh(125.6, 0.5, 0.25, up=False, pan_sweep=False)

# I 126–144: design — groove back
sub_hit(126, 0.35)
groove(126, 144, sixteenth=False)
arp(126, 144, gain=0.07, cutoff=3000, pattern=(0, 1, 2, 3))
stabs(126, 144, 0.06)
pads_over(126, 144, 1800, 0.05)
for k in range(24):
    click(143.5 + k * 0.035, 0.07)  # tile flip

# J 144–162: agents — the build
groove(144, 160, sixteenth=True, kick_g=0.62)
arp(144, 160, step=B / 4, gain=0.09, cutoff=4000, pattern=(0, 1, 2, 3, 2, 3))
pads_over(144, 160, 2600, 0.06)
for t in beats(158, 161.75, B / 4):
    snare(t, 0.05 + 0.18 * (t - 158) / 4)
riser(156, 161.8, 0.18)
reverse_swell(161.85, 1.0, 0.3)
impact(162, 0.35)

# K/L 162–194: breakdown — piano (teach, honesty)
for t in bars(162, 194):
    notes, root = chord_at(t, WARM)
    piano([root + 12] + notes, t, 2.4, 0.15)
    piano([notes[-1] + 12], t + 1.0, 1.4, 0.06)
pads_over(162, 194, 900, 0.07, prog=WARM)
for t in beats(178, 194, B * 2):
    heartbeat(t, 0.12)
whoosh(178, 1.6, 0.12, pan_sweep=False)

# M 194–222: the reveal
sub_hit(194, 0.55, 40)
for t in beats(194, 220.5):
    tick(t, 0.09, hi=int((t - 194) / B) % 2 == 0)
supersaw([38, 45], 27, 350, 0.12, 194.2, a=4, r=2)
for t in beats(194, 220, B * 2):
    heartbeat(t, 0.18)
for tl in (105, 215, 275):
    impact(194 + tl / 30, 0.3)
whoosh(194 + 370 / 30, 0.8, 0.2)
for t in beats(206.4, 216, B / 2):
    click(t, 0.04)  # the code panel scrolling
riser(212, 216, 0.16)
impact(216, 0.45)  # "НАПИСАНО КОДОМ"
supersaw([50, 57, 62, 65], 4.5, 1500, 0.09, 216, a=0.01, r=2)
tape_rewind(220.6, 1.4, 0.28)

# N 222–246: THE DROP
impact(222, 0.7)
groove(222, 244, kick_g=0.7, clap_g=0.32, hat_g=0.08, bass_g=0.32, sixteenth=True)
pads_over(222, 244, 3200, 0.1)
stabs(222, 244, 0.1)
HOOK = [81, 77, 74, 76, 77, 74, 72, 74]
for i, t in enumerate(beats(222, 244, B)):
    m = HOOK[i % 8] + (12 if (i // 16) % 2 else 0)
    supersaw([m], B * 0.9, 5000, 0.07, t, a=0.005, r=0.1, b=music, send=0.3, voices=3)
for t in beats(222, 234, 1.0):
    whoosh(t, 0.2, 0.05, pan_sweep=False)
for t in beats(234, 244, B):
    whoosh(t, 0.12, 0.04, pan_sweep=False)
reverse_swell(246, 2.0, 0.25)
piano([50, 57, 62, 65], 244, 2.0, 0.14)

# O 246–270: you — piano + pulse, rising
whoosh(245.6, 0.6, 0.2, up=True, pan_sweep=False)
for t in bars(246, 270):
    notes, root = chord_at(t, WARM)
    piano([root + 12] + notes, t, 2.4, 0.13)
    for k in range(4):
        piano([notes[(k * 2) % 4] + 12], t + k * B, 0.6, 0.05)
pads_over(246, 270, 1400, 0.07, prog=WARM)
for t in beats(250, 270):
    if int((t - 250) / B) % 2 == 0:
        kick(t, 0.38)
    hat(t + B / 2, 0.05)
for t in beats(258, 270, B):
    clap(t, 0.12) if int((t - 258) / B) % 2 == 1 else None
riser(266, 270, 0.14)
for k in range(6):
    click(246 + (150 + k * 90) / 30, 0.08)

# P 270–290: finale
whoosh(269.4, 1.4, 0.22, up=True, pan_sweep=False)
impact(272, 0.75)
chime(272.1, [74, 81, 86, 89, 93], 0.1, 0.08)
for t in bars(272, 286):
    notes, root = chord_at(t, WARM)
    supersaw([n + 12 for n in notes] + [root], BAR + 0.4, 2600, 0.11, t, a=0.05, r=0.4)
    piano([root + 12] + notes, t, 2.4, 0.12)
    bass(root, t, BAR * 0.95, 0.25)
for t in beats(274, 286):
    kick(t, 0.45) if int((t - 274) / B) % 2 == 0 else snare(t, 0.15)
    hat(t + B / 2, 0.05, open_=True)
supersaw([38, 50, 57, 62, 65, 69], 8, 2200, 0.13, 286, a=0.02, r=5)
piano([38, 50, 57, 62, 65], 286, 6, 0.18)
crash(286, 0.25)

# Q 290–300: credits tail — a soft pad that fades out
supersaw([50, 57, 62], 9.5, 900, 0.06, 290.5, a=2.0, r=4)

# ───────────── mix ─────────────
duck = 1 - 0.55 * KICK_ENV
pads *= duck
music_d = music * (1 - 0.25 * KICK_ENV)

# reverb: stereo exponentially decaying noise IR
L = int(2.4 * SR)
xi = np.arange(L) / SR
ir = np.stack([rng.standard_normal(L), rng.standard_normal(L)]) * np.exp(-xi / 0.55)
ir = np.stack([lp(ir[0], 6000), lp(ir[1], 6000)])
ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
wet = np.stack([signal.fftconvolve(verb[c], ir[c])[:N] for c in range(2)]) * 0.5

mix = pads + music_d + drums * 0.9 + fx + wet
mix = np.stack([hp(mix[0], 25), hp(mix[1], 25)])
# gentle glue + soft clip
mix = mix / (np.percentile(np.abs(mix), 99.9) + 1e-9) * 0.7
mix = np.tanh(mix * 1.25) / np.tanh(1.25)
# fade in/out
fi = int(0.05 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
fo = int(4 * SR)
mix[:, -fo:] *= np.linspace(1, 0, fo) ** 2
mix *= 0.93 / np.max(np.abs(mix))

pcm = (mix.T * 32767).astype(np.int16)
os.makedirs(os.path.join(ROOT, 'public'), exist_ok=True)
with wave.open(os.path.join(ROOT, 'public', 'soundtrack.wav'), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote public/soundtrack.wav', mix.shape[1] / SR, 's')
