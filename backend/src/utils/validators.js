import { z } from "zod";

const trimmed = z.string().trim();
const phoneSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().replace(/[\s()-]/g, "") : value),
  z
    .string()
    .regex(/^(?:\+91)?\d{10}$/, "Phone number must be a 10-digit Indian number.")
    .transform((phone) => phone.replace(/^\+91/, "")),
);

export const signupSchema = z.object({
  name: trimmed.min(2).max(80),
  email: trimmed.email().max(320),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters.")
    .max(100)
    .regex(/[A-Z]/, "Password must contain one uppercase letter.")
    .regex(/[a-z]/, "Password must contain one lowercase letter.")
    .regex(/[0-9]/, "Password must contain one number."),
  studentId: trimmed.min(2).max(30),
  department: trimmed.min(2).max(120),
  year: trimmed.min(1).max(40),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: trimmed.email().max(320),
  password: z.string().min(1).max(100),
});

export const forgotPasswordSchema = z.object({
  email: trimmed.email().max(320),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1).max(500),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters.")
    .max(100)
    .regex(/[A-Z]/, "Password must contain one uppercase letter.")
    .regex(/[a-z]/, "Password must contain one lowercase letter.")
    .regex(/[0-9]/, "Password must contain one number."),
});

export const registrationSchema = z.object({
  eventId: trimmed.min(1).max(100),
  fullName: trimmed.min(2).max(80),
  studentId: trimmed.min(2).max(30),
  email: trimmed.email().max(320),
  phone: phoneSchema,
  department: trimmed.min(2).max(120),
  year: trimmed.min(1).max(40),
  teamName: trimmed.max(120).optional().or(z.literal("")),
  teamMembers: z.array(trimmed.min(1).max(80)).max(20).optional(),
});

export const savedEventSchema = z.object({
  eventId: trimmed.min(1).max(100),
});
