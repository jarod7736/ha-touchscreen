import { AlarmCard, ClimateCard, LightCard, LockCard, Section, SensorCard } from "../components/cards";
import { useHA } from "../ha/context";

function Clock() {
  const now = new Date();
  return (
    <div className="text-center py-4">
      <div className="text-6xl font-thin tabular-nums">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}
      </div>
      <div className="text-white/40 text-sm mt-1">
        {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
      </div>
    </div>
  );
}

export function HomeTab() {
  const { states } = useHA();

  // Count active lights
  const activeLights = Object.values(states).filter(
    (s) => s.entity_id.startsWith("light.") && s.state === "on"
  ).length;

  return (
    <div className="p-4 overflow-y-auto h-full">
      <Clock />

      <Section title="Security">
        <AlarmCard entityId="alarm_control_panel.alarmo" />
        <LockCard entityId="lock.entryway_front_door" />
      </Section>

      <Section title="Climate">
        <ClimateCard entityId="climate.thermostat" />
        <ClimateCard entityId="climate.thermostat_2" />
      </Section>

      <Section title="Lights">
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <p className="text-white font-medium">{activeLights} lights on</p>
            <p className="text-white/40 text-sm">across the house</p>
          </div>
        </div>
        <LightCard entityId="light.living_room_lights" />
        <LightCard entityId="light.master_ceiling_lights" />
        <LightCard entityId="light.bedroom" />
        <LightCard entityId="light.media_room_lights" />
      </Section>

      <Section title="Weather">
        <SensorCard entityId="weather.home" icon="🌤️" />
      </Section>
    </div>
  );
}
