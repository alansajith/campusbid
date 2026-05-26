import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isPast, differenceInSeconds } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTimeLeft(endTime: Date): {
  label: string;
  urgency: "normal" | "soon" | "critical" | "ended";
  seconds: number;
} {
  if (isPast(endTime)) {
    return { label: "Ended", urgency: "ended", seconds: 0 };
  }

  const seconds = differenceInSeconds(endTime, new Date());

  if (seconds < 60) {
    return { label: `${seconds}s left`, urgency: "critical", seconds };
  }
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      label: `${mins}m ${secs}s left`,
      urgency: seconds < 300 ? "critical" : "soon",
      seconds,
    };
  }
  if (seconds < 86400) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return { label: `${hrs}h ${mins}m left`, urgency: "soon", seconds };
  }

  return {
    label: formatDistanceToNow(endTime, { addSuffix: true }),
    urgency: "normal",
    seconds,
  };
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function isEduEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  
  // Whitelist developer's Resend sandbox testing email in development mode
  if (process.env.NODE_ENV === "development" && emailLower === "alan.sajith1722@gmail.com") {
    return true;
  }

  const suffixes = [".edu", ".ac.in", ".edu.in", ".ac.uk", ".edu.au", ".edu.sg"];
  return suffixes.some((suffix) => emailLower.endsWith(suffix));
}

export function extractUniversityFromEmail(email: string): string {
  const domain = email.split("@")[1];
  if (!domain) return "Unknown University";

  if (process.env.NODE_ENV === "development" && domain === "gmail.com") {
    return "Resend Developer Sandbox";
  }

  const suffixes = [".edu", ".ac.in", ".edu.in", ".ac.uk", ".edu.au", ".edu.sg"];
  let cleanDomain = domain;
  for (const suffix of suffixes) {
    if (cleanDomain.endsWith(suffix)) {
      cleanDomain = cleanDomain.slice(0, -suffix.length);
      break;
    }
  }

  // Format nicely (e.g. nsut -> NSUT, oxford -> Oxford)
  const name = cleanDomain.replace(/\./g, " ");
  return name
    .split(" ")
    .map((word) => {
      // If it looks like an acronym/short name, make it uppercase
      if (word.length <= 4) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
}

export const AUCTION_CATEGORIES = [
  "TEXTBOOKS",
  "ELECTRONICS",
  "CLOTHING",
  "FURNITURE",
  "SPORTS",
  "MUSIC",
  "ART",
  "GAMING",
  "APPLIANCES",
  "OTHER",
] as const;

export const AUCTION_CONDITIONS = [
  "NEW",
  "LIKE_NEW",
  "GOOD",
  "FAIR",
  "POOR",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  TEXTBOOKS: "Textbooks",
  ELECTRONICS: "Electronics",
  CLOTHING: "Clothing",
  FURNITURE: "Furniture",
  SPORTS: "Sports",
  MUSIC: "Music",
  ART: "Art",
  GAMING: "Gaming",
  APPLIANCES: "Appliances",
  OTHER: "Other",
};

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

export const DURATION_OPTIONS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "12 hours", hours: 12 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
];
