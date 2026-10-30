#!/usr/bin/env bash
# Сборка ролика «Земля-2126» и экспорт двух файлов: для YouTube (4K) и для Telegram (1080p).
#
#   ./assemble.sh build              клипы из clips/ по edl.csv + audio/ -> мастер и оба файла
#   ./assemble.sh export master.mov  готовый монтаж (например, из DaVinci) -> оба файла
#
# Ожидаемые файлы для build:
#   clips/S01-1.mp4 … clips/S25-1.mp4   (имена — из edl.csv; отсутствующий клип заменяется чёрным кадром)
#   audio/voiceover.wav                  голос, 15:00 (необязательно)
#   audio/music.wav                      музыка, 15:00 (необязательно; приглушается под голосом)
#
# Переменные окружения (по умолчанию — значения для публикации):
#   W=3840 H=2160      разрешение мастера и YouTube-файла
#   FPS=24             частота кадров; клипы с меньшей частотой интерполируются (медленно, см. ниже)
#   INTERP=1           0 — не интерполировать, а просто повторять кадры
#   CODEC=h264         h264 или hevc для YouTube-файла
#   TG_H=1080          высота Telegram-файла
set -euo pipefail
cd "$(dirname "$0")"

W=${W:-3840}; H=${H:-2160}; FPS=${FPS:-24}; CODEC=${CODEC:-h264}; TG_H=${TG_H:-1080}
TG_W=$(( TG_H * 16 / 9 / 2 * 2 ))
OUT=out; BUILD=build
NORM="$BUILD/norm_${W}x${H}_${FPS}"   # кэш привязан к параметрам: смена разрешения не смешает клипы
mkdir -p "$OUT" "$NORM"

log() { printf '\033[1;36m==>\033[0m %s\n' "$*"; }

# Частота клипа не ниже целевой — просто приводим к FPS; ниже — интерполируем движение.
# Интерполяция ffmpeg очень медленная (часы на 4K): для всего ролика лучше заранее перевести
# клипы в 60 fps в Topaz Video AI или Flowframes (RIFE) — тогда здесь они пройдут без пересчёта.
motion_filter() {
  local src_fps
  src_fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of csv=p=0 "$1" \
            | awk -F/ '{ print ($2 > 0 ? $1 / $2 : 0) }')
  if [ "${INTERP:-1}" = 0 ] || awk -v s="$src_fps" -v t="$FPS" 'BEGIN { exit !(s == 0 || s >= t - 0.1) }'; then
    echo "fps=${FPS}"
  else
    echo "minterpolate=fps=${FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
  fi
}

build_video() {
  local list="$BUILD/concat.txt"
  : > "$list"
  tail -n +2 edl.csv | while IFS=, read -r clip dur _; do
    local src="clips/$clip.mp4" dst="$NORM/$clip.mp4"
    if [ -f "$dst" ] && [ "$dst" -nt "$src" ] 2>/dev/null; then :
    elif [ -f "$src" ]; then
      log "клип $clip ($dur с)"
      # Заполнить кадр 16:9 без полос, привести частоту, обрезать или дотянуть последним кадром до длительности.
      ffmpeg -nostdin -loglevel error -y -i "$src" -an \
        -vf "scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},setsar=1,$(motion_filter "$src"),tpad=stop_mode=clone:stop_duration=${dur},trim=duration=${dur},setpts=PTS-STARTPTS,format=yuv420p" \
        -r "$FPS" -c:v libx264 -preset medium -crf 12 "$dst"
    else
      echo "  ! нет $src — вставляю чёрный кадр на $dur с" >&2
      ffmpeg -nostdin -loglevel error -y -f lavfi -i "color=c=black:s=${W}x${H}:r=${FPS}:d=${dur}" \
        -c:v libx264 -preset medium -crf 12 -pix_fmt yuv420p "$dst"
    fi
    echo "file '$(basename "$NORM")/$clip.mp4'" >> "$list"
  done
  log "склейка видеоряда"
  ffmpeg -nostdin -loglevel error -y -f concat -safe 0 -i "$list" -c copy "$BUILD/video.mp4"
}

build_audio() {
  local vo=audio/voiceover.wav mu=audio/music.wav
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$BUILD/video.mp4")
  log "сведение звука"
  if [ -f "$vo" ] && [ -f "$mu" ]; then
    # Музыка приглушается под голосом (sidechain), затем общая громкость по стандарту YouTube −14 LUFS.
    # loudnorm отдаёт звук в 192 кГц, поэтому после него — обратно в 48 кГц.
    ffmpeg -nostdin -loglevel error -y -i "$vo" -i "$mu" -filter_complex \
      "[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[vo][key];
       [1:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.6[mu];
       [mu][key]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck];
       [vo][duck]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1:LRA=11,aresample=48000,apad,atrim=0:${dur}[a]" \
      -map "[a]" -c:a pcm_s24le "$BUILD/mix.wav"
  elif [ -f "$vo" ] || [ -f "$mu" ]; then
    local one; one=$([ -f "$vo" ] && echo "$vo" || echo "$mu")
    ffmpeg -nostdin -loglevel error -y -i "$one" \
      -af "aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1:LRA=11,aresample=48000,apad,atrim=0:${dur}" \
      -c:a pcm_s24le "$BUILD/mix.wav"
  else
    echo "  ! нет audio/voiceover.wav и audio/music.wav — ролик будет без звука" >&2
    ffmpeg -nostdin -loglevel error -y -f lavfi -i "anullsrc=r=48000:cl=stereo" -t "$dur" -c:a pcm_s24le "$BUILD/mix.wav"
  fi
  log "мастер"
  ffmpeg -nostdin -loglevel error -y -i "$BUILD/video.mp4" -i "$BUILD/mix.wav" \
    -map 0:v -map 1:a -c:v copy -c:a pcm_s24le -shortest "$BUILD/master.mov"
}

export_files() {
  local master=$1
  log "YouTube: ${W}×${H}, ${CODEC}, AAC 320 кбит/с"
  if [ "$CODEC" = hevc ]; then
    venc=(-c:v libx265 -preset slow -crf 18 -tag:v hvc1 -x265-params log-level=error)
  else
    # Рекомендация YouTube для 4K SDR 24–30 fps — 35–45 Мбит/с; CRF 16 с потолком 60 Мбит/с даёт запас качества.
    venc=(-c:v libx264 -preset slow -crf 16 -maxrate 60M -bufsize 120M -profile:v high -level 5.1)
  fi
  ffmpeg -nostdin -loglevel error -stats -y -i "$master" \
    -vf "scale=${W}:${H}:flags=lanczos,setsar=1,format=yuv420p" "${venc[@]}" \
    -g $(( FPS / 2 )) -bf 2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 320k -ar 48000 -movflags +faststart "$OUT/earth-2126_youtube_${H}p.mp4"

  log "Telegram: ${TG_W}×${TG_H}, H.264, AAC 192 кбит/с"
  # Telegram воспроизводит H.264 + AAC в MP4 прямо в чате; faststart — чтобы видео начинало играть сразу.
  ffmpeg -nostdin -loglevel error -stats -y -i "$master" \
    -vf "scale=${TG_W}:${TG_H}:flags=lanczos,setsar=1,format=yuv420p" \
    -c:v libx264 -preset slow -crf 20 -maxrate 8M -bufsize 16M -profile:v high -level 4.1 \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
    -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT/earth-2126_telegram_${TG_H}p.mp4"

  local tg="$OUT/earth-2126_telegram_${TG_H}p.mp4" size
  size=$(stat -c %s "$tg")
  if [ "$size" -gt 2000000000 ]; then
    echo "  ! Telegram-файл больше 2 ГБ ($((size/1000000)) МБ): без Premium не загрузится — повысьте CRF" >&2
  fi
  log "готово:"
  for f in "$OUT"/earth-2126_*; do
    printf '   %s  %s МБ  %s\n' "$f" "$(( $(stat -c %s "$f") / 1000000 ))" \
      "$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate:format=duration -of csv=p=0 "$f" | paste -sd' ')"
  done
}

case "${1:-}" in
  build)  build_video; build_audio; export_files "$BUILD/master.mov" ;;
  export) [ -f "${2:-}" ] || { echo "укажите файл: ./assemble.sh export master.mov" >&2; exit 1; }
          export_files "$2" ;;
  *)      awk 'NR > 1 && /^#/ { sub(/^# ?/, ""); print; next } NR > 1 { exit }' "$0"; exit 1 ;;
esac
