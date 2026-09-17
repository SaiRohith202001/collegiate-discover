import { apiRequest } from "./apiClient";
import type { Registration } from "@/types";

const apiUrl = import.meta.env.VITE_REGISTRATION_SERVICE_URL?.replace(/\/$/, "");
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

type RegistrationListResponse = { registrations: Registration[] };
type RegistrationCreateResponse = { registration: Registration };
type SavedEventsResponse = { eventIds: string[] };

export const registrationService = {
  async getRegistrations(): Promise<Registration[]> {
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/registrations`);
      if (!response.ok) throw new Error("Registration Service could not load registrations.");
      return (await response.json()) as Registration[];
    }
    const data = await apiRequest<RegistrationListResponse>("/registrations");
    return data.registrations;
  },

  async createRegistration(input: RegistrationInput): Promise<Registration> {
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/registrations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Registration Service rejected the registration.");
      }
      return (await response.json()) as Registration;
    }
    const data = await apiRequest<RegistrationCreateResponse>("/registrations", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.registration;
  },

  async cancelRegistration(id: string): Promise<void> {
    if (apiUrl) {
      const response = await fetch(`${apiUrl}/registrations/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Registration Service could not cancel the registration.");
      return;
    }
    await apiRequest<void>(`/registrations/${id}`, { method: "DELETE" });
  },

  async getSavedEventIds(): Promise<string[]> {
    const data = await apiRequest<SavedEventsResponse>("/saved-events");
    return data.eventIds;
  },

  async toggleSavedEvent(eventId: string): Promise<string[]> {
    const data = await apiRequest<SavedEventsResponse>("/saved-events/toggle", {
      method: "POST",
      body: JSON.stringify({ eventId }),
    });
    return data.eventIds;
  },
};
