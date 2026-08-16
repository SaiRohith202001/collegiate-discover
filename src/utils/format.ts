const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FULL_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parse(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

/** "Aug 28" */
export function formatShortDate(iso: string) {
  const d = parse(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "August 28, 2026" */
export function formatLongDate(iso: string) {
  const d = parse(iso);
  return `${FULL_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "Today" / "Tomorrow" / "Fri, Aug 28" */
export function formatRelativeDay(iso: string, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const target = parse(iso);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return target.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function teamSizeLabel(teamSize: { min: number; max: number } | null) {
  if (!teamSize) return "Individual";
  if (teamSize.min === teamSize.max) return `${teamSize.max} Members`;
  return `${teamSize.min}–${teamSize.max} Members`;
}