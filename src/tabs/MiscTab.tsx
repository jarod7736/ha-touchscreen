import { CameraCard, LightCard, Section, SwitchCard } from "../components/cards";

export function MiscTab() {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <Section title="Office">
        <LightCard entityId="light.office_lights" />
        <LightCard entityId="light.office_1_light" />
        <LightCard entityId="light.office2_light" />
      </Section>

      <Section title="Front Hallway">
        <LightCard entityId="light.smart_rgbtw_bulb" />
        <LightCard entityId="light.front_hall_1" />
      </Section>

      <Section title="Network">
        <SwitchCard entityId="switch.unifi_network_youtube_block_kids" icon="🚫" />
        <SwitchCard entityId="switch.unifi_network_kids" icon="👧" />
        <SwitchCard entityId="switch.unifi_network_youtube_tv" icon="📺" />
      </Section>

      <Section title="Automations">
        <SwitchCard entityId="switch.automation_wake_up" icon="⏰" />
      </Section>

      <Section title="Cameras">
        <CameraCard entityId="camera.kitchen_camera" />
        <CameraCard entityId="camera.stairway_camera" />
        <CameraCard entityId="camera.backyard_camera" />
      </Section>
    </div>
  );
}
