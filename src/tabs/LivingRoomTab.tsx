import { CameraCard, LightCard, MediaCard, SceneCard, Section } from "../components/cards";

export function LivingRoomTab() {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <Section title="Lights">
        <LightCard entityId="light.living_room_lights" />
        <LightCard entityId="light.wiz_rgbw_tunable_dc6a39" />
        <LightCard entityId="light.wiz_rgbw_tunable_c8dba3" />
        <LightCard entityId="light.wiz_rgbw_tunable_dc3a81" />
        <LightCard entityId="light.wiz_rgbw_tunable_dc4b91" />
        <LightCard entityId="light.wiz_rgbww_tunable_61b432" />
      </Section>

      <Section title="Scenes">
        <SceneCard entityId="scene.living_room_lights" icon="📺" />
        <SceneCard entityId="scene.living_room_lights_normal" icon="☀️" />
      </Section>

      <Section title="TV">
        <MediaCard entityId="media_player.lg_webos_tv_oled55g2pua_2" />
      </Section>

      <Section title="Cameras">
        <CameraCard entityId="camera.living_room_camera" />
      </Section>
    </div>
  );
}
