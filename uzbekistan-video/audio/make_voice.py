"""
Russian voice-over for the Uzbekistan video — neural TTS (Piper / VITS), voice "ruslan".

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
  public/voiceover.wav       — voice only, mono, 180 s
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
VOICE_PATH = os.environ.get('PIPER_VOICE', 'voices/vits-piper-ru_RU-ruslan-medium/ru_RU-ruslan-medium.onnx')
SR = 44100
DUR = 180.0
N = int(SR * DUR)
rng = np.random.default_rng(5)

# Scene start/end (seconds) and the lines: (scene, planned local start, subtitle text, spoken text or None)
S = dict(s1=0, s2=5, s3=12, s4=22, s5=36, s6=51, s7=61, s8=74, s9=88, s10=98, s11=110, s12=119, s13=134, s14=147, s15=159, s16=171)
SCENE_END = dict(s1=5, s2=12, s3=22, s4=36, s5=51, s6=61, s7=74, s8=88, s9=98, s10=110, s11=119, s12=133.6, s13=147, s14=159, s15=171, s16=180)
LINES = [
    ('s1', 0.3, 'Корабль посреди пустыни.', None),
    ('s1', 2.0, 'А до моря отсюда — две границы.', None),
    ('s2', 0.3, 'Таких стран в мире всего две.', None),
    ('s2', 2.3, 'Угадаете вторую?', None),
    ('s2', 4.6, 'Крошечный Лихтенштейн в Альпах.', None),
    ('s3', 0.3, 'Больше тридцати восьми миллионов человек, столица — Ташкент.', None),
    ('s3', 4.5, 'И забавно: соседей пять, и все — на «-стан».', 'И забавно: соседей пять, и все — на «стан».'),
    ('s4', 0.4, 'Здесь шёл Великий шёлковый путь — из Китая в Европу.', None),
    ('s4', 4.1, 'Самарканд, Бухара и Хива были для караванов как заправки.', None),
    ('s4', 8.8, 'А Самарканду, по выводу учёных, три тысячи лет:', None),
    ('s4', 11.6, 'он старше Рима.', None),
    ('s5', 0.3, 'Ваша лента в соцсетях — это алгоритм.', None),
    ('s5', 2.7, 'А слово — от имени учёного из Хорезма, аль-Хорезми.', None),
    ('s5', 7.2, 'Отсюда же врач Ибн Сина', None),
    ('s5', 10.0, 'и Улугбек: без телескопа он измерил длину года', None),
    ('s5', 12.4, 'и ошибся примерно на минуту.', None),
    ('s6', 0.3, 'Бабур, потомок Амира Темура, родился в Андижане', None),
    ('s6', 3.0, 'и основал в Индии империю Великих Моголов.', None),
    ('s6', 6.6, 'А его праправнук построил Тадж-Махал.', None),
    ('s7', 0.3, 'Регистан: три медресе смотрят друг на друга, как великаны на совете.', None),
    ('s7', 4.5, 'Лорд Керзон назвал его самой благородной площадью мира.', None),
    ('s7', 8.4, 'А в Хиве за стеной спрятан целый город-музей — Ичан-Кала.', None),
    ('s8', 0.4, 'Плов здесь — не еда, а ритуал.', None),
    ('s8', 2.5, 'В 2016 году культуру плова внесли в список ЮНЕСКО.', 'В две тысячи шестнадцатом году культуру плова внесли в список ЮНЕСКО.'),
    ('s8', 6.6, 'А лепёшку-нон не режут ножом —', None),
    ('s8', 9.6, 'её ломают руками и никогда не кладут лицом вниз.', None),
    ('s9', 0.3, 'Внимание, вопрос: почему гостю наливают только полпиалы?', None),
    ('s9', 5.6, 'Это знак уважения: хозяин хочет подливать вам снова и снова.', None),
    ('s10', 0.3, 'Атлас и адрас ткут в технике икат:', None),
    ('s10', 3.4, 'нити красят ещё до ткачества, поэтому узор размыт, как облако.', None),
    ('s10', 7.8, 'А на Навруз вся махалля всю ночь варит сумаляк.', None),
    ('s11', 0.3, 'Кызылкум — это «красный песок».', None),
    ('s11', 2.7, 'Но рядом горы выше четырёх с половиной километров', None),
    ('s11', 5.6, 'и Ферганская долина — сад всей страны.', None),
    ('s12', 0.4, 'Помните корабль из начала?', None),
    ('s12', 2.5, 'Он стоит на дне Аральского моря.', None),
    ('s12', 5.0, 'Когда-то это было четвёртое по величине озеро мира.', None),
    ('s12', 8.6, 'Воду рек забрали на поля —', None),
    ('s12', 11.2, 'и море потеряло около девяноста процентов площади.', None),
    ('s13', 0.6, 'В ташкентском метро больше сорока лет нельзя было фотографировать —', None),
    ('s13', 4.4, 'запрет сняли только в 2018-м.', 'запрет сняли только в две тысячи восемнадцатом.'),
    ('s13', 7.6, 'А в 2025-м — рекорд: почти 12 миллионов туристов.', 'А в двадцать пятом году — рекорд: почти двенадцать миллионов туристов.'),
    ('s14', 0.2, 'Три мифа. «Всегда жарко»? Зимой под Ташкентом катаются на лыжах.', None),
    ('s14', 4.1, '«Пишут кириллицей»? Официально — уже латиница.', None),
    ('s14', 7.7, '«Плов — на ужин»? На свадьбах его едят на рассвете.', None),
    ('s15', 0.2, 'Проверим? Ставьте на паузу!', None),
    ('s15', 2.1, 'Первый: откуда слово «алгоритм»?', None),
    ('s15', 5.35, 'Второй: почему чая — полпиалы?', None),
    ('s15', 8.62, 'Третий: вторая страна без моря дважды?', None),
    ('s16', 0.5, 'До моря отсюда — две границы.', None),
    ('s16', 3.2, 'А до сердца — всего одна пиала чая.', None),
    ('s16', 6.3, 'Приезжайте.', None),
]
GAP = 0.22  # pause between consecutive lines
BASE_LS = 1.0  # Piper length_scale: 1.0 = the narrator's natural pace
MIN_LS = 0.86  # never read faster than this
SLOW = {'s16': 1.08}  # the final lines are read a little slower

# Stress fixes (espeak-ng misplaces these). Raw phonemes go inside [[ ]].
STRESS = {
    'аль-Хорезми': 'ˈɑɭxʌrʲɪzmʲˈi',
    'Бабур': 'bʌbˈur',
    'Бухара': 'buxʌrˈa',
    'Кызылкум': 'kyzyɭkˈum',
    'махалля': 'mʌxʌɭɭʲˈa',
    'Навруз': 'nʌvrˈus',
    'Атлас': 'ʌtɭˈas',
    'адрас': 'ʌdrˈas',
    'Ичан-Кала': 'ɪtʃʲˈaŋkʌɭˈa',
    'полпиалы': 'pʌɭpʲiʌɭˈy',
    'праправнук': 'prʌprʌvnˈuk',
    'Самарканду': 'sʌmarkˈandu',
    'Сина': 'sʲinˈa',
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
