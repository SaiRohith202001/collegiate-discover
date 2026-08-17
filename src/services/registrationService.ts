import { apiRequest } from "./apiClient";
import type { Registration } from "@/types";

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
    const data = await apiRequest<RegistrationListResponse>("/registrations");
    return data.registrations;
  },

  async createRegistration(input: RegistrationInput): Promise<Registration> {
    const data = await apiRequest<RegistrationCreateResponse>("/registrations", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data.registration;
  },

  async cancelRegistration(id: string): Promise<void> {
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
