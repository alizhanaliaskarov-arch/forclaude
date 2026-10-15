"""
Original soundtrack + SFX for the Uzbekistan video, synthesised from scratch with numpy/scipy.
No samples, no third-party material: fully original, nothing to license.

Style: oriental motifs with a light beat — dutar (Karplus-Strong plucked string) in D hijaz,
doira (frame drum), soft lo-fi kick/clap/shaker, bass, pads, a nay-like flute for the Aral scene.
Cues follow the script (seconds):
  0  wind + low boom            5  hit (black cut), dutar enters
  22 beat comes in              119 beat drops out (Aral), nay + wind
  134 beat returns, brighter    171 beat out, final chord
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 44100
DUR = 180.0
N = int(SR * DUR)
BPM = 96
B = 60.0 / BPM  # beat
E = B / 2  # eighth
BAR = 4 * B
rng = np.random.default_rng(11)


def bus():
    return np.zeros((2, N))


music, drums, fx, verb = bus(), bus(), bus(), bus()
music_main = music
amb = bus()  # Aral + final sections (not gated)


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
    return signal.sosfilt(signal.butter(order, fc, 'low', fs=SR, output='sos'), x)


def hp(x, fc, order=2):
    return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def fade(x, a=0.005, r=0.02):
    x = x.copy()
    na, nr = int(a * SR), int(r * SR)
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)
    return x


# ───────────── instruments ─────────────

def pluck(freq, dur, bright=0.6, decay=0.9965):
    """Karplus-Strong plucked string, vectorised per period block."""
    P = max(2, int(round(SR / freq)))
    total = int(dur * SR)
    burst = rng.uniform(-1, 1, P)
    burst = bright * burst + (1 - bright) * np.convolve(burst, np.ones(4) / 4, 'same')
    out = np.zeros(total + P)
    out[:P] = burst
    start = P
    while start < total + P:
        prev = out[start - P:start]
        before = out[start - P - 1] if start - P - 1 >= 0 else 0.0
        shifted = np.concatenate(([before], prev[:-1]))
        blk = decay * 0.5 * (prev + shifted)
        end = min(start + P, total + P)
        out[start:end] = blk[:end - start]
        start += P
    y = out[P:P + total]
    # dutar body: a little low-mid resonance, soft attack click
    y = y + 0.35 * bp(y, 180, 420) + 0.2 * bp(y, 900, 1600)
    return fade(y, 0.002, 0.05)


def dutar(t, midi, dur=1.4, gain=0.5, pan=0.0, drone=None, send=0.25):
    put(music, pluck(mtof(midi), dur), t, gain, pan, send)
    if drone is not None:
        put(music, pluck(mtof(drone), dur * 1.3, bright=0.45), t + 0.012, gain * 0.55, -pan * 0.6, send)


def nay(t, midi, dur, gain=0.35, pan=0.15):
    x = tt(dur)
    f0 = mtof(midi)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * x) * np.minimum(x / 0.6, 1)
    ph = 2 * np.pi * np.cumsum(f0 * vib) / SR
    tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
    breath = bp(rng.standard_normal(len(x)), f0 * 0.8, min(f0 * 4, 9000)) * 0.35
    env = np.minimum(x / 0.25, 1) * np.minimum((dur - x) / 0.4, 1)
    put(music, (tone + breath) * env, t, gain, pan, 0.6)


def pad(t, midis, dur, gain=0.12, bright=1800):
    x = tt(dur)
    s = np.zeros(len(x))
    for m in midis:
        for det in (-0.08, 0.0, 0.08):
            f = mtof(m + det)
            s += signal.sawtooth(2 * np.pi * f * x + rng.uniform(0, 6))
    s = lp(s / (len(midis) * 3), bright)
    env = np.minimum(x / 1.2, 1) * np.minimum((dur - x) / 1.2, 1)
    put(music, s * env, t, gain, 0.0, 0.5)


def bass(t, midi, dur, gain=0.32):
    x = tt(dur)
    f = mtof(midi)
    s = np.sin(2 * np.pi * f * x) + 0.3 * np.sin(4 * np.pi * f * x)
    env = np.minimum(x / 0.01, 1) * np.exp(-x / (dur * 0.9))
    put(music, fade(s * env, 0.003, 0.03), t, gain)


def kick(t, gain=0.55):
    x = tt(0.4)
    f = 48 + 70 * np.exp(-x / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.16)
    put(drums, s, t, gain)


def clap(t, gain=0.16):
    x = tt(0.25)
    n = bp(rng.standard_normal(len(x)), 900, 4500)
    env = np.exp(-x / 0.06)
    for k, d in enumerate((0, 0.008, 0.017)):
        put(drums, n * env, t + d, gain * (0.6 if k < 2 else 1.0), 0.0, 0.25)


def shaker(t, gain=0.05, pan=0.3):
    x = tt(0.08)
    n = hp(rng.standard_normal(len(x)), 5500)
    put(drums, n * np.exp(-x / 0.02), t, gain, pan)


def dum(t, gain=0.5):
    x = tt(0.5)
    f = 72 + 40 * np.exp(-x / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.22)
    s += lp(rng.standard_normal(len(x)), 300) * np.exp(-x / 0.02) * 0.3
    put(drums, s, t, gain, -0.1, 0.15)


def tak(t, gain=0.22, pan=0.15):
    x = tt(0.18)
    n = bp(rng.standard_normal(len(x)), 1800, 5200) * np.exp(-x / 0.035)
    ring = np.sin(2 * np.pi * 360 * x) * np.exp(-x / 0.05) * 0.4
    put(drums, n + ring, t, gain, pan, 0.15)


def jingle(t, gain=0.06, pan=-0.2):
    x = tt(0.22)
    n = hp(rng.standard_normal(len(x)), 7000) * (np.exp(-x / 0.06) * (1 + 0.5 * np.sin(2 * np.pi * 38 * x)))
    put(drums, n, t, gain, pan, 0.2)


# ───────────── sfx ─────────────

def boom(t, gain=0.9):
    x = tt(3.0)
    f = 34 + 50 * np.exp(-x / 0.12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x / 0.9)
    s += lp(rng.standard_normal(len(x)), 180) * np.exp(-x / 0.3) * 0.5
    put(fx, s, t, gain, 0.0, 0.3)


def riser(t_end, dur=2.2, gain=0.25):
    x = tt(dur)
    n = rng.standard_normal(len(x))
    out = np.zeros(len(x))
    seg = 8
    L = len(x) // seg
    for k in range(seg):
        lo = 300 + k * 500
        out[k * L:(k + 1) * L] = bp(n[k * L:(k + 1) * L], lo, lo * 3)
    env = (x / dur) ** 2
    put(fx, out * env, t_end - dur, gain, 0.0, 0.3)


def whoosh(t, dur=0.6, gain=0.3, pan=0.0):
    x = tt(dur)
    n = rng.standard_normal(len(x))
    out = np.zeros(len(x))
    seg = 10
    L = len(x) // seg
    for k in range(seg):
        c = 400 + 2600 * np.sin(np.pi * (k + 0.5) / seg)
        out[k * L:(k + 1) * L] = bp(n[k * L:(k + 1) * L], c * 0.6, c * 1.6)
    env = np.sin(np.pi * x / dur) ** 2
    put(fx, out * env, t - dur / 2, gain, pan, 0.25)


def bell(t, f0, gain=0.15, dur=2.5, pan=0.0, send=0.5):
    x = tt(dur)
    s = np.zeros(len(x))
    for k, (r, a, d) in enumerate(((1, 1, 1.2), (2.76, 0.5, 0.6), (5.4, 0.25, 0.3), (8.93, 0.12, 0.18))):
        s += a * np.sin(2 * np.pi * f0 * r * x) * np.exp(-x / d)
    put(fx, s * np.minimum(x / 0.002, 1), t, gain, pan, send)


def click(t, gain=0.12, f=3000, d=0.012, pan=0.0):
    x = tt(0.05)
    n = bp(rng.standard_normal(len(x)), f * 0.6, min(f * 1.6, 18000)) * np.exp(-x / d)
    put(fx, n, t, gain, pan)


def tick(t, gain=0.18):
    x = tt(0.08)
    s = np.sin(2 * np.pi * 1800 * x) * np.exp(-x / 0.012)
    put(fx, s, t, gain, 0.1)


def thud(t, gain=0.6):
    x = tt(0.5)
    s = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-x / 0.02)) / SR) * np.exp(-x / 0.09)
    s += lp(rng.standard_normal(len(x)), 900) * np.exp(-x / 0.03) * 0.6
    put(fx, s, t, gain, 0.0, 0.1)


def pour(t, dur, gain=0.16):
    x = tt(dur)
    n = rng.standard_normal(len(x))
    out = np.zeros(len(x))
    seg = 12
    L = len(x) // seg
    for k in range(seg):
        c = 700 + k * 90  # pitch rises as the bowl fills
        out[k * L:(k + 1) * L] = bp(n[k * L:(k + 1) * L], c, c * 3.2)
    am = 0.7 + 0.3 * np.sin(2 * np.pi * 11 * x + 2 * np.sin(2 * np.pi * 1.3 * x))
    env = np.minimum(x / 0.15, 1) * np.minimum((dur - x) / 0.25, 1)
    put(fx, out * am * env, t, gain, 0.2, 0.2)
    for k in range(int(dur * 5)):
        bt = rng.uniform(0, dur)
        xb = tt(0.05)
        fb = rng.uniform(600, 1400)
        put(fx, np.sin(2 * np.pi * np.cumsum(fb + 3000 * xb) / SR) * np.exp(-xb / 0.012), t + bt, gain * 0.25, 0.2)


def sizzle(t, dur, gain=0.05):
    x = tt(dur)
    n = hp(rng.standard_normal(len(x)), 3000)
    crack = (rng.random(len(x)) > 0.9993).astype(float)
    crack = signal.lfilter([1], [1, -0.97], crack)
    env = np.minimum(x / 1.0, 1) * np.minimum((dur - x) / 1.0, 1)
    put(fx, (n * 0.6 + crack * 2) * env, t, gain, -0.2)


def wind(t, dur, gain=0.18):
    x = tt(dur)
    n = rng.standard_normal(len(x))
    lo = lp(n, 500)
    hi = bp(n, 600, 2400)
    m1 = 0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * x + 1)
    m2 = 0.5 + 0.5 * np.sin(2 * np.pi * 0.21 * x)
    env = np.minimum(x / 1.5, 1) * np.minimum((dur - x) / 1.5, 1)
    sig = (lo * m1 + hi * m2 * 0.35) * env
    put(fx, sig, t, gain, -0.3)
    put(fx, np.roll(sig, 4000), t, gain * 0.8, 0.3)


# ───────────── composition ─────────────
D4 = 62
SC = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19]  # D hijaz, two octaves
MOTIFS = [
    [4, 4, 5, 4, 3, 2, 3, None, 2, 1, 2, 3, 2, 1, 0, None],
    [0, 1, 2, 3, 4, None, 3, 4, 5, 4, 3, 2, 3, None, None, None],
    [7, 6, 5, 4, 5, 6, 5, 4, 3, 4, 3, 2, 1, None, 0, None],
    [4, 5, 6, 7, 6, 5, 4, 3, 2, 3, 2, 1, 0, None, None, None],
]


def play_motif(t0, motif, octave=0, gain=0.42, drone=True, pan=0.15):
    for k, deg in enumerate(motif):
        if deg is None:
            continue
        t = t0 + k * E
        # hold until the next note
        nxt = next((j for j in range(k + 1, len(motif)) if motif[j] is not None), len(motif))
        dur = (nxt - k) * E + 0.6
        dr = 50 if (drone and k % 4 == 0) else None
        dutar(t, D4 + SC[deg] + 12 * octave, dur, gain * (1.0 if k % 2 == 0 else 0.8), pan, dr)


def doira_bar(t0, gain=1.0, busy=False):
    # usul: DUM . tak tak | DUM . tak .
    dum(t0, 0.45 * gain)
    tak(t0 + 2 * E, 0.2 * gain)
    tak(t0 + 3 * E, 0.16 * gain, -0.15)
    dum(t0 + 4 * E, 0.4 * gain)
    tak(t0 + 6 * E, 0.2 * gain)
    if busy:
        tak(t0 + 7 * E, 0.12 * gain, -0.2)
    for k in range(8):
        jingle(t0 + k * E + E / 2, 0.025 * gain)


def beat_bar(t0, bright=False):
    kick(t0)
    kick(t0 + 2.5 * B, 0.4)
    clap(t0 + B)
    clap(t0 + 3 * B)
    for k in range(16):
        shaker(t0 + k * B / 4, 0.03 if k % 2 else 0.02, 0.3 if k % 4 < 2 else -0.3)
    if bright:
        for k in range(4):
            jingle(t0 + k * B + B / 2, 0.05, 0.3)


BASS_PROG = [50 - 12, 50 - 12, 48 - 12, 50 - 12]  # D D C D
PAD_PROG = [[62, 69], [62, 69], [60, 67], [62, 69]]


def groove(t_start, t_end, bright=False, motif_offset=0, octave=0):
    t = t_start
    bar = 0
    while t < t_end - 0.01:
        beat_bar(t, bright)
        doira_bar(t, 0.8, busy=bright)
        root = BASS_PROG[bar % 4]
        bass(t, root, B * 1.5)
        bass(t + 1.5 * B, root, B)
        bass(t + 2.5 * B, root + 12 if bar % 2 else root, B * 1.4)
        if bar % 4 == 0:
            pad(t, PAD_PROG[0], BAR * 2 + 0.6, 0.07)
        if bar % 4 == 2:
            pad(t, PAD_PROG[2], BAR + 0.6, 0.07)
            pad(t + BAR, PAD_PROG[3], BAR + 0.6, 0.07)
        if bar % 2 == 0:
            m = MOTIFS[(bar // 2 + motif_offset) % 4]
            play_motif(t, m, octave + (1 if bright and (bar // 2) % 2 else 0), 0.38)
        t += BAR
        bar += 1
    return t


# 0–5: wind + boom + riser into the cut
wind(0.0, 5.6, 0.16)
boom(0.05, 0.9)
riser(5.0, 2.4, 0.18)
boom(5.0, 0.7)
dum(5.0, 0.8)

# 5–22: solo dutar (free intro), doira enters softly at ~12 s
t = 5.25
for m in (MOTIFS[1], MOTIFS[0]):
    play_motif(t, m, 0, 0.45)
    t += 2 * BAR
pad(5.0, [50, 57], 17.5, 0.06, 1200)
tb = 12.0
while tb < 21.5:
    doira_bar(tb, 0.45)
    tb += BAR
riser(22.0, 1.6, 0.12)

# 22–119: groove
groove(22.0, 119.0)

# 119–134: Aral — beat drops; wind + nay
music = amb
boom(119.0, 0.8)
wind(119.0, 15.5, 0.22)
pad(119.0, [50, 57, 62], 15.5, 0.08, 900)
for (dt, deg, d) in ((0.8, 4, 1.6), (2.4, 5, 0.9), (3.3, 4, 1.4), (4.9, 2, 2.2), (7.4, 3, 1.1), (8.5, 2, 0.9), (9.4, 1, 1.4), (10.9, 0, 3.0)):
    nay(119.0 + dt, D4 + 12 + SC[deg] - 12, d, 0.3)
for dt in (1.0, 4.2, 7.6, 11.0):
    dutar(119.0 + dt, 50, 2.5, 0.28, -0.3)

# 134–171: groove returns, brighter
music = music_main
riser(134.0, 1.2, 0.12)
groove(134.0, 171.0, bright=True, motif_offset=2)

# 171–180: beat out, final chord
music = amb
pad(171.0, [50, 57, 62, 66], 9.0, 0.09, 1500)
for k, m in enumerate((38, 50, 57, 62, 66, 69)):
    dutar(171.05 + k * 0.03, m, 4.0, 0.3, -0.4 + k * 0.15)
for k, m in enumerate((38, 50, 57, 62, 69, 74)):
    dutar(176.9 + k * 0.035, m, 3.2, 0.32, -0.4 + k * 0.15)
boom(176.9, 0.45)
bell(177.0, 1174.7, 0.08, 3.0)

# ───────────── scene SFX ─────────────
for k in range(6):  # camel bells along the Silk Road
    bell(23.0 + k * 2.1 + rng.uniform(0, 0.4), rng.choice([2093.0, 2349.3, 2637.0]), 0.04, 1.2, rng.uniform(-0.5, 0.5), 0.3)
whoosh(36.0, 0.9, 0.35)  # ikat wipe
for k in range(8):  # typing «алгоритм»
    click(37.53 + k * 0.133, 0.11, 2600 + rng.uniform(-300, 300), 0.01, 0.1)
bell(61.0, 1568.0, 0.07, 2.4)  # dome shimmer at Registan
whoosh(74.0, 1.4, 0.18)  # steam
sizzle(74.0, 6.6, 0.022)
thud(77.93, 0.55)  # passport stamp
pour(87.75, 3.55, 0.17)  # J-cut: starts under the plov
pour(94.95, 1.9, 0.15)
whoosh(98.0, 1.0, 0.32)  # fabric wipe
whoosh(110.0, 0.5, 0.4, 0.4)  # whip pan
for k in range(5):  # chandeliers switching on
    click(134.27 + k * 0.267, 0.16, 1200, 0.02, -0.3 + k * 0.15)
for tsh in (139.93, 140.87):  # camera shutters
    click(tsh, 0.2, 4000, 0.008)
    click(tsh + 0.07, 0.16, 3000, 0.01)
bell(142.4, 1318.5, 0.05, 1.5)
for ts in (149.0, 153.0, 156.2):  # МИФ stamps
    thud(ts, 0.6)
for tw in (151.0, 155.0):  # card swipes
    whoosh(tw, 0.45, 0.22)
whoosh(158.8, 0.4, 0.2)  # iris
click(159.2, 0.18, 1500, 0.03)  # pause tap
for q in range(3):  # quiz ticks + answer ding
    q0 = 159.0 + (62 + q * 98) / 30
    for k in range(3):
        tick(q0 + k, 0.16)
    bell(q0 + 78 / 30, 1760.0, 0.08, 1.4)
whoosh(170.6, 0.6, 0.2)

# ───────────── mix ─────────────
ir_len = int(2.4 * SR)
xi = np.arange(ir_len) / SR
ir = np.stack([rng.standard_normal(ir_len), rng.standard_normal(ir_len)]) * np.exp(-xi / 0.55)
ir[:, : int(0.012 * SR)] = 0
ir = np.stack([lp(ir[0], 6000), lp(ir[1], 6000)])
wet = np.stack([signal.fftconvolve(verb[c], ir[c])[:N] for c in range(2)]) * 0.012

def gate(b, windows, ramp=0.04):
    g = np.ones(N)
    r = int(ramp * SR)
    for a, z in windows:
        ia, iz = int(a * SR), min(N, int(z * SR))
        g[ia:iz] = 0
        g[max(0, ia - r):ia] = np.minimum(g[max(0, ia - r):ia], np.linspace(1, 0, ia - max(0, ia - r)))
        if iz < N:
            g[iz:iz + r] = np.minimum(g[iz:iz + r], np.linspace(0, 1, len(g[iz:iz + r])))
    return b * g


CUTS = [(119.0, 134.0), (171.0, DUR)]
mix = gate(music_main, CUTS) * 0.9 + amb * 0.9 + gate(drums, CUTS) * 0.8 + fx * 1.0 + wet
mix = np.stack([lp(mix[c], 14000) for c in range(2)])  # gentle lo-fi top
# master fades
fi = int(0.02 * SR)
fo = int(2.5 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
mix[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
peak = np.max(np.abs(mix))
mix = np.tanh(mix / peak * 1.25) / np.tanh(1.25) * 0.89

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'soundtrack.wav')
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', os.path.abspath(out), f'{DUR:.1f}s', 'peak', float(np.max(np.abs(mix))))
