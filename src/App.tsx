import { HAProvider, useHA } from "./ha/context";

const STATUS_COLOR: Record<string, string> = {
  connected: "#22c55e",
  connecting: "#f59e0b",
  authenticating: "#f59e0b",
  disconnected: "#6b7280",
  error: "#ef4444",
};

function StatusBadge() {
  const { status, states } = useHA();
  const entityCount = Object.keys(states).length;

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: STATUS_COLOR[status] ?? "#6b7280",
            display: "inline-block",
          }}
        />
        <span>HA WebSocket: {status}</span>
      </div>
      {status === "connected" && (
        <p style={{ marginTop: "0.5rem", color: "#22c55e" }}>
          {entityCount} entities loaded
        </p>
      )}
    </div>
  );
}

export default function App() {
  return (
    <HAProvider>
      <StatusBadge />
    </HAProvider>
  );
}
