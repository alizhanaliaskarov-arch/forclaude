"""
Озвучка «Земли-2126» синтезатором RHVoice (открытый, работает офлайн).
Диктор — голос VOICE (по умолчанию aleksandr-hq), реплика Миры в S24 — голос MIRA_VOICE.

Сборка RHVoice (один раз):
  git clone --depth 1 --branch 1.14.0 --recurse-submodules --shallow-submodules https://github.com/RHVoice/RHVoice.git
  cd RHVoice && pip install scons && scons audio_libs=none prefix=$HOME/rhvoice && scons audio_libs=none prefix=$HOME/rhvoice install
Запуск:
  RHVOICE=$HOME/rhvoice python3 film/audio/make_voice.py

Пишет build/voice.wav и build/voice-timing.json (по нему film/subs.py делает субтитры точно под голос).
Фразы сцены идут подряд с её начала; если не помещаются в сцену, темп речи немного повышается.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
from subs import scenes, split_cues  # noqa: E402

BUILD = os.path.join(HERE, '..', '..', 'build')
RHV = os.environ.get('RHVOICE', os.path.expanduser('~/rhvoice'))
VOICE = os.environ.get('VOICE', 'aleksandr-hq')
MIRA_VOICE = os.environ.get('MIRA_VOICE', 'anna')
SR = 44100
N = SR * 900
BASE_RATE, MAX_RATE = 100, 124
GAP = 0.32

# как произносить то, что синтезатор прочитает неверно
SPOKEN = [
    ('1,2–1,3 градуса', 'одну и две десятых — одну и три десятых градуса'), ('около 2,7', 'около двух и семи десятых'),
    ('10,3 миллиарда', 'десяти и трёх десятых миллиарда'), ('2080-х', 'двух тысяча восьмидесятых'), ('2070-х', 'двух тысяча семидесятых'),
    ('2010-е', 'двух тысяча десятые'), ('1920-х', 'тысяча девятьсот двадцатых'), ('2026-м', 'две тысячи двадцать шестом'),
    ('2126-м', 'две тысячи сто двадцать шестом'), ('2066-му', 'две тысячи шестьдесят шестому'), ('XX века', 'двадцатого века'),
    ('МГЭИК', 'эм-гэ-э-и-ка'), ('IPBES', 'ай-пи-бэс'), ('NIF', 'эн-ай-эф'), ('CRISPR', 'криспр'), ('мРНК', 'эм-эр-эн-ка'),
    ('CO₂', 'цэ-о-два'), ('Ascent', 'Эссент'), ('Telegram', 'Телеграм'), ('«Вояджер-1»', 'Вояджер-один'), ('„Вояджер-1“', 'Вояджер-один'),
    ('86-метровую', 'восьмидесятишестиметровую'), ('NASA', 'НАСА'),
]


def speakable(text):
    for a, b in SPOKEN:
        text = text.replace(a, b)
    return text.replace('„', '').replace('“', '').replace('«', '').replace('»', '')


def synth(text, voice, rate):
    with tempfile.TemporaryDirectory() as d:
        out = os.path.join(d, 'o.wav')
        cmd = [os.path.join(RHV, 'bin', 'RHVoice-test'), '-p', voice, '-o', out, '-r', str(int(rate))]
        env = dict(os.environ, LD_LIBRARY_PATH=os.path.join(RHV, 'lib'))
        subprocess.run(cmd, input=speakable(text).encode('utf-8'), env=env, check=True, capture_output=True)
        with wave.open(out) as w:
            sr = w.getframerate()
            x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    t_new = np.arange(int(len(x) * SR / sr)) / SR
    y = np.interp(t_new, np.arange(len(x)) / sr, x)
    idx = np.where(np.abs(y) > 0.01)[0]
    return y[max(0, idx[0] - 400): idx[-1] + 3000] if len(idx) else y


def main():
    voice = np.zeros(N)
    timing = []
    for sid, t0, t1, lines in scenes():
        if not lines:
            continue
        items = []
        for sp, body in lines:
            items += [(sp, c) for c in split_cues(body, maxlen=140)]
        start = t0 + 0.5
        if sid == 'S24':
            start = t0 + 0.8
        limit = t1 - 0.4
        rate = BASE_RATE
        while True:
            clips = [synth(c, MIRA_VOICE if sp == 'Мира' else VOICE, rate) for sp, c in items]
            t, spans = start, []
            for (sp, c), clip in zip(items, clips):
                if sid == 'S24' and sp == 'Диктор':
                    t += 3.0  # пауза перед последней фразой
                spans.append((t, t + len(clip) / SR))
                t += len(clip) / SR + GAP
            if spans[-1][1] <= limit or rate >= MAX_RATE:
                break
            rate += 4
        for (st, en), clip, (sp, c) in zip(spans, clips, items):
            i = int(st * SR)
            n = min(len(clip), N - i)
            voice[i:i + n] += clip[:n]
            timing += sub_cues(st, en, c, sp)  # строки субтитров — пропорционально длине фразы
        over = spans[-1][1] - limit
        print(f'{sid}: темп {rate}' + (f'  !! не помещается на {over:.1f} с' if over > 0 else ''))
    voice = voice / (np.max(np.abs(voice)) + 1e-9) * 0.9
    os.makedirs(BUILD, exist_ok=True)
    pcm = (voice * 32767).astype(np.int16)
    with wave.open(os.path.join(BUILD, 'voice.wav'), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    json.dump(timing, open(os.path.join(BUILD, 'voice-timing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok: build/voice.wav, build/voice-timing.json')


def sub_cues(st, en, text, who):
    parts = split_cues(text)
    total = sum(len(p) for p in parts)
    out, t = [], st
    for p in parts:
        d = (en - st) * len(p) / total
        out.append({'start': round(t, 2), 'end': round(t + d, 2), 'text': p, 'who': who})
        t += d
    return out


if __name__ == '__main__':
    main()
