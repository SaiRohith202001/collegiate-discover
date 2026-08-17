import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { adminService } from "@/services/adminService";
import type { EventStat } from "@/types";

interface AdminContextValue {
  isAdmin: boolean;
  eventStats: EventStat[];
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [eventStats, setEventStats] = useState<EventStat[]>([]);

  const refreshStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const stats = await adminService.getStats();
      setEventStats(stats);
    } catch {
      // silently ignore — user may not be admin yet
    }
  }, [isAdmin]);

  useEffect(() => {
    void refreshStats();
  }, [refreshStats]);

  const value = useMemo<AdminContextValue>(
    () => ({ isAdmin, eventStats, refreshStats }),
    [isAdmin, eventStats, refreshStats],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
}
