import { LightCard, MediaCard, SceneCard, Section } from "../components/cards";

export function MediaRoomTab() {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <Section title="Lights">
        <LightCard entityId="light.media_room_lights" />
        <LightCard entityId="light.wiz_rgbw_tunable_0b6802" />
        <LightCard entityId="light.wiz_rgbw_tunable_0b87ea" />
      </Section>

      <Section title="Scenes">
        <SceneCard entityId="scene.media_room_10" icon="🌑" />
        <SceneCard entityId="scene.media_room_blue" icon="🔵" />
      </Section>

      <Section title="Audio / Video">
        <MediaCard entityId="media_player.home_theater" />
        <MediaCard entityId="media_player.home_theater_2" />
      </Section>
    </div>
  );
}
