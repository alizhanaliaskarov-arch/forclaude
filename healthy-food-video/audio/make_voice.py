"""
English voice-over with Kokoro (kokoro-onnx, Apache-2.0 model), voice "af_heart".
Writes public/voiceover.wav (44.1 kHz mono) and src/timeline.json (scene + line timing),
which drives the scene lengths and the subtitles in the video.

  KOKORO_DIR=/path/with/kokoro-v1.0.onnx+voices-v1.0.bin python3 audio/make_voice.py
"""
import json
import os
import wave

import numpy as np
from scipy import signal

from script import LINES, SCENES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KDIR = os.environ.get('KOKORO_DIR', '.')
CACHE = os.path.join(ROOT, 'audio', 'voice-cache')
SR = 44100
VOICE, SPEED = "af_heart", 0.86
TARGET = 300.0       # aim for a 5:00 video
LEAD = {'intro': 3.6}  # seconds of picture before the first line of a scene
LEAD_DEFAULT = 2.0
TAIL = {'outro': 6.0}  # picture after the last line of a scene
TAIL_DEFAULT = 2.2
GAP = 0.6            # base pause between lines (scaled to hit TARGET)

os.makedirs(CACHE, exist_ok=True)
_k = None


def synth(i, text):
    path = os.path.join(CACHE, f'{i:02d}.npy')
    if os.path.exists(path):
        return np.load(path)
    global _k
    if _k is None:
        from kokoro_onnx import Kokoro
        _k = Kokoro(os.path.join(KDIR, 'kokoro-v1.0.onnx'), os.path.join(KDIR, 'voices-v1.0.bin'))
    s, sr = _k.create(text, voice=VOICE, speed=SPEED, lang='en-us')
    s = signal.resample_poly(np.asarray(s, dtype=np.float64), 147, 80)  # 24k -> 44.1k
    # trim leading/trailing near-silence so pauses are under our control
    idx = np.nonzero(np.abs(s) > 0.01)[0]
    s = s[max(0, idx[0] - 600):idx[-1] + 2200]
    np.save(path, s)
    return s


clips = [synth(i, t) for i, (_, t) in enumerate(LINES)]
durs = [len(c) / SR for c in clips]

n_gaps = sum(1 for i in range(1, len(LINES)) if LINES[i][0] == LINES[i - 1][0])
fixed = sum(durs) + sum(LEAD.get(s, LEAD_DEFAULT) + TAIL.get(s, TAIL_DEFAULT) for s in SCENES)
k = float(np.clip((TARGET - fixed) / (n_gaps * GAP), 0.8, 2.6))
print(f'speech {sum(durs):.1f}s, gap scale {k:.2f}')

t = 0.0
timeline = {'scenes': [], 'lines': []}
spans = []
for s in SCENES:
    start = t
    t += LEAD.get(s, LEAD_DEFAULT)
    first = True
    for i, (sc, text) in enumerate(LINES):
        if sc != s:
            continue
        if not first:
            # a little longer after a question or a long line
            t += GAP * k * (1.25 if LINES[i - 1][1].endswith('?') else 1.0)
        first = False
        spans.append((t, clips[i]))
        timeline['lines'].append({'scene': s, 'start': round(t, 3), 'end': round(t + durs[i], 3), 'text': text})
        t += durs[i]
    t += TAIL.get(s, TAIL_DEFAULT)
    timeline['scenes'].append({'id': s, 'start': round(start, 3), 'end': round(t, 3)})
timeline['total'] = round(t, 3)

N = int(np.ceil(t * SR))
voice = np.zeros(N)
for st, c in spans:
    i = int(st * SR)
    voice[i:i + len(c)] += c[:N - i]
voice = signal.sosfilt(signal.butter(2, 70, 'high', fs=SR, output='sos'), voice)
voice = voice / (np.max(np.abs(voice)) + 1e-9) * 0.9

with wave.open(os.path.join(ROOT, 'public', 'voiceover.wav'), 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(voice, -1, 1) * 32767).astype(np.int16).tobytes())
with open(os.path.join(ROOT, 'src', 'timeline.json'), 'w') as fh:
    json.dump(timeline, fh, indent=1)
for sc in timeline['scenes']:
    print(f"{sc['id']:9s} {sc['start']:7.2f} - {sc['end']:7.2f}  ({sc['end'] - sc['start']:.1f}s)")
print('total', timeline['total'])
