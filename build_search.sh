#!/usr/bin/env bash
#
# Regenerate the tinysearch WASM index from the current Jekyll posts, then
# commit the result. Run this after adding or removing posts.
#
set -euo pipefail

cd "$(dirname "$0")"

TINYSEARCH_IMAGE="tinysearch/cli:0.11.1"
INPUT="_site/search.json"
OUT_DIR="assets/tinysearch"

echo "Building Jekyll site..."
bundle exec jekyll build

if [ ! -f "$INPUT" ]; then
  echo "ERROR: $INPUT not found. Ensure search.json exists in the repo root." >&2
  exit 1
fi

echo "Generating WASM with $TINYSEARCH_IMAGE..."
docker run --rm -v "$PWD":/app "$TINYSEARCH_IMAGE" \
  --release -m wasm -p "/app/$OUT_DIR" "/app/$INPUT"

echo "Regenerated $OUT_DIR/tinysearch_engine.wasm"
