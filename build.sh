#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

find . -mindepth 1 -maxdepth 1 \
  ! -name '.git' \
  ! -name '.DS_Store' \
  ! -name 'dist' \
  -exec cp -R {} dist/ \;
