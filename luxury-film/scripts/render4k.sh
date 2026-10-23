#!/bin/bash
# 4K master (2160x3840): rendered in four chunks (video only), then joined and muxed with the 48 kHz score.
cd "$(dirname "$0")/.."
mkdir -p out/4k
LOG=out/4k/progress.log
echo "RESTART $(date)" >> $LOG
for i in 0 1 2 3; do
  a=$((i*450)); b=$((a+449))
  if [ ! -s out/4k/part$i.mp4 ]; then
    echo "CHUNK $i $a-$b" >> $LOG
    npx remotion render src/index.ts Luxury out/4k/part$i.mp4 --frames=$a-$b --scale=2 --muted --timeout=240000 \
      --codec=h264 --crf=16 --pixel-format=yuv420p --concurrency=4 >> $LOG 2>&1 || { echo "FAILED chunk $i" >> $LOG; exit 1; }
  fi
done
printf "file 'part0.mp4'\nfile 'part1.mp4'\nfile 'part2.mp4'\nfile 'part3.mp4'\n" > out/4k/list.txt
ffmpeg -v error -y -f concat -safe 0 -i out/4k/list.txt -i public/soundtrack.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -shortest -movflags +faststart out/luxury-film-4k.mp4 >> $LOG 2>&1 \
  && echo "ALL-DONE" >> $LOG || echo "FAILED mux" >> $LOG
