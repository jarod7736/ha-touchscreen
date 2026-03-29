export type HaState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
};

export type HaMessage = {
  type: string;
  [key: string]: unknown;
};

export type ConnectionStatus = "disconnected" | "connecting" | "authenticating" | "connected" | "error";

type MessageHandler = (msg: HaMessage) => void;
type StateChangeHandler = (entityId: string, state: HaState) => void;
type StatusChangeHandler = (status: ConnectionStatus) => void;

export class HAWebSocketClient {
  private ws: WebSocket | null = null;
  private msgId = 1;
  private pendingCmds = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private stateChangeHandlers: StateChangeHandler[] = [];
  private statusHandlers: StatusChangeHandler[] = [];
  private messageHandlers: MessageHandler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = true;
  private status: ConnectionStatus = "disconnected";

  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  connect() {
    this.shouldReconnect = true;
    this._connect();
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }

  private _connect() {
    this._setStatus("connecting");
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      // HA sends auth_required first, handled in onmessage
    };

    this.ws.onmessage = (event) => {
      const msg: HaMessage = JSON.parse(event.data as string);
      this._handleMessage(msg);
    };

    this.ws.onclose = () => {
      this._setStatus("disconnected");
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this._connect(), 3000);
      }
    };

    this.ws.onerror = () => {
      this._setStatus("error");
    };
  }

  private _handleMessage(msg: HaMessage) {
    this.messageHandlers.forEach((h) => h(msg));

    switch (msg.type) {
      case "auth_required":
        this._setStatus("authenticating");
        this._send({ type: "auth", access_token: this.token });
        break;

      case "auth_ok":
        this._setStatus("connected");
        this._subscribeEvents();
        break;

      case "auth_invalid":
        this._setStatus("error");
        this.shouldReconnect = false;
        break;

      case "result": {
        const id = msg.id as number;
        const pending = this.pendingCmds.get(id);
        if (pending) {
          this.pendingCmds.delete(id);
          if (msg.success) {
            pending.resolve(msg.result);
          } else {
            pending.reject(new Error((msg.error as { message: string })?.message ?? "Unknown error"));
          }
        }
        break;
      }

      case "event": {
        const event = msg.event as { event_type: string; data: { entity_id: string; new_state: HaState } };
        if (event?.event_type === "state_changed") {
          const { entity_id, new_state } = event.data;
          if (new_state) {
            this.stateChangeHandlers.forEach((h) => h(entity_id, new_state));
          }
        }
        break;
      }
    }
  }

  private _subscribeEvents() {
    this._sendWithId({ type: "subscribe_events", event_type: "state_changed" });
  }

  private _send(msg: Record<string, unknown>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private _sendWithId(msg: Record<string, unknown>): number {
    const id = this.msgId++;
    this._send({ ...msg, id });
    return id;
  }

  sendCommand<T = unknown>(msg: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this._sendWithId(msg);
      this.pendingCmds.set(id, { resolve: resolve as (v: unknown) => void, reject });
    });
  }

  getStates(): Promise<HaState[]> {
    return this.sendCommand<HaState[]>({ type: "get_states" });
  }

  callService(domain: string, service: string, data: Record<string, unknown> = {}) {
    return this.sendCommand({
      type: "call_service",
      domain,
      service,
      service_data: data,
    });
  }

  onStateChange(handler: StateChangeHandler) {
    this.stateChangeHandlers.push(handler);
    return () => {
      this.stateChangeHandlers = this.stateChangeHandlers.filter((h) => h !== handler);
    };
  }

  onStatusChange(handler: StatusChangeHandler) {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter((h) => h !== handler);
    };
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private _setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusHandlers.forEach((h) => h(status));
  }
}
