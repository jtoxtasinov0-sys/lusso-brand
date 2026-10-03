#!/bin/bash
# Tayyor MP4 dan har 1 soniyada kadr olib, 8 talik montajlar yasaydi: ./qa.sh video.mp4 prefix
v=$1; pre=$2; d=build/qa/$pre; rm -rf $d; mkdir -p $d
ffmpeg -loglevel error -i "$v" -vf fps=1 $d/f%03d.png
ls $d/f*.png | split -l 8 - $d/grp_
for g in $d/grp_*; do ./montage.sh $d/m_$(basename $g).png $(cat $g); done
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of compact "$v"
ffmpeg -i "$v" -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
