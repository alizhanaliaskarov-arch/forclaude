"""
Саундтрек «Земля-2126» (15:00) — полностью синтезирован, без сторонних сэмплов.
Только numpy и стандартная библиотека.

Пишет:
  build/music.wav — музыка (главная тема ре минор → фа мажор, струнные, хор, синтезаторы, щипковые, эмбиент)
  build/sfx.wav   — звуки по таймкодам сцен (плёнка, ветер, ракета, удары карточек глав, лёд, шторм, город,
                    дождь, термояд, «вжух», сердцебиение, кит, лягушки, колокол трамвая)
Сведение с голосом и громкость −14 LUFS — в export.sh (ffmpeg).
"""
import math
import os
import wave

import numpy as np

SR = 44100
DUR = 900.0
N = int(SR * DUR)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'build')
rng = np.random.default_rng(2126)

music = np.zeros((2, N), dtype=np.float32)
sfx = np.zeros((2, N), dtype=np.float32)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, t0, sig, pan=0.0, gain=1.0):
    """Положить моно- или стерео-сигнал в буфер с позиции t0 (секунды)."""
    i = int(t0 * SR)
    if i >= N:
        return
    if sig.ndim == 1:
        l = sig * gain * math.cos((pan + 1) * math.pi / 4)
        r = sig * gain * math.sin((pan + 1) * math.pi / 4)
        sig = np.stack([l, r])
    else:
        sig = sig * gain
    n = min(sig.shape[1], N - i)
    if i < 0:
        sig = sig[:, -i:]
        n = min(sig.shape[1], N)
        i = 0
    buf[:, i:i + n] += sig[:, :n].astype(np.float32)


def env_adsr(n, a, d, s, r, sus_len):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    e = np.where((t >= a + d) & (t < sus_len), s, e)
    e = np.where(t >= sus_len, s * np.exp(-(t - sus_len) / max(r, 1e-4) * 3), e)
    return e


def lowpass_fft(x, cutoff):
    """Мягкий фильтр низких частот через БПФ (для шума и пэдов)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass_fft(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)) * (1 / np.sqrt(1 + (f / hi) ** 4))
    return np.fft.irfft(X, len(x))


# ---------------------------------------------------------------- инструменты
def piano(m, dur=3.5, vel=0.8):
    f = hz(m)
    n = int(SR * (dur + 1.5))
    t = np.arange(n) / SR
    sig = np.zeros(n)
    B = 0.0003
    for k in range(1, 10):
        fk = f * k * math.sqrt(1 + B * k * k)
        if fk > 12000:
            break
        tau = 2.8 / (k ** 0.6) * (220 / max(f, 110)) ** 0.25
        sig += (1 / k ** 1.25) * np.sin(2 * math.pi * fk * t + rng.random() * 6.28) * np.exp(-t / tau)
    att = np.minimum(1, t / 0.004)
    rel = np.where(t > dur, np.exp(-(t - dur) / 0.25), 1)
    hammer = rng.standard_normal(n) * np.exp(-t / 0.006) * 0.15
    return (sig * att * rel + hammer) * vel * 0.32


def pluck(m, vel=0.7, bright=1.0):
    f = hz(m)
    n = int(SR * 2.2)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for k in range(1, 12):
        fk = f * k
        if fk > 10000:
            break
        sig += (1 / k ** (1.6 - 0.4 * bright)) * np.sin(2 * math.pi * fk * t) * np.exp(-t * (2.5 + k * 0.9))
    return sig * np.minimum(1, t / 0.002) * vel * 0.3


def strings(m, dur, vel=0.5, att=1.2, rel=2.0, bright=0.6):
    f = hz(m)
    n = int(SR * (dur + rel))
    t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * math.pi * 5.2 * t + rng.random() * 6) * np.minimum(1, t / 1.5)
    sig = np.zeros(n)
    for det in (-0.006, -0.002, 0.003, 0.007):
        ph = 2 * math.pi * f * (1 + det) * np.cumsum(vib) / SR
        for k in range(1, 9):
            if f * k > 9000:
                break
            sig += (1 / k ** (1.9 - bright)) * np.sin(k * ph + rng.random() * 6.28)
    e = np.minimum(1, t / att) * np.where(t > dur, np.exp(-(t - dur) / (rel / 3)), 1)
    return sig * e * vel * 0.06


def choir(m, dur, vel=0.5):
    f = hz(m)
    n = int(SR * (dur + 2.5))
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for k in range(1, 14):
        fk = f * k
        # гласная «а»: форманты около 700 и 1100 Гц
        w = math.exp(-((fk - 700) / 220) ** 2) + 0.7 * math.exp(-((fk - 1150) / 260) ** 2) + 0.25 / k
        for det in (-0.004, 0.004):
            sig += w * np.sin(2 * math.pi * fk * (1 + det) * t + 0.002 * np.sin(2 * math.pi * 5 * t) * k + rng.random() * 6)
    e = np.minimum(1, t / 1.8) * np.where(t > dur, np.exp(-(t - dur) / 0.8), 1)
    return sig * e * vel * 0.05


def sub(m, dur, vel=0.6):
    f = hz(m)
    n = int(SR * (dur + 1.5))
    t = np.arange(n) / SR
    sig = np.sin(2 * math.pi * f * t) + 0.3 * np.sin(4 * math.pi * f * t)
    e = np.minimum(1, t / 0.8) * np.where(t > dur, np.exp(-(t - dur) / 0.4), 1)
    return sig * e * vel * 0.35


def synth_pluck(m, vel=0.6, cutoff=2400):
    f = hz(m)
    n = int(SR * 0.6)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for k in range(1, 20):
        fk = f * k
        if fk > cutoff * 2:
            break
        a = (1 / k) * (1 / math.sqrt(1 + (fk / cutoff) ** 4))
        sig += a * np.sin(2 * math.pi * fk * t)
    return sig * np.exp(-t / 0.14) * np.minimum(1, t / 0.003) * vel * 0.22


def kick(vel=0.8):
    n = int(SR * 0.5)
    t = np.arange(n) / SR
    f = 45 + 80 * np.exp(-t / 0.04)
    return np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16) * vel * 0.7


def shaker(vel=0.3):
    n = int(SR * 0.08)
    t = np.arange(n) / SR
    x = bandpass_fft(rng.standard_normal(n), 4000, 12000)
    return x * np.exp(-t / 0.02) * vel * 0.25


def boom(vel=1.0, length=3.0):
    n = int(SR * length)
    t = np.arange(n) / SR
    low = np.sin(2 * math.pi * (38 + 30 * np.exp(-t / 0.25)) * t) * np.exp(-t / 0.9)
    noise = lowpass_fft(rng.standard_normal(n), 300) * np.exp(-t / 0.5) * 0.4
    return (low + noise) * vel * 0.9


def noise_bed(dur, lo, hi, gain, lfo=0.0, lfo_rate=0.2):
    n = int(SR * dur)
    t = np.arange(n) / SR
    x = bandpass_fft(rng.standard_normal(n), lo, hi)
    x /= np.max(np.abs(x)) + 1e-9
    if lfo:
        x *= 1 - lfo + lfo * (0.5 + 0.5 * np.sin(2 * math.pi * lfo_rate * t + rng.random() * 6))
    return x * gain


def fade_io(x, fi, fo):
    n = x.shape[-1]
    e = np.ones(n)
    a, b = int(fi * SR), int(fo * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if b:
        e[-b:] = np.minimum(e[-b:], np.linspace(1, 0, b))
    return x * e


# ---------------------------------------------------------------- гармония
Dm, Bb, F, C, Gm, A, Am = [50, 57, 62, 65, 69], [46, 53, 58, 62, 65], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 58, 62], [45, 52, 57, 61, 64], [45, 52, 57, 60, 64]
MINOR = [Dm, Bb, F, C, Dm, Bb, Gm, A]
MAJOR = [F, Dm, Bb, C, F, Am, Bb, C]
# главная тема: (доля такта, MIDI, длительность в долях), 8 тактов по 4 доли
THEME_MIN = [(0, 69, 2), (2, 65, 1), (3, 67, 1), (4, 69, 3), (7, 74, 1), (8, 72, 2), (10, 69, 1), (11, 65, 1), (12, 67, 4),
             (16, 69, 2), (18, 65, 1), (19, 67, 1), (20, 69, 2), (22, 72, 1), (23, 74, 1), (24, 76, 2), (26, 74, 1), (27, 69, 1), (28, 74, 4)]
THEME_MAJ = [(0, 72, 2), (2, 69, 1), (3, 70, 1), (4, 72, 3), (7, 77, 1), (8, 74, 2), (10, 72, 1), (11, 69, 1), (12, 67, 4),
             (16, 72, 2), (18, 69, 1), (19, 70, 1), (20, 72, 2), (22, 76, 1), (23, 77, 1), (24, 79, 2), (26, 77, 1), (27, 74, 1), (28, 76, 2), (30, 77, 2)]


def theme(t0, bpm, melody=True, chords=MINOR, mel=THEME_MIN, vel=0.75, strings_on=True, bars=8, arp=True, oct_shift=0):
    beat = 60 / bpm
    for i in range(bars):
        ch = chords[i % len(chords)]
        tb = t0 + i * 4 * beat
        if strings_on:
            for m in ch[1:]:
                add(music, tb, strings(m + 12, 4 * beat, vel * 0.7), pan=rng.uniform(-0.5, 0.5))
            add(music, tb, strings(ch[0], 4 * beat, vel * 0.8, bright=0.4), pan=0)
        if arp:
            pattern = [ch[0], ch[2], ch[3], ch[2] + 12 if ch[2] + 12 < 84 else ch[2], ch[4], ch[3], ch[2], ch[3]]
            for k, m in enumerate(pattern):
                add(music, tb + k * beat / 2, piano(m, beat * 0.9, vel * 0.42), pan=-0.25)
    if melody:
        for b, m, d in mel:
            if b < bars * 4:
                add(music, t0 + b * beat, piano(m + oct_shift, d * beat * 0.95, vel), pan=0.15)


def pad(t0, t1, chords, chord_len, vel=0.4, voice='strings', octave=0):
    t = t0
    i = 0
    while t < t1 - 0.5:
        ch = chords[i % len(chords)]
        L = min(chord_len, t1 - t)
        for m in ch[1:]:
            sig = strings(m + octave, L, vel) if voice == 'strings' else choir(m + octave, L, vel)
            add(music, t, sig, pan=rng.uniform(-0.6, 0.6))
        add(music, t, sub(ch[0] - 12, L, vel * 0.6))
        t += chord_len
        i += 1


# ---------------------------------------------------------------- музыка по главам
# 0:12–0:30 — удар, нарастающий пэд, на склейке «глаз в глаз» (0:22) — первая нота темы
add(music, 13.4, boom(0.8), gain=0.9)
pad(14, 22.5, [Dm], 8.5, 0.25)
theme(22, 72, melody=True, bars=2, vel=0.6, strings_on=True)
# 0:30–1:04 — пульсирующий синтезатор, ускоряется; обрыв перед 1:05
t = 30.0
bpm = 100
k = 0
while t < 64.0:
    ch = [Dm, Bb, F, C][(k // 16) % 4]
    m = ch[[1, 2, 3, 2][k % 4]] + 12
    add(music, t, synth_pluck(m, 0.55), pan=0.4 if k % 2 else -0.4)
    if k % 4 == 0:
        add(music, t, kick(0.35))
    k += 1
    bpm = 100 + 22 * (t - 30) / 34
    t += 60 / bpm / 2
pad(30, 64, [Dm, Bb, F, C], 8.5, 0.22)
# 1:05–1:30 — тема тихо, до «лично вас»
theme(65.2, 72, melody=True, bars=7, vel=0.5, strings_on=True)

# 1:30–3:30 — Глава 1: тёмный дрон, низкие струнные
add(music, 90.0, boom(1.0), gain=1.0)
pad(90.5, 165.0, [Dm, Bb, Gm, A], 6.0, 0.32)
for tb in np.arange(92, 164, 12):
    add(music, tb, sub(38, 5, 0.5))
# «поворот» — стоп и одна нота
add(music, 166.0, piano(69, 4, 0.7), pan=0.1)
pad(168, 200, [Dm, Bb], 8, 0.18)
# 3:20 — надежда: тёплые струнные в фа мажоре
pad(200, 210, [F, C], 5, 0.3)

# 3:30–5:45 — Глава 2: хор, струнные, лёгкая перкуссия; кульминация на виде города (3:46)
add(music, 210.0, boom(0.9))
pad(211, 250, [F, C, Dm, Bb], 4.5, 0.3, voice='choir')
pad(211, 250, [F, C, Dm, Bb], 4.5, 0.22)
for tb in np.arange(214, 250, 0.4167):
    add(music, tb, shaker(0.25 + 0.1 * ((tb - 214) % 1.667 < 0.1)), pan=0.3)
for tb in np.arange(214, 250, 1.667):
    add(music, tb, kick(0.3))
noise_swell = fade_io(noise_bed(4, 3000, 12000, 0.25), 3.5, 0.5)
add(music, 222.5, noise_swell, gain=0.7)
add(music, 226.0, boom(0.7))
pad(226, 234, [F], 8, 0.45, voice='choir', octave=12)
# 4:10 — улица: музыка тише, после «тишины» лёгкая гитара
pad(253, 295, [F, Am, Bb, C], 5.25, 0.16)
for i, tb in enumerate(np.arange(254, 295, 0.79)):
    ch = [F, Am, Bb, C][int((tb - 254) / 5.25) % 4]
    add(music, tb, pluck(ch[1 + i % 4] + 12, 0.45), pan=-0.3)
# 4:55–5:45 — дождь: фортепианные арпеджио, в конце фортепиано одно
theme(295.5, 76, melody=False, chords=MAJOR, bars=13, vel=0.45, strings_on=True)
for b, m, d in THEME_MAJ[15:]:
    add(music, 339.6 + (b - 24) * 0.62, piano(m, d * 0.6, 0.55), pan=0.1)

# 5:45–8:00 — Глава 3: технологичный пульс 112 bpm
add(music, 345.0, boom(0.9))
beat = 60 / 112
t = 346.0
k = 0
while t < 435:
    ch = [Dm, Bb, F, C][(k // 32) % 4]
    m = ch[[1, 3, 2, 4, 3, 2, 1, 2][k % 8]] + 12
    add(music, t, synth_pluck(m, 0.4, 1800 + 1200 * (0.5 + 0.5 * math.sin(k / 20))), pan=0.5 if k % 2 else -0.5)
    if k % 4 == 0:
        add(music, t, kick(0.4))
    if k % 8 == 4:
        add(music, t, shaker(0.35), pan=0.2)
    if k % 8 == 0:
        add(music, t, sub(ch[0] - 12, beat * 3.5, 0.5))
    k += 1
    t += beat / 2
pad(346, 435, [Dm, Bb, F, C], 8.57, 0.16)
# 7:15–8:00 — игриво: пиццикато
for i, tb in enumerate(np.arange(435.5, 480, 0.42)):
    ch = [F, C, Dm, Bb][int((tb - 435.5) / 3.36) % 4]
    add(music, tb, pluck(ch[1 + (i * 3) % 4] + 12, 0.5, bright=1.3), pan=0.35 if i % 2 else -0.35)
pad(436, 480, [F, C, Dm, Bb], 3.36 * 2, 0.14)

# 8:00–10:00 — Глава 4: тёплые щипковые и фортепиано
add(music, 480.0, boom(0.8))
for i, tb in enumerate(np.arange(481, 552, 0.395)):
    ch = MAJOR[int((tb - 481) / 3.16) % 8]
    add(music, tb, pluck(ch[1 + [0, 1, 2, 3, 2, 1][i % 6]] + 12, 0.42), pan=-0.35)
pad(481, 552, MAJOR, 3.16, 0.16)
for b, m, d in THEME_MAJ:
    add(music, 500 + b * 0.79, piano(m, d * 0.75, 0.45), pan=0.2)
# «тёмная сторона» — низкий дрон
pad(552, 565, [Dm, Bb], 6.5, 0.35)
add(music, 552.0, sub(26, 12, 0.7))
# еда — снова тепло
for i, tb in enumerate(np.arange(565, 600, 0.395)):
    ch = MAJOR[int((tb - 565) / 3.16) % 8]
    add(music, tb, pluck(ch[1 + [0, 1, 2, 3, 2, 1][i % 6]] + 12, 0.38), pan=-0.35)
pad(565, 600, MAJOR, 3.16, 0.14)

# 10:00–12:00 — Глава 5: виолончель, подъём к киту (10:52)
add(music, 600.0, boom(1.0))
pad(600.5, 640, [Dm, Gm, Bb, A], 5.0, 0.26)
for b, m, d in THEME_MIN[:9]:
    add(music, 604 + b * 1.0, strings(m - 12, d * 0.95, 0.9, att=0.25, rel=1.2, bright=0.7), pan=-0.1)
pad(640, 652, [Bb, C], 6, 0.3)
pad(640, 652, [Bb, C], 6, 0.25, voice='choir')
add(music, 651.6, boom(0.7))
pad(652, 685, [F, C, Dm, Bb], 4.2, 0.38)
pad(652, 668, [F, C], 4.2, 0.35, voice='choir', octave=12)
theme(652, 76, melody=True, chords=MAJOR, mel=THEME_MAJ, bars=6, vel=0.5, strings_on=False)
pad(685, 720, [F, Am, Bb, C], 6, 0.16)

# 12:00–13:15 — Глава 6: космос
add(music, 720.0, boom(0.9))
pad(722, 760, [Dm, Bb, F, C], 9, 0.18, octave=12)
for tb in [726, 733, 741, 748, 755]:
    add(music, tb, piano(int(rng.choice([74, 76, 77, 81])), 3.5, 0.35), pan=rng.uniform(-0.6, 0.6))
add(music, 760, strings(81, 32, 0.55, att=4, rel=1.5, bright=0.2), pan=0.0)
pad(760, 792, [Dm], 32, 0.08, octave=12)

# 13:15–14:20 — главная тема полностью, ре минор → фа мажор, пик на «мы строим»
theme(795.2, 72, melody=True, chords=MINOR, mel=THEME_MIN, bars=8, vel=0.7, strings_on=True)
theme(795.2 + 32 * 60 / 72, 72, melody=True, chords=MAJOR, mel=THEME_MAJ, bars=8, vel=0.8, strings_on=True, arp=True)
pad(850, 858.3, [Bb, C], 4.2, 0.45, voice='choir')
add(music, 856.0, boom(0.6))
# 14:20–15:00 — финал: тихое фортепиано, последний аккорд в 14:58
for b, m, d in THEME_MAJ[:9]:
    add(music, 861 + b * 0.95, piano(m, d * 0.9, 0.42), pan=0.1)
pad(862, 896, [F, Dm, Bb, C], 8.5, 0.15)
for m in F:
    add(music, 897.0, piano(m + 12, 2.0, 0.55), pan=rng.uniform(-0.3, 0.3))

# тишина там, где её требует сценарий (обрывы)
def silence(a, b, ramp=0.05):
    i, j = int(a * SR), int(b * SR)
    r = int(ramp * SR)
    music[:, i - r:i] *= np.linspace(1, 0, r)
    music[:, i:j] = 0
    music[:, j:j + r] *= np.linspace(0, 1, r)


silence(64.0, 65.2)
silence(89.6, 90.0)
silence(165.2, 166.0)
silence(793.5, 795.2)
silence(858.4, 860.6)

# ---------------------------------------------------------------- звуки по сценам
def crackle(a, b, gain=0.12):
    n = int((b - a) * SR)
    x = bandpass_fft(rng.standard_normal(n), 400, 6000) * 0.25
    clicks = (rng.random(n) < 0.0009) * rng.standard_normal(n) * 6
    add(sfx, a, fade_io(x + clicks, 0.2, 0.3), gain=gain)


for a, b in [(0, 12.2), (30, 47), (345, 352), (390, 397), (480, 488)]:
    crackle(a, b)
add(sfx, 0, fade_io(noise_bed(12.5, 80, 900, 0.5, lfo=0.6, lfo_rate=0.15), 1.5, 0.6))  # ветер
# ракета Годдарда: хлопок
n = int(SR * 2)
tt = np.arange(n) / SR
pop = (rng.standard_normal(n) * np.exp(-tt / 0.12) * 0.8 + np.sin(2 * math.pi * 70 * tt) * np.exp(-tt / 0.2))
add(sfx, 7.0, lowpass_fft(pop, 2500), gain=0.9)
add(sfx, 12.0, fade_io(noise_bed(0.6, 2000, 12000, 0.4), 0.3, 0.3))  # вспышка
add(sfx, 89.0, fade_io(noise_bed(0.7, 300, 5000, 0.5), 0.6, 0.05))  # «вдох» перед чёрным
# лёд: треск и обрушение
crack = rng.standard_normal(int(SR * 0.4)) * np.exp(-np.arange(int(SR * 0.4)) / SR / 0.05)
add(sfx, 110.6, crack, gain=0.6, pan=0.3)
add(sfx, 113.6, boom(0.9, 4.0), gain=0.9)
add(sfx, 113.6, fade_io(noise_bed(4, 200, 3000, 0.6), 0.05, 3.0), pan=0.2)
# океан и шторм
add(sfx, 125, fade_io(noise_bed(40, 100, 2500, 0.45, lfo=0.7, lfo_rate=0.38), 1.0, 2.0))
add(sfx, 125, fade_io(noise_bed(8, 3000, 14000, 0.25), 0.5, 1.0))  # дождь в шторм
# город: шум улицы 3 с → тишина и птицы
street = noise_bed(3.2, 60, 1500, 0.55)
for h in (0.4, 1.6, 2.4):
    i0 = int(h * SR)
    tt = np.arange(int(SR * 0.35)) / SR
    street[i0:i0 + len(tt)] += 0.25 * np.sign(np.sin(2 * math.pi * 440 * tt)) * np.exp(-tt / 0.3)
add(sfx, 250.0, fade_io(street, 0.05, 0.15))


def chirp(t0, f0=3500, pan=0.0):
    n = int(SR * 0.12)
    tt = np.arange(n) / SR
    f = f0 + 1800 * np.sin(math.pi * tt / 0.12)
    add(sfx, t0, np.sin(2 * math.pi * np.cumsum(f) / SR) * np.sin(math.pi * tt / 0.12) * 0.12, pan=pan)


for tb in np.arange(253.4, 294, 0.9):
    if rng.random() < 0.6:
        for j in range(int(rng.integers(1, 4))):
            chirp(tb + j * 0.15, float(rng.uniform(2800, 4500)), float(rng.uniform(-0.8, 0.8)))
add(sfx, 253.2, fade_io(noise_bed(41, 200, 3000, 0.12, lfo=0.5, lfo_rate=0.1), 1, 2))  # листва
# дождь в парке-губке, брызги Аи
add(sfx, 295, fade_io(noise_bed(12, 2500, 14000, 0.4), 1.0, 2.0))
for tb in np.arange(325.5, 335, 0.62):
    add(sfx, tb, fade_io(noise_bed(0.3, 800, 8000, 0.35), 0.01, 0.25), pan=float(rng.uniform(-0.4, 0.4)))
# термоядерный зал: гул и вспышки
hum_t = np.arange(int(SR * 9)) / SR
add(sfx, 361, fade_io(0.12 * np.sin(2 * math.pi * 60 * hum_t) + 0.05 * np.sin(2 * math.pi * 120 * hum_t), 1, 1))
for k in range(4):
    add(sfx, 361 + 0.7 + k * 2.86, fade_io(noise_bed(0.8, 500, 9000, 0.35), 0.5, 0.3))
# «вжух» и штампы
sw = noise_bed(1.0, 400, 6000, 0.5)
add(sfx, 437.4, fade_io(sw * np.linspace(0.2, 1, len(sw)), 0.4, 0.4), pan=0.0)
for tb in (438.0, 443.4):
    add(sfx, tb, kick(0.9), gain=0.8)
# сердцебиение под графиком продолжительности жизни
for tb in np.arange(484, 496, 1.0):
    add(sfx, tb, kick(0.6) * 0.8)
    add(sfx, tb + 0.22, kick(0.4) * 0.6)
# кит: всплески
for tb, g in ((649.8, 0.7), (655.0, 1.0)):
    add(sfx, tb, fade_io(noise_bed(2.5, 150, 6000, 0.6), 0.02, 2.0), gain=g)
    add(sfx, tb, boom(0.5, 2.0))
# трасса → хор лягушек
add(sfx, 693, fade_io(noise_bed(10, 50, 900, 0.35), 1, 4))


def croak(t0, f=180, pan=0.0):
    n = int(SR * 0.25)
    tt = np.arange(n) / SR
    am = 0.5 + 0.5 * np.sign(np.sin(2 * math.pi * 28 * tt))
    sig = np.sin(2 * math.pi * f * tt) * am * np.sin(math.pi * tt / 0.25)
    add(sfx, t0, lowpass_fft(sig, 900) * 0.25, pan=pan)


for tb in np.arange(699, 720, 0.33):
    if rng.random() < 0.55:
        croak(tb + float(rng.uniform(0, 0.2)), float(rng.uniform(140, 260)), float(rng.uniform(-0.9, 0.9)))
# космос: эхо хлопка ракеты → рёв старта
add(sfx, 720.2, lowpass_fft(pop, 2500), gain=0.6)
roar = noise_bed(5, 30, 1200, 0.7)
add(sfx, 720.8, fade_io(roar * np.linspace(0.3, 1, len(roar)), 1.5, 2.0))
# финал: ветер и далёкий колокол трамвая
add(sfx, 860, fade_io(noise_bed(26, 80, 1200, 0.25, lfo=0.6, lfo_rate=0.12), 2, 4))
bell_t = np.arange(int(SR * 3)) / SR
bell = sum(np.sin(2 * math.pi * f * bell_t) * np.exp(-bell_t / d) / (i + 1) for i, (f, d) in enumerate([(1180, 1.2), (2950, 0.6), (4100, 0.4)]))
add(sfx, 868.0, bell * 0.08, pan=0.5)
add(sfx, 869.1, bell * 0.06, pan=0.5)


# ---------------------------------------------------------------- реверберация и запись
def reverb(x, seconds=2.6, wet=0.28):
    n = int(SR * seconds)
    tt = np.arange(n) / SR
    out = np.zeros_like(x)
    block = 1 << 18
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-tt / (seconds / 6.5))
        ir = lowpass_fft(ir, 5000)
        ir /= np.sqrt(np.sum(ir ** 2))
        L = 1 << int(math.ceil(math.log2(block + n)))
        IR = np.fft.rfft(ir, L)
        y = np.zeros(x.shape[1] + n)
        for s in range(0, x.shape[1], block):
            seg = x[ch, s:s + block]
            conv = np.fft.irfft(np.fft.rfft(seg, L) * IR, L)[:len(seg) + n]
            y[s:s + len(conv)] += conv
        out[ch] = x[ch] * (1 - wet) + y[:x.shape[1]] * wet * 1.8
    return out


def write(path, x, peak=0.89):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    pcm = (np.clip(x, -1, 1).T * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


os.makedirs(OUT, exist_ok=True)
music = reverb(music.astype(np.float64), 2.8, 0.3)
sfx = reverb(sfx.astype(np.float64), 1.4, 0.15)
write(os.path.join(OUT, 'music.wav'), np.tanh(music / (np.max(np.abs(music)) + 1e-9) * 1.4))
write(os.path.join(OUT, 'sfx.wav'), sfx, 0.95)
print('ok: build/music.wav, build/sfx.wav')
