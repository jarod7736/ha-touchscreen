# Light Card Redesign

**Date:** 2026-04-01  
**Status:** Approved

## Problem

The current `LightCard` is a full-surface `<button>` that toggles the light on/off when tapped. This makes it impossible to add a brightness slider inside the card — any drag gesture on the slider also fires the card's click, toggling the light unexpectedly.

## Solution

Redesign `LightCard` so that:
- The card container is no longer a button
- On/off is controlled by a dedicated toggle switch in the top-right corner
- Brightness is controlled by a slider below the light name
- The two controls are independent touch targets with no overlap

## Layout

Keep the existing 2-column grid in `Section`. `LightCard` remains half-width (no `col-span-2`). The card layout is:

```
┌─────────────────────────┐
│ 💡  Light Name   [toggle]│
│                          │
│ [══════●══════════]      │
│  Dim       70%    Bright │
└─────────────────────────┘
```

## Component: `LightCard`

**File:** `src/components/cards.tsx`

### Props
```ts
{ entityId: string }
```

### Behavior

| Condition | Toggle | Slider |
|---|---|---|
| Light ON, dimmable | Amber, right | Amber fill, draggable |
| Light OFF, dimmable | Gray, left | Grayed out, disabled |
| Light ON, not dimmable | Amber, right | Hidden |
| Light OFF, not dimmable | Gray, left | Hidden |

### Toggle
- A styled `<button>` (not a checkbox) — amber background + right-positioned knob when on, gray + left when off
- Calls `callService("light", "turn_on" / "turn_off", { entity_id })`

### Brightness slider
- `<input type="range" min="0" max="100">`
- Visible only when `entity.attributes.brightness` exists (i.e. entity supports dimming)
- Value: `Math.round((entity.attributes.brightness / 255) * 100)`
- Disabled (`disabled` attribute) when light is off
- `onChange`: calls `callService("light", "turn_on", { entity_id, brightness_pct: value })` — HA accepts `brightness_pct` (0–100) directly
- Use `onPointerDown` with `e.stopPropagation()` on the slider to prevent any parent scroll conflicts

### Card container
- `<div>` not `<button>` — no onClick handler
- Styled identically to current on/off card states (amber border when on, subtle border when off)

## Scope

All `LightCard` usages across all tabs are updated automatically since it's a single shared component:

- `HomeTab` — 4 light cards
- `LivingRoomTab` — 6 light cards
- `BedroomTab` — 6 light cards
- `MediaRoomTab` — 3 light cards
- `OutsideTab` — 2 light cards
- `MiscTab` — 5 light cards

No other card types change (`SwitchCard`, `SceneCard`, `LockCard`, `ClimateCard`, `MediaCard`).

## What Does Not Change

- `Section` component — unchanged
- All other card types — unchanged
- Tab structure and routing — unchanged
- HA WebSocket layer — unchanged
