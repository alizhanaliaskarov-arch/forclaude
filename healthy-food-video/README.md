# Healthy Food, Healthy Life — video (Remotion, 16:9, 5:00)

An English explainer video for YouTube and Telegram: fresh fruit and vegetables, building a balanced plate,
simple breakfasts, lunches and dinners, drinking water with lemon and mint, sharing a meal with family or friends
(treats included), and small everyday habits. It ends with the question **“What healthy habit will you try?”**

| File | For | Format |
|---|---|---|
| `out/healthy-food-healthy-life-4k60.mp4` | YouTube | 3840×2160 (4K UHD), 60 fps, H.264 + AAC, no burned-in subtitles. Sent with the chat because it is over GitHub’s 100 MB file limit (not in git) |
| `out/healthy-food-healthy-life.en.srt` | YouTube | English captions: upload as subtitles (YouTube Studio → Subtitles) |
| `out/healthy-food-healthy-life-1080p-telegram.mp4` | Telegram | 1920×1080, 30 fps, H.264 + AAC, subtitles burned in for muted autoplay |

**Why 60 fps and not 120:** YouTube and Telegram play at most 60 fps, so a 120 fps file would be converted down anyway.
The animation is computed continuously, so 60 fps is twice as smooth as 30 fps at the same speed.

## What’s inside
- 8 scenes driven by the voice-over timing (`src/timeline.json`): intro, fresh produce (ending in a “food rainbow”),
  balanced plate, meals through the day (morning → noon → evening light), water, family meal + treats,
  small habits, closing question.
- Visual style: warm, naturally lit flat illustrations drawn in code (SVG), with slow eased camera moves, soft window light,
  vignette and drifting bokeh. No photos, no generated images, so there are no distorted hands or faces, no flicker and no
  random text. People are deliberately stylised and faceless. All on-screen text is intentional (scene titles, short labels).
- Palette: greens `#1E4632` / `#2A7A3E` / `#6DBE45`, cream `#FBF6EC`, warm wood. Fonts: DM Serif Display + Nunito Sans (SIL OFL).

## Audio
- **Voice-over:** Kokoro TTS (open model, Apache-2.0), voice `af_heart`, made by [`audio/make_voice.py`](audio/make_voice.py)
  from [`audio/script.py`](audio/script.py). It also writes the timing that drives the scenes and the subtitles.
- **Music:** original, synthesised by [`audio/make_music.py`](audio/make_music.py) (numpy/scipy, no samples, nothing to license):
  warm acoustic pop in G major, 92 BPM, with fingerpicked guitar, felt piano, pad, bass and a light shaker. It is ducked
  under the voice, then mastered to about -16 LUFS with a -1.5 dBFS limiter (`public/soundtrack_master.wav`).
- Want your own voice? Render `HealthyFoodMusicOnly` and record over it, or replace `public/voiceover.wav` and rerun `make_music.py`.

## Build
```bash
npm install
pip install kokoro-onnx soundfile scipy
# Kokoro model files (kokoro-v1.0.onnx, voices-v1.0.bin) from github.com/thewh1teagle/kokoro-onnx releases
KOKORO_DIR=/path/to/model python3 audio/make_voice.py   # voice + src/timeline.json
python3 audio/make_music.py                              # music, mix, master
python3 audio/make_srt.py                                # YouTube captions
npx remotion render src/index.ts HealthyFood60 out/healthy-food-healthy-life-4k60.mp4 --scale=2 --crf=20   # 4K60, no subs
npx remotion render src/index.ts HealthyFood out/healthy-food-healthy-life-1080p-telegram.mp4 --crf=20     # 1080p30 + subs
npx remotion studio                                       # preview
node scripts/stills.mjs out/stills 10 60 120              # stills for checking (seconds)
```
Compositions are 1920×1080; `--scale=2` renders them at 3840×2160 with crisp vector edges.
`remotion.config.ts` points at the Chromium in this environment. On your own machine, delete that line.
