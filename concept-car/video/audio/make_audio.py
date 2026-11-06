"""
Original score + sound design for the concept-car review, synthesised from scratch with numpy/scipy.
No samples and no third-party material: nothing to license.

96 BPM, D minor (Dm - Bb - F - C). Every scene starts on a beat (see make_voice.py).
Reads src/timing.json (scenes, subtitle cues) and src/events.json (visual events, callouts), so every
effect lands on its picture event. Mixes public/voiceover.wav on top with ducking.

Writes:
  public/music.wav          music + effects, no voice
  public/soundtrack_vo.wav  final mix used by the video (voice + ducked music), loudness -16 LUFS

Usage: python3 audio/make_audio.py      (run audio/make_voice.py first)
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy import signal
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
T = json.load(open(os.path.join(ROOT, 'src', 'timing.json'), encoding='utf-8'))
E = json.load(open(os.path.join(ROOT, 'src', 'events.json'), encoding='utf-8'))

SR = 48000
B = 60.0 / T['bpm']
BAR = 4 * B
DUR = T['seconds']
N = int(round(SR * DUR))
rng = np.random.default_rng(11)

SC = {s[0]: (s[1], s[2]) for s in T['scenes']}


def ev(scene, key):
    return SC[scene][0] + E['scenes'][scene][key]


def bus():
    return np.zeros((2, N))


drums, bass, music, fx, amb, verb = bus(), bus(), bus(), bus(), bus(), bus()


def put(b, sig, t, gain=1.0, pan=0.0, send=0.0):
    i = int(round(t * SR))
    if i >= N:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
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


def noise(n):
    return rng.standard_normal(n)


def fade(y, a=0.005, r=0.02):
    n = len(y)
    env = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    env[:na] = np.linspace(0, 1, na)
    env[-nr:] *= np.linspace(1, 0, nr)
    return y * env


# ------------------------------------------------------------------ instruments
def kick(t0, g=1.0):
    t = tt(0.55)
    f = 40 + 95 * np.exp(-t * 30)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    y += lp(noise(len(t)), 3000) * np.exp(-t * 300) * 0.18
    put(drums, np.tanh(y * 1.6) * 0.85, t0, g)


def snare(t0, g=1.0):
    t = tt(0.32)
    y = bp(noise(len(t)), 1200, 6500) * np.exp(-t * 22) * 0.8
    y += np.sin(2 * np.pi * 185 * t) * np.exp(-t * 28) * 0.45
    put(drums, y, t0, g * 0.55, send=0.35)


def hat(t0, g=1.0, open_=False, pan=0.2):
    t = tt(0.3 if open_ else 0.05)
    y = hp(noise(len(t)), 8000) * np.exp(-t * (13 if open_ else 85))
    put(drums, y, t0, g * 0.28, pan=pan)


def tom(t0, f0=110, g=1.0):
    t = tt(0.5)
    f = f0 * (0.65 + 0.35 * np.exp(-t * 16))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    put(drums, y, t0, g * 0.7, send=0.25)


def sub(t0, f, d, g=1.0):
    t = tt(d)
    y = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    y = np.tanh(1.3 * y) * np.exp(-t / (d * 0.9))
    put(bass, fade(y, 0.004, 0.03), t0, g)


def pad(t0, freqs, d, g=1.0, cutoff=1200):
    t = tt(d + 0.6)
    y = np.zeros_like(t)
    for f in freqs:
        for det in (0.995, 1.0, 1.005):
            y += signal.sawtooth(2 * np.pi * f * det * t + rng.uniform(0, 6.28))
    y = lp(y, cutoff) / (len(freqs) * 2.2)
    y *= np.minimum(t / 0.45, 1) * np.clip((d + 0.6 - t) / 0.6, 0, 1)
    put(music, y, t0, g, pan=0.0, send=0.45)


def pluck(t0, f, d=0.32, g=1.0, pan=0.0, bright=1.0):
    t = tt(d)
    y = np.zeros_like(t)
    for det in (0.998, 1.002):
        for k in range(1, 12):
            if f * k * det > 10000:
                break
            y += np.sin(2 * np.pi * f * k * det * t) / k * np.exp(-t * (8 + 6 * k / bright))
    put(music, fade(y, 0.002, 0.02), t0, g * 0.22, pan=pan, send=0.35)


def bell(t0, f, g=1.0, pan=0.0, d=2.4):
    t = tt(d)
    y = np.sin(2 * np.pi * f * t + 1.8 * np.exp(-t * 5) * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 1.8)
    y += 0.3 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3)
    put(music, fade(y, 0.002, 0.2), t0, g * 0.2, pan=pan, send=0.6)


def impact(t0, g=1.0, d=2.8):
    t = tt(d)
    y = np.sin(2 * np.pi * np.cumsum(32 + 55 * np.exp(-t * 5)) / SR) * np.exp(-t * 1.9)
    y += lp(noise(len(t)), 700) * np.exp(-t * 5) * 0.6
    y += hp(noise(len(t)), 2000) * np.exp(-t * 25) * 0.25
    put(fx, np.tanh(y * 1.4), t0, g * 0.8, send=0.35)


def whoosh(t0, d=0.8, up=True, g=1.0, f0=250, f1=7000, pan=0.0):
    n = int(SR * d)
    f, _, Z = signal.stft(noise(n), SR, nperseg=1024)
    k = np.linspace(0, 1, Z.shape[1])
    k = k if up else k[::-1]
    centre = f0 * (f1 / f0) ** k
    mask = np.exp(-0.5 * ((np.log(f[:, None] + 1) - np.log(centre[None, :])) / 0.5) ** 2)
    _, y = signal.istft(Z * mask, SR, nperseg=1024)
    y = y[:n] * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * 4
    put(fx, y, t0, g * 0.55, pan=pan, send=0.2)


def riser(t0, d, g=1.0, f0=120, f1=2400):
    t = tt(d)
    s = t / d
    y = np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** s) / SR) * 0.22
    y += hp(noise(len(t)), 2000) * 0.45 * s ** 2
    put(fx, y * s ** 1.7, t0, g * 0.7, send=0.2)


def light_on(t0, g=1.0):
    """LED ignite: three tiny relay clicks, a rising electric whine and a glassy shimmer."""
    for k, o in enumerate((0.0, 0.07, 0.12)):
        t = tt(0.03)
        put(fx, hp(noise(len(t)), 3000) * np.exp(-t * 300), t0 + o, g * (0.35 + 0.15 * k), pan=-0.2)
    t = tt(0.9)
    f = 260 * (1600 / 260) ** np.minimum(t / 0.35, 1)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(t / 0.05, 1) * np.exp(-t * 3.5) * 0.25
    put(fx, y, t0 + 0.1, g, send=0.3)
    for fr, pan in ((2349.3, -0.4), (2793.8, 0.4), (3520.0, 0.0)):
        bell(t0 + 0.14, fr / 2, g * 0.6, pan=pan, d=2.0)


def power_down(t0, g=1.0):
    t = tt(1.1)
    f = 1500 * (180 / 1500) ** (t / 1.1)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) * 0.22
    put(fx, fade(y, 0.01, 0.2), t0, g, send=0.4)
    whoosh(t0, 1.0, False, g * 0.7, 300, 5000)


def scan(t0, d, g=1.0):
    t = tt(d)
    s = t / d
    x = noise(len(t))
    y = np.zeros_like(x)
    # band-passed noise sweeping up, chopped at 22 Hz: a "drawing / scanning" texture
    for i, (lo, hi) in enumerate([(700, 1400), (1400, 2800), (2800, 5600)]):
        w = np.clip(1 - np.abs(s * 2 - i) , 0, 1)
        y += bp(x, lo, hi) * w
    y *= (0.6 + 0.4 * (np.sin(2 * np.pi * 22 * t) > 0)) * np.sin(np.pi * s) ** 0.8
    put(fx, y, t0, g * 0.35, pan=0.0, send=0.15)


def wind(t0, d, g=1.0, pan=0.0):
    t = tt(d)
    s = t / d
    y = bp(noise(len(t)), 200, 2600) * (0.4 + 0.6 * np.sin(np.pi * s) ** 2)
    y = lp(y, 1600) * (1 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
    put(amb, fade(y, 0.3, 0.6), t0, g * 0.5, pan=pan, send=0.1)


def shimmer(t0, d=1.6, g=1.0):
    t = tt(d)
    s = t / d
    y = bp(noise(len(t)), 5000, 12000) * np.sin(np.pi * s) ** 2 * 0.5
    put(fx, y, t0, g * 0.45, pan=-0.5 + s[-1], send=0.4)
    for k, fr in enumerate((1760.0, 2217.5, 2637.0)):
        bell(t0 + d * (0.25 + 0.2 * k), fr, g * 0.35, pan=-0.4 + 0.4 * k, d=1.6)


def spin(t0, g=1.0):
    whoosh(t0, 1.1, True, g * 0.8, 200, 4000)
    for k in range(10):
        o = 1.0 * (1 - (1 - k / 10) ** 1.6)
        t = tt(0.04)
        put(fx, np.sin(2 * np.pi * (1800 + 90 * k) * t) * np.exp(-t * 120), t0 + o, g * 0.18, pan=-0.3 + 0.06 * k)


def tick(t0, g=1.0, f=2400, pan=0.0):
    t = tt(0.06)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 95) + hp(noise(len(t)), 5000) * np.exp(-t * 400) * 0.25
    put(fx, y, t0, g * 0.3, pan=pan, send=0.15)


def drip(t0, g=1.0, pan=0.0):
    t = tt(0.12)
    f = rng.uniform(900, 1500) * (0.55 + 0.45 * np.exp(-t * 60))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)
    put(amb, y, t0, g * 0.12, pan=pan, send=0.5)


# ------------------------------------------------------------------ harmony
CH = [  # pad tones, bass root    Dm(add9)  Bb(add9)  F(add9)  C(add9)
    ([146.83, 174.61, 220.00, 329.63], 73.42),
    ([116.54, 146.83, 174.61, 261.63], 58.27),
    ([174.61, 220.00, 261.63, 392.00], 87.31),
    ([130.81, 164.81, 196.00, 293.66], 65.41),
]


def chord_at(t):
    return CH[int(t // BAR + 1e-6) % 4]


def beats(t0, t1, step=1.0):
    """beat times (multiples of step*B) inside [t0, t1)"""
    k0 = int(np.ceil(t0 / (B * step) - 1e-6))
    out = []
    k = k0
    while k * B * step < t1 - 1e-6:
        out.append(k * B * step)
        k += 1
    return out


s_sil, s_lig, s_aer, s_whe, s_det, s_ver = (SC[k][0] for k in
                                             ('silhouette', 'light', 'aero', 'wheels', 'details', 'verdict'))
END_CARD = ev('verdict', 'endcard')
OFF = ev('verdict', 'lightsOff')

# ------------------------------------------------------------------ ambience: wet street all along
t = tt(DUR)
x = noise(len(t))
street = lp(hp(x, 120), 900) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t))
amb[0] += street * 0.05
amb[1] += np.roll(street, 2400) * 0.05
for td in np.cumsum(rng.exponential(1.4, 200)):
    if td < DUR - 0.5:
        drip(td, rng.uniform(0.5, 1.0), pan=rng.uniform(-0.8, 0.8))

# ------------------------------------------------------------------ intro
# low drone from the first frame, lights on, the photo fades in on a soft boom
d = tt(s_sil + 0.5)
drone = (np.sin(2 * np.pi * 36.71 * d) + 0.5 * np.sin(2 * np.pi * 73.42 * d)) * np.minimum(d / 1.5, 1)
drone *= np.clip((s_sil + 0.5 - d) / 1.0, 0, 1) * 0.22
put(music, drone, 0.0)
light_on(ev('intro', 'drlOn'), 1.0)
impact(ev('intro', 'photoIn'), 0.55, d=3.2)
riser(s_sil - 2.5, 2.5, 0.6, 150, 1800)
whoosh(s_sil - 0.6, 0.9, True, 0.7)

# ------------------------------------------------------------------ pads (whole piece, intensity automation)
bar0 = int(ev('intro', 'photoIn') // BAR)
for bi in range(bar0, int(END_CARD // BAR) + 1):
    t0 = bi * BAR
    if t0 >= END_CARD:
        break
    tones, _ = chord_at(t0)
    if t0 < s_sil:
        g, cut = 0.35, 700
    elif s_det <= t0 < s_ver:
        g, cut = 0.55, 1800
    else:
        g, cut = 0.42, 1200
    dur = min(BAR, END_CARD - t0)
    pad(max(t0, ev('intro', 'photoIn')), tones, dur, g, cut)

# ------------------------------------------------------------------ groove
for tb in beats(s_sil, END_CARD):
    bi = int(round(tb / B))
    in_det = s_det <= tb < s_ver
    full = (s_aer <= tb < s_det) or (tb >= s_ver)
    # kick: half-time in silhouette/light/details, four-on-the-floor in aero/wheels/verdict
    if full or bi % 2 == 0:
        kick(tb, 0.9 if full else 0.75)
    if full and bi % 4 in (1, 3):
        snare(tb, 0.8)
    if tb >= s_lig and not in_det:
        hat(tb + B / 2, 0.8, open_=full, pan=0.25)
    if full and not in_det:
        for s16 in (0.25, 0.75):
            hat(tb + s16 * B, 0.55, pan=-0.25)
    # sub bass: 8th pulses, long notes in the details breakdown
    _, root = chord_at(tb)
    if in_det:
        if bi % 4 == 0:
            sub(tb, root, BAR * 0.95, 0.75)
    else:
        sub(tb, root, B * 0.45, 0.8)
        sub(tb + B / 2, root, B * 0.4, 0.55)

# arpeggio: light (8ths), aero/wheels (16ths), verdict (8ths)
for tb in beats(s_lig, END_CARD, 0.5):
    if s_det <= tb < s_ver:
        continue
    tones, _ = chord_at(tb)
    seq = [tones[0] * 2, tones[1] * 2, tones[2] * 2, tones[3] * 2, tones[2] * 2, tones[1] * 2]
    k = int(round(tb / (B / 2)))
    pluck(tb, seq[k % len(seq)], 0.34, 0.9, pan=-0.35 if k % 2 else 0.35, bright=1.3)
    if s_aer <= tb < s_det:
        pluck(tb + B / 4, seq[(k + 3) % len(seq)] * 2, 0.22, 0.45, pan=0.0, bright=1.6)

# details: sparse glassy bell motif
motif = [(0, 2), (1.5, 1), (2, 0), (3, 3)]
for bi in range(int(np.ceil(s_det / BAR)), int(s_ver // BAR) + 1):
    t0 = bi * BAR
    tones, _ = chord_at(t0)
    for ob, idx in motif:
        tm = t0 + ob * B
        if s_det <= tm < s_ver - 0.2:
            bell(tm, tones[idx] * 4, 0.8, pan=(-0.3 if idx % 2 else 0.3))

# ------------------------------------------------------------------ scene transitions + events
for sid in ('light', 'aero', 'wheels', 'details', 'verdict'):
    whoosh(SC[sid][0] - 0.45, 0.8, True, 0.75, pan=rng.uniform(-0.3, 0.3))
for sid in ('silhouette', 'light', 'aero', 'wheels', 'details'):
    tick(ev(sid, 'chapter'), 0.9, 1900)
impact(s_sil, 0.45, d=2.0)
scan(ev('silhouette', 'draw'), E['scenes']['silhouette']['drawEnd'] - E['scenes']['silhouette']['draw'], 1.0)
light_on(ev('light', 'ignite'), 1.1)
whoosh(ev('light', 'ignite') + 0.1, 1.3, False, 0.5, 6000, 900)
wind(ev('aero', 'flow'), 4.5, 0.9, pan=-0.3)
wind(ev('aero', 'flow') + 5.0, 5.0, 0.8, pan=0.3)
tom(s_whe, 98, 0.9)
spin(ev('wheels', 'ring'), 1.0)
shimmer(ev('details', 'sweep1'), 1.8, 1.0)
shimmer(ev('details', 'sweep2'), 1.8, 0.9)
impact(s_ver, 0.6, d=2.4)
riser(END_CARD - 2.5, 2.5, 1.0, 120, 3200)
impact(END_CARD, 1.0, d=4.5)
pad(END_CARD, [73.42, 146.83, 220.0, 293.66, 349.23], DUR - END_CARD - 0.6, 0.6, 900)
bell(END_CARD + 0.05, 587.33, 1.0, d=4.0)
bell(END_CARD + 0.05, 880.0, 0.7, pan=0.3, d=4.0)
power_down(OFF, 0.9)

# callout ticks
cues = T['cues']
for c in E['callouts']:
    a, b, _ = cues[c['cue']]
    tick(a + c['f'] * (b - a), 0.7, 2600 + rng.uniform(-150, 150), pan=rng.uniform(-0.4, 0.4))

# ------------------------------------------------------------------ reverb
ir_t = tt(2.6)
ir = np.zeros((2, len(ir_t)))
for ch in range(2):
    ir[ch] = lp(noise(len(ir_t)), 5500) * np.exp(-ir_t * 6.9 / 2.4)
ir[:, : int(0.025 * SR)] = 0
ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
wet = np.stack([signal.fftconvolve(verb[ch], ir[ch])[:N] for ch in range(2)])

# ------------------------------------------------------------------ voice + ducking
with wave.open(os.path.join(ROOT, 'public', 'voiceover.wav')) as w:
    assert w.getframerate() == SR
    vo = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
env = np.abs(vo)
att, rel = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
follow = signal.lfilter([1 - rel], [1, -rel], env)            # smooth release
follow = np.maximum(follow, signal.lfilter([1 - att], [1, -att], env))
level = np.clip(follow / (np.percentile(follow[follow > 1e-4], 70) + 1e-9), 0, 1)
level = signal.savgol_filter(level, 2401, 2).clip(0, 1)

music_mix = drums * 0.85 + bass * 0.75 + music * 0.7 + wet * 0.32
fx_mix = fx * 0.75 + amb * 0.8
duck_m = 1 - 0.66 * level   # about -9 dB under the voice
duck_f = 1 - 0.35 * level
bed = music_mix * duck_m + fx_mix * duck_f

# gentle bus compression, then fix the bed's scale BEFORE the lifts so they really change the balance
benv = signal.savgol_filter(np.max(np.abs(bed), axis=0), 1201, 2)
thr = np.percentile(benv, 95) * 0.7
bed *= np.where(benv > thr, (thr + (benv - thr) * 0.5) / np.maximum(benv, 1e-9), 1.0)
bed *= 0.89 / np.max(np.abs(bed))

# lift the moments without voice: lights-on before the first line, and the end card
lift = np.zeros(N)
for a, b, db in ((0.0, T['cues'][0][0] - 0.2, 10.0), (END_CARD - 0.3, DUR, 12.0)):
    lift[int(a * SR):int(b * SR)] = db
lift = signal.savgol_filter(lift, int(0.4 * SR) | 1, 1)
bed *= 10 ** (lift / 20)
bed[:, -int(0.9 * SR):] *= np.linspace(1, 0, int(0.9 * SR))  # tail fade

# peak limiter (hold + smooth gain, centred windows act as look-ahead)
pk = maximum_filter1d(np.max(np.abs(bed), axis=0), int(0.005 * SR))
g = np.minimum(1.0, 0.95 / np.maximum(pk, 1e-9))
g = uniform_filter1d(minimum_filter1d(g, int(0.03 * SR)), int(0.02 * SR))
bed *= g


def write(path, stereo):
    stereo = stereo / max(1e-9, np.max(np.abs(stereo))) * 0.89
    with wave.open(path, 'w') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(stereo.T, -1, 1) * 32767).astype(np.int16).tobytes())


write(os.path.join(ROOT, 'public', 'music.wav'), bed)

mix = bed * 0.42 + np.stack([vo, vo]) * 1.0
with tempfile.TemporaryDirectory() as td:
    raw = os.path.join(td, 'mix.wav')
    write(raw, mix)
    out = os.path.join(ROOT, 'public', 'soundtrack_vo.wav')
    # two-pass loudnorm in linear mode: one static gain, no pumping
    target = 'I=-16:TP=-1.5:LRA=11'
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', raw, '-af',
                        f'loudnorm={target}:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True, check=True)
    m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
    af = (f"loudnorm={target}:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af', af, '-ar', str(SR), out], check=True)
print('ok', round(DUR, 2), 's')
