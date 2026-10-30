#!/usr/bin/env bash
# Финальная сборка фильма «Земля-2126».
#   1) склеивает отрендеренные части видео (build/part*_4k.mp4)
#   2) сводит звук: музыка + звуки (+ голос, если есть build/voice.wav — музыка приглушается под ним) → −14 LUFS, 48 кГц
#   3) делает субтитры (film/subs.py) и вшивает их
#   4) экспортирует out/earth-2126_youtube_2160p.mp4 и out/earth-2126_telegram_1080p.mp4
# Переменные: SUBS_YT=1|0 — вшивать ли субтитры в YouTube-версию (по умолчанию 1 без голоса, 0 с голосом:
# тогда загрузите subtitles_ru.srt на YouTube как отдельные субтитры).
set -euo pipefail
cd "$(dirname "$0")/.."
B=build
O=out
mkdir -p "$O"
log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

log "склейка видео"
ls "$B"/part*_4k.mp4 | sort -V | sed "s|^|file '$PWD/|;s|$|'|" > "$B/parts.txt"
ffmpeg -nostdin -y -loglevel error -f concat -safe 0 -i "$B/parts.txt" -c copy "$B/video_4k.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$B/video_4k.mp4")
log "длительность видео: $DUR с"

log "сведение звука"
if [ -f "$B/voice.wav" ]; then
  VOICE=1
  ffmpeg -nostdin -y -loglevel error -i "$B/music.wav" -i "$B/sfx.wav" -i "$B/voice.wav" -filter_complex \
    "[2:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v][key];
     [0:a]aresample=48000,volume=0.8,volume=enable='between(t,551.5,566.5)':volume=0.45[m];
     [m][key]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=500[duck];
     [1:a]aresample=48000,volume=0.6[s];
     [duck][s][v]amix=inputs=3:normalize=0,highpass=f=28,loudnorm=I=-14:TP=-1:LRA=11,aresample=48000,apad,atrim=0:$DUR[a]" \
    -map "[a]" -c:a pcm_s16le "$B/mix.wav"
else
  VOICE=0
  ffmpeg -nostdin -y -loglevel error -i "$B/music.wav" -i "$B/sfx.wav" -filter_complex \
    "[0:a]aresample=48000,volume=0.9,volume=enable='between(t,551.5,566.5)':volume=0.45[m];[1:a]aresample=48000,volume=0.6[s];
     [m][s]amix=inputs=2:normalize=0,highpass=f=28,loudnorm=I=-14:TP=-1:LRA=11,aresample=48000,apad,atrim=0:$DUR[a]" \
    -map "[a]" -c:a pcm_s16le "$B/mix.wav"
fi

log "субтитры"
python3 film/subs.py
SUBS_YT=${SUBS_YT:-$((1 - VOICE))}
ASS="ass=$B/subs.ass:fontsdir=/usr/share/fonts/opentype/inter"

log "YouTube: 3840×2160, H.264, AAC 320 кбит/с (субтитры вшиты: $SUBS_YT)"
if [ "$SUBS_YT" = 1 ]; then VF="$ASS,format=yuv420p"; else VF="format=yuv420p"; fi
ffmpeg -nostdin -y -loglevel error -stats -i "$B/video_4k.mp4" -i "$B/mix.wav" -map 0:v -map 1:a \
  -vf "$VF" -c:v libx264 -preset medium -crf 18 -maxrate 50M -bufsize 100M -profile:v high -level 5.1 -g 15 -bf 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$O/earth-2126_youtube_2160p.mp4"

log "Telegram: 1920×1080, H.264, AAC 192 кбит/с, субтитры вшиты (видео в ленте играет без звука)"
ffmpeg -nostdin -y -loglevel error -stats -i "$B/video_4k.mp4" -i "$B/mix.wav" -map 0:v -map 1:a \
  -vf "scale=1920:1080:flags=lanczos,$ASS,format=yuv420p" -c:v libx264 -preset slow -crf 21 -maxrate 6M -bufsize 12M \
  -profile:v high -level 4.1 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$O/earth-2126_telegram_1080p.mp4"

log "готово:"
for f in "$O"/earth-2126_*.mp4; do
  printf '   %s  %s МБ  %s\n' "$f" "$(( $(stat -c %s "$f") / 1000000 ))" \
    "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate:format=duration -of csv=p=0 "$f" | paste -sd' ')"
done
