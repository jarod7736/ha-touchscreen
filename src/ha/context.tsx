import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { HAWebSocketClient } from "./client";
import type { HaState, ConnectionStatus } from "./client";
import { HA_URL, HA_TOKEN } from "./config";

type HAContextValue = {
  status: ConnectionStatus;
  states: Record<string, HaState>;
  client: HAWebSocketClient | null;
  callService: (domain: string, service: string, data?: Record<string, unknown>) => Promise<unknown>;
};

const HAContext = createContext<HAContextValue>({
  status: "disconnected",
  states: {},
  client: null,
  callService: async () => {},
});

export function HAProvider({ children }: { children: ReactNode }) {
  const clientRef = useRef<HAWebSocketClient | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [states, setStates] = useState<Record<string, HaState>>({});

  useEffect(() => {
    const client = new HAWebSocketClient(HA_URL, HA_TOKEN);
    clientRef.current = client;

    const unsubStatus = client.onStatusChange((s) => {
      setStatus(s);
      if (s === "connected") {
        client.getStates().then((all) => {
          const map: Record<string, HaState> = {};
          all.forEach((s) => (map[s.entity_id] = s));
          setStates(map);
        });
      }
    });

    const unsubState = client.onStateChange((entityId, newState) => {
      setStates((prev) => ({ ...prev, [entityId]: newState }));
    });

    client.connect();

    return () => {
      unsubStatus();
      unsubState();
      client.disconnect();
    };
  }, []);

  const callService = (domain: string, service: string, data?: Record<string, unknown>) => {
    return clientRef.current?.callService(domain, service, data) ?? Promise.resolve();
  };

  return (
    <HAContext.Provider value={{ status, states, client: clientRef.current, callService }}>
      {children}
    </HAContext.Provider>
  );
}

export function useHA() {
  return useContext(HAContext);
}

export function useEntity(entityId: string): HaState | undefined {
  const { states } = useHA();
  return states[entityId];
}
