import { AlarmCard, CameraCard, LightCard, LockCard, Section, SwitchCard } from "../components/cards";

export function OutsideTab() {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <Section title="Security">
        <AlarmCard entityId="alarm_control_panel.alarmo" protect="admin" />
        <LockCard entityId="lock.entryway_front_door" protect="admin" />
      </Section>

      <Section title="Cameras">
        <CameraCard entityId="camera.front_door_doorbell" />
        <CameraCard entityId="camera.front_yard_camera" />
        <CameraCard entityId="camera.backyard_camera" />
      </Section>

      <Section title="Lights">
        <LightCard entityId="light.smart_rgbtw_bulb" />
        <LightCard entityId="light.front_hall_1" />
      </Section>

      <Section title="Irrigation">
        <SwitchCard entityId="switch.zone_1_front_between_houses" icon="💧" />
        <SwitchCard entityId="switch.zone_2_sidewalk" icon="💧" />
        <SwitchCard entityId="switch.zone_3_mid_front" icon="💧" />
        <SwitchCard entityId="switch.zone_4_front_close" icon="💧" />
        <SwitchCard entityId="switch.zone_5_bushes_front" icon="💧" />
        <SwitchCard entityId="switch.zone_6_front_rotor" icon="💧" />
        <SwitchCard entityId="switch.zone_7_big_backyard" icon="💧" />
        <SwitchCard entityId="switch.zone_8" icon="💧" />
      </Section>
    </div>
  );
}
