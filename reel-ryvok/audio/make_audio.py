"""
Original soundtrack + SFX for the RYVOK reel, synthesised from scratch with numpy/scipy.
120 BPM  ->  1 beat = 0.5 s = 15 frames @30fps. Every cut in the video lands on this grid.
No samples, no third-party material: fully original, nothing to license.
"""
import numpy as np, wave, os
from scipy import signal

SR = 44100
BPM = 120
B = 60.0 / BPM
DUR = 27.0
TAIL = 1.0
N = int(SR * (DUR + TAIL))
rng = np.random.default_rng(7)


def bus():
    return np.zeros((2, N))


drums, bass, music, fx, verb = bus(), bus(), bus(), bus(), bus()
sc_times = []  # kick times used for side-chain ducking


def put(b, sig, t, gain=1.0, pan=0.0, send=0.0):
    """mix mono sig into stereo bus b at time t (s). send -> reverb bus."""
    i = int(t * SR)
    if i >= N or i < 0:
        return
    n = min(len(sig), N - i)
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    b[0, i:i + n] += sig[:n] * gain * l * 1.414
    b[1, i:i + n] += sig[:n] * gain * r * 1.414
    if send:
        verb[0, i:i + n] += sig[:n] * send * l * 1.414
        verb[1, i:i + n] += sig[:n] * send * r * 1.414


def tt(d):
    return np.arange(int(SR * d)) / SR


def env_ad(t, a, d):
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-t / d)


def lp(x, fc, order=2):
    sos = signal.butter(order, fc, 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], 'band', fs=SR, output='sos')
    return signal.sosfilt(sos, x)


def noise(n):
    return rng.standard_normal(n)


# ---------------------------------------------------------------- instruments
def kick(t0, g=1.0, short=False):
    t = tt(0.5 if not short else 0.28)
    f = 42 + 120 * np.exp(-t * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t * (7 if not short else 12))
    y += noise(len(t)) * np.exp(-t * 380) * 0.25
    y = np.tanh(y * 1.8) * 0.9
    put(drums, y, t0, g)
    sc_times.append(t0)


def clap(t0, g=1.0):
    t = tt(0.35)
    y = np.zeros_like(t)
    for o in (0, 0.011, 0.023):
        k = int(o * SR)
        y[k:] += noise(len(t) - k) * np.exp(-(t[:len(t) - k]) * 220) * 0.7
    y += noise(len(t)) * np.exp(-t * 18) * 0.25
    y = bp(y, 900, 5200)
    put(drums, y, t0, g * 0.8, send=0.25)


def hat(t0, g=1.0, open_=False, pan=0.2):
    d = 0.28 if open_ else 0.045
    t = tt(d)
    y = hp(noise(len(t)), 7500) * np.exp(-t * (14 if open_ else 90))
    put(drums, y, t0, g * 0.35, pan=pan)


def snare(t0, g=1.0):
    t = tt(0.3)
    y = noise(len(t)) * np.exp(-t * 28)
    y = bp(y, 1500, 7500) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5
    put(drums, y, t0, g * 0.7, send=0.15)


def tom(t0, f0=160, g=1.0):
    t = tt(0.35)
    f = f0 * (0.6 + 0.4 * np.exp(-t * 18))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    put(drums, y, t0, g * 0.8, send=0.1)


def bass_note(t0, f, d, g=1.0):
    t = tt(d)
    saw = signal.sawtooth(2 * np.pi * f * t)
    y = lp(saw, 420) * 0.6 + np.sin(2 * np.pi * f * t) * 0.9
    y *= np.minimum(t / 0.006, 1) * np.minimum((d - t) / 0.02, 1)
    y = np.tanh(y * 1.4)
    put(bass, y, t0, g)


def pluck(t0, f, d=0.35, g=1.0, pan=0.0, bright=1.0):
    t = tt(d)
    y = np.zeros_like(t)
    for det in (0.997, 1.003):
        for k in range(1, 14):
            if f * k * det > 9000:
                break
            y += np.sin(2 * np.pi * f * k * det * t) / k * np.exp(-t * (7 + 5 * k / bright))
    y *= np.minimum(t / 0.002, 1)
    put(music, y, t0, g * 0.28, pan=pan, send=0.22)


def pad(t0, freqs, d, g=1.0, cutoff=1400):
    t = tt(d)
    y = np.zeros_like(t)
    for f in freqs:
        for det in (0.996, 1.004):
            y += signal.sawtooth(2 * np.pi * f * det * t)
    y = lp(y, cutoff) / (len(freqs) * 1.6)
    y *= np.minimum(t / 0.35, 1) * np.minimum((d - t) / 0.5, 1)
    put(music, y, t0, g, send=0.35)


def lead(t0, f, d, g=1.0):
    t = tt(d)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(t / 0.3, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    y = signal.square(ph, 0.4) * 0.5 + signal.sawtooth(ph) * 0.5
    y = lp(y, 3200)
    y *= np.minimum(t / 0.008, 1) * np.exp(-t / (d * 0.9)) * np.minimum((d - t) / 0.03, 1)
    put(music, y, t0, g * 0.22, pan=-0.1, send=0.3)


def bell(t0, f, g=1.0, pan=0.0):
    t = tt(2.2)
    y = np.sin(2 * np.pi * f * t + 2.5 * np.exp(-t * 7) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 2.2)
    put(fx, y, t0, g * 0.35, pan=pan, send=0.5)


def ding(t0, f=1320, g=1.0):
    t = tt(0.9)
    y = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 6)
    put(fx, y, t0, g * 0.4, send=0.35)


def tick(t0, f=1800, g=1.0, pan=0.0):
    t = tt(0.05)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 90)
    y += noise(len(t)) * np.exp(-t * 400) * 0.3
    put(fx, y, t0, g * 0.4, pan=pan)


def thump(t0, g=1.0):
    t = tt(0.4)
    y = np.sin(2 * np.pi * np.cumsum(55 * (0.5 + 0.5 * np.exp(-t * 20))) / SR) * np.exp(-t * 10)
    put(fx, y, t0, g)


def heartbeat(t0, g=1.0):
    thump(t0, g)
    thump(t0 + 0.2, g * 0.7)


def impact(t0, g=1.0, long=True):
    d = 2.6 if long else 1.2
    t = tt(d)
    y = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t * 6)) / SR) * np.exp(-t * (2.0 if long else 4))
    y += lp(noise(len(t)), 900) * np.exp(-t * 6) * 0.7
    y += noise(len(t)) * np.exp(-t * 40) * 0.5
    put(fx, np.tanh(y * 1.5), t0, g * 0.9, send=0.3)
    sc_times.append(t0)


def whoosh(t0, d=0.7, up=True, g=1.0, f0=300, f1=6000, pan=0.0):
    n = int(SR * d)
    x = noise(n)
    f, tm, Z = signal.stft(x, SR, nperseg=1024)
    k = np.linspace(0, 1, Z.shape[1])
    if not up:
        k = k[::-1]
    center = f0 * (f1 / f0) ** k
    mask = np.exp(-0.5 * ((np.log(f[:, None] + 1) - np.log(center[None, :])) / 0.55) ** 2)
    _, y = signal.istft(Z * mask, SR, nperseg=1024)
    y = y[:n]
    s = np.linspace(0, 1, len(y))
    shape = np.sin(np.pi * s) ** 1.5 if True else s
    y = y * shape * 4
    put(fx, y, t0, g * 0.6, pan=pan, send=0.15)


def riser(t0, d, g=1.0, f0=150, f1=3000):
    t = tt(d)
    s = t / d
    f = f0 * (f1 / f0) ** s
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    y += hp(noise(len(t)), 1800) * 0.5 * s ** 2
    y *= s ** 1.6
    put(fx, y, t0, g * 0.8, send=0.15)


def reverse_crash(t0, d=1.6, g=1.0):
    t = tt(d)
    y = hp(noise(len(t)), 3000) * np.exp(-t * 2.2)
    y = y[::-1] * 0.7
    put(fx, y, t0, g, send=0.2)


def crash(t0, g=1.0, d=2.2):
    t = tt(d)
    y = hp(noise(len(t)), 4000) * np.exp(-t * 2.4)
    put(fx, y, t0, g * 0.55, send=0.25)


def glitch(t0, g=1.0, d=0.12):
    n = int(SR * d)
    seg = rng.choice([0, 1], size=n // 40 + 1)
    y = np.repeat(seg, 40)[:n].astype(float) * 2 - 1
    y = y * rng.uniform(0.4, 1.0, size=n) * np.exp(-np.arange(n) / SR * 14)
    put(fx, hp(y, 400), t0, g * 0.45, pan=rng.uniform(-0.5, 0.5))


def stab(t0, freqs, d=0.25, g=1.0):
    t = tt(d)
    y = np.zeros_like(t)
    for f in freqs:
        y += signal.sawtooth(2 * np.pi * f * t) + signal.sawtooth(2 * np.pi * f * 1.006 * t)
    y = lp(y, 2400) / (len(freqs) * 2) * np.exp(-t / (d * 0.5))
    put(music, y, t0, g * 0.8, send=0.2)


# ---------------------------------------------------------------- helpers
def beat(n):
    return n * B


CH = {  # chord tones, bass root
    'Am': ([220.0, 261.63, 329.63], 55.0),
    'F': ([174.61, 220.0, 261.63], 43.65),
    'C': ([261.63, 329.63, 392.0], 65.41),
    'G': ([196.0, 246.94, 293.66], 49.0),
}
PROG = ['Am', 'F', 'C', 'G']


def bar_chord(bar):
    return CH[PROG[bar % 4]]


def arp(bar_t0, chord, g=1.0, bright=1.0, bars=1):
    tones = chord[0]
    notes = [tones[0] * 2, tones[1] * 2, tones[2] * 2, tones[0] * 4, tones[2] * 2, tones[1] * 4, tones[2] * 2, tones[1] * 2]
    for i in range(8 * bars):
        f = notes[i % 8]
        pluck(bar_t0 + i * B / 2, f, 0.3, g, pan=(-0.3 if i % 2 else 0.3), bright=bright)


# ---------------------------------------------------------------- arrangement
# Timeline (s): 0 hook | 2.5 "a year" | 7 turn | 10 DROP (logo) | 13 three promises
#               20 break | 21.5 "TODAY" hit | 23 end frame | 27 out
CH = {
    'Dm': ([293.66, 349.23, 440.0], 73.42),
    'Bb': ([233.08, 293.66, 349.23], 58.27),
    'F': ([174.61, 220.0, 261.63], 43.65),
    'C': ([261.63, 329.63, 392.0], 65.41),
}
PROG = ['Dm', 'Bb', 'F', 'C']

# --- 0-2.5 : HOOK -------------------------------------------------------------
impact(0.0, 1.0, long=False)
glitch(0.0, 1.2)
pad(0.0, [73.42, 110.0, 146.83], 2.6, 0.55, cutoff=500)
for k in range(5):
    heartbeat(beat(k), 0.9)
glitch(0.4, 0.8)
glitch(1.25, 1.0)
for i in range(5):
    tick(1.25 + i * 0.25, 2400 if i % 2 else 1900, 0.5)
riser(1.5, 1.0, 0.6, 120, 1200)

# --- 2.5-7 : "YOU'VE BEEN SAYING IT FOR A YEAR" -------------------------------
impact(2.5, 0.7, long=False)
for b in range(5, 14):  # 2.5 .. 6.5
    t = beat(b)
    kick(t, 0.85, short=True)
    bass_note(t, 73.42 if b < 9 else 58.27, B * 0.45, 0.8)
    bass_note(t + B / 2, 73.42 if b < 9 else 58.27, B * 0.4, 0.6)
    if b >= 9:
        tom(t + B / 2, 150 + (b % 3) * 30, 0.45)
        for s in range(4):
            hat(t + s * B / 4, 0.35 + 0.1 * s, pan=0.3 if s % 2 else -0.3)
for i in range(6):  # calendar pages flipping
    tick(2.75 + i * 0.28, 1500 + 90 * i, 0.5, pan=0.4 if i % 2 else -0.4)
for t in (4.2, 5.05, 5.98):  # the three broken promises
    stab(t, [293.66, 349.23, 440.0], 0.2, 0.8)
    thump(t, 0.8)
    glitch(t + 0.33, 0.8, 0.09)  # strike-through
pad(2.5, [146.83, 174.61, 220.0], 4.5, 0.55, cutoff=900)
riser(5.0, 2.0, 0.8, 200, 4000)
reverse_crash(6.2, 0.8, 0.8)

# --- 7-10 : TURN ---------------------------------------------------------------
whoosh(7.0, 0.6, False, 1.0, 5000, 200)
heartbeat(7.25, 1.0)
heartbeat(8.0, 1.0)
impact(8.5, 0.8, long=False)  # the word breaks, "SYSTEM" assembles
glitch(8.5, 1.2, 0.2)
for i, f in enumerate((293.66, 349.23, 440.0, 587.33)):
    pluck(8.6 + i * 0.12, f * 2, 0.4, 0.9, pan=(-0.3 if i % 2 else 0.3))
for i in range(8):
    snare(9.0 + i * B / 4, 0.25 + 0.09 * i)
riser(8.5, 1.5, 1.0, 300, 5000)
reverse_crash(8.8, 1.2, 0.8)

# --- 10-20 : DROP --------------------------------------------------------------
impact(10.0, 1.2)
crash(10.0, 1.0)
for bar in range(5):
    t0 = 10.0 + bar * 4 * B
    ch = CH[PROG[bar % 4]]
    for q in range(4):
        kick(t0 + q * B, 1.0)
        hat(t0 + q * B + B / 2, 0.9, open_=True)
        if q in (1, 3):
            clap(t0 + q * B, 1.0)
    for s in range(16):
        hat(t0 + s * B / 4, 0.28 if s % 2 else 0.18, pan=0.25 if s % 2 else -0.25)
    for e in range(8):
        bass_note(t0 + e * B / 2, ch[1], B * 0.42, 0.9)
    arp(t0, ch, 0.8, bright=1.0 if bar < 2 else 1.4)
    pad(t0, ch[0], 4 * B, 0.5, cutoff=1200)
whoosh(12.6, 0.5, True, 0.8)
for t in (13.0, 15.5, 17.5):  # three cards
    crash(t, 0.5)
    impact(t, 0.5, long=False)
    whoosh(t - 0.4, 0.5, True, 0.8)
ding(13.5, 1568, 1.0)  # arrow hits the target
for i in range(10):  # 30-day grid filling
    tick(15.7 + i * 0.15, 2000 + 60 * i, 0.4, pan=0.4 if i % 2 else -0.4)
ding(17.9, 1760, 0.8)  # chat messages
ding(18.6, 2093, 0.9)
for i in range(8):
    snare(19.0 + i * B / 4, 0.3 + 0.08 * i)
reverse_crash(18.8, 1.2, 0.8)

# --- 20-23 : BREAK, then "TODAY" -----------------------------------------------
impact(20.0, 0.9, long=False)
pad(20.0, [146.83, 174.61, 220.0, 293.66], 1.6, 0.6, cutoff=800)
heartbeat(20.25, 1.0)
glitch(20.5, 1.1, 0.15)  # monday crossed out
glitch(20.75, 1.1, 0.15)
heartbeat(21.0, 1.0)
riser(20.5, 1.0, 1.0, 200, 6000)
for i in range(4):
    snare(21.0 + i * B / 4, 0.4 + 0.12 * i)
impact(21.5, 1.2)
crash(21.5, 1.0)
for q in range(3):
    kick(21.5 + q * B, 1.0)
    clap(21.5 + q * B + B / 2, 0.8)
    stab(21.5 + q * B, [293.66, 440.0, 587.33], 0.22, 0.9)
    bass_note(21.5 + q * B, 73.42, B * 0.8, 0.9)
reverse_crash(22.0, 1.0, 0.8)

# --- 23-27 : END FRAME ---------------------------------------------------------
impact(23.0, 1.1)
crash(23.0, 0.9)
kick(23.0, 1.1)
pad(23.0, [146.83, 220.0, 293.66, 349.23, 440.0], 4.2, 0.9, cutoff=1800)
for i, f in enumerate((587.33, 440.0, 349.23, 440.0, 587.33, 880.0)):
    bell(23.3 + i * B * 0.75, f, 0.9 if i < 5 else 1.1, pan=(-0.3 if i % 2 else 0.3))
tick(24.0, 2600, 1.0)  # CTA button pops
ding(24.05, 1976, 0.9)
bell(25.6, 146.83, 0.8)


# ---------------------------------------------------------------- mixing
def reverb(x):
    n = int(SR * 2.0)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    for ch in range(2):
        ir = noise(n) * np.exp(-t * 3.2)
        ir = lp(ir, 6000)
        ir[:int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        out[ch] = signal.fftconvolve(x[ch], ir)[:N]
    return out / 60.0


# side-chain: bass and music breathe with every kick during the drop
t_axis = np.arange(N) / SR
duck = np.ones(N)
for kt in sc_times:
    if not (10.0 <= kt < 20.0):
        continue
    idx = int(kt * SR)
    m = min(int(0.35 * SR), N - idx)
    if m <= 0:
        continue
    d = 1 - 0.65 * np.exp(-np.arange(m) / SR / 0.09)
    duck[idx:idx + m] = np.minimum(duck[idx:idx + m], d)

wet = reverb(verb)
mix = drums * 0.95 + bass * duck * 0.85 + music * duck * 0.95 + fx * 0.95 + wet * 0.9
mix *= np.minimum(t_axis / 0.003, 1)
mix = np.stack([hp(mix[0], 28), hp(mix[1], 28)])
mix = np.tanh(mix * 1.1)
mix = mix[:, :int(SR * DUR)]
mix = mix / np.abs(mix).max() * 0.89
fo = int(0.8 * SR)
mix[:, -fo:] *= np.linspace(1, 0, fo)

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'soundtrack.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('wrote', os.path.abspath(out), mix.shape[1] / SR, 's')
