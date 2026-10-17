# Узбекистан: две границы до моря — видео (Remotion, 1920×1080, 3:00, 30 fps)

**Результат:** [`out/uzbekistan.mp4`](out/uzbekistan.mp4) — H.264 + AAC, 3:00.
**Сценарий и проверка фактов:** [`script.md`](script.md).

## Что внутри
- 16 сцен строго по сценарию: хронометраж, тексты на экране, переходы (резкая склейка через чёрное,
  зум в карту, шторка-икат, match cut купола, растворение через пар, шторка-ткань, whip pan,
  белая вспышка, затемнение, штамп, ирис).
- Настоящие карты: глобус и карты Центральной Азии построены по данным Natural Earth
  (пакет [`world-atlas`](https://github.com/topojson/world-atlas), общественное достояние) через `d3-geo`.
  Контуры Аральского моря — упрощённая схема (так и подписано в кадре).
- Озвучка: нейросетевой русский голос (Piper / VITS, голос «ruslan», обучен на корпусе RUSLAN —
  записях профессионального диктора; данные под CC BY-NC-SA 4.0, указание есть в финальном кадре).
  Ударения в редких именах выставлены вручную, голос прогнан через «студийную» обработку,
  музыка автоматически приглушается под речью. Субтитры идут точно по озвучке.
  Есть и чистая версия — только музыка, без голоса и субтитров (композиция `UzbekistanClean`).
- Палитра: бирюза `#1AA7A1`, лазурь `#1F5FA8`, золото `#D4A537`, охра `#C4772E`, тёплый белый `#FBF8F2`.
  Шрифты: Unbounded (заголовки) и Manrope (субтитры, подписи) — оба SIL OFL, через `@fontsource`.

## Почему иллюстрации, а не фото
Из окружения, где собиралось видео, фотобанки и Wikimedia Commons недоступны (сетевая политика
отвечает 403), поэтому все кадры нарисованы векторно в коде. Если захотите заменить сцену на фото
или видео, положите файл в `public/` и используйте `<Img src={staticFile('…')}/>` или `<OffthreadVideo/>`
внутри нужной сцены в `src/scenes/`.

## Музыка и звук
Сторонних треков нет: саундтрек полностью синтезирован скриптом [`audio/make_audio.py`](audio/make_audio.py)
(numpy + scipy) — дутар (Karplus-Strong) в ладу ре-хиджаз, дойра, мягкий лоу-фай бит, бас, пэды,
флейта-най в сцене Арала, ветер и эффекты (льющийся чай, штампы, затвор камеры, тиканье квиза).
Лицензировать и указывать авторство не нужно. Файл — `public/soundtrack.wav`.
Чтобы поставить свой трек, замените этот файл (длина 3:00) или поменяйте `src` у `<Audio>` в `src/Root.tsx`.

## Озвучка
Скрипт [`audio/make_voice.py`](audio/make_voice.py) читает реплики нейросетевым голосом Piper «ruslan»,
исправляет ударения (аль-Хорезми́, Бабу́р, Бухара́, Кызылку́м, махалля́, Навру́з, атла́с, Ича́н-Кала́ …),
держит естественный темп диктора (ускоряет только сцену, которая не помещается) и пропускает голос через
студийную цепочку: EQ, де-эссер, компрессор, немного «воздуха», маленькая комната, тихий фон помещения
и мягкие вдохи перед фразами. Пишет `public/voiceover.wav`, `public/soundtrack_vo.wav` и `src/voice-timing.json`.
```bash
curl -LO https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ru_RU-ruslan-medium.tar.bz2
tar xjf vits-piper-ru_RU-ruslan-medium.tar.bz2
pip install piper-tts onnxruntime numpy scipy
PIPER_VOICE=vits-piper-ru_RU-ruslan-medium/ru_RU-ruslan-medium.onnx python3 audio/make_voice.py
```
Хотите свой голос — запишите его поверх `UzbekistanClean` или замените `public/voiceover.wav`.

## Как собрать
```bash
npm install
npm run audio                     # пересобрать музыку (python3 + numpy + scipy)
PIPER_VOICE=…/ru_RU-ruslan-medium.onnx python3 audio/make_voice.py   # озвучка + микс + субтитры
npm run render                    # -> out/uzbekistan.mp4 (озвучка + субтитры)
npx remotion render src/index.ts UzbekistanClean out/uzbekistan-clean.mp4   # только музыка
npm run studio                    # превью в Remotion Studio
node scripts/stills.mjs out/stills 0 900 2700   # стоп-кадры для проверки
```
`remotion.config.ts` указывает на Chromium из `/opt/pw-browsers`; на своей машине эту строку можно
удалить — Remotion скачает браузер сам.

## Структура
| Файл | Что делает |
|---|---|
| `src/Root.tsx` | таймлайн сцен, переходы, субтитры, звук |
| `src/cues.ts` | закадровый текст по секундам |
| `src/scenes/S01…S16` | сцены |
| `src/illustrations.tsx` | корабль, купола, медресе, минареты, верблюды, пиала, лепёшка |
| `src/components.tsx` | заголовки, плашки, субтитры, узор икат, майолика |
| `src/geo.ts` | данные карт, координаты городов, схема Арала |
