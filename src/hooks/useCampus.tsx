import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { registrationService, type RegistrationInput } from "@/services/registrationService";
import { userService } from "@/services/userService";
import type { Registration, StudentProfile } from "@/types";

interface CampusContextValue {
  user: StudentProfile;
  registrations: Registration[];
  savedEventIds: string[];
  ready: boolean;
  isRegistered: (eventId: string) => boolean;
  isSaved: (eventId: string) => boolean;
  toggleSaved: (eventId: string) => void;
  register: (input: RegistrationInput) => Promise<Registration>;
  cancelRegistration: (id: string) => Promise<void>;
  extraRegistrations: (eventId: string) => number;
}

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const user = userService.getCurrentUserSync();

  useEffect(() => {
    let active = true;
    Promise.all([registrationService.getRegistrations(), registrationService.getSavedEventIds()]).then(
      ([regs, saved]) => {
        if (!active) return;
        setRegistrations(regs);
        setSavedEventIds(saved);
        setReady(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const toggleSaved = useCallback((eventId: string) => {
    setSavedEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [eventId, ...current],
    );
    void registrationService.toggleSavedEvent(eventId);
  }, []);

  const register = useCallback(async (input: RegistrationInput) => {
    const created = await registrationService.createRegistration(input);
    setRegistrations((current) => [created, ...current]);
    return created;
  }, []);

  const cancelRegistration = useCallback(async (id: string) => {
    await registrationService.cancelRegistration(id);
    setRegistrations((current) => current.filter((registration) => registration.id !== id));
  }, []);

  const value = useMemo<CampusContextValue>(
    () => ({
      user,
      registrations,
      savedEventIds,
      ready,
      isRegistered: (eventId) => registrations.some((r) => r.eventId === eventId),
      isSaved: (eventId) => savedEventIds.includes(eventId),
      toggleSaved,
      register,
      cancelRegistration,
      extraRegistrations: (eventId) => registrations.filter((r) => r.eventId === eventId).length,
    }),
    [user, registrations, savedEventIds, ready, toggleSaved, register, cancelRegistration],
  );

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) throw new Error("useCampus must be used within CampusProvider");
  return context;
}