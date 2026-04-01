import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type AuthLevel = "finn" | "master" | "admin";

const RANK: Record<AuthLevel, number> = { finn: 1, master: 2, admin: 3 };
const AUTH_TTL = 5 * 60 * 1000; // 5 minutes

// PIN → level. admin and master share 2108; entering it grants "admin" (rank 3),
// which satisfies both admin and master requirements.
const PIN_MAP: Record<string, AuthLevel> = {
  "2108": "admin",
  "1109": "finn",
};

export function canAccess(current: AuthLevel | null, required: AuthLevel): boolean {
  if (!current) return false;
  return RANK[current] >= RANK[required];
}

export type PinState = {
  requiredLevel: AuthLevel;
  onSubmit: (pin: string) => boolean;
  onCancel: () => void;
};

type AuthContextValue = {
  authLevel: AuthLevel | null;
  requireAuth: (minLevel: AuthLevel, action: () => void) => void;
  pinState: PinState | null;
};

const AuthContext = createContext<AuthContextValue>({
  authLevel: null,
  requireAuth: (_l, fn) => fn(),
  pinState: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authLevel, setAuthLevelState] = useState<AuthLevel | null>(null);
  const authRef = useRef<AuthLevel | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pending, setPending] = useState<{ level: AuthLevel; fn: () => void } | null>(null);

  const setAuthLevel = (level: AuthLevel | null) => {
    authRef.current = level;
    setAuthLevelState(level);
  };

  const grantAuth = (level: AuthLevel) => {
    setAuthLevel(level);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAuthLevel(null), AUTH_TTL);
  };

  const requireAuth = useCallback((minLevel: AuthLevel, action: () => void) => {
    if (canAccess(authRef.current, minLevel)) {
      action();
    } else {
      setPending({ level: minLevel, fn: action });
    }
  }, []);

  const handleSubmit = (pin: string): boolean => {
    const level = PIN_MAP[pin];
    if (!level || !canAccess(level, pending?.level ?? "finn")) return false;
    grantAuth(level);
    pending?.fn();
    setPending(null);
    return true;
  };

  const handleCancel = () => setPending(null);

  const pinState: PinState | null = pending
    ? { requiredLevel: pending.level, onSubmit: handleSubmit, onCancel: handleCancel }
    : null;

  return (
    <AuthContext.Provider value={{ authLevel, requireAuth, pinState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
