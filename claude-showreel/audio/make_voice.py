"""
Russian voice-over for the Claude showreel, synthesised offline with RHVoice (voice: aleksandr-hq).

RHVoice is open source (LGPL-2.1, voices under their own free licences):
  git clone --depth 1 --branch 1.14.0 --recurse-submodules --shallow-submodules https://github.com/RHVoice/RHVoice.git
  cd RHVoice && scons audio_libs=none prefix=$PWD/../rhvoice && scons audio_libs=none prefix=$PWD/../rhvoice install
Then:  RHVOICE=/path/to/rhvoice python3 audio/make_voice.py

Writes:
  public/voiceover.wav       — voice only, mono, 300 s
  public/soundtrack_vo.wav   — music ducked under the voice + voice (used by the main composition)
  src/voice-timing.json      — actual start/end of every spoken line (subtitles follow it)
Each line starts at its planned time; if the natural reading is longer than the scene allows,
the speech rate is raised a little (max +30 %) so it never runs into the next scene.
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
RHV = os.environ.get('RHVOICE', '/tmp/claude-0/tts/inst')
SR = 44100
DUR = 300.0
N = int(SR * DUR)
VOICE = 'aleksandr-hq'

# scene start/end (seconds) — the same grid as SCENE_SECONDS in src/Root.tsx
GRID = [0, 8, 18, 34, 54, 72, 90, 108, 126, 144, 162, 178, 194, 222, 246, 270, 290, 300]
S = {f's{i + 1}': GRID[i] for i in range(17)}
SCENE_END = {f's{i + 1}': GRID[i + 1] for i in range(17)}
# (scene, planned local start, subtitle text, spoken text or None)
LINES = [
    ('s1', 1.2, 'Всё начинается с одного слова.', None),
    ('s2', 1.6, 'Одно слово — и миллион возможностей.', None),
    ('s2', 5.4, 'Привет. Я — Claude.', 'Привет. Я — Клод.'),
    ('s3', 0.3, 'Я пишу и считаю.', None),
    ('s3', 4.1, 'Программирую и рисую.', None),
    ('s3', 8.1, 'Сочиняю музыку и объясняю сложное простыми словами.', None),
    ('s3', 14.2, 'Вместе с вами.', None),
    ('s4', 0.5, 'Код — мой родной язык.', None),
    ('s4', 3.0, 'Python, TypeScript, Rust, SQL.', 'Пайтон, ТайпСкрипт, Раст, эс-ку-эль.'),
    ('s4', 7.0, 'Я читаю целые проекты и нахожу ошибку, которую искали неделю.', None),
    ('s4', 12.8, 'Пишу тесты — и они проходят.', None),
    ('s5', 0.5, 'Дайте мне таблицу на миллион строк.', None),
    ('s5', 3.9, 'Я найду тренд, аномалию', None),
    ('s5', 6.5, 'и ответ на вопрос, который вы ещё не задали.', None),
    ('s5', 11.0, 'А потом соберу дашборд — за минуты.', None),
    ('s6', 0.8, 'Я говорю на десятках языков.', None),
    ('s6', 4.5, 'Переведу договор, письмо бабушке или шутку —', None),
    ('s6', 9.2, 'так, чтобы она осталась смешной.', None),
    ('s7', 0.5, 'Я пишу всё: от делового письма до сонета.', None),
    ('s7', 5.0, 'Сценарий, тост, статья, резюме.', None),
    ('s7', 9.5, 'И меняю тон за секунду: строгий, тёплый, дерзкий.', None),
    ('s8', 0.6, 'Математика, физика, химия, биология.', None),
    ('s8', 5.0, 'Я решаю задачу шаг за шагом', None),
    ('s8', 7.8, 'и показываю, почему ответ именно такой.', None),
    ('s8', 12.0, 'Не просто ответ — понимание.', None),
    ('s9', 0.8, 'Сайт, интерфейс, презентация.', None),
    ('s9', 4.0, 'От наброска на салфетке до готового макета —', None),
    ('s9', 8.3, 'с сеткой, палитрой и шрифтами.', None),
    ('s9', 12.0, 'За минуты, а не за недели.', None),
    ('s10', 0.4, 'А ещё я умею работать сам.', None),
    ('s10', 3.4, 'Делю большую задачу на шаги и запускаю помощников,', None),
    ('s10', 8.6, 'проверяю каждый результат', None),
    ('s10', 11.4, 'и докладываю, когда всё готово.', None),
    ('s11', 0.6, '«А почему небо голубое?»', 'А почему небо голубое?'),
    ('s11', 3.2, 'Объясню что угодно — ребёнку или профессору.', None),
    ('s11', 8.2, 'Столько раз, сколько нужно. Без осуждения.', None),
    ('s12', 0.6, 'И я честен.', None),
    ('s12', 2.6, 'Если я не знаю — я так и скажу.', None),
    ('s12', 7.6, 'Ваши данные — ваши.', None),
    ('s12', 10.2, 'А безопасность — не опция, а основа.', None),
    ('s13', 0.4, 'А теперь — секрет.', None),
    ('s13', 3.4, 'В этом ролике нет ни одной камеры.', None),
    ('s13', 7.0, 'Ни одной фотографии. Ни одного чужого звука.', None),
    ('s13', 12.6, 'Каждый кадр, каждую ноту и каждое слово —', 'Каждый кадр, каждую ноту и каждое слово'),
    ('s13', 16.8, '9 000 кадров. 17 сцен.', 'Девять тысяч кадров. Семнадцать сцен.'),
    ('s13', 21.9, 'я написал кодом.', 'Я написал кодом.'),
    ('s13', 23.6, 'Сам.', None),
    ('s13', 24.5, 'Вот что я умею.', None),
    ('s14', 22.0, 'И это только начало.', None),
    ('s15', 0.5, 'А теперь главный вопрос:', None),
    ('s15', 2.8, 'что создадите вы?', None),
    ('s15', 5.6, 'Бизнес-план к утру. Экзамен без паники.', None),
    ('s15', 10.4, 'Песню на мамин юбилей.', None),
    ('s15', 14.0, 'Я — инструмент. Идея — ваша.', None),
    ('s15', 18.6, 'Давайте начнём.', None),
    ('s16', 2.2, 'Claude.', 'Клод.'),
    ('s16', 4.8, 'Думай шире.', None),
    ('s16', 9.6, 'Одно слово — и всё возможно.', None),
]
GAP = 0.18  # pause between consecutive lines
BASE_RATE = 112  # same pace as the Uzbekistan video
MAX_RATE = 128


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
    # trim leading/trailing silence
    a = np.abs(y)
    idx = np.where(a > 0.01)[0]
    if len(idx):
        y = y[max(0, idx[0] - int(0.02 * SR)): idx[-1] + int(0.08 * SR)]
    return y


def read_wav(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, w.getnchannels()).T.astype(np.float64) / 32768
    return x


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
for scene in S:
    lines = [ln for ln in LINES if ln[0] == scene]
    if not lines:
        continue
    texts = [ln[3] or ln[2] for ln in lines]
    plans = [ln[1] for ln in lines]
    limit = SCENE_END[scene] - 0.15
    natural = [len(synth(t)) / SR for t in texts]
    rate = BASE_RATE
    while True:
        est = [d * 100 / rate for d in natural]
        if place(est, plans, S[scene])[-1][1] <= limit or rate >= MAX_RATE:
            break
        rate += 2
    while True:
        clips = [synth(t, rate) for t in texts]
        spans = place([len(c) / SR for c in clips], plans, S[scene])
        if spans[-1][1] <= limit or rate >= MAX_RATE:
            break
        rate += 2
    for (st, en), clip, ln in zip(spans, clips, lines):
        i = int(st * SR)
        n = min(len(clip), N - i)
        voice[i:i + n] += clip[:n]
        timing.append({'start': round(st, 3), 'end': round(en, 3), 'text': ln[2]})
        print(f'{st:7.2f}-{en:7.2f}  rate {rate}  {ln[2][:64]}')
    if spans[-1][1] > limit:
        print(f'  !! {scene} overruns by {spans[-1][1] - limit:.2f}s')

# light broadcast polish: high-pass, gentle compression-ish limiting, normalise
voice = signal.sosfilt(signal.butter(2, 80, 'high', fs=SR, output='sos'), voice)
voice = voice / (np.max(np.abs(voice)) + 1e-9) * 0.9
voice = np.tanh(voice * 1.6) / np.tanh(1.6) * 0.9

music = read_wav(os.path.join(ROOT, 'public', 'soundtrack.wav'))
music = music[:, :N] if music.shape[1] >= N else np.pad(music, ((0, 0), (0, N - music.shape[1])))

# side-chain ducking: music drops ~9 dB while the voice speaks
env = np.abs(voice)
env = signal.sosfilt(signal.butter(1, 4, 'low', fs=SR, output='sos'), env)
active = (env > 0.01).astype(float)
k = int(0.25 * SR)
active = np.convolve(active, np.ones(k) / k, 'same')  # smooth attack/release
active = np.clip(active * 2.5, 0, 1)
duck = 1 - 0.65 * active
mix = music * duck * 0.77 + np.stack([voice, voice]) * 0.95
peak = np.max(np.abs(mix))
if peak > 0.98:
    mix *= 0.98 / peak

write_wav(os.path.join(ROOT, 'public', 'voiceover.wav'), voice[None, :])
write_wav(os.path.join(ROOT, 'public', 'soundtrack_vo.wav'), mix)
with open(os.path.join(ROOT, 'src', 'voice-timing.json'), 'w') as fh:
    json.dump(timing, fh, ensure_ascii=False, indent=1)
print('lines:', len(timing))
