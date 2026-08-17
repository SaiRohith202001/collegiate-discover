import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signup" />;
  }

  return <>{children}</>;
}
