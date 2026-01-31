#!/bin/bash
# Extract PDF to text using docker + pdftotext

PDF_PATH=$1
OUTPUT_PATH=${2:-${PDF_PATH%.pdf}.txt}

docker run --rm -v "$(dirname "$PDF_PATH"):/data" \
  minidocks/poppler \
  pdftotext -layout "/data/$(basename "$PDF_PATH")" "/data/$(basename "$OUTPUT_PATH")"

echo "Extracted to: $OUTPUT_PATH"
