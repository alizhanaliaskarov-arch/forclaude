"""
Russian voice-over for the concept-car review, synthesised offline with RHVoice (voice aleksandr-hq).
On Ubuntu:  sudo apt-get install rhvoice rhvoice-russian

The narration drives the edit: every sentence is synthesised whole (natural intonation), placed after
the previous one with a fixed pause, and each scene lasts as long as its sentences plus lead/tail time.
A "|" inside a sentence splits its subtitle; the split time is taken from the real pause RHVoice makes
at that comma/dash.

Writes:
  public/voiceover.wav   voice only, 48 kHz mono, whole video length
  src/timing.json        fps, total frames, scenes [start, end] and subtitle cues [start, end, text]

Usage: python3 audio/make_voice.py
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
SR = 48000
FPS = 30
VOICE = 'aleksandr-hq'
RATE = 112        # RHVoice rate, %
GAP = 0.30        # pause between sentences inside a scene, s
BPM = 96          # music tempo: every scene starts on a beat
BEAT = 60 / BPM

# (scene id, lead-in before the first sentence, tail after the last one, sentences)
SCENES = [
    ('intro', 2.6, 1.1, [
        'Город после дождя.',
        'И купе, которого пока нет ни в одном каталоге.',
    ]),
    ('silhouette', 0.8, 0.7, [
        'Начнём с силуэта: длинный капот, низкая кабина | и крыша, плавно стекающая к корме.',
        'Задние арки шире передних — | машина будто присела перед рывком.',
    ]),
    ('light', 0.7, 0.7, [
        'Фары — узкие светодиодные полосы.',
        'Тонкая линия дневных огней — это световая подпись: | её узнаёшь издалека.',
    ]),
    ('aero', 0.7, 0.7, [
        'Аэродинамика здесь не для вида.',
        'Воздухозаборник и сплиттер прижимают нос, | вырезы на капоте отводят горячий воздух, | '
        'а жабры и пороги ведут поток вдоль борта.',
    ]),
    ('wheels', 0.7, 0.7, [
        'Колёса — крупные кованые диски с тонкими спицами.',
        'За ними видны бронзовые суппорты, | а на низкопрофильной резине — настоящий протектор.',
    ]),
    ('details', 0.7, 0.8, [
        'Цвет — тёмный графит с глубоким металлическим блеском, | в котором отражается вечерний город.',
        'И мелочи на месте: утопленные ручки, зеркала на тонких ножках, | ровные стыки панелей.',
    ]),
    ('verdict', 0.9, 5.2, [
        'Итог: концепт выглядит готовым к серии.',
        'Осталось только дать ему имя.',
    ]),
]


def synth(text):
    """RHVoice -> float32 mono at SR, leading/trailing silence trimmed."""
    with tempfile.TemporaryDirectory() as td:
        out = os.path.join(td, 'v.wav')
        subprocess.run(['RHVoice-test', '-p', VOICE, '-r', str(RATE), '-o', out],
                       input=text.encode('utf-8'), check=True, capture_output=True)
        with wave.open(out) as w:
            sr = w.getframerate()
            x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    x = signal.resample_poly(x, SR, sr)
    env = np.convolve(np.abs(x), np.ones(240) / 240, 'same')
    on = np.nonzero(env > 0.01)[0]
    return x[max(0, on[0] - 480): on[-1] + 2400]


def pauses(x):
    """Silent stretches (>= 70 ms) inside x: list of (start_s, end_s)."""
    env = np.convolve(np.abs(x), np.ones(480) / 480, 'same')
    quiet = env < 0.006
    out, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - i) / SR >= 0.07 and i > 0 and j < len(quiet):
                out.append((i / SR, j / SR))
            i = j
        else:
            i += 1
    return out


def main():
    clips, scenes, cues = [], [], []
    t = 0.0
    for sid, lead, tail, sentences in SCENES:
        s0 = t
        t += lead
        for k, sent in enumerate(sentences):
            parts = [p.strip() for p in sent.split('|')]
            x = synth(' '.join(parts))
            dur = len(x) / SR
            clips.append((t, x))
            # subtitle split points: the real pause nearest to the character-proportional estimate
            bounds = [0.0]
            if len(parts) > 1:
                ps = pauses(x)
                total = sum(len(p) for p in parts)
                acc = 0
                for p in parts[:-1]:
                    acc += len(p)
                    guess = dur * acc / total
                    if ps:
                        a, b = min(ps, key=lambda q: abs((q[0] + q[1]) / 2 - guess))
                        cut = (a + b) / 2 if abs((a + b) / 2 - guess) < 1.2 else guess
                    else:
                        cut = guess
                    bounds.append(cut)
            bounds.append(dur)
            for p, a, b in zip(parts, bounds[:-1], bounds[1:]):
                cues.append([round(t + a, 3), round(t + b, 3), p])
            t += dur + (GAP if k < len(sentences) - 1 else 0)
        t += tail
        t = np.ceil(t / BEAT - 1e-6) * BEAT  # next cut lands on the beat grid
        scenes.append([sid, round(s0, 3), round(t, 3)])

    total = int(np.ceil(t * FPS)) / FPS
    vo = np.zeros(int(round(total * SR)) + SR, np.float32)
    for start, x in clips:
        i = int(round(start * SR))
        vo[i:i + len(x)] += x

    # light polish: high-pass, gentle presence lift, soft compression, peak at -3 dBFS
    b, a = signal.butter(2, 85 / (SR / 2), 'highpass')
    vo = signal.lfilter(b, a, vo)
    b, a = signal.butter(2, [2500 / (SR / 2), 6000 / (SR / 2)], 'bandpass')
    vo = vo + 0.18 * signal.lfilter(b, a, vo)
    env = np.convolve(np.abs(vo), np.ones(960) / 960, 'same')
    thr = np.percentile(env[env > 1e-4], 90) * 0.6
    gain = np.where(env > thr, (thr + (env - thr) * 0.45) / np.maximum(env, 1e-9), 1.0)
    vo = vo * signal.savgol_filter(gain, 4801, 2)
    vo = vo[: int(round(total * SR))]
    vo = vo / np.max(np.abs(vo)) * 10 ** (-3 / 20)

    with wave.open(os.path.join(ROOT, 'public', 'voiceover.wav'), 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(vo, -1, 1) * 32767).astype(np.int16).tobytes())

    timing = {'fps': FPS, 'bpm': BPM, 'durationInFrames': int(round(total * FPS)), 'seconds': total,
              'scenes': scenes, 'cues': cues}
    with open(os.path.join(ROOT, 'src', 'timing.json'), 'w') as f:
        json.dump(timing, f, ensure_ascii=False, indent=1)
    for s in scenes:
        print(f'{s[0]:<11} {s[1]:6.2f} – {s[2]:6.2f}  ({s[2] - s[1]:.2f} s)')
    print('total', total, 's;', len(cues), 'cues')


if __name__ == '__main__':
    main()
