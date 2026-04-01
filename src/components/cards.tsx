import { useEffect, useState } from "react";
import { useEntity, useHA } from "../ha/context";
import { HA_HTTP_URL, HA_TOKEN } from "../ha/config";
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
  const brightness = entity.attributes.brightness as number | undefined;
  const brightnessPct = brightness != null ? Math.round((brightness / 255) * 100) : 100;

  const guard = (action: () => void) => protect ? requireAuth(protect, action) : action();

  return (
    <Card on={on} onClick={() => guard(() => callService("light", on ? "turn_off" : "turn_on", { entity_id: entityId }))}>
      <span className="text-2xl">{on ? "💡" : "🔆"}</span>
      <CardLabel>{name}</CardLabel>
      <CardState on={on}>{on ? `${brightnessPct}%` : "Off"}</CardState>
      {on && (
        <input
          type="range"
          min={1}
          max={100}
          value={brightnessPct}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onChange={(e) => {
            const pct = Number(e.target.value);
            guard(() => callService("light", "turn_on", { entity_id: entityId, brightness_pct: pct }));
          }}
          className="w-full h-1 accent-amber-400 cursor-pointer mt-1"
        />
      )}
    </Card>
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
      className="col-span-2"
    >
      <span className="text-2xl">{locked ? "🔒" : "🔓"}</span>
      <CardLabel>{name}</CardLabel>
      <CardState on={locked}>{locked ? "Locked" : "Unlocked"}</CardState>
    </Card>
  );
}

// ── Climate card ─────────────────────────────────────────────────────────────

export function ClimateCard({ entityId, protect }: { entityId: string; protect?: AuthLevel }) {
  const entity = useEntity(entityId);
  const { callService } = useHA();
  const { requireAuth } = useAuth();
  if (!entity) return null;

  const name = (entity.attributes.friendly_name as string) ?? entityId;
  const current = entity.attributes.current_temperature as number;
  const target = entity.attributes.temperature as number;
  const hvacMode = entity.state;

  const bump = (delta: number) => {
    const action = () => callService("climate", "set_temperature", {
      entity_id: entityId,
      temperature: (target ?? current) + delta,
    });
    protect ? requireAuth(protect, action) : action();
  };

  return (
    <Card on={hvacMode !== "off"} className="col-span-2">
      <span className="text-2xl">🌡️</span>
      <CardLabel>{name}</CardLabel>
      <div className="flex items-center justify-between mt-1">
        <div>
          <span className="text-2xl font-bold text-white">{current}°</span>
          <span className="text-sm text-white/40 ml-1">→ {target}°</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); bump(-1); }}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg active:scale-90 flex items-center justify-center"
          >
            −
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); bump(1); }}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg active:scale-90 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
      <CardState on={hvacMode !== "off"}>{hvacMode}</CardState>
    </Card>
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
    <Card on={armed} onClick={toggle} className="col-span-2">
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
    <Card on={active} className="col-span-2">
      <span className="text-2xl">📺</span>
      <CardLabel>{name}</CardLabel>
      <div className="flex items-center justify-between">
        <div>
          <CardState on={active}>{state}</CardState>
          {title && <p className="text-xs text-white/40 mt-0.5 truncate max-w-32">{title}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); callService("media_player", "media_play_pause", { entity_id: entityId }); }}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg active:scale-90 flex items-center justify-center"
          >
            {state === "playing" ? "⏸" : "▶️"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); callService("media_player", "turn_off", { entity_id: entityId }); }}
            className="w-10 h-10 rounded-xl bg-white/10 text-lg active:scale-90 flex items-center justify-center"
          >
            ⏹
          </button>
        </div>
      </div>
    </Card>
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
  const src = `${HA_HTTP_URL}/api/camera_proxy/${entityId}?token=${HA_TOKEN}&_t=${tick}`;

  return (
    <div className="col-span-2 bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
      <img src={src} alt={name} className="w-full object-cover" />
      <div className="px-3 py-2 text-xs text-white/40">{name}</div>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3 px-1">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}
