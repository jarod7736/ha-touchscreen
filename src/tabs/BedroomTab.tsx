import { LightCard, Section } from "../components/cards";

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
    </div>
  );
}
