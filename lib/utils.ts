import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

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

export const generalSurveySchema = z.object({
  shopName: z.string().min(1, "Shop name is required."),
  shopAddress: z.string().min(1, "Shop address is required."),
  clientName: z.string().min(1, "Shopkeeper name is required."),
  phoneNumber: z.string().min(1, "Phone number is required."),
  clientId: z.string().min(1, "Client selection is required."),
  description: z.string().min(1, "Surveyor remarks are required."),
});
