#!/usr/bin/env bash
# Deploy built app to the Pi
# Usage: ./pi/deploy.sh <pi-host>
# Example: ./pi/deploy.sh pi@touchscreen.holdfast.lan

set -e

PI_HOST="${1:?Usage: $0 <user@pi-host>}"
APP_DIR="/var/www/ha-touchscreen"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building app..."
cd "$SCRIPT_DIR"
npm run build

echo "==> Deploying to $PI_HOST:$APP_DIR..."
rsync -avz --delete dist/ "$PI_HOST:$APP_DIR/"

echo "==> Done. Reloading nginx..."
ssh "$PI_HOST" "sudo systemctl reload nginx"

echo ""
echo "Deployed to http://$PI_HOST"
