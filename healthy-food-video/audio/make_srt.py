"""Writes out/healthy-food-healthy-life.en.srt from src/timeline.json (upload it to YouTube as English captions)."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tl = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))


def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
with open(os.path.join(ROOT, 'out', 'healthy-food-healthy-life.en.srt'), 'w') as fh:
    for i, l in enumerate(tl['lines'], 1):
        fh.write(f"{i}\n{ts(l['start'])} --> {ts(l['end'] + 0.3)}\n{l['text']}\n\n")
print(len(tl['lines']), 'captions')
