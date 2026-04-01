import { useEffect, useRef, useState } from "react";
import { HAProvider, useHA, useEntity } from "./ha/context";
import { AuthProvider, useAuth } from "./ha/auth";
import { PinPad } from "./components/PinPad";
import { TabBar } from "./components/TabBar";
import type { TabId } from "./components/TabBar";
import { HomeTab } from "./tabs/HomeTab";
import { LivingRoomTab } from "./tabs/LivingRoomTab";
import { BedroomTab } from "./tabs/BedroomTab";
import { MediaRoomTab } from "./tabs/MediaRoomTab";
import { OutsideTab } from "./tabs/OutsideTab";
import { MiscTab } from "./tabs/MiscTab";

const IDLE_MS = 5 * 60 * 1000; // 5 minutes

function IdleScreen({ onWake }: { onWake: () => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const weather = useEntity("weather.home");

  return (
    <div
      className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 select-none"
      onPointerDown={onWake}
    >
      <div className="text-8xl font-thin tabular-nums text-white">
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-white/40 text-xl mt-3">
        {now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
      </div>
      {weather && (
        <div className="mt-8 text-white/50 text-lg">
          🌤️ {weather.state}
          {weather.attributes.temperature != null && ` · ${weather.attributes.temperature}°`}
        </div>
      )}
    </div>
  );
}

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
  const [idle, setIdle] = useState(false);
  const lastTouchRef = useRef(Date.now());
  const { pinState } = useAuth();

  useEffect(() => {
    const id = setInterval(() => {
      if (Date.now() - lastTouchRef.current > IDLE_MS) setIdle(true);
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  const handlePointerDown = () => {
    lastTouchRef.current = Date.now();
    setIdle(false);
  };

  return (
    <div className="flex flex-col h-full relative" onPointerDown={handlePointerDown}>
      {idle && <IdleScreen onWake={handlePointerDown} />}
      {pinState && <PinPad {...pinState} />}
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
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </HAProvider>
  );
}
