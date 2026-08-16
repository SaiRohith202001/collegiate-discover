import type { StudentProfile } from "@/types";

/** Mock user service — replace with an auth-backed API later. */

const profile: StudentProfile = {
  id: "stu-2026-0182",
  name: "Sai Rohith",
  studentId: "21CSE0182",
  department: "Computer Science & Engineering",
  year: "3rd Year",
  email: "sai.rohith@campus.edu",
  phone: "+91 98765 43210",
  avatarInitials: "SR",
};

export const userService = {
  async getCurrentUser(): Promise<StudentProfile> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return profile;
  },
  getCurrentUserSync(): StudentProfile {
    return profile;
  },
};