#!/usr/bin/env bash
# Kiosk launcher — runs as a labwc autostart entry (~/.config/labwc/autostart)
# Deploy: copy this file's contents into ~/.config/labwc/autostart on the Pi,
#         or run: pi/deploy-kiosk.sh <user@pi-host>

KIOSK_URL="http://localhost"
LOG="/tmp/kiosk.log"

# Disable screen blanking (via XWayland)
DISPLAY=:0 xset s off &
DISPLAY=:0 xset s noblank &
DISPLAY=:0 xset -dpms &

# Hide cursor after 3s idle
DISPLAY=:0 unclutter -idle 3 -root &

# Wait for nginx to be ready
sleep 2

# Launch Chromium with native Wayland backend (required for USB touch support)
# --ozone-platform=wayland overrides the RPi OS chromium wrapper default of x11
WAYLAND_DISPLAY=wayland-0 XDG_RUNTIME_DIR=/run/user/$(id -u) chromium \
  --ozone-platform=wayland \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --disable-features=TranslateUI \
  --disable-component-update \
  --no-first-run \
  --password-store=basic \
  --touch-events=enabled \
  --enable-touch-drag-drop \
  "$KIOSK_URL" >> "$LOG" 2>&1 &
