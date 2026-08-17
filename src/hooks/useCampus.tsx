import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { registrationService, type RegistrationInput } from "@/services/registrationService";
import type { Registration, StudentProfile } from "@/types";
import { useAuth } from "./useAuth";

interface CampusContextValue {
  user: StudentProfile | null;
  registrations: Registration[];
  savedEventIds: string[];
  ready: boolean;
  isRegistered: (eventId: string) => boolean;
  isSaved: (eventId: string) => boolean;
  toggleSaved: (eventId: string) => Promise<void>;
  register: (input: RegistrationInput) => Promise<Registration>;
  cancelRegistration: (id: string) => Promise<void>;
  extraRegistrations: (eventId: string) => number;
}

const CampusContext = createContext<CampusContextValue | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady, isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      setRegistrations([]);
      setSavedEventIds([]);
      setReady(true);
      return;
    }

    setReady(false);
    let active = true;
    Promise.all([registrationService.getRegistrations(), registrationService.getSavedEventIds()])
      .then(([regs, saved]) => {
        if (!active) return;
        setRegistrations(regs);
        setSavedEventIds(saved);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setRegistrations([]);
        setSavedEventIds([]);
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [authReady, isAuthenticated]);

  const toggleSaved = useCallback(
    async (eventId: string) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to save events.");
      }

      const previous = savedEventIds;
      const optimistic = previous.includes(eventId)
        ? previous.filter((id) => id !== eventId)
        : [eventId, ...previous];
      setSavedEventIds(optimistic);
      try {
        const saved = await registrationService.toggleSavedEvent(eventId);
        setSavedEventIds(saved);
      } catch (error) {
        setSavedEventIds(previous);
        throw error;
      }
    },
    [isAuthenticated, savedEventIds],
  );

  const register = useCallback(
    async (input: RegistrationInput) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to register.");
      }
      const created = await registrationService.createRegistration(input);
      setRegistrations((current) => [created, ...current]);
      return created;
    },
    [isAuthenticated],
  );

  const cancelRegistration = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        throw new Error("You must be logged in to cancel registration.");
      }
      await registrationService.cancelRegistration(id);
      setRegistrations((current) => current.filter((registration) => registration.id !== id));
    },
    [isAuthenticated],
  );

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
