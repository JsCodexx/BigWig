import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
      client_review: ["client_approved"],
      client_approved: ["installation_pending"],
      installation_pending: ["installation_in_progress"],
      installation_in_progress: ["installation_completed"],
      installation_completed: ["completed"],
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
