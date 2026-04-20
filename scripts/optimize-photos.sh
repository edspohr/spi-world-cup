#!/usr/bin/env bash
# Optimiza fotos de jugadoras a WebP 256x256 (center-crop square) con slug filename.
# El logo preserva aspect ratio + transparencia.
#
# Requiere: cwebp (brew install webp), sips (macOS nativo).
# Uso: bash scripts/optimize-photos.sh

set -euo pipefail

PHOTOS_DIR="public/photos"
BACKUP_DIR="$PHOTOS_DIR/original"
TARGET_SIZE=256
QUALITY=85

mkdir -p "$BACKUP_DIR"

slugify() {
  # Normaliza vía Python (iconv TRANSLIT en macOS borra acentos en vez de transliterar).
  python3 -c "
import sys, unicodedata, re
s = sys.argv[1]
s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
s = s.lower()
s = re.sub(r'[^a-z0-9.]+', '-', s)
s = re.sub(r'-+', '-', s).strip('-')
print(s)
" "$1"
}

TABLE_FILE="$PHOTOS_DIR/_mapping.txt"
echo "# Mapping original → slug (copiar a Google Sheet columna URL_Foto)" > "$TABLE_FILE"
echo "# Generado: $(date)" >> "$TABLE_FILE"
echo >> "$TABLE_FILE"

shopt -s nullglob nocaseglob

TOTAL=0
TOTAL_ORIG=0
TOTAL_NEW=0

for src in "$PHOTOS_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  [[ -f "$src" ]] || continue
  base="$(basename "$src")"
  stem="${base%.*}"

  # El logo tiene tratamiento especial
  if [[ "$(echo "$stem" | tr '[:upper:]' '[:lower:]')" == "logo" ]]; then
    out="$PHOTOS_DIR/logo.webp"
    echo ">>> logo.png → logo.webp (preservando alpha + aspect ratio)"
    orig_bytes=$(stat -f%z "$src")
    cwebp -q 92 -alpha_q 100 -resize 0 256 "$src" -o "$out" 2>/dev/null
    new_bytes=$(stat -f%z "$out")
    cp -n "$src" "$BACKUP_DIR/" 2>/dev/null || true
    rm -f "$src"
    printf '   %8d B → %8d B  (%.1f%% reducción)\n' \
      "$orig_bytes" "$new_bytes" "$(bc -l <<< "($orig_bytes-$new_bytes)/$orig_bytes*100")"
    continue
  fi

  slug="$(slugify "$stem")"
  out="$PHOTOS_DIR/${slug}.webp"

  # Dimensiones originales
  read -r w h <<< "$(sips -g pixelWidth -g pixelHeight "$src" 2>/dev/null | awk '/pixel/ {print $2}' | tr '\n' ' ')"
  [[ -z "$w" || -z "$h" ]] && { echo "!!! no pude leer dims de $base, salto"; continue; }

  # Center crop a cuadrado
  if (( w > h )); then
    min=$h
    x_off=$(( (w - h) / 2 ))
    y_off=0
  else
    min=$w
    x_off=0
    y_off=$(( (h - w) / 2 ))
  fi

  orig_bytes=$(stat -f%z "$src")

  # cwebp: crop primero (en coords originales), luego resize a 256, encode q=85
  # Flags: -crop x y w h ; -resize w h ; -q quality ; -metadata none (strip EXIF)
  cwebp -q "$QUALITY" \
        -metadata none \
        -crop "$x_off" "$y_off" "$min" "$min" \
        -resize "$TARGET_SIZE" "$TARGET_SIZE" \
        "$src" -o "$out" 2>/dev/null

  new_bytes=$(stat -f%z "$out")
  reduction=$(bc -l <<< "($orig_bytes-$new_bytes)/$orig_bytes*100")

  printf '%-30s → %-32s  %7d KB → %5d KB  (%.1f%% reducción)\n' \
    "$base" "${slug}.webp" "$((orig_bytes/1024))" "$((new_bytes/1024))" "$reduction"

  echo "${base}  →  /photos/${slug}.webp" >> "$TABLE_FILE"

  cp -n "$src" "$BACKUP_DIR/" 2>/dev/null || true
  rm -f "$src"

  TOTAL=$((TOTAL + 1))
  TOTAL_ORIG=$((TOTAL_ORIG + orig_bytes))
  TOTAL_NEW=$((TOTAL_NEW + new_bytes))
done

echo
echo "────────────────────────────────────────────────────────────"
echo "Fotos procesadas: $TOTAL"
printf 'Peso total: %.1f MB → %.1f MB  (%.1f%% reducción global)\n' \
  "$(bc -l <<< "$TOTAL_ORIG/1048576")" \
  "$(bc -l <<< "$TOTAL_NEW/1048576")" \
  "$(bc -l <<< "($TOTAL_ORIG-$TOTAL_NEW)/$TOTAL_ORIG*100")"
echo "Originales respaldados en: $BACKUP_DIR"
echo "Mapping para Sheet: $TABLE_FILE"
