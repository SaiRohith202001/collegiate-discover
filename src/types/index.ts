export type EventCategory =
  | "Hackathon"
  | "Coding"
  | "Quiz"
  | "Workshop"
  | "Technical"
  | "Cultural"
  | "Sports"
  | "Gaming"
  | "Clubs";

export interface TeamSize {
  min: number;
  max: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  about: string;
  category: EventCategory;
  image: string;
  /** ISO date, e.g. 2026-08-28 */
  date: string;
  time: string;
  venue: string;
  venueDetail: string[];
  department: string;
  organizer: string;
  registrationDeadline: string;
  maxParticipants: number;
  registeredParticipants: number;
  /** null = individual event */
  teamSize: TeamSize | null;
  eligibility: string;
  highlights: string[];
  rules: string[];
  status: "upcoming" | "completed";
  featured?: boolean;
  trending?: boolean;
}

export interface Registration {
  id: string;
  registrationId: string;
  eventId: string;
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  department: string;
  year: string;
  teamName?: string;
  teamMembers?: string[];
  status: "registered" | "cancelled";
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  studentId: string;
  department: string;
  year: string;
  email: string;
  phone: string;
  avatarInitials: string;
}