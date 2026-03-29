const TABS = [
  { id: "home",        label: "Home",        icon: "🏠" },
  { id: "living",      label: "Living Room", icon: "🛋️" },
  { id: "bedroom",     label: "Bedroom",     icon: "🛏️" },
  { id: "media",       label: "Media Room",  icon: "🎬" },
  { id: "outside",     label: "Outside",     icon: "🌿" },
  { id: "misc",        label: "Misc",        icon: "⚙️" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export { TABS };

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <nav className="flex border-t border-white/10 bg-[#0f1117] shrink-0">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors",
            active === tab.id
              ? "text-amber-400 border-t-2 border-amber-400 -mt-px"
              : "text-white/30 border-t-2 border-transparent -mt-px",
          ].join(" ")}
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="hidden sm:block">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
