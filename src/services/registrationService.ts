import type { Registration } from "@/types";

/**
 * Mock registration service backed by localStorage.
 * Replace with REST calls later; the UI only uses these methods.
 */

const STORAGE_KEY = "campusly.registrations";
const SAVED_KEY = "campusly.saved";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export interface RegistrationInput {
  eventId: string;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  teamName?: string;
  teamMembers?: string[];
}

function makeRegistrationId(department: string) {
  const code = (department.match(/[A-Z]{2,4}/)?.[0] ?? "GEN").slice(0, 4);
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `REG-${code}-2026-0${seq}`;
}

export const registrationService = {
  async getRegistrations(): Promise<Registration[]> {
    await delay(220);
    return read<Registration[]>(STORAGE_KEY, []);
  },

  async createRegistration(input: RegistrationInput): Promise<Registration> {
    await delay();
    const registration: Registration = {
      id: crypto.randomUUID(),
      registrationId: makeRegistrationId(input.department),
      status: "registered",
      createdAt: new Date().toISOString(),
      ...input,
    };
    const all = read<Registration[]>(STORAGE_KEY, []);
    write(STORAGE_KEY, [registration, ...all]);
    return registration;
  },

  async cancelRegistration(id: string): Promise<void> {
    await delay(250);
    const all = read<Registration[]>(STORAGE_KEY, []);
    write(
      STORAGE_KEY,
      all.filter((registration) => registration.id !== id),
    );
  },

  async getSavedEventIds(): Promise<string[]> {
    await delay(120);
    return read<string[]>(SAVED_KEY, []);
  },

  async toggleSavedEvent(eventId: string): Promise<string[]> {
    const current = read<string[]>(SAVED_KEY, []);
    const next = current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [eventId, ...current];
    write(SAVED_KEY, next);
    return next;
  },
};