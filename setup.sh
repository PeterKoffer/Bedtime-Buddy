#!/usr/bin/env bash
set -euo pipefail

if command -v apt-get >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y --no-install-recommends nodejs npm
  apt-get clean
  rm -rf /var/lib/apt/lists/*
fi

if [ -f package.json ]; then
  npm install
else
  echo "package.json not found, skipping npm install"
fi
