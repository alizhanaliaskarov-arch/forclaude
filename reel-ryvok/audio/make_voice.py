"""
Russian voice-over for the RYVOK reel, synthesised offline with RHVoice (voice: aleksandr-hq).

RHVoice is open source (LGPL-2.1, voices under their own free licences):
  git clone --depth 1 --branch 1.14.0 --recurse-submodules --shallow-submodules https://github.com/RHVoice/RHVoice.git
  cd RHVoice && pip install scons
  scons audio_libs=none prefix=$HOME/rhvoice && scons audio_libs=none prefix=$HOME/rhvoice install
Then:  RHVOICE=$HOME/rhvoice python3 audio/make_voice.py

Writes:
  public/voiceover.wav       — voice only, mono
  public/soundtrack_vo.wav   — music ducked under the voice + voice (used by the composition)
  src/voice-timing.json      — actual start/end of every spoken line (subtitles follow it)
Each line starts at its planned time; if a scene's lines do not fit before the cut,
the speech rate for that scene is raised a little so it never runs into the next scene.
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
RHV = os.environ.get('RHVOICE', os.path.expanduser('~/rhvoice'))
SR = 44100
DUR = 27.0
N = int(SR * DUR)
VOICE = 'aleksandr-hq'

# scene -> (start, end) in seconds; lines: (scene, planned local start, subtitle, spoken text or None)
SCENES = dict(s1=(0, 2.5), s2=(2.5, 7), s3=(7, 10), s4=(10, 13.4), s5a=(13.4, 15.5), s5b=(15.5, 17.5),
              s5c=(17.5, 20), s6=(20, 23), s7=(23, 27))
LINES = [
    ('s1', 0.25, 'Опять начнёшь с понедельника?', None),
    ('s2', 0.1, 'Ты говоришь это уже год.', None),
    ('s2', 1.7, 'Спортзал.', None),
    ('s2', 2.55, 'Английский.', None),
    ('s2', 3.48, 'Своё дело.', None),
    ('s3', 0.2, 'Проблема не в лени.', None),
    ('s3', 1.6, 'У тебя нет системы.', None),
    ('s4', 0.2, 'Рывок.', None),
    ('s4', 0.9, 'Личное наставничество на 30 дней.', 'Личное наставничество на тридцать дней.'),
    ('s5a', 0.15, 'Одна цель.', None),
    ('s5b', 0.15, 'План на каждый день.', None),
    ('s5c', 0.1, 'И человек, который не даст слиться.', None),
    ('s6', 0.05, 'Понедельник не наступит.', None),
    ('s6', 1.55, 'Начни сегодня.', None),
    ('s7', 0.9, 'Ссылка в профиле.', None),
]
GAP = 0.12
BASE_RATE = 118
MAX_RATE = 140


def synth(text, rate=None):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, 'o.wav')
        cmd = [os.path.join(RHV, 'bin', 'RHVoice-test'), '-p', VOICE, '-o', out]
        if rate:
            cmd += ['-r', str(int(rate))]
        env = dict(os.environ, LD_LIBRARY_PATH=os.path.join(RHV, 'lib'))
        subprocess.run(cmd, input=text.encode('utf-8'), env=env, check=True, capture_output=True)
        with wave.open(out) as w:
            sr = w.getframerate()
            x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    y = signal.resample_poly(x, SR, sr)
    idx = np.where(np.abs(y) > 0.01)[0]
    if len(idx):
        y = y[max(0, idx[0] - int(0.02 * SR)): idx[-1] + int(0.08 * SR)]
    return y


def read_wav(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
        return x.reshape(-1, w.getnchannels()).T.astype(np.float64) / 32768


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1).T * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(x.shape[0])
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def place(durs, plans, t0):
    """Lines start at their planned time or right after the previous one, whichever is later."""
    out, t = [], -1e9
    for d, p in zip(durs, plans):
        st = max(t0 + p, t + GAP)
        out.append((st, st + d))
        t = st + d
    return out


voice = np.zeros(N)
timing = []
for scene, (s0, s1) in SCENES.items():
    lines = [ln for ln in LINES if ln[0] == scene]
    texts = [ln[3] or ln[2] for ln in lines]
    plans = [ln[1] for ln in lines]
    limit = s1 - 0.1
    rate = BASE_RATE
    while True:
        clips = [synth(t, rate) for t in texts]
        spans = place([len(c) / SR for c in clips], plans, s0)
        if spans[-1][1] <= limit or rate >= MAX_RATE:
            break
        rate += 3
    for (st, en), clip, ln in zip(spans, clips, lines):
        i = int(st * SR)
        n = min(len(clip), N - i)
        voice[i:i + n] += clip[:n]
        late = st - (s0 + ln[1])
        timing.append({'start': round(st, 3), 'end': round(en, 3), 'text': ln[2]})
        print(f'{st:6.2f}-{en:6.2f}  rate {rate}  late {late:+.2f}  {ln[2]}')
    if spans[-1][1] > limit:
        print(f'  !! {scene} overruns by {spans[-1][1] - limit:.2f}s')

# light polish: high-pass, soft limiting, normalise
voice = signal.sosfilt(signal.butter(2, 80, 'high', fs=SR, output='sos'), voice)
voice = voice / (np.max(np.abs(voice)) + 1e-9) * 0.9
voice = np.tanh(voice * 1.6) / np.tanh(1.6) * 0.9

music = read_wav(os.path.join(ROOT, 'public', 'soundtrack.wav'))
music = music[:, :N] if music.shape[1] >= N else np.pad(music, ((0, 0), (0, N - music.shape[1])))

# side-chain ducking: music drops while the voice speaks
env = signal.sosfilt(signal.butter(1, 4, 'low', fs=SR, output='sos'), np.abs(voice))
active = (env > 0.01).astype(float)
k = int(0.2 * SR)
active = np.clip(np.convolve(active, np.ones(k) / k, 'same') * 2.5, 0, 1)
mix = music * (1 - 0.6 * active) * 0.9 + np.stack([voice, voice]) * 0.95
peak = np.max(np.abs(mix))
if peak > 0.98:
    mix *= 0.98 / peak

write_wav(os.path.join(ROOT, 'public', 'voiceover.wav'), voice[None, :])
write_wav(os.path.join(ROOT, 'public', 'soundtrack_vo.wav'), mix)
with open(os.path.join(ROOT, 'src', 'voice-timing.json'), 'w') as fh:
    json.dump(timing, fh, ensure_ascii=False, indent=1)
print('lines:', len(timing))
