"""
Original soundtrack + SFX for the ODIN promo, synthesised from scratch with numpy/scipy.
120 BPM  ->  1 beat = 0.5 s = 15 frames @30fps. Every cut in the video lands on this grid.
No samples, no third-party material: fully original, nothing to license.
"""
import numpy as np, wave, os
from scipy import signal

SR = 44100
BPM = 120
B = 60.0 / BPM
DUR = 25.0
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
# --- 0-2 s : HOOK ------------------------------------------------------------
impact(0.0, 1.0, long=False)
glitch(0.0, 1.2)
for k in range(4):
    heartbeat(beat(k), 0.9)
glitch(beat(1), 0.9)  # "У ТЕБЯ"
glitch(beat(2), 1.0)  # "ЗАДАЧ"
tick(beat(3), 1200, 1.2)
glitch(beat(3), 1.1)  # stamp
for i in range(4, 8):  # tick tock
    tick(beat(i) / 1.0 * 0 + i * B / 2 * 1.0 if False else i * B / 2, 2400 if i % 2 else 1900, 0.5)
pad(0.0, [55.0, 82.41, 110.0], 4.0, 0.55, cutoff=500)
riser(0.5, 1.5, 0.5, 120, 900)

# --- 2-6 s : CHAOS (words on every beat) -------------------------------------
for b in range(4, 12):  # 2.0 .. 5.5
    t = beat(b)
    kick(t, 0.85, short=True)
    tom(t + B / 2, 150 + (b % 3) * 30, 0.5)
    stab(t, [220, 261.63, 329.63] if b % 2 == 0 else [196, 246.94, 293.66], 0.18, 0.7)
    glitch(t, 0.6, 0.07)
for b in range(6, 12):
    for s in range(4):
        hat(beat(b) + s * B / 4, 0.4 + 0.1 * s, pan=0.3 if s % 2 else -0.3)
for b in (8, 9, 10, 11):
    clap(beat(b) + B, 0.0 + 0.9)  # on the 'and' for urgency
for b in range(4, 12):
    bass_note(beat(b), 55.0 if b < 8 else 49.0, B * 0.45, 0.8)
    bass_note(beat(b) + B / 2, 55.0 if b < 8 else 49.0, B * 0.4, 0.6)
riser(beat(8), beat(4) - 0.0, 1.0, 200, 5000)
whoosh(beat(8), 2.0, True, 0.9, 250, 7000)
crash(beat(8), 0.6)
pad(beat(4), [110.0, 130.81, 164.81], 4.0, 0.6, cutoff=900)

# --- 6-8 s : TURN (implosion, silence, question) -----------------------------
whoosh(6.0, 0.7, False, 1.1, 5000, 200)  # suck-in
reverse_crash(5.2, 0.8, 0.9)
# 6.7 - 7.5 near silence : heartbeat + question
heartbeat(7.0, 1.0)
tick(beat(13) + 0.33, 1500, 0.8)  # "а если"
tick(beat(14) + 0.33, 1500, 0.8)  # "только одно?"
heartbeat(7.5, 1.0)
for i in range(8):  # snare roll into drop
    snare(7.5 + i * B / 8 * 1, 0.25 + 0.09 * i)
riser(7.0, 1.0, 0.9, 300, 4500)
reverse_crash(7.0, 1.0, 0.8)

# --- 8-16 s : DROP A ---------------------------------------------------------
impact(8.0, 1.2)
crash(8.0, 1.0)
for bar in range(4, 8):  # bars starting 8s
    t0 = beat(bar * 4)
    ch = bar_chord(bar - 4)
    for q in range(4):
        kick(t0 + q * B, 1.0)
        hat(t0 + q * B + B / 2, 0.9, open_=True)
        if q in (1, 3):
            clap(t0 + q * B, 1.0)
    for s in range(16):
        hat(t0 + s * B / 4, 0.28 if s % 2 else 0.18, pan=0.25 if s % 2 else -0.25)
    for e in range(8):
        # offbeat rolling bass
        bass_note(t0 + e * B / 2 + (B / 4 if e % 2 else 0) * 0, ch[1], B * 0.42, 0.9)
    arp(t0, ch, 0.9 if bar >= 5 else 0.7, bright=1.0)
    pad(t0, ch[0], 4 * B, 0.5, cutoff=1100)
whoosh(10.0 - 0.5, 0.8, True, 0.9)   # phone enters
whoosh(12.0 - 0.4, 0.6, True, 0.8)   # swipe scene
whoosh(14.0 - 0.4, 0.6, True, 0.8)   # timer scene
impact(10.0, 0.6, long=False)
ding(12.0 + 0.55, 1568, 1.1)  # task complete
ding(12.0 + 1.05, 1760, 0.9)
for i in range(8):
    tick(14.0 + 0.2 + i * B / 2, 2600 if i % 2 else 2000, 0.45, pan=0.4 if i % 2 else -0.4)
crash(12.0, 0.5)
crash(14.0, 0.5)
glitch(13.5, 0.8)

# --- 16-20 s : DROP B : dots collapse, 'no list, no guilt, no chaos' ---------
crash(16.0, 0.9)
impact(16.0, 0.7, long=False)
for bar in range(8, 12):
    t0 = beat(bar * 4)
    ch = bar_chord(bar - 8)
    for q in range(4):
        kick(t0 + q * B, 1.0)
        hat(t0 + q * B + B / 2, 0.9, open_=True)
        if q in (1, 3):
            clap(t0 + q * B, 1.0)
            snare(t0 + q * B, 0.5)
    for s in range(16):
        hat(t0 + s * B / 4, 0.3 if s % 2 else 0.2, pan=0.25 if s % 2 else -0.25)
    for e in range(8):
        bass_note(t0 + e * B / 2, ch[1], B * 0.42, 0.9)
    arp(t0, ch, 0.8, bright=1.4)
    pad(t0, ch[0], 4 * B, 0.45, cutoff=1300)
    LD = {'Am': [(0, 659.25, 1.4), (1.5, 587.33, 0.5), (2, 523.25, 1.0), (3, 587.33, 1.0)],
          'F': [(0, 523.25, 1.4), (1.5, 440.0, 0.5), (2, 523.25, 1.0), (3, 698.46, 1.0)],
          'C': [(0, 659.25, 1.4), (1.5, 783.99, 0.5), (2, 659.25, 1.0), (3, 523.25, 1.0)],
          'G': [(0, 587.33, 1.4), (1.5, 493.88, 0.5), (2, 587.33, 1.0), (3, 783.99, 1.0)]}[PROG[bar - 8]]
    for (ob, f, ln) in LD:
        lead(t0 + ob * B, f, ln * B * 0.95, 1.0)
for i, t in enumerate((17.0, 17.5, 18.0, 18.5, 19.0)):
    tom(t - 0.0 + 0.25, 200 - i * 12, 0.5)
for i in range(8):
    snare(19.0 + i * B / 4 * 1, 0.3 + 0.08 * i)  # fill
whoosh(18.0 - 0.1, 0.5, True, 0.7)
whoosh(19.5, 0.5, True, 0.8)

# --- 20-22 s : BUILD / MARQUEE ----------------------------------------------
riser(20.0, 2.0, 1.1, 180, 6000)
whoosh(20.0, 2.0, True, 1.0, 300, 9000)
for i in range(16):
    snare(20.0 + i * B / 2 * 1.0 if i < 4 else 20.0 + 2 * B + (i - 4) * B / 4 * 1, 0.2 + 0.05 * i)
for i in range(4):
    kick(20.0 + i * B, 0.9, short=True)
pad(20.0, [110.0, 130.81, 164.81, 220.0], 2.0, 0.6)
for i in range(6):
    tick(20.0 + i * 0.33, 2200 + 120 * i, 0.5)
reverse_crash(20.4, 1.6, 0.9)

# --- 22-25 s : THE END FRAME ---------------------------------------------
impact(22.0, 1.1)
crash(22.0, 0.9)
kick(22.0, 1.1)
pad(22.0, [110.0, 164.81, 220.0, 246.94, 261.63, 329.63], 3.3, 0.9, cutoff=1800)
for i, f in enumerate((659.25, 523.25, 440.0, 523.25, 659.25, 987.77)):
    bell(22.35 + i * B * 0.75, f, 0.9 if i < 5 else 1.1, pan=(-0.3 if i % 2 else 0.3))
thump(22.0, 1.2)
tick(23.05, 2600, 1.0)   # CTA button pops
ding(23.1, 1976, 0.9)
bell(24.0, 220.0, 0.8)

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


# side-chain: duck bass+music with every kick during the "drop" sections
t_axis = np.arange(N) / SR
duck = np.ones(N)
for kt in sc_times:
    if kt < 8.0 or (20.0 <= kt < 22.0):
        continue
    idx = int(kt * SR)
    m = min(int(0.35 * SR), N - idx)
    if m <= 0:
        continue
    d = 1 - 0.65 * np.exp(-np.arange(m) / SR / 0.09)
    duck[idx:idx + m] = np.minimum(duck[idx:idx + m], d)

wet = reverb(verb)
mix = drums * 0.95 + bass * duck * 0.85 + music * duck * 0.95 + fx * 0.95 + wet * 0.9

# silence window in the TURN (6.67-7.0): duck everything but the heartbeat/ticks (fx bus)
gate = np.ones(N)
a, b_ = int(6.66 * SR), int(7.5 * SR)
gate[a:b_] = 0.0
fade = np.minimum((b_ - np.arange(a, b_)) / (0.08 * SR), 1.0)  # no-op safety
mix_bed = (drums * 0.95 + bass * duck * 0.85 + music * duck * 0.95 + wet * 0.9) * gate
mix = mix_bed + fx * 0.95
# small ramp-in so the hook is punchy but not clicky
mix *= np.minimum(t_axis / 0.003, 1)
# master: gentle HP, soft clip, normalise, outro fade
mix = np.stack([hp(mix[0], 28), hp(mix[1], 28)])
mix = np.tanh(mix * 1.1)
mix = mix[:, :int(SR * DUR)]
peak = np.abs(mix).max()
mix = mix / peak * 0.89
n_out = mix.shape[1]
fo = int(0.7 * SR)
mix[:, -fo:] *= np.linspace(1, 0, fo)

out = os.path.join(os.path.dirname(__file__), '..', 'public', 'soundtrack.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('wrote', os.path.abspath(out), n_out / SR, 's')
