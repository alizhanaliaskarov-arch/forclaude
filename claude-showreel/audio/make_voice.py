"""
Russian voice-over for the Claude showreel — neural TTS (Piper / VITS), voice "ruslan".

Why Piper/ruslan: a neural voice trained on the RUSLAN corpus (a professional audiobook narrator),
the most expressive of the open Russian voices we tried (widest pitch range, deep narrator timbre).
Licence of the voice data: CC BY-NC-SA 4.0 (credited in the final frame).

Get the voice (one-off), then run:
  curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-ruslan-medium.tar.bz2
  tar xjf vits-piper-ru_RU-ruslan-medium.tar.bz2
  pip install piper-tts onnxruntime scipy numpy
  PIPER_VOICE=vits-piper-ru_RU-ruslan-medium/ru_RU-ruslan-medium.onnx python3 audio/make_voice.py

What makes it sound like a recorded narrator rather than a robot:
  * hand-fixed stress for names espeak gets wrong (аль-Хорезми́, Бабу́р, Бухара́, Кызылку́м …);
  * each line keeps the model's natural pace; only a scene that would overrun is read a bit faster;
  * a studio chain: warmth/presence EQ, gentle de-esser and compressor, a touch of "air",
    a small-room reflection, quiet room tone between lines and soft breaths before phrases.

Writes:
  public/voiceover.wav       — voice only, mono, 300 s
  public/soundtrack_vo.wav   — music ducked under the voice + voice (used by the main composition)
  src/voice-timing.json      — start/end of every spoken line (subtitles follow it)
"""
import json
import os
import re
import wave

import numpy as np
from scipy import signal
from piper import PiperVoice, SynthesisConfig

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
VOICE_PATH = os.environ.get('PIPER_VOICE', '/tmp/claude-0/piper/vits-piper-ru_RU-ruslan-medium/ru_RU-ruslan-medium.onnx')
SR = 44100
DUR = 300.0
N = int(SR * DUR)
rng = np.random.default_rng(5)

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
GAP = 0.22  # pause between consecutive lines
BASE_LS = 1.0  # Piper length_scale: 1.0 = the narrator's natural pace
MIN_LS = 0.86  # never read faster than this
SLOW = {'s16': 1.1, 's13': 1.04}  # the reveal and the final lines are read a little slower

# Stress fixes (espeak-ng misplaces these). Raw phonemes go inside [[ ]].
STRESS = {
    'потом': 'pʌtˈom',
    'письма': 'pʲɪsʲmˈa',
    'теперь': 'tʲɪpʲˈerʲ',
    'резюме': 'rʲɪzʲʉmˈɛ',
}


def apply_stress(text):
    for word, ph in sorted(STRESS.items(), key=lambda kv: -len(kv[0])):
        text = re.sub(rf'(?<![\w-]){re.escape(word)}(?![\w-])', f'[[{ph}]]', text)
    return text


voice = PiperVoice.load(VOICE_PATH, config_path=VOICE_PATH + '.json')
VSR = voice.config.sample_rate


def synth(text, ls):
    cfg = SynthesisConfig(length_scale=ls, noise_scale=0.667, noise_w_scale=0.85)
    chunks = [c.audio_float_array for c in voice.synthesize(apply_stress(text), syn_config=cfg)]
    x = np.concatenate(chunks).astype(np.float64)
    y = signal.resample_poly(x, SR, VSR)
    a = np.abs(y)
    idx = np.where(a > 0.012)[0]
    if len(idx):
        y = y[max(0, idx[0] - int(0.015 * SR)): idx[-1] + int(0.12 * SR)]
    fi = int(0.004 * SR)
    y[:fi] *= np.linspace(0, 1, fi)
    fo = int(0.04 * SR)
    y[-fo:] *= np.linspace(1, 0, fo)
    return y


def place(durs, plans, t0):
    """Lines start at their planned time or right after the previous one, whichever is later."""
    out, t = [], -1e9
    for d, p in zip(durs, plans):
        st = max(t0 + p, t + GAP)
        out.append((st, st + d))
        t = st + d
    return out


def breath(dur=0.32, level=0.035):
    """Soft inhale: band-limited noise with a rising-then-falling envelope."""
    n = int(dur * SR)
    x = rng.standard_normal(n)
    x = signal.sosfilt(signal.butter(2, [450, 2600], 'band', fs=SR, output='sos'), x)
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t ** 0.7) ** 2
    return x / (np.max(np.abs(x)) + 1e-9) * env * level


# ───────────── synthesis + placement ─────────────
dry = np.zeros(N)
breaths = np.zeros(N)
timing = []
for scene in S:
    lines = [ln for ln in LINES if ln[0] == scene]
    if not lines:
        continue
    texts = [ln[3] or ln[2] for ln in lines]
    plans = [ln[1] for ln in lines]
    limit = SCENE_END[scene] - 0.15
    ls = SLOW.get(scene, BASE_LS)
    while True:
        clips = [synth(t, ls) for t in texts]
        spans = place([len(c) / SR for c in clips], plans, S[scene])
        if spans[-1][1] <= limit or ls <= MIN_LS:
            break
        ls = round(ls - 0.03, 3)
    prev_end = -1.0
    for (st, en), clip, ln in zip(spans, clips, lines):
        i = int(st * SR)
        n = min(len(clip), N - i)
        dry[i:i + n] += clip[:n]
        if st - prev_end > 0.5 and st > 0.5:  # breathe before a fresh phrase
            b = breath(0.28 + rng.uniform(0, 0.1), 0.03 + rng.uniform(0, 0.012))
            j = max(0, i - len(b) - int(0.06 * SR))
            breaths[j:j + len(b)] += b[: N - j]
        prev_end = en
        timing.append({'start': round(st, 3), 'end': round(en, 3), 'text': ln[2]})
        print(f'{st:7.2f}-{en:7.2f}  ls {ls:.2f}  {ln[2][:64]}')
    if spans[-1][1] > limit:
        print(f'  !! {scene} overruns by {spans[-1][1] - limit:.2f}s')


# ───────────── studio chain ─────────────
def peq(x, f0, gain_db, q=0.9):
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    alpha = np.sin(w0) / (2 * q)
    b = [1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A]
    a = [1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A]
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x)


def envelope(x, attack, release):
    a_at = np.exp(-1 / (attack * SR))
    a_re = np.exp(-1 / (release * SR))
    # one-pole follower on |x| (vectorised approximation: smooth with release, then max with fast attack)
    slow = signal.lfilter([1 - a_re], [1, -a_re], np.abs(x))
    fast = signal.lfilter([1 - a_at], [1, -a_at], np.abs(x))
    return np.maximum(slow, fast)


v = signal.sosfilt(signal.butter(2, 75, 'high', fs=SR, output='sos'), dry)
v = peq(v, 170, 1.8, 0.8)    # chest warmth
v = peq(v, 3200, 2.0, 1.0)   # presence / intelligibility
v = peq(v, 600, -1.2, 1.2)   # less boxiness
# de-esser: tame 5–9 kHz when it dominates
ss = signal.sosfilt(signal.butter(2, [5000, 9500], 'band', fs=SR, output='sos'), v)
e_ss = envelope(ss, 0.002, 0.06)
e_all = envelope(v, 0.002, 0.06) + 1e-6
red = np.clip(1 - np.maximum(0, e_ss / e_all - 0.35) * 1.2, 0.5, 1)
v = v - ss * (1 - red)
# compressor 2.5:1 above −22 dBFS (normalised first)
v = v / (np.max(np.abs(v)) + 1e-9) * 0.7
env = envelope(v, 0.008, 0.15)
thr = 10 ** (-22 / 20)
gain = np.where(env > thr, (thr * (env / thr) ** (1 / 2.5)) / (env + 1e-9), 1.0)
v = v * gain
# a little "air" above the 11 kHz band limit of the model: soft saturation of the 4–10 kHz band, high-passed
band = signal.sosfilt(signal.butter(2, [4000, 10000], 'band', fs=SR, output='sos'), v)
air = signal.sosfilt(signal.butter(4, 10500, 'high', fs=SR, output='sos'), np.tanh(band * 6))
v = v + air * 0.035
# small room: early reflections + short diffuse tail
ir_len = int(0.45 * SR)
t = np.arange(ir_len) / SR
ir = rng.standard_normal(ir_len) * np.exp(-t / 0.09)
ir = signal.sosfilt(signal.butter(2, 5000, 'low', fs=SR, output='sos'), ir)
ir[: int(0.006 * SR)] = 0
for d, g in ((0.011, 0.5), (0.017, 0.35), (0.023, 0.28), (0.031, 0.2)):
    ir[int(d * SR)] += g * 3
ir /= np.sqrt((ir ** 2).sum())
wet = signal.fftconvolve(v, ir)[:N]
v = v + wet * 0.12
# breaths + room tone (only between the first and the last line)
v = v + breaths
first = int(timing[0]['start'] * SR) - int(0.5 * SR)
last = int(timing[-1]['end'] * SR) + int(0.8 * SR)
tone = rng.standard_normal(N)
tone = signal.lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400], tone)  # pink
tone = signal.sosfilt(signal.butter(2, [80, 7000], 'band', fs=SR, output='sos'), tone)
tone = tone / (np.sqrt((tone ** 2).mean()) + 1e-9) * 10 ** (-62 / 20)
mask = np.zeros(N)
mask[max(0, first):min(N, last)] = 1
mask = np.convolve(mask, np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
v = v + tone * mask
v = v / (np.max(np.abs(v)) + 1e-9) * 0.9
voice_track = v


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


music = read_wav(os.path.join(ROOT, 'public', 'soundtrack.wav'))
music = music[:, :N] if music.shape[1] >= N else np.pad(music, ((0, 0), (0, N - music.shape[1])))

# side-chain ducking: music drops ~9 dB while the voice speaks
act_env = signal.sosfilt(signal.butter(1, 4, 'low', fs=SR, output='sos'), np.abs(dry))
active = (act_env > 0.01).astype(float)
k = int(0.3 * SR)
active = np.clip(np.convolve(active, np.ones(k) / k, 'same') * 2.5, 0, 1)
duck = 1 - 0.65 * active
mix = music * duck * 0.9 + np.stack([voice_track, voice_track]) * 0.95
peak = np.max(np.abs(mix))
if peak > 0.98:
    mix *= 0.98 / peak

write_wav(os.path.join(ROOT, 'public', 'voiceover.wav'), voice_track[None, :])
write_wav(os.path.join(ROOT, 'public', 'soundtrack_vo.wav'), mix)
with open(os.path.join(ROOT, 'src', 'voice-timing.json'), 'w') as fh:
    json.dump(timing, fh, ensure_ascii=False, indent=1)
print('lines:', len(timing))
