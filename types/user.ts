export type UserRole = "admin" | "surveyor" | "client";

export interface User {
  user_id?: string;
  full_name: string;
  email?: string;
  role?: UserRole;
  phone_number?: string;
  status?: "active" | "inactive";
  created_at: string;
  updated_at: string;
  id?: string;
  address?: string;
}
