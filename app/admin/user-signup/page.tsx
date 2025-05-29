import AdminCreateUserForm from "@/components/auth/admin-create-user";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Survey Management System",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="w-full">
      <AdminCreateUserForm />
    </div>
  );
}
