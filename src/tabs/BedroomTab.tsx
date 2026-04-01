import { LightCard, SceneCard, Section } from "../components/cards";

export function BedroomTab() {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <Section title="Master Bedroom">
        <LightCard entityId="light.master_ceiling_lights" protect="master" />
      </Section>

      <Section title="Finn's Room">
        <LightCard entityId="light.bedroom" protect="finn" />
        <LightCard entityId="light.wiz_rgbw_tunable_01dfc6" protect="finn" />
        <LightCard entityId="light.hue_color_lamp_1" protect="finn" />
        <LightCard entityId="light.hue_color_lamp_2" protect="finn" />
        <LightCard entityId="light.hue_color_lamp_3" protect="finn" />
      </Section>

      <Section title="Scenes">
        <SceneCard entityId="scene.bedroom_bright" icon="☀️" protect="finn" />
        <SceneCard entityId="scene.bedroom_relax" icon="😌" protect="finn" />
        <SceneCard entityId="scene.bedroom_nightlight" icon="🌙" protect="finn" />
        <SceneCard entityId="scene.bedroom_storybook" icon="📖" protect="finn" />
        <SceneCard entityId="scene.bedroom_galaxy" icon="🌌" protect="finn" />
        <SceneCard entityId="scene.bedroom_honolulu" icon="🌺" protect="finn" />
        <SceneCard entityId="scene.bedroom_dreamy_dusk" icon="🌅" protect="finn" />
        <SceneCard entityId="scene.bedroom_moonlight" icon="🌕" protect="finn" />
        <SceneCard entityId="scene.bedroom_blood_moon" icon="🔴" protect="finn" />
        <SceneCard entityId="scene.bedroom_snow_sparkle" icon="❄️" protect="finn" />
        <SceneCard entityId="scene.bedroom_rolling_hills" icon="🌄" protect="finn" />
        <SceneCard entityId="scene.bedroom_memento" icon="🎭" protect="finn" />
        <SceneCard entityId="scene.bedroom_rosy" icon="🌸" protect="finn" />
        <SceneCard entityId="scene.bedroom_first_light" icon="🌤️" protect="finn" />
      </Section>
    </div>
  );
}
