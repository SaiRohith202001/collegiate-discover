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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

type AuthResponse = { user: StudentProfile };
type MessageResponse = { message: string; resetToken?: string };

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
  async forgotPassword(payload: ForgotPasswordPayload) {
    return apiRequest<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async resetPassword(payload: ResetPasswordPayload) {
    return apiRequest<MessageResponse>("/auth/reset-password", {
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
