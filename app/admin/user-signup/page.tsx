import { Metadata } from "next";
import { AdminCreateUserForm } from "@/components/auth/admin-create-user";

export const metadata: Metadata = {
  title: "Register - Survey Management System",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 py-12 px-4 sm:px-6 lg:px-8">
      <AdminCreateUserForm />
    </div>
  );
}
