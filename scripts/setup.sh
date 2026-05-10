#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and set real secrets."
  exit 1
fi

npm install
echo "Setup complete."
