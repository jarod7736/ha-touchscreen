import { useEffect, useState } from "react";
import { useEntity, useHA } from "../ha/context";
import { HA_HTTP_URL } from "../ha/config";
import { useAuth, type AuthLevel } from "../ha/auth";

// ── Base card ────────────────────────────────────────────────────────────────

function Card({
  on,
  onClick,
  children,
  className = "",
}: {
  on?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex flex-col gap-2 rounded-2xl p-4 text-left transition-all active:scale-95",
        on
          ? "bg-amber-400/20 border border-amber-400/40"
          : "bg-white/5 border border-white/10",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm text-white/60 leading-tight">{children}</span>;
}

function CardState({ children, on }: { children: React.ReactNode; on?: boolean }) {
  return (
    <span className={["text-base font-medium", on ? "text-amber-300" : "text-white/40"].join(" ")}>
      {children}
    </span>
  );
}

// ── Light card ───────────────────────────────────────────────────────────────

export function LightCard({ entityId, protect }: { entityId: string; protect?: AuthLevel }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  const { requireAuth } = useAuth();
  if (!entity) return null;

  const on = entity.state === "on";
  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const rawBrightness = entity.attributes.brightness as number | null | undefined;
  const isDimmable = rawBrightness !== undefined;
  const brightnessPercent = rawBrightness != null ? Math.round((rawBrightness / 255) * 100) : 0;

  const guard = (action: () => void) => protect ? requireAuth(protect, action) : action();

  const toggle = () => guard(() => callService("light", on ? "turn_off" : "turn_on", { entity_id: entityId }));

  const handleBrightness = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    guard(() => callService("light", "turn_on", { entity_id: entityId, brightness_pct: pct }));
  };

  return (
    <div
      className={[
        "flex flex-col gap-2 rounded-2xl p-4 transition-all",
        on
          ? "bg-amber-400/20 border border-amber-400/40"
          : "bg-white/5 border border-white/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{on ? "💡" : "🔆"}</span>
          <span className="text-sm text-white/60 leading-tight truncate">{name}</span>
        </div>
        <button
          onClick={toggle}
          className={[
            "relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200",
            on ? "bg-amber-400" : "bg-white/20",
          ].join(" ")}
          aria-label={on ? "Turn off" : "Turn on"}
        >
          <span
            className={[
              "absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200",
              on ? "translate-x-[1.375rem]" : "translate-x-0.5",
            ].join(" ")}
          />
        </button>
      </div>

      {isDimmable && (
        <div className="flex flex-col gap-1 mt-1">
          <input
            type="range"
            min="0"
            max="100"
            value={brightnessPercent}
            disabled={!on}
            onChange={handleBrightness}
            onPointerDown={(e) => e.stopPropagation()}
            className={[
              "w-full accent-amber-400 cursor-pointer",
              !on ? "opacity-30 cursor-not-allowed" : "",
            ].join(" ")}
          />
          <div className="flex justify-between text-xs text-white/30">
            <span>Dim</span>
            <span>{brightnessPercent}%</span>
            <span>Bright</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Switch card ──────────────────────────────────────────────────────────────

export function SwitchCard({ entityId, icon = "🔌" }: { entityId: string; icon?: string }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  if (!entity) return null;

  const on = entity.state === "on";
  const name = (entity.attributes.friendly_name as string) ?? entityId;

  return (
    <Card on={on} onClick={() => callService("switch", on ? "turn_off" : "turn_on", { entity_id: entityId })}>
      <span className="text-2xl">{icon}</span>
      <CardLabel>{name}</CardLabel>
      <CardState on={on}>{on ? "On" : "Off"}</CardState>
    </Card>
  );
}

// ── Scene card ───────────────────────────────────────────────────────────────

export function SceneCard({ entityId, icon = "🎨", protect }: { entityId: string; icon?: string; protect?: AuthLevel }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  const { requireAuth } = useAuth();
  if (!entity) return null;

  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const action = () => callService("scene", "turn_on", { entity_id: entityId });

  return (
    <Card onClick={() => protect ? requireAuth(protect, action) : action()}>
      <span className="text-2xl">{icon}</span>
      <CardLabel>{name}</CardLabel>
      <CardState>Activate</CardState>
    </Card>
  );
}

// ── Lock card ────────────────────────────────────────────────────────────────

export function LockCard({ entityId, protect }: { entityId: string; protect?: AuthLevel }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  const { requireAuth } = useAuth();
  if (!entity) return null;

  const locked = entity.state === "locked";
  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const action = () => callService("lock", locked ? "unlock" : "lock", { entity_id: entityId });

  return (
    <Card
      on={locked}
      onClick={() => protect ? requireAuth(protect, action) : action()}
    >
      <span className="text-2xl">{locked ? "🔒" : "🔓"}</span>
      <CardLabel>{name}</CardLabel>
      <CardState on={locked}>{locked ? "Locked" : "Unlocked"}</CardState>
    </Card>
  );
}

// ── Climate card ─────────────────────────────────────────────────────────────

const CLIMATE_TEMP_MIN = 60;
const CLIMATE_TEMP_MAX = 85;
const DIAL_TRACK_LEN = 462;   // stroke length of the ~330° arc (r=82, full circ≈515)
const DIAL_TOTAL_CIRC = 515;  // 2π×82 rounded

const HVAC_MODE_COLOR: Record<string, string> = {
  heat:      "#ef4444",  // red
  cool:      "#60a5fa",  // blue
  auto:      "#34d399",
  heat_cool: "#34d399",
  dry:       "#fb923c",
  fan_only:  "#94a3b8",
  off:       "#6b7280",
};

function hvacColor(mode: string): string {
  return HVAC_MODE_COLOR[mode] ?? "#6b7280";
}

function dialFillLen(target: number): number {
  const frac = Math.max(0, Math.min(1, (target - CLIMATE_TEMP_MIN) / (CLIMATE_TEMP_MAX - CLIMATE_TEMP_MIN)));
  return frac * DIAL_TRACK_LEN;
}

export function ClimateCard({ entityId, protect }: { entityId: string; protect?: AuthLevel }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  const { requireAuth } = useAuth();
  if (!entity) return null;

  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const current = entity.attributes.current_temperature as number;
  const target = entity.attributes.temperature as number | undefined;
  const targetHigh = entity.attributes.target_temp_high as number | undefined;
  const targetLow  = entity.attributes.target_temp_low  as number | undefined;
  const hvacMode = entity.state as string;
  const hvacModes = (entity.attributes.hvac_modes as string[]) ?? [hvacMode];
  const isOff = hvacMode === "off";
  const isHeatCool = hvacMode === "heat_cool";
  const color = hvacColor(hvacMode);

  const guard = (action: () => void) => protect ? requireAuth(protect, action) : action();

  const bump = (delta: number) => guard(() => {
    if (isHeatCool) {
      callService("climate", "set_temperature", {
        entity_id: entityId,
        target_temp_high: (targetHigh ?? current) + delta,
        target_temp_low:  (targetLow  ?? current) + delta,
      });
    } else {
      callService("climate", "set_temperature", {
        entity_id: entityId,
        temperature: (target ?? current) + delta,
      });
    }
  });

  const setMode = (mode: string) => guard(() =>
    callService("climate", "set_hvac_mode", { entity_id: entityId, hvac_mode: mode })
  );

  // SVG dial: ~330° arc, gap centered at bottom via rotate(90) + dashoffset=-26
  const trackDash = `${DIAL_TRACK_LEN} ${DIAL_TOTAL_CIRC - DIAL_TRACK_LEN}`;

  // heat_cool: blue (cooling) arc drawn first, red (heating) arc on top
  const coolFill = isHeatCool ? dialFillLen(targetHigh ?? current) : 0;
  const heatFill = isHeatCool ? dialFillLen(targetLow  ?? current) : 0;
  const singleFill = !isHeatCool ? dialFillLen(target ?? current ?? CLIMATE_TEMP_MIN) : 0;

  const cardBg     = isOff ? "rgba(255,255,255,0.05)" : color + "22";
  const cardBorder = isOff ? "rgba(255,255,255,0.10)" : color + "66";

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl p-3"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, transition: "background 300ms, border-color 300ms" }}
    >
      <span className="text-xs tracking-widest uppercase text-white/50 truncate">{name}</span>

      {/* Dial */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Responsive square container — SVG + text overlay */}
        <div className="relative w-full mx-auto aspect-square" style={{ maxWidth: 160 }}>
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Track */}
            <circle cx="100" cy="100" r="82" fill="none"
              stroke="#ffffff12" strokeWidth="16" strokeLinecap="round"
              strokeDasharray={trackDash} strokeDashoffset="-26"
              transform="rotate(90 100 100)" />

            {isHeatCool ? (
              <>
                {/* Cooling arc (blue) — longer, drawn first */}
                <circle cx="100" cy="100" r="82" fill="none"
                  stroke="#60a5fa" strokeWidth="16" strokeLinecap="round"
                  strokeDasharray={`${coolFill} ${DIAL_TOTAL_CIRC - coolFill}`}
                  strokeDashoffset="-26" transform="rotate(90 100 100)"
                  style={{ transition: "stroke-dasharray 300ms ease" }} />
                {/* Heating arc (red) — shorter, drawn on top */}
                <circle cx="100" cy="100" r="82" fill="none"
                  stroke="#ef4444" strokeWidth="16" strokeLinecap="round"
                  strokeDasharray={`${heatFill} ${DIAL_TOTAL_CIRC - heatFill}`}
                  strokeDashoffset="-26" transform="rotate(90 100 100)"
                  style={{ transition: "stroke-dasharray 300ms ease" }} />
              </>
            ) : (
              <circle cx="100" cy="100" r="82" fill="none"
                stroke={color} strokeWidth="16" strokeLinecap="round"
                strokeDasharray={`${singleFill} ${DIAL_TOTAL_CIRC - singleFill}`}
                strokeDashoffset="-26" transform="rotate(90 100 100)"
                style={{ transition: "stroke-dasharray 300ms ease, stroke 300ms ease" }} />
            )}

            {/* Center text embedded in SVG for reliable responsive scaling */}
            <text x="100" y="90" textAnchor="middle"
              fill="rgba(255,255,255,0.4)" fontSize="9" letterSpacing="2">CURRENT</text>
            <text x="100" y="118" textAnchor="middle"
              fill="white" fontSize="36" fontWeight="bold">{current}°</text>
            {isHeatCool ? (
              <>
                <text x="76" y="136" textAnchor="middle" fill="#ef4444" fontSize="12">{targetLow}°</text>
                <text x="124" y="136" textAnchor="middle" fill="#60a5fa" fontSize="12">{targetHigh}°</text>
              </>
            ) : (
              <text x="100" y="136" textAnchor="middle" fontSize="12"
                fill={color} style={{ transition: "fill 300ms" }}>→ {target}°</text>
            )}
          </svg>
        </div>

        {/* +/− row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => bump(-1)}
            disabled={isOff}
            className="w-10 h-10 rounded-full bg-white/10 text-xl text-white flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
          >−</button>
          <span className="text-xs uppercase tracking-wider text-white/40 w-10 text-center">target</span>
          <button
            onClick={() => bump(1)}
            disabled={isOff}
            className="w-10 h-10 rounded-full text-xl font-bold flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
            style={{ background: isHeatCool ? "#34d399" : color, color: "#000", transition: "background 300ms" }}
          >+</button>
        </div>
      </div>

      {/* Mode pills */}
      <div className="flex gap-1 flex-wrap justify-center">
        {hvacModes.map((mode) => {
          const active = mode === hvacMode;
          const modeColor = hvacColor(mode);
          return (
            <button
              key={mode}
              onClick={() => setMode(mode)}
              className="px-2 py-1 rounded-full text-xs font-medium capitalize transition-all active:scale-95"
              style={
                active
                  ? { background: modeColor, color: mode === "off" ? "#fff" : "#000" }
                  : { background: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.60)" }
              }
            >
              {mode.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Alarm card ───────────────────────────────────────────────────────────────

export function AlarmCard({ entityId, protect }: { entityId: string; protect?: AuthLevel }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  const { requireAuth } = useAuth();
  if (!entity) return null;

  const state = entity.state;
  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const armed = state !== "disarmed";

  const toggle = () => {
    const action = () => armed
      ? callService("alarm_control_panel", "alarm_disarm", { entity_id: entityId })
      : callService("alarm_control_panel", "alarm_arm_away", { entity_id: entityId });
    protect ? requireAuth(protect, action) : action();
  };

  const stateColor = state === "disarmed"
    ? "text-green-400"
    : state.includes("arming") || state.includes("pending")
    ? "text-yellow-400"
    : "text-red-400";

  return (
    <Card on={armed} onClick={toggle}>
      <span className="text-2xl">{armed ? "🔴" : "🟢"}</span>
      <CardLabel>{name}</CardLabel>
      <span className={["text-base font-medium capitalize", stateColor].join(" ")}>
        {state.replace(/_/g, " ")}
      </span>
    </Card>
  );
}

// ── Media player card ────────────────────────────────────────────────────────

export function MediaCard({ entityId }: { entityId: string }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  if (!entity) return null;

  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const state = entity.state;
  const title = entity.attributes.media_title as string | undefined;
  const active = state === "playing" || state === "on";

  return (
    <div className={[
      "flex flex-col gap-2 rounded-2xl p-4 transition-all",
      active ? "bg-amber-400/20 border border-amber-400/40" : "bg-white/5 border border-white/10",
    ].join(" ")}>
      <span className="text-2xl">📺</span>
      <CardLabel>{name}</CardLabel>
      <div className="flex items-center justify-between">
        <div>
          <CardState on={active}>{state}</CardState>
          {title && <p className="text-xs text-white/40 mt-0.5 truncate max-w-32">{title}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => callService("media_player", "media_play_pause", { entity_id: entityId })}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg active:scale-90 flex items-center justify-center"
          >
            {state === "playing" ? "⏸" : "▶️"}
          </button>
          <button
            onClick={() => callService("media_player", "turn_off", { entity_id: entityId })}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg active:scale-90 flex items-center justify-center"
          >
            ⏹
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sensor card ──────────────────────────────────────────────────────────────

export function SensorCard({ entityId, icon = "📊" }: { entityId: string; icon?: string }) {
  const entity = useEntity(entityId);
  if (!entity) return null;

  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const unit = entity.attributes.unit_of_measurement as string ?? "";

  return (
    <Card>
      <span className="text-2xl">{icon}</span>
      <CardLabel>{name}</CardLabel>
      <span className="text-lg font-semibold text-white">
        {entity.state}
        {unit && <span className="text-sm text-white/40 ml-1">{unit}</span>}
      </span>
    </Card>
  );
}

// ── Camera card ──────────────────────────────────────────────────────────────

export function CameraCard({ entityId, label }: { entityId: string; label?: string }) {
  const entity = useEntity(entityId);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const name = label ?? (entity?.attributes.friendly_name as string) ?? entityId;
  // HA camera_proxy requires the entity's own access_token, not the long-lived API token
  const accessToken = entity?.attributes.access_token as string | undefined;
  const src = accessToken
    ? `${HA_HTTP_URL}/api/camera_proxy/${entityId}?token=${accessToken}&_t=${tick}`
    : undefined;

  return (
    <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
      {src ? (
        <img src={src} alt={name} className="w-full object-cover" />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center text-white/20 text-xs">
          Loading…
        </div>
      )}
      <div className="px-3 py-2 text-xs text-white/40">{name}</div>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3 px-1">{title}</h2>
      <div className="grid grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}
