#!/usr/bin/env bash
# Pi Kiosk Setup Script
# Run once on a fresh Raspberry Pi OS Lite install
# Usage: bash setup.sh

set -e

KIOSK_USER="${SUDO_USER:-pi}"
APP_DIR="/var/www/ha-touchscreen"
KIOSK_URL="http://localhost"

echo "==> Setting up HA Touchscreen Kiosk"
echo "    User: $KIOSK_USER"
echo "    App dir: $APP_DIR"

# ── Dependencies ────────────────────────────────────────────────────────────
echo "==> Installing packages..."
apt-get update -qq
apt-get install -y \
  xserver-xorg \
  x11-xserver-utils \
  xinit \
  openbox \
  chromium-browser \
  nginx \
  unclutter \
  xdotool \
  libinput-tools \
  xinput \
  xinput-calibrator

# ── App directory ────────────────────────────────────────────────────────────
echo "==> Creating app directory..."
mkdir -p "$APP_DIR"
chown "$KIOSK_USER:$KIOSK_USER" "$APP_DIR"

# ── nginx ────────────────────────────────────────────────────────────────────
echo "==> Configuring nginx..."
cp "$(dirname "$0")/nginx.conf" /etc/nginx/sites-available/ha-touchscreen
ln -sf /etc/nginx/sites-available/ha-touchscreen /etc/nginx/sites-enabled/ha-touchscreen
rm -f /etc/nginx/sites-enabled/default
systemctl enable nginx
systemctl restart nginx

# ── Kiosk scripts ────────────────────────────────────────────────────────────
echo "==> Installing kiosk scripts..."
cp "$(dirname "$0")/start-kiosk.sh" /usr/local/bin/start-kiosk
chmod +x /usr/local/bin/start-kiosk

# ── systemd service ──────────────────────────────────────────────────────────
echo "==> Installing kiosk systemd service..."
sed "s/{{USER}}/$KIOSK_USER/g" "$(dirname "$0")/kiosk.service" \
  > /etc/systemd/system/kiosk.service
systemctl daemon-reload
systemctl enable kiosk.service

# ── Auto-login on tty1 ───────────────────────────────────────────────────────
echo "==> Enabling auto-login for $KIOSK_USER on tty1..."
mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf <<EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $KIOSK_USER --noclear %I \$TERM
EOF
systemctl daemon-reload

# ── Disable screen blanking ──────────────────────────────────────────────────
echo "==> Disabling screen blanking in X..."
if ! grep -q "xserver-command" /etc/lightdm/lightdm.conf 2>/dev/null; then
  cat >> /home/"$KIOSK_USER"/.bashrc <<'EOF'

# Start kiosk on tty1 login
if [ "$(tty)" = "/dev/tty1" ]; then
  exec startx /usr/local/bin/start-kiosk -- -nocursor 2>/tmp/kiosk.log
fi
EOF
fi

echo ""
echo "==> Done! Reboot to start the kiosk."
echo "    Deploy your app with: ./deploy.sh <pi-hostname-or-ip>"
