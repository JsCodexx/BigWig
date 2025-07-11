import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
// utils/formatDate.ts
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getAllowedStatusOptions = (
  userRole: string,
  currentStatus: string
) => {
  const statusOptions: Record<string, Record<string, string[]>> = {
    admin: {
      pending_admin_review: ["client_review"],
      client_approved: ["installation_pending"],
      // installation_pending: ["installation_in_progress"],
      // installation_in_progress: ["installation_completed"],
      installation_completed: ["completed"],
      client_review: ["client_approved"],
    },
    client: {
      client_review: ["client_approved"],
    },
    surveyor: {
      installation_pending: ["installation_in_progress"],
      installation_in_progress: ["installation_completed"],
    },
  };

  return statusOptions[userRole]?.[currentStatus] || [currentStatus];
};
export const allStatuses = [
  "pending_admin_review",
  "client_review",
  "client_approved",
  "installation_pending",
  "installation_in_progress",
  "installation_completed",
  "completed",
];

export const generalSurveySchema = z.object({
  shopName: z.string().min(1, "Shop name is required."),
  shopAddress: z.string().min(1, "Shop address is required."),
  clientName: z.string().min(1, "Shopkeeper name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  clientId: z.string().min(1, "Client selection is required."),
  description: z.string().min(1, "Surveyor remarks are required."),
});

const uploadImage = async (
  img: File | { file: File } | string
): Promise<string | null> => {
  try {
    if (typeof img === "string") {
      return img; // already a URL
    }

    const file = img instanceof File ? img : img.file;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url || null;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

export const uploadImages = async (
  images: (File | { file: File } | string)[]
): Promise<string[]> => {
  const results = await Promise.all(images.map(uploadImage));
  return results.filter((url): url is string => Boolean(url));
};

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * Format date either as relative (e.g., "3 days ago") or absolute ("on Nov 12, 2025")
 * @param inputDate - Date string (e.g., "2025-06-20 09:50:17.490775")
 * @returns A formatted string like "3 hours ago" or "on Jun 21, 2025"
 */
export function formatReadableDate(inputDate: string): string {
  const date = dayjs(inputDate);
  const now = dayjs();

  if (!date.isValid()) return "Invalid date";

  const diffInHours = now.diff(date, "hour");

  // If recent (within 48 hours), show relative
  if (diffInHours < 48) {
    return date.fromNow(); // e.g., "3 hours ago"
  }

  // Else show absolute
  return `on ${date.format("MMM D, YYYY")}`; // e.g., "on Jun 21, 2025"
}
