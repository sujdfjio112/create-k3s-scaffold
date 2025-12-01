#!/usr/bin/env bash
set -euo pipefail

echo "=== Starting CentOS one-click installation ==="

# 依赖
echo "[Step 1] Installing dependencies..."
yum install -y curl bash sudo || echo "Dependencies already installed"

# Node.js
if command -v node >/dev/null 2>&1; then
  echo "[Step 2] Node.js already installed, skipping..."
else
  echo "[Step 2] Installing Node.js 18..."
  curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
  yum install -y nodejs
fi

# k3s1
if command -v k3s >/dev/null 2>&1; then
  echo "[Step 3] k3s already installed, skipping..."
else
  echo "[Step 3] Installing k3s..."
  curl -sfL https://get.k3s.io | sh -
fi

# kubectl
if command -v kubectl >/dev/null 2>&1; then
  echo "[Step 4] kubectl already installed, skipping..."
else
  echo "[Step 4] Installing kubectl..."
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  chmod +x kubectl
  mv kubectl /usr/local/bin/
fi

# CLI
if command -v create-k3s-scaffold >/dev/null 2>&1; then
  echo "[Step 5] CLI already installed, skipping..."
else
  echo "[Step 5] Installing create-k3s-scaffold CLI..."
  npm install -g .
fi

echo "=== Installation complete! ==="
echo "You can now run:"
echo "  create-k3s-scaffold init <project-name> --install-k3s"
