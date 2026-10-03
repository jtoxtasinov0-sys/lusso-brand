#!/bin/bash
# Kadrlarni bitta rasmga yig'ish (tekshiruv uchun): ./montage.sh out.png a.png b.png ...
out=$1; shift; n=$#; args=(); f=""; i=0
for x in "$@"; do args+=(-i "$x"); f+="[$i:v]scale=405:720[v$i];"; i=$((i+1)); done
cols=$(( n<4 ? n : 4 )); rows=$(( (n+cols-1)/cols )); lay=""
for ((k=0;k<n;k++)); do lay+="${lay:+|}$(( (k%cols)*405 ))_$(( (k/cols)*720 ))"; done
inp=""; for ((k=0;k<n;k++)); do inp+="[v$k]"; done
ffmpeg -loglevel error -y "${args[@]}" -filter_complex "${f}${inp}xstack=inputs=$n:layout=$lay:fill=gray" "$out"
