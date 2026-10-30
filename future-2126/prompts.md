# Земля-2126 — промты для генерации видео

**101 клип · 900 с · 16:9.** Каждый клип длится 4–15 с. Порядок и длительности совпадают с [`edl.csv`](edl.csv): по нему собирает ролик скрипт [`assemble.sh`](assemble.sh).
Промты на английском: генераторы видео лучше всего понимают английский. Описание каждой сцены по-русски — в [`script.md`](script.md).

## Как пользоваться

1. **Сначала референсы персонажей.** В генераторе изображений сделайте лист персонажа для Миры, Аи и младенца по промтам из раздела «Паспорт персонажей». Выберите лучший вариант и больше не меняйте его.
2. **Генерируйте image-to-video или с референсами** (character reference, «ingredients», elements — названия зависят от генератора). Каждый кадр с героиней генерируйте от её референса. Только text-to-video внешность «поплывёт».
3. **В каждый промт вставляйте блоки** `[STYLE]`, `[NEG]` и нужные блоки персонажей и мест **полностью, слово в слово**. Одинаковый текст даёт одинаковую картинку.
4. **Длинные клипы (10–15 с)** генерируйте как 8–10 с и продлевайте функцией extend. Можно сделать два клипа и склеить их по движению камеры. На склейку уходит 1–2 с.
5. **Генерируйте 2–4 варианта** каждого клипа и берите лучший. Отбраковка: лишние пальцы, «плывущие» лица, случайные буквы, мерцание, рывки движения.
6. **Героини не говорят в кадре.** Весь текст идёт закадровым голосом, поэтому синхронизация губ не нужна. Это главный способ избежать искажений лица.
7. **Сохраняйте файлы** как `clips/S01-1.mp4`, `clips/S01-2.mp4`… Тогда сборка пройдёт автоматически.

### Настройки генератора
| Параметр | Значение | Почему |
|---|---|---|
| Соотношение сторон | **16:9** | YouTube, горизонтальный ролик |
| Разрешение | максимальное доступное (4K, если есть; иначе 1080p) | 1080p потом апскейлится до 3840×2160 (Topaz Video AI или аналог) |
| Частота кадров | **24 fps** | кинематографичное движение; см. примечание ниже |
| Длительность клипа | 5–10 с | короткие клипы стабильнее; длинные — через extend |
| Seed | фиксированный для одной локации | меньше разброса между дублями |

> **Про 120 fps.** Мне не известен генератор, который выдаёт настоящие 120 fps. Главное — YouTube принимает и воспроизводит максимум **60 fps**: 120 fps он не покажет. Telegram тоже не даст преимущества. Рекомендация: мастер **24 fps** (кино). Если нужна «гладкая» картинка, переведите клипы в **60 fps** в Topaz Video AI (Chronos) или Flowframes (RIFE) и соберите с `FPS=60` (см. README). Плавность камеры задают промты: везде указано медленное равномерное движение.

---

## Блоки для вставки

**[STYLE]**
```
Photorealistic cinematic documentary footage, shot on ARRI Alexa 35, anamorphic-look lenses, 16:9 frame, natural motivated lighting, soft volumetric haze, shallow depth of field, subtle film grain, color grade with warm amber skin tones against deep teal and lush green environments, smooth slow steady camera movement, high detail, sharp focus, realistic textures, realistic physics.
```

**[ARCHIVE]** (только для кадров 1920-х; вместо [STYLE])
```
Authentic 1920s black-and-white 35mm newsreel footage, orthochromatic film look, slightly sped-up early-cinema motion, light scratches and dust, gentle gate weave, soft vignette, period-accurate clothing and objects.
```

**[NEG]** (негативный промт / «avoid»)
```
text, letters, words, subtitles, captions, logos, watermarks, UI, screens with readable content, extra fingers, deformed hands, fused fingers, distorted face, asymmetric eyes, morphing, flicker, jitter, sudden camera jumps, warping background, cartoon, CGI look, plastic skin, oversaturated colors, low resolution, blur.
```

---

## Паспорт персонажей

**[MIRA-2126]**: героиня, 100 лет, в 2126 году. В каждом кадре одна и та же одежда.
```
Mira, a 100-year-old woman who looks like a healthy 75-year-old, slim, upright posture, short silver-white bob haircut, light olive skin with fine wrinkles, warm hazel-green eyes, a small dark mole on her right cheekbone, thin round titanium-framed glasses, long charcoal-grey wool coat with a high collar, chunky hand-knitted rust-orange scarf, simple silver ring on her right ring finger.
```

**[AYA]**: правнучка, 8 лет.
```
Aya, an 8-year-old girl, warm light-brown skin, dark brown curly hair in two puffs, hazel-green eyes, light freckles across her nose, mustard-yellow raincoat over a white t-shirt, dark blue jeans, white sneakers.
```

**[BABY-2026]**: Мира-младенец в 2026 году.
```
a newborn baby girl with a few strands of dark hair, wrapped in a chunky hand-knitted rust-orange blanket (the same rust-orange color and knit as Mira's scarf).
```

**Лист персонажа** (генератор изображений, по одному на героиню):
```
Character reference sheet of [MIRA-2126 / AYA text], four views on one image: front portrait, three-quarter view, side profile, full-body standing; neutral light-grey studio background, soft even lighting, photorealistic, consistent features in all views, no text.
```

## Паспорт мест

**[CITY-2126]**
```
a coastal city in the year 2126: terraced mid-rise towers of light timber and pale stone covered with hanging gardens and trees, integrated solar-glass facades, elevated garden viaducts with a silent tram, canals and wooden pedestrian bridges, a grassy sea-wall park along the waterfront, very few cars, many pedestrians and cyclists, clean air, believable near-future architecture, not sci-fi chrome.
```

**[TERRACE]**
```
Mira's rooftop terrace: weathered wooden deck, potted olive trees, a teak bench, a low glass railing, overlooking the green city and the sea.
```

---

## Клипы

Формат строки: **ID · длительность** — промт. Перед каждым промтом вставьте `[STYLE]` (или `[ARCHIVE]`), в конце — `[NEG]`.

### S01 · Хук: 1926 (12 с)
- **S01-1 · 6 с** — [ARCHIVE] Wide static shot of an empty snowy farm field in 1926; a tall thin metal launch frame stands in the middle; three men in long wool overcoats and hats walk away from it toward the camera, breath visible in the cold air.
- **S01-2 · 6 с** — [ARCHIVE] Medium shot of the slender metal launch frame; a small burst of flame and white smoke at its base, a thin primitive rocket jumps upward out of frame, smoke drifts, snow is blown by the blast; slight handheld shake.

> Плашка «реконструкция» в монтаже. Рядом можно вставить настоящее фото Годдарда (NASA, общественное достояние).

### S02 · Одна жизнь (18 с)
- **S02-1 · 6 с** — [STYLE] [BABY-2026] in a modern 2026 maternity ward in soft morning window light; the baby's tiny hand closes around the mother's index finger (mother out of focus, only her hand visible). Slow push-in, macro lens look.
- **S02-2 · 4 с** — [STYLE] Extreme macro close-up of the newborn's eye slowly opening, hazel-green iris, tiny eyelashes, soft morning light, eye centered in frame. Static.
- **S02-3 · 8 с** — [STYLE] [MIRA-2126] Extreme macro close-up of an elderly woman's hazel-green eye opening, eye centered in frame exactly like the previous shot; the camera smoothly pulls back to reveal Mira standing on [TERRACE] at golden hour, wind moving her rust-orange scarf, [CITY-2126] behind her.

### S03 · Вы бы не поверили (35 с)
- **S03-1 · 6 с** — [ARCHIVE] A 1926 city street: horse-drawn carts mixed with early Ford Model T cars, pedestrians in hats and long coats, tram wires overhead.
- **S03-2 · 5 с** — [ARCHIVE] Interior of a rural wooden house at night in the 1920s; a single kerosene lamp is the only light; a woman sews by its flame.
- **S03-3 · 6 с** — [ARCHIVE] A large office room with rows of women at desks operating mechanical calculators and writing numbers with pencils, early 20th-century clothing; slow dolly along the desks; nothing legible on paper.
- **S03-4 · 6 с** — [STYLE] Night time-lapse of a 2026 megacity from a high angle: rivers of car headlights, glowing skyscrapers, moving clouds.
- **S03-5 · 6 с** — [STYLE] A subway car at night in 2026: passengers' faces lit by their smartphones, phone screens turned away from camera; slow lateral dolly.
- **S03-6 · 6 с** — [STYLE] [MIRA-2126] Close-up of Mira's wrinkled hands with the silver ring holding an old faded paper photograph of a newborn wrapped in a rust-orange blanket; her thumb gently touches the photo; warm window light, shallow depth of field.

### S04 · Правила игры (25 с)
- **S04-1 · 9 с** — [STYLE] Aerial drone shot at dawn over a wide misty valley: a river splits into three branches flowing in different directions; slow forward glide, gradually rising. *(эта же локация в S23-1 — сохраните seed)*
- **S04-2 · 8 с** — [STYLE] Planet Earth from space, night side slowly rotating, city lights and a thin blue atmospheric rim, the sun about to rise at the edge. Locked-off camera.
- **S04-3 · 8 с** — [STYLE] [MIRA-2126] Mira walks slowly along [TERRACE] in the morning, the wind lifting her rust-orange scarf; side tracking shot at her walking pace, [CITY-2126] softly out of focus behind her.

### S05 · Два градуса и четыре (35 с)
- **S05-1 · 10 с** — [STYLE] Earth from low orbit: sunrise breaking over the curved horizon, the thin atmosphere glowing blue and orange; slow drift.
- **S05-2 · 8 с** — [STYLE] Low angle: heat haze shimmering above a cracked dry farm field with withered crops under a harsh midday sun; slow push-in.
- **S05-3 · 9 с** — [STYLE] A massive glacier front calving: a huge block of ice breaks off and falls into the dark sea, wide shot from a boat, slow motion, spray and waves.
- **S05-4 · 8 с** — [STYLE] Full disk of planet Earth on black space, very slow push-in, Earth placed in the left two thirds of the frame, empty space on the right for graphics.

### S06 · Океан помнит (40 с)
- **S06-1 · 8 с** — [STYLE] Storm waves crash against a present-day concrete seawall promenade, spray in slow motion, overcast sky.
- **S06-2 · 8 с** — [STYLE] Aerial over a low-lying river delta coastline: dense small houses right at the water's edge, rice fields, silver water; slow lateral flight.
- **S06-3 · 8 с** — [STYLE] Aerial along the edge of an Antarctic ice shelf: tall white ice cliffs meeting the dark ocean; slow forward motion.
- **S06-4 · 8 с** — [STYLE] Time-lapse, locked-off camera: on a sunny day tidal seawater slowly rises through storm drains and floods a present-day coastal street with parked cars.
- **S06-5 · 8 с** — [STYLE] [CITY-2126] A similar coastline in 2126: a wide grassy levee park with trees and walking paths forms the new waterfront, people strolling, calm sea; slow aerial pull-back.

### S07 · Поворот: жить с водой (45 с)
- **S07-1 · 8 с** — [STYLE] Wide static landscape: a green fertile valley with a river, orchards and a small village, centered composition. *(для сплит-скрина, сохраните seed)*
- **S07-2 · 8 с** — [STYLE] Exactly the same valley composition, but in drought: the river reduced to a cracked bed, brown hills, dead orchards, dusty haze. Static.
- **S07-3 · 10 с** — [STYLE] Aerial over Dutch-style dikes and flat green polders lying below the sea level, the sea on one side visibly higher than the fields, modern wind turbines turning; slow glide.
- **S07-4 · 9 с** — [STYLE] Present-day construction of a large coastal flood barrier: tower cranes, workers in orange vests, huge concrete blocks, the sea behind; wide slow dolly.
- **S07-5 · 10 с** — [STYLE] [MIRA-2126] Mira stands at the railing of the levee park in [CITY-2126], looking at the sea, wind in her rust-orange scarf; over-the-shoulder medium shot that slowly arcs to her profile.

### S08 · Пик человечества (40 с)
- **S08-1 · 8 с** — [STYLE] Top-down shot of a massive crowd crossing a scramble intersection in a present-day megacity, umbrellas, rhythmic flow; locked-off.
- **S08-2 · 8 с** — [STYLE] Night view of Earth from orbit: city lights clustered along coastlines and rivers; slow drift.
- **S08-3 · 12 с** — [STYLE] [CITY-2126] Epic aerial reveal at golden hour: the drone flies low over the sea toward the city, waves below, then rises to reveal the full skyline of green terraced towers. *(8 с + extend)*
- **S08-4 · 12 с** — [STYLE] [CITY-2126] Continuous drone flight between green terraced towers, past hanging gardens and a garden viaduct with a silent tram, ending on [TERRACE] where [MIRA-2126] stands small in the frame. *(8 с + extend)*

### S09 · Город, который охлаждает себя (45 с)
- **S09-1 · 9 с** — [STYLE] [CITY-2126] Street level: a wide pedestrian street under a dense tree canopy, people walking and cycling, a sleek quiet tram glides by in the background, dappled sunlight; steadicam moving forward.
- **S09-2 · 9 с** — [STYLE] [CITY-2126] Children playing in deep tree shade on a hot sunny day, sunlight sparkling through leaves, a fine mist fountain; slow motion.
- **S09-3 · 9 с** — [STYLE] [CITY-2126] Aerial top-down: white and light-grey rooftops with solar panels and rooftop gardens forming a mosaic; slow rotation.
- **S09-4 · 9 с** — [STYLE] Interior of a tall mass-timber building: exposed glulam wooden beams and columns, warm daylight, people crossing the lobby; slow upward tilt along the wooden structure.
- **S09-5 · 9 с** — [STYLE] [MIRA-2126] In the lobby of the timber building Mira rests her palm on a large wooden column and looks up; medium close-up, soft light.

### S10 · Впустить воду (50 с)
- **S10-1 · 10 с** — [STYLE] Present-day time-lapse, locked-off: a designed city park in heavy rain gradually fills with water and becomes a shallow lake, trees standing in water.
- **S10-2 · 10 с** — [STYLE] Aerial: a modular floating neighborhood of hexagonal platforms connected by bridges on a calm sea, low-rise timber buildings with gardens; slow orbit.
- **S10-3 · 10 с** — [STYLE] [CITY-2126] Lagoon district at morning mist: old 20th-century building facades standing half in calm water, covered with greenery, wooden footbridges, small electric boats; slow glide at water level.
- **S10-4 · 10 с** — [STYLE] [AYA] Aya runs and splashes through ankle-deep water in a lagoon park after rain, laughing, droplets frozen in the air, slow motion, low tracking camera.
- **S10-5 · 10 с** — [STYLE] [MIRA-2126] The camera starts on an old submerged doorway and window under clear water, then tilts up to Mira standing on a wooden footbridge above, looking down, smiling softly.

### S11 · Солнце и звезда в бутылке (45 с)
- **S11-1 · 7 с** — [ARCHIVE] A 1920s coal power station: tall brick chimneys pouring black smoke, coal wagons on rails. Static wide.
- **S11-2 · 9 с** — [STYLE] Aerial at sunrise over a vast solar farm, endless rows of panels reflecting the orange sky; slow forward flight, rising.
- **S11-3 · 9 с** — [STYLE] Interior of a laser fusion research facility: a huge spherical target chamber with many beam ports, technicians in clean suits, cool blue light; slow push toward the chamber; realistic lab.
- **S11-4 · 10 с** — [STYLE] [CITY-2126] At dusk: solar-glass facades glowing softly, offshore wind turbines on the horizon, warm windows lighting up; slow aerial pan.
- **S11-5 · 10 с** — [STYLE] [MIRA-2126] Evening in Mira's apartment: warm wooden interior with plants; as the daylight fades, the room lighting gently brightens by itself; Mira reads a paper book in an armchair. Static wide, then slow push-in.

### S12 · Работа без названия (45 с)
- **S12-1 · 7 с** — [ARCHIVE] Close-up of a hand with a pencil and a slide rule writing columns of numbers on paper under a desk lamp, numbers not legible.
- **S12-2 · 9 с** — [STYLE] [MIRA-2126] Mira in her kitchen pours tea and speaks toward a soft glowing ring of light on the wall that gently pulses in response; no screens. Medium shot, mouth movement minimal, face in three-quarter view.
- **S12-3 · 9 с** — [STYLE] [MIRA-2126] Mira sits by the window; a soft semi-transparent life-size light projection of a friendly doctor stands in the room; they calmly converse; subtle and realistic, no interface elements.
- **S12-4 · 10 с** — [STYLE] A 2126 workshop: people and slim robotic arms working side by side assembling wooden furniture and electronics, warm daylight, collaborative atmosphere; slow dolly.
- **S12-5 · 10 с** — [STYLE] [AYA] Aya draws with her finger on a large glowing tabletop canvas; her abstract colorful drawing comes alive as soft moving light; close-up of her focused face.

### S13 · Где летающие машины? (45 с)
- **S13-1 · 8 с** — [STYLE] A miniature diorama in 1950s retro-futurist style: chrome flying cars with fins and bubble canopies hovering above a toy city, tilt-shift look, warm nostalgic light; slow pan.
- **S13-2 · 8 с** — [STYLE] Aerial top-down of a huge present-day parking lot full of cars next to a congested highway, heat haze; slow rise.
- **S13-3 · 10 с** — [STYLE] [MIRA-2126] On a tree-lined street of [CITY-2126] a small rounded autonomous pod silently stops, its door slides open, Mira steps in and sits down. Medium wide, static.
- **S13-4 · 9 с** — [STYLE] [CITY-2126] Aerial: a former parking lot turned into a garden with ponds, a playground and trees, faint old parking lines still visible under the grass; slow top-down drift.
- **S13-5 · 10 с** — [STYLE] [CITY-2126] POV from inside the autonomous pod gliding along an avenue under trees, cyclists alongside, soft morning light; smooth forward motion.

### S14 · Сто лет — не чудо (45 с)
- **S14-1 · 8 с** — [ARCHIVE] A formal 1920s family portrait: parents and seven children of different ages standing still in front of a farmhouse, small natural movements, as in early film.
- **S14-2 · 9 с** — [STYLE] Present-day neonatal care unit: a nurse gently checks a tiny baby in an incubator, soft light, monitors out of focus.
- **S14-3 · 10 с** — [STYLE] [MIRA-2126] Morning: Mira walks with a confident steady stride along a tree-lined street toward a market, carrying a woven bag; tracking shot from the front.
- **S14-4 · 9 с** — [STYLE] [MIRA-2126] At a lively open-air market in [CITY-2126], stalls with fruit and vegetables, vendors; Mira picks up a ripe peach, smells it and smiles. Medium shot.
- **S14-5 · 9 с** — [STYLE] [MIRA-2126] Macro close-up of Mira's wrinkled hands with the silver ring slowly turning a ripe peach in warm morning light.

### S15 · Медицина и её тень (40 с)
- **S15-1 · 8 с** — [STYLE] A present-day genetics lab: a scientist in blue gloves pipettes liquid into a row of tubes, blue-white light, shallow focus.
- **S15-2 · 8 с** — [STYLE] Abstract macro visualization: glowing translucent double helices and particles floating in deep blue space; slow camera drift; no symbols.
- **S15-3 · 12 с** — [STYLE] [MIRA-2126] A calm bright clinic in 2126 with plants and wood: a doctor holds a small handheld scanner near Mira's wrist, both relaxed and smiling; slow arc. *(8 с + extend)*
- **S15-4 · 12 с** — [STYLE] Contrast: a crowded dim clinic waiting room in a poor district in 2126, people on plastic chairs and standing along walls, tired faces, cold fluorescent light; slow lateral dolly. *(8 с + extend)*

### S16 · Что на тарелке (35 с)
- **S16-1 · 8 с** — [STYLE] A clean food production facility: rows of tall stainless-steel bioreactor tanks, technicians in white, soft reflections; slow dolly.
- **S16-2 · 9 с** — [STYLE] A vertical farm: towering racks of lettuce and herbs under pink-purple LED light, a worker walks between rows; slow symmetrical push forward.
- **S16-3 · 9 с** — [STYLE] [MIRA-2126] [AYA] Family dinner in Mira's apartment in warm evening light: Mira and Aya at a wooden table with bread, soup and salad, two adults in soft focus in the background laughing. Medium wide. *(Мира здесь без пальто, но в шарфе — пропишите: «Mira without the coat, wearing a dark grey sweater and the rust-orange scarf»)*
- **S16-4 · 9 с** — [STYLE] [AYA] Close-up: Aya bites into a red cherry tomato and grins at someone off-screen.

### S17 · Честная глава (40 с)
- **S17-1 · 10 с** — [STYLE] Underwater: a vibrant healthy coral reef with colorful fish, sunbeams through the water; slow forward swim. *(сохраните seed для S17-2)*
- **S17-2 · 10 с** — [STYLE] The same reef composition, bleached: white dead corals, few fish, murky light; slow forward swim.
- **S17-3 · 10 с** — [STYLE] Aerial: dense tropical rainforest ending abruptly in a straight line of clear-cut land with stumps and red soil; slow lateral flight along the edge.
- **S17-4 · 10 с** — [STYLE] [MIRA-2126] [AYA] Mira and Aya sit on a sofa; Mira opens an old paper book with large photographs of animals; Aya touches a photo of a coral reef. Over-the-shoulder shot, no legible text.

### S18 · Природа умеет возвращаться (45 с)
- **S18-1 · 9 с** — [STYLE] Wildlife documentary telephoto: a wolf pack trots across a snowy mountain valley, breath in the cold air.
- **S18-2 · 9 с** — [STYLE] A humpback whale breaches fully out of the ocean and crashes back, slow motion, golden light.
- **S18-3 · 9 с** — [STYLE] Antarctic landscape: sunlit ice and snow under a deep blue sky with iridescent clouds; slow pan.
- **S18-4 · 9 с** — [STYLE] Aerial: a restored meandering river with wetlands and a beaver dam, morning mist; slow forward flight.
- **S18-5 · 9 с** — [STYLE] Aerial: a young regrowing mixed forest on former clear-cut land, sunlight; slow rise.

### S19 · Здесь была трасса (35 с)
- **S19-1 · 9 с** — [STYLE] [CITY-2126] At the edge of the city: a vast wetland with reeds and ponds, a wooden boardwalk leading toward green towers on the horizon, birds flying; slow aerial descent.
- **S19-2 · 9 с** — [STYLE] Remains of an old concrete highway overpass overgrown with vines and young trees, birds nesting; slow dolly underneath.
- **S19-3 · 9 с** — [STYLE] [MIRA-2126] [AYA] Mira and Aya walk on the boardwalk; Mira stops and points toward the overgrown overpass, Aya follows her gaze. Medium wide tracking shot.
- **S19-4 · 8 с** — [STYLE] Macro: a green frog on a reed croaks, its throat sac inflating; rack focus to [AYA]'s delighted face behind it.

### S20 · Небо над головой (40 с)
- **S20-1 · 10 с** — [STYLE] A realistic lunar south pole base: low habitats covered with regolith, tall solar towers, the sun very low casting long shadows, astronauts in white suits; slow lateral pan.
- **S20-2 · 10 с** — [STYLE] A Mars settlement: a cluster of domes and half-buried habitats on red terrain, a dust storm approaching on the horizon, pale salmon sky; slow push-in.
- **S20-3 · 10 с** — [STYLE] Low Earth orbit at night: several satellites and a large orbital station silhouetted against green aurora over the night side of Earth; slow drift.
- **S20-4 · 10 с** — [STYLE] [TERRACE] at night: starry sky over [CITY-2126], several slow-moving points of light crossing the sky, warm city glow below; Mira and Aya as silhouettes watching. Static wide.

### S21 · Бледно-голубая точка (35 с)
- **S21-1 · 12 с** — [STYLE] Deep space: the camera drifts slowly through darkness toward a tiny pale blue point of light caught in a faint diagonal sunbeam; minimalistic. *(8 с + extend; в монтаже — вставка настоящего снимка NASA/JPL)*
- **S21-2 · 12 с** — [STYLE] Earthrise over the lunar horizon: grey cratered surface in the foreground, the blue Earth slowly rising above it in the black sky. *(8 с + extend)*
- **S21-3 · 11 с** — [STYLE] [AYA] On [TERRACE] at night Aya looks through a small brass telescope, then pulls away with wide amazed eyes; warm light from the apartment behind her. Medium close-up. *(8 с + extend)*

### S22 · Он уже родился (35 с)
- **S22-1 · 9 с** — [STYLE] [BABY-2026] Overhead shot of the newborn sleeping in a hospital bassinet in the rust-orange blanket, soft morning light; slow push-in.
- **S22-2 · 9 с** — [STYLE] A present-day schoolyard: diverse children running, playing and laughing, sunny day, slow motion.
- **S22-3 · 9 с** — [STYLE] [MIRA-2126] Close-up portrait on [TERRACE] at golden hour: Mira looks directly into the camera, calm and kind, a slight smile, lips closed; very slow push-in.
- **S22-4 · 8 с** — [STYLE] [MIRA-2126] [AYA] Close-up: Mira's old hand with the silver ring holds Aya's small hand as they walk; slow-motion low tracking shot.

### S23 · Не прогноз погоды (30 с)
- **S23-1 · 10 с** — [STYLE] The same dawn valley where the river splits into three branches (as S04-1); the drone banks and follows the left branch flowing into a lush green landscape.
- **S23-2 · 10 с** — [STYLE] Close-up: hands in rich soil planting a young tree sapling, present day, morning light, slow motion.
- **S23-3 · 5 с** — [STYLE] Aerial of a grey present-day coastal city skyline in hazy daylight; slow push-in. *(тот же ракурс, что S23-4, — для растворения)*
- **S23-4 · 5 с** — [STYLE] [CITY-2126] The same aerial angle and framing as the previous shot, now the green city of 2126 in clear golden light; slow push-in.

### S24 · Шарф (25 с)
- **S24-1 · 13 с** — [STYLE] [MIRA-2126] [AYA] Sunset on [TERRACE]: Mira slowly unwinds her rust-orange scarf and wraps it around Aya's neck, Aya hugs her; medium side shot, faces in profile, gentle hand movements. *(8 с + extend)*
- **S24-2 · 12 с** — [STYLE] Wide silhouette shot from behind: Mira and Aya at the glass railing, the lights of [CITY-2126] turning on one by one under a deep orange-blue sky. Static. *(8 с + extend)*

### S25 · Ваш сценарий (15 с)
- **S25-1 · 15 с** — [STYLE] Slow drone pull-back and rise from [TERRACE] with the tiny figures of Mira and Aya, revealing the whole city and the sea, rising into soft clouds; calm lower part of the frame for end-screen elements. *(8 с + extend)*

---

## Звук: промты и бриф

**Голос диктора** (ElevenLabs или аналог; либо живая запись): мужской баритон 35–45 лет, спокойный, тёплый, без «рекламной» интонации; темп ~125 слов/мин; паузы — там, где в сценарии *(пауза)*. Пишите по сценам: `vo/S01.wav … vo/S25.wav`, затем склейте по таймкодам в один `audio/voiceover.wav` длиной 15:00.

**Голос Миры** (только S24): женский, пожилой, мягкий, немного хрипловатый, говорит медленно и с улыбкой.

**Музыка** (библиотека без авторских претензий: YouTube Audio Library, Artlist, Musicbed; или генератор с коммерческой лицензией). Один файл `audio/music.wav` длиной 15:00, сведённый по главам:
| Время | Настроение | Инструменты |
|---|---|---|
| 0:00–0:12 | тишина, ветер, треск плёнки | — |
| 0:12–1:30 | главная тема, интрига → пульс | фортепиано, струнные, синтезатор |
| 1:30–3:30 | тревожная, глубокая | низкие струнные, дрон, сабвуфер |
| 3:30–5:45 | раскрытие, удивление, надежда | хор, струнные, лёгкая перкуссия |
| 5:45–8:00 | технологичная, ритмичная | синтезаторы, электронная пульсация |
| 8:00–10:00 | тёплая, человеческая | гитара, фортепиано |
| 10:00–12:00 | грусть → подъём (пик на прыжке кита) | виолончель, оркестр |
| 12:00–13:15 | космос, простор | эмбиент-пэды, одна высокая нота |
| 13:15–15:00 | главная тема — полная версия, финальный аккорд 14:58 | фортепиано, оркестр |

**Звуковые эффекты:** треск киноплёнки, хлопок ракеты (S01, повтор в S20), низкий удар на карточках глав, шум улицы → тишина и птицы (S09), дождь (S10), детский смех, гул термоядерного зала, «вжух» (S13), сердцебиение (S14), волны и кит, хор лягушек (S19), ветер и далёкий колокол трамвая (S24).
