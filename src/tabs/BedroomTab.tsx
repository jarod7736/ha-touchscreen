import { LightCard, Section } from "../components/cards";

export function BedroomTab() {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <Section title="Lights">
        <LightCard entityId="light.bedroom" />
        <LightCard entityId="light.master_ceiling_lights" />
        <LightCard entityId="light.wiz_rgbw_tunable_01dfc6" />
        <LightCard entityId="light.hue_color_lamp_1" />
        <LightCard entityId="light.hue_color_lamp_2" />
        <LightCard entityId="light.hue_color_lamp_3" />
      </Section>

      {/* <Section title="Scenes">
        <SceneCard entityId="scene.bedroom_bright" icon="☀️" />
        <SceneCard entityId="scene.bedroom_relax" icon="😌" />
        <SceneCard entityId="scene.bedroom_nightlight" icon="🌙" />
        <SceneCard entityId="scene.bedroom_storybook" icon="📖" />
        <SceneCard entityId="scene.bedroom_galaxy" icon="🌌" />
        <SceneCard entityId="scene.bedroom_honolulu" icon="🌺" />
        <SceneCard entityId="scene.bedroom_dreamy_dusk" icon="🌅" />
        <SceneCard entityId="scene.bedroom_moonlight" icon="🌕" />
        <SceneCard entityId="scene.bedroom_blood_moon" icon="🔴" />
        <SceneCard entityId="scene.bedroom_snow_sparkle" icon="❄️" />
        <SceneCard entityId="scene.bedroom_rolling_hills" icon="🌄" />
        <SceneCard entityId="scene.bedroom_memento" icon="🎭" />
        <SceneCard entityId="scene.bedroom_rosy" icon="🌸" />
        <SceneCard entityId="scene.bedroom_first_light" icon="🌤️" />
      </Section> */}
    </div>
  );
}
