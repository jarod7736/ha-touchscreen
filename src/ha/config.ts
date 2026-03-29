// HA connection config — set via environment variables
// Create a .env.local file with:
//   VITE_HA_URL=ws://homeassistant.local:8123/api/websocket
//   VITE_HA_TOKEN=your_long_lived_access_token

export const HA_URL = import.meta.env.VITE_HA_URL ?? "ws://homeassistant.local:8123/api/websocket";
export const HA_TOKEN = import.meta.env.VITE_HA_TOKEN ?? "";
