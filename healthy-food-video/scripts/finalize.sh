#!/usr/bin/env bash
# Converts a Remotion render (full-range BT.601 "yuvj420p") into standard limited-range BT.709 yuv420p H.264,
# the most compatible form for YouTube, Telegram and phone players. Audio is copied as is.
#   scripts/finalize.sh in.mp4 out.mp4 [crf]
set -euo pipefail
in="$1"; out="$2"; crf="${3:-18}"
ffmpeg -hide_banner -loglevel error -stats -y -i "$in" \
  -vf "scale=in_range=full:in_color_matrix=bt601:out_range=tv:out_color_matrix=bt709:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p" \
  -c:v libx264 -preset medium -crf "$crf" -profile:v high \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -c:a copy -movflags +faststart "$out"
