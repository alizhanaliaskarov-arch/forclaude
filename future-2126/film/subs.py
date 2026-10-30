"""
Субтитры из script.md: текст диктора делится на строки и раскладывается по времени сцен.
Если есть build/voice-timing.json (тайминг реальной озвучки), берётся он.

Пишет:  build/subs.ass             — для вшивания в видео (ffmpeg, фильтр ass)
        ../subtitles_ru.srt        — для загрузки на YouTube как отдельные субтитры
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
BUILD = os.path.join(ROOT, 'build')


def scenes():
    text = open(os.path.join(ROOT, 'script.md'), encoding='utf-8').read()
    out = []
    for block in re.split(r'\n### ', text)[1:]:
        head = block.split('\n')[0]
        m = re.match(r'(S\d\d) · (\d+):(\d\d)–(\d+):(\d\d)', head)
        if not m:
            continue
        sid = m.group(1)
        t0 = int(m.group(2)) * 60 + int(m.group(3))
        t1 = int(m.group(4)) * 60 + int(m.group(5))
        lines = []
        for sp, body in re.findall(r'^- \*\*(Диктор|Мира)[^*]*:\*\* «(.*?)»\s*$', block, re.M):
            body = re.sub(r'\*\*\[.*?\]\*\*', '', body)
            body = re.sub(r'\*\(.*?\)\*', '', body)
            body = re.sub(r'\s+', ' ', body).strip()
            lines.append((sp, body))
        out.append((sid, t0, t1, lines))
    return out


def split_cues(text, maxlen=84):
    parts = re.split(r'(?<=[.!?…])\s+', text)
    cues = []
    for p in parts:
        while len(p) > maxlen:
            cut = max(p.rfind(', ', 0, maxlen), p.rfind(' — ', 0, maxlen), p.rfind(': ', 0, maxlen))
            if cut < 25:
                cut = p.rfind(' ', 0, maxlen)
            cues.append(p[:cut + 1].strip())
            p = p[cut + 1:].strip()
        if p:
            cues.append(p)
    return cues


def planned():
    cues = []
    for sid, t0, t1, lines in scenes():
        if not lines:
            continue
        lead, tail = 0.5, 0.7
        if sid == 'S24':
            # реплика Миры, пауза 3 с, последняя фраза диктора
            mira = split_cues(lines[0][1])
            span = (t0 + 0.8, t0 + 16.5)
            cues += spread(mira, span, 'Мира')
            cues += spread(split_cues(lines[1][1]), (t0 + 19.5, t1 - 0.6), 'Диктор')
            continue
        items = []
        for sp, body in lines:
            items += [(sp, c) for c in split_cues(body)]
        avail = (t1 - tail) - (t0 + lead)
        total = sum(len(c) + 12 for _, c in items)
        t = t0 + lead
        for sp, c in items:
            d = avail * (len(c) + 12) / total
            cues.append({'start': round(t, 2), 'end': round(t + d - 0.15, 2), 'text': c, 'who': sp})
            t += d
    return cues


def spread(texts, span, who):
    a, b = span
    total = sum(len(c) + 12 for c in texts)
    out, t = [], a
    for c in texts:
        d = (b - a) * (len(c) + 12) / total
        out.append({'start': round(t, 2), 'end': round(t + d - 0.15, 2), 'text': c, 'who': who})
        t += d
    return out


def ts_srt(s):
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f'{int(h):02d}:{int(m):02d}:{int(sec):02d},{int(round((sec - int(sec)) * 1000)):03d}'


def ts_ass(s):
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f'{int(h)}:{int(m):02d}:{sec:05.2f}'


def main():
    vt = os.path.join(BUILD, 'voice-timing.json')
    cues = json.load(open(vt, encoding='utf-8')) if os.path.exists(vt) else planned()
    os.makedirs(BUILD, exist_ok=True)
    with open(os.path.join(ROOT, 'subtitles_ru.srt'), 'w', encoding='utf-8') as f:
        for i, c in enumerate(cues, 1):
            text = ('— ' if c.get('who') == 'Мира' else '') + c['text']
            f.write(f"{i}\n{ts_srt(c['start'])} --> {ts_srt(c['end'])}\n{text}\n\n")
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narr,Inter SemiBold,46,&H00FFFFFF,&H00FFFFFF,&H64000000,&H96000000,0,0,0,0,100,100,0,0,1,3.2,1.2,2,260,260,56,204
Style: Mira,Inter SemiBold,46,&H00A9D9FF,&H00FFFFFF,&H64000000,&H96000000,0,1,0,0,100,100,0,0,1,3.2,1.2,2,260,260,56,204

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(os.path.join(BUILD, 'subs.ass'), 'w', encoding='utf-8') as f:
        f.write(head)
        for c in cues:
            style = 'Mira' if c.get('who') == 'Мира' else 'Narr'
            f.write(f"Dialogue: 0,{ts_ass(c['start'])},{ts_ass(c['end'])},{style},,0,0,0,,{{\\fad(120,160)}}{c['text']}\n")
    print(f'субтитров: {len(cues)}; источник: {"озвучка" if os.path.exists(vt) else "план сценария"}')


if __name__ == '__main__':
    main()
