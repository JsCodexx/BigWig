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
      client_approved: ["installation_pending"],
      // installation_pending: ["installation_in_progress"],
      // installation_in_progress: ["installation_completed"],
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
