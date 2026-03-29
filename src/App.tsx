import { useState } from "react";
import { HAProvider, useHA } from "./ha/context";
import { TabBar } from "./components/TabBar";
import type { TabId } from "./components/TabBar";
import { HomeTab } from "./tabs/HomeTab";
import { LivingRoomTab } from "./tabs/LivingRoomTab";
import { BedroomTab } from "./tabs/BedroomTab";
import { MediaRoomTab } from "./tabs/MediaRoomTab";
import { OutsideTab } from "./tabs/OutsideTab";
import { MiscTab } from "./tabs/MiscTab";

const STATUS_DOT: Record<string, string> = {
  connected: "bg-green-500",
  connecting: "bg-yellow-500 animate-pulse",
  authenticating: "bg-yellow-500 animate-pulse",
  disconnected: "bg-gray-500",
  error: "bg-red-500",
};

function Dashboard() {
  const [tab, setTab] = useState<TabId>("home");
  const { status } = useHA();

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 shrink-0">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Holdfast</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status] ?? "bg-gray-500"}`} />
          <span className="text-white/30 text-xs capitalize">{status}</span>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0">
        {tab === "home"    && <HomeTab />}
        {tab === "living"  && <LivingRoomTab />}
        {tab === "bedroom" && <BedroomTab />}
        {tab === "media"   && <MediaRoomTab />}
        {tab === "outside" && <OutsideTab />}
        {tab === "misc"    && <MiscTab />}
      </div>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <HAProvider>
      <Dashboard />
    </HAProvider>
  );
}
