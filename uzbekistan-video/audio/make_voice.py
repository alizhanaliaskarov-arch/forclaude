"""
Russian voice-over for the Uzbekistan video, synthesised offline with RHVoice (voice: aleksandr-hq).

RHVoice is open source (LGPL-2.1, voices under their own free licences):
  git clone --depth 1 --branch 1.14.0 --recurse-submodules --shallow-submodules https://github.com/RHVoice/RHVoice.git
  cd RHVoice && scons audio_libs=none prefix=$PWD/../rhvoice && scons audio_libs=none prefix=$PWD/../rhvoice install
Then:  RHVOICE=/path/to/rhvoice python3 audio/make_voice.py

Writes:
  public/voiceover.wav       — voice only, mono, 180 s
  public/soundtrack_vo.wav   — music ducked under the voice + voice (used by the main composition)
  src/voice-timing.json      — actual start/end of every spoken line (subtitles follow it)
Each line starts at its subtitle cue time; if the natural reading is longer than the cue window,
the speech rate is raised a little (max +30 %) so it never runs into the next line.
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
DUR = 180.0
N = int(SR * DUR)
VOICE = 'aleksandr-hq'

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
GAP = 0.18  # pause between consecutive lines
BASE_RATE = 112  # a touch brisker than RHVoice default (100)
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
mix = music * duck * 0.9 + np.stack([voice, voice]) * 0.95
peak = np.max(np.abs(mix))
if peak > 0.98:
    mix *= 0.98 / peak

write_wav(os.path.join(ROOT, 'public', 'voiceover.wav'), voice[None, :])
write_wav(os.path.join(ROOT, 'public', 'soundtrack_vo.wav'), mix)
with open(os.path.join(ROOT, 'src', 'voice-timing.json'), 'w') as fh:
    json.dump(timing, fh, ensure_ascii=False, indent=1)
print('lines:', len(timing))
