# ClimateCard Dial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the text-based `ClimateCard` with a full-ring SVG dial, +/− buttons below the ring, and tappable mode pills.

**Architecture:** Single file edit — replace the `ClimateCard` function in `src/components/cards.tsx`. The ring is two SVG `<circle>` elements sharing the same geometry; the fill arc length is computed from the target temp as a fraction of a 60–85°F range using `stroke-dasharray`. Mode pills read `hvac_modes` from the entity attributes and call `set_hvac_mode`. No new files required.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Vite (no test runner — use `tsc -b` for type-checking and `npm run dev` for visual verification)

---

### Task 1: Define the mode color map and dial constants

**Files:**
- Modify: `src/components/cards.tsx` (add constants above `ClimateCard`)

This task adds the pure data needed by the dial so they're not inline magic numbers. It introduces no rendering changes.

- [ ] **Step 1: Add constants above the `ClimateCard` function**

In `src/components/cards.tsx`, find the `// ── Climate card ─────` comment and insert the following block immediately after it, before `export function ClimateCard`:

```ts
const CLIMATE_TEMP_MIN = 60;
const CLIMATE_TEMP_MAX = 85;
const DIAL_TRACK_LEN = 462;   // stroke length of the ~330° arc (r=82, full circ≈515)
const DIAL_TOTAL_CIRC = 515;  // 2π×82 rounded

const HVAC_MODE_COLOR: Record<string, string> = {
  heat: "#f59e0b",
  cool: "#60a5fa",
  auto: "#34d399",
  heat_cool: "#34d399",
  dry:  "#fb923c",
  fan_only: "#94a3b8",
  off:  "#6b7280",
};

function hvacColor(mode: string): string {
  return HVAC_MODE_COLOR[mode] ?? "#6b7280";
}

function dialFillLen(target: number): number {
  const frac = Math.max(0, Math.min(1, (target - CLIMATE_TEMP_MIN) / (CLIMATE_TEMP_MAX - CLIMATE_TEMP_MIN)));
  return frac * DIAL_TRACK_LEN;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/jarod7736/workspace/ha-touchscreen && npm run build 2>&1 | tail -20
```

Expected: build succeeds (or same errors as before — no new errors introduced).

- [ ] **Step 3: Commit**

```bash
git add src/components/cards.tsx
git commit -m "feat: add ClimateCard dial constants and helpers"
```

---

### Task 2: Implement the new `ClimateCard` JSX

**Files:**
- Modify: `src/components/cards.tsx` — replace the `ClimateCard` function body entirely

- [ ] **Step 1: Replace `ClimateCard` with the new implementation**

Find and replace the entire `export function ClimateCard` block (lines ~185–228) in `src/components/cards.tsx` with:

```tsx
export function ClimateCard({ entityId }: { entityId: string }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  if (!entity) return null;

  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const current = entity.attributes.current_temperature as number;
  const target = entity.attributes.temperature as number;
  const hvacMode = entity.state as string;
  const hvacModes = (entity.attributes.hvac_modes as string[]) ?? [hvacMode];
  const isOff = hvacMode === "off";
  const color = hvacColor(hvacMode);
  const fillLen = dialFillLen(target ?? current ?? CLIMATE_TEMP_MIN);

  const bump = (delta: number) => {
    callService("climate", "set_temperature", {
      entity_id: entityId,
      temperature: (target ?? current) + delta,
    });
  };

  const setMode = (mode: string) => {
    callService("climate", "set_hvac_mode", { entity_id: entityId, hvac_mode: mode });
  };

  // SVG dial geometry: two circles, both use stroke-dasharray to form a ~330° arc.
  // The 53px gap (DIAL_TOTAL_CIRC - DIAL_TRACK_LEN) faces downward via rotate(90).
  // stroke-dashoffset="-26" centers the gap at the bottom.
  const trackDash = `${DIAL_TRACK_LEN} ${DIAL_TOTAL_CIRC - DIAL_TRACK_LEN}`;
  const fillDash = `${fillLen} ${DIAL_TOTAL_CIRC - fillLen}`;

  return (
    <Card on={!isOff} className="col-span-2">
      {/* Room name */}
      <span className="text-xs tracking-widest uppercase text-white/50">{name}</span>

      {/* Dial */}
      <div className="flex flex-col items-center" style={{ gap: "7px" }}>
        <div className="relative" style={{ width: 200, height: 200 }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            {/* Track ring */}
            <circle
              cx="100" cy="100" r="82"
              fill="none"
              stroke="#ffffff12"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={trackDash}
              strokeDashoffset="-26"
              transform="rotate(90 100 100)"
            />
            {/* Fill ring */}
            <circle
              cx="100" cy="100" r="82"
              fill="none"
              stroke={color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={fillDash}
              strokeDashoffset="-26"
              transform="rotate(90 100 100)"
              style={{ transition: "stroke-dasharray 300ms ease, stroke 300ms ease" }}
            />
          </svg>

          {/* Center overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-[10px] uppercase tracking-widest text-white/40">current</span>
            <span className="text-5xl font-bold text-white leading-none">{current}°</span>
            <span className="text-sm" style={{ color, transition: "color 300ms" }}>
              → {target}°
            </span>
          </div>
        </div>

        {/* +/− row */}
        <div className="flex items-center gap-5">
          <button
            onClick={(e) => { e.stopPropagation(); bump(-1); }}
            disabled={isOff}
            className="w-12 h-12 rounded-full bg-white/10 text-2xl text-white flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
          >
            −
          </button>
          <span className="text-xs uppercase tracking-wider text-white/40 w-14 text-center">target</span>
          <button
            onClick={(e) => { e.stopPropagation(); bump(1); }}
            disabled={isOff}
            className="w-12 h-12 rounded-full text-2xl font-bold flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
            style={{ background: color, color: hvacMode === "off" ? "#fff" : "#000", transition: "background 300ms" }}
          >
            +
          </button>
        </div>
      </div>

      {/* Mode pills */}
      <div className="flex gap-2 flex-wrap justify-center">
        {hvacModes.map((mode) => {
          const active = mode === hvacMode;
          const modeColor = hvacColor(mode);
          return (
            <button
              key={mode}
              onClick={(e) => { e.stopPropagation(); setMode(mode); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all active:scale-95"
              style={
                active
                  ? { background: modeColor, color: mode === "off" ? "#fff" : "#000" }
                  : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }
              }
            >
              {mode.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/jarod7736/workspace/ha-touchscreen && npm run build 2>&1 | tail -20
```

Expected: build succeeds with no new TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/cards.tsx
git commit -m "feat: redesign ClimateCard with SVG dial, mode pills, and +/- buttons"
```

---

### Task 3: Visual verification

**Files:** none — this is a manual check step.

- [ ] **Step 1: Start the dev server**

```bash
cd /home/jarod7736/workspace/ha-touchscreen && npm run dev
```

- [ ] **Step 2: Open the dashboard and navigate to any tab with a thermostat**

`HomeTab` or `LivingRoomTab` — whichever has a `ClimateCard`. Verify:

- Ring fills proportionally to the target temperature (e.g. 72° in a 60–85 range ≈ 48% fill)
- Ring color matches the current HVAC mode (amber = heat, blue = cool, etc.)
- +/− buttons are below the ring, not overlapping it
- Tapping +/− updates `→ {target}°` in the center and adjusts the fill arc
- Mode pills appear for each mode in `hvac_modes`; active pill is filled with mode color
- Tapping a mode pill updates ring color, + button color, and center label color
- When mode is "off": ring is gray, +/− are dimmed and non-interactive
- Card border glows amber when on, subtle when off (inherited from `Card` `on` prop)

- [ ] **Step 3: Commit if any visual fixes were needed**

```bash
git add src/components/cards.tsx
git commit -m "fix: visual adjustments to ClimateCard dial"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Full-ring SVG via stroke-dasharray | Task 2 |
| Track + fill circles, r=82, stroke-width=16, stroke-linecap=round | Task 2 |
| rotate(90) transform, dashoffset="-26" for bottom gap | Task 2 |
| Fill length = clamp((target-60)/(85-60)) × 462 | Task 1 (`dialFillLen`) |
| 300ms CSS transition on stroke-dasharray and stroke | Task 2 |
| Mode color map (heat/cool/auto/off + extras) | Task 1 (`HVAC_MODE_COLOR`) |
| Center overlay: current label, current temp, target temp | Task 2 |
| +/− buttons below ring with 7px gap | Task 2 (`gap: "7px"`) |
| "target" label between +/− | Task 2 |
| +/− disabled + dimmed when off | Task 2 (`disabled={isOff}`) |
| +/− call set_temperature with ±1 | Task 2 (`bump`) |
| Mode pills from hvac_modes attribute | Task 2 |
| Active pill filled with mode color | Task 2 |
| Pill tap calls set_hvac_mode | Task 2 (`setMode`) |
| col-span-2 preserved | Task 2 (`className="col-span-2"`) |
| Card on={!isOff} for border glow | Task 2 |

**Placeholder scan:** None found.

**Type consistency:** `hvacColor`, `dialFillLen`, `DIAL_TRACK_LEN`, `DIAL_TOTAL_CIRC`, `CLIMATE_TEMP_MIN`, `CLIMATE_TEMP_MAX` defined in Task 1, used in Task 2. All match.
