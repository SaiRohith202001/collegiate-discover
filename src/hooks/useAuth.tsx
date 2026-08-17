import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService, type LoginPayload, type SignupPayload } from "@/services/authService";
import type { StudentProfile } from "@/types";

interface AuthContextValue {
  user: StudentProfile | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [ready, setReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me.user);
    } catch {
      try {
        const refreshed = await authService.refresh();
        setUser(refreshed.user);
      } catch {
        setUser(null);
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const data = await authService.signup(payload);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      refreshSession,
    }),
    [user, ready, login, signup, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
