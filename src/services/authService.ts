import type { StudentProfile } from "@/types";
import { apiRequest } from "./apiClient";

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  studentId: string;
  department: string;
  year: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

type AuthResponse = { user: StudentProfile };

export const authService = {
  async me() {
    return apiRequest<AuthResponse>("/auth/me");
  },
  async signup(payload: SignupPayload) {
    return apiRequest<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async login(payload: LoginPayload) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async refresh() {
    return apiRequest<AuthResponse>("/auth/refresh", {
      method: "POST",
    });
  },
  async logout() {
    return apiRequest<void>("/auth/logout", {
      method: "POST",
    });
  },
};
