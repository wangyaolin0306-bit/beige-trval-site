#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist
rsync -a \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude 'dist' \
  ./ dist/
