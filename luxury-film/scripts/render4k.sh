#!/bin/bash
# 4K master, rendered in four chunks (video only), then joined and muxed with the 48 kHz mix.
#   scripts/render4k.sh [composition] [output name] [audio file in public/]
#   scripts/render4k.sh Luxury     luxury-film-4k-vo   soundtrack_vo.wav   → 2160×3840
#   scripts/render4k.sh LuxuryWide luxury-film-wide-4k soundtrack_vo.wav   → 3840×2160
# Chunks that already exist are skipped, so a failed run can simply be restarted.
COMP=${1:-Luxury}
NAME=${2:-luxury-film-4k-vo}
AUDIO=${3:-soundtrack_vo.wav}
cd "$(dirname "$0")/.."
D=out/4k-$COMP
mkdir -p $D
LOG=$D/progress.log
echo "RESTART $(date)" >> $LOG
for i in 0 1 2 3; do
  a=$((i*450)); b=$((a+449))
  if [ ! -s $D/part$i.mp4 ]; then
    echo "CHUNK $i $a-$b" >> $LOG
    npx remotion render src/index.ts $COMP $D/part$i.mp4 --frames=$a-$b --scale=2 --muted --timeout=240000 \
      --codec=h264 --crf=16 --pixel-format=yuv420p --concurrency=4 >> $LOG 2>&1 || { rm -f $D/part$i.mp4; echo "FAILED chunk $i" >> $LOG; exit 1; }
  fi
done
printf "file 'part0.mp4'\nfile 'part1.mp4'\nfile 'part2.mp4'\nfile 'part3.mp4'\n" > $D/list.txt
ffmpeg -v error -y -f concat -safe 0 -i $D/list.txt -i public/$AUDIO -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/$NAME.mp4 >> $LOG 2>&1 \
  && echo "ALL-DONE" >> $LOG || echo "FAILED mux" >> $LOG
