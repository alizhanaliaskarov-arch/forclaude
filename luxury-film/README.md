# OBSIDIAN — luxury cinematic film (Remotion + Three.js, 1080×1920, 0:60, 30 fps)

**Result:** [`out/luxury-film.mp4`](out/luxury-film.mp4) — vertical 9:16, H.264 + AAC 48 kHz, dialogue-free.

A 60-second dark-luxury spot built entirely in code: real-time 3D (Three.js, physically based materials —
polished chrome, black chrome, anisotropic brushed titanium, clear-coated obsidian) rendered frame by frame in Remotion,
editorial typography in HTML/CSS, and an original score synthesised in Python. No stock footage, no samples, no AI-generated clips.

## Storyboard
| Time | Scene | Camera / lens | Transition out |
|---|---|---|---|
| 0:00 | 01 The Arrival — a silver line forms, bends, catches the light on the cap's edge | 100 mm macro dolly-in | light wipe |
| 0:05 | 02 Material & Detail — obsidian, titanium, chrome; slivers align magnetically; **FORM.** | 100 mm lateral track → macro orbit | highlight match cut |
| 0:10 | 03 The Reveal — rim light traces the contours, chrome rings assemble; **BEYOND ORDINARY** | 50 mm 180° orbit → push-in | occlusion by a passing pillar |
| 0:17 | 04 The Motion Sequence — blades unfold, gyroscope rings, orbiting spheres; **PRECISION** in depth | 85/50 mm, cut every two beats | spinning titanium disc fills the frame |
| 0:25 | 05 The Luxury Peak — reflective floor, monoliths align, haze, volumetric beam; **TIMELESS BY DESIGN.** | 50 mm push-in → low-angle orbit | flash of reflected light, hard cut |
| 0:35 | 06 The Art of Precision — macro details; the silhouette traced in light collapses into an emblem | 100 mm track → 85 mm frontal | emblem opens as a circular portal |
| 0:43 | 07 The Signature Moment — monumental chrome arcs lock into alignment; **LESS. BUT BETTER.** | 50 mm low-angle dolly → subtle orbit | geometry fades, one silver glint remains |
| 0:52 | 08 The Final Frame — a light sweep, hairline frame → emblem → **OBSIDIAN** | 85 mm, decelerating push-in | fade to silence |

`OBSIDIAN` is a placeholder name — change `BRAND` in `src/theme.ts`.

## Look
Palette: obsidian black, graphite, brushed silver, platinum, a single champagne card in the studio for a sparing warm accent.
Light: a virtual black studio of long strip lights baked into an environment map (PMREM) — the strips are what draw the narrow
highlights on chrome and obsidian; rotating the environment makes the light travel across the metal. Rim spot, exponential fog,
fake volumetric cones, dust. Floor reflections are real mirrored geometry under a glossy, semi-transparent floor.
Lenses are real focal lengths converted to a vertical full-frame field of view (`lens()` in `src/theme.ts`).
Finishing: ACES filmic tone mapping, animated film grain, vignette. Text stays in the title-safe area for Reels/TikTok UI.

## Sound
[`audio/make_audio.py`](audio/make_audio.py): dark electronic-orchestral, D minor, 96 BPM; drone and glass textures →
measured pulse → peak with impact, strings and brass → space → climax, restrained impact and near-silence → deep sustained note
and a long metallic tail. Every transition has its own cue (clicks, metallic sweeps, impacts). 48 kHz, peaks at −1 dBFS.

## Build
```bash
npm install
python3 audio/make_audio.py        # numpy + scipy → public/soundtrack.wav
npm run render                     # → out/luxury-film.mp4 (software WebGL: ~1 h on 4 CPU cores)
node scripts/stills.mjs Luxury out/stills 150 900 1700   # check frames
```
On a machine with a GPU, set `Config.setChromiumOpenGlRenderer('angle')` in `remotion.config.ts` — much faster.
For a 4K master (2160×3840) change `W`/`H` in `src/theme.ts` and double the type sizes, or render with `--scale=2`.
