# ClimateCard Dial Redesign

**Date:** 2026-04-01
**Status:** Approved

## Problem

The current `ClimateCard` shows temperature as text with plain +/− buttons. It lacks visual feedback about how the target relates to the available range, and mode switching is not available from the touchscreen.

## Solution

Redesign `ClimateCard` with a full-ring SVG dial showing the target temperature as a filled arc, +/− buttons below the ring, and tappable mode pills beneath that.

## Layout

```
┌────────────────────────────────────┐
│ Living Room                        │
│                                    │
│         ╭───────────╮              │
│       ╱               ╲            │
│      │   current        │           │
│      │     71°          │           │
│      │    → 72°         │           │
│       ╲               ╱            │
│         ╰───────────╯              │
│                                    │
│       [−]   target   [+]           │
│                                    │
│    [Heat]  [Cool]  [Auto]  [Off]   │
└────────────────────────────────────┘
```

Card remains `col-span-2`.

## Component: `ClimateCard`

**File:** `src/components/cards.tsx`

### Props
```ts
{ entityId: string }
```

### Ring Dial

- Single `<svg>` (200×200) with two `<circle>` elements using `stroke-dasharray`
- Both circles: `r="82"`, `stroke-width="16"`, `stroke-linecap="round"`, `transform="rotate(90 100 100)"`
- **Track circle**: `stroke-dasharray="462 53"`, `stroke-dashoffset="-26"`, `stroke="#ffffff12"` — the 53px gap faces downward
- **Fill circle**: same geometry, `stroke-dasharray` dynamically computed:
  - `frac = clamp((target - 60) / (85 - 60), 0, 1)`
  - `fillLen = frac × 462`
  - `stroke-dasharray="${fillLen} ${515 - fillLen}"`
  - CSS `transition: stroke-dasharray 300ms ease, stroke 300ms ease`
- Temp range: 60–85°F (hardcoded; sufficient for residential HVAC)

### Ring color by mode

| Mode | Color |
|------|-------|
| heat | `#f59e0b` (amber) |
| cool | `#60a5fa` (blue) |
| auto | `#34d399` (green) |
| off  | `#6b7280` (gray) |

Card border also shifts to `{modeColor}40`.

### Center overlay

Absolutely positioned over the SVG:
- "current" label — `text-xs text-white/40 uppercase tracking-widest`
- Current temp — `text-5xl font-bold text-white` (`current_temperature` attribute)
- Target temp — `text-sm` colored with mode color, format `→ {target}°`

### +/− buttons

Row below the dial with `gap-[7px]` between dial and row:
- `−` button: `w-12 h-12 rounded-full bg-white/10 text-2xl text-white`
- "target" label: `text-xs text-white/40 uppercase tracking-wider` centered between buttons
- `+` button: `w-12 h-12 rounded-full text-2xl font-bold text-black`, background = mode color

Both buttons:
- Disabled (`opacity-30 pointer-events-none`) when `hvac_mode === "off"`
- `onClick`: `callService("climate", "set_temperature", { entity_id, temperature: target ± 1 })`
- `e.stopPropagation()` on each

Target temp read from `entity.attributes.temperature`. Current temp from `entity.attributes.current_temperature`.

### Mode pills

Row of pills, one per entry in `entity.attributes.hvac_modes`:
- Active pill: filled with mode color, text black (or white for "off")
- Inactive pills: `bg-white/10 text-white/60`
- `onClick`: `callService("climate", "set_hvac_mode", { entity_id, hvac_mode: mode })`

### On/off state (`Card` `on` prop)

`on={entity.state !== "off"}` — preserves the amber border glow when heating/cooling is active.

## What Does Not Change

- `Section` component — unchanged
- All other card types — unchanged
- Tab structure and routing — unchanged
- HA WebSocket layer — unchanged
