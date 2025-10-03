#!/usr/bin/env bash
set -euo pipefail

MIN_NODE_MAJOR=18

have_command() {
  command -v "$1" >/dev/null 2>&1
}

current_node_major() {
  if have_command node; then
    node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0
  else
    echo 0
  fi
}

ensure_apt_dependencies() {
  export DEBIAN_FRONTEND=noninteractive
  apt-get update
  apt-get install -y --no-install-recommends ca-certificates curl gnupg
}

install_node_with_apt() {
  ensure_apt_dependencies
  local node_major
  node_major=$(current_node_major)

  if [ "$node_major" -lt "$MIN_NODE_MAJOR" ]; then
    curl -fsSL https://deb.nodesource.com/setup_${MIN_NODE_MAJOR}.x | bash -
    apt-get install -y --no-install-recommends nodejs
  fi

  apt-get clean
  rm -rf /var/lib/apt/lists/*
}

install_node_if_needed() {
  local node_major
  node_major=$(current_node_major)

  if [ "$node_major" -ge "$MIN_NODE_MAJOR" ]; then
    echo "Detected Node.js $(node -v), no installation needed."
    return
  fi

  if have_command apt-get; then
    echo "Installing Node.js ${MIN_NODE_MAJOR}.x via apt-get..."
    install_node_with_apt
  else
    echo "Error: Node.js ${MIN_NODE_MAJOR}.x is required but could not be installed automatically." >&2
    echo "Please install Node.js ${MIN_NODE_MAJOR}.x or newer and re-run this script." >&2
    exit 1
  fi
}

run_npm_install() {
  if [ -f package.json ]; then
    if [ -f package-lock.json ]; then
      npm ci
    else
      npm install
    fi
  else
    echo "package.json not found, skipping npm install"
  fi
}

install_node_if_needed

if have_command npm; then
  run_npm_install
else
  echo "npm command not found even after attempting installation." >&2
  exit 1
fi
