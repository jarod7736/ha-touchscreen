# HA Touchscreen Dashboard

Wall-mounted Home Assistant touchscreen dashboard for a Raspberry Pi LCD.

## Stack

- React 19 + Vite + TypeScript + Tailwind CSS 4
- HA WebSocket API (custom client — no external HA library)
- Node 22 via fnm (`~/.local/share/fnm`)
- `gh` CLI at `~/.local/bin/gh`

## Commands

```bash
npm run dev       # local dev server
npm run build     # tsc + vite build → dist/
npm run lint      # eslint
```

Deploy to Pi:
```bash
bash pi/deploy.sh   # build + rsync dist/ to Pi at 192.168.1.71
```

## Project Structure

```
src/
  ha/
    client.ts     — HAWebSocketClient (auth, reconnect, subscriptions, callService)
    context.tsx   — HAProvider, useHA(), useEntity() hooks
    config.ts     — reads VITE_HA_URL + VITE_HA_TOKEN from env
  components/
    cards.tsx     — LightCard, SwitchCard, SceneCard, LockCard, ClimateCard,
                    AlarmCard, MediaCard, SensorCard, Section
    TabBar.tsx    — bottom tab navigation
  tabs/
    HomeTab.tsx
    LivingRoomTab.tsx
    BedroomTab.tsx
    MediaRoomTab.tsx
    OutsideTab.tsx
    MiscTab.tsx
pi/
  deploy.sh         — build + rsync to Pi
  start-kiosk.sh    — labwc autostart script (source of truth for kiosk launch)
  setup.sh          — Pi first-run setup
  nginx.conf        — nginx config for serving dist/
  kiosk.service     — systemd unit (reference only; labwc autostart is preferred)
```

## HA Connection

- URL: `ws://homeassistant.holdfast.lan:8123/api/websocket`
- Token: `.env.local` (gitignored) — `VITE_HA_URL` + `VITE_HA_TOKEN`

## Pi Deployment

- OS: Raspberry Pi OS Bookworm with **labwc** (Wayland) — NOT X11
- Served by nginx from `/var/www/ha-touchscreen`
- Chromium kiosk must use `--ozone-platform=wayland` (touch requires Wayland)
- Touch device: "wch.cn TouchScreen" (USB), mapped via labwc `rc.xml` with `mouseEmulation=yes`

## Tabs

| Tab | Contents |
|-----|----------|
| Home | Clock, alarm, lock, thermostats, active light count, weather |
| Living Room | WiZ lights, scenes, LG TV |
| Bedroom | Lights + 14 Hue scenes |
| Media Room | Lights, scenes, home theater |
| Outside | Alarm, lock, 8 Rachio irrigation zones |
| Misc | Office lights, UniFi network switches, wake-up automation |
