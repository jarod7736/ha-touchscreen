#!/usr/bin/env bash
# Kiosk launcher — runs as the X session
# Called by: startx /usr/local/bin/start-kiosk

KIOSK_URL="http://localhost"
LOG="/tmp/kiosk.log"

# ── Display tweaks ────────────────────────────────────────────────────────────
# Disable screen blanking and power saving
xset s off
xset s noblank
xset -dpms

# Hide cursor after 3 seconds of inactivity
unclutter -idle 3 -root &

# ── Openbox (window manager) ─────────────────────────────────────────────────
openbox &

# ── Touch rotation (uncomment and adjust if touch is rotated/inverted) ───────
# Find device id: xinput list
# Flip matrix for 180°: xinput set-prop <id> "Coordinate Transformation Matrix" -1 0 1 0 -1 1 0 0 1
# Flip for 90° clockwise:  xinput set-prop <id> "Coordinate Transformation Matrix" 0 1 0 -1 0 1 0 0 1

# ── Chromium kiosk ───────────────────────────────────────────────────────────
# Wait for nginx to be ready
sleep 1

chromium-browser \
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
  --fast \
  --fast-start \
  --disable-default-apps \
  --touch-events=enabled \
  --enable-touch-drag-drop \
  "$KIOSK_URL" >> "$LOG" 2>&1

# If Chromium exits, restart the kiosk
exec "$0"
