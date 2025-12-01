#!/usr/bin/env bash
set -euo pipefail

if command -v k3s >/dev/null 2>&1; then
  echo "k3s already installed. Skipping."
  exit 0
fi

echo "Installing k3s..."
curl -sfL https://get.k3s.io | sh -
echo "k3s installation complete."
