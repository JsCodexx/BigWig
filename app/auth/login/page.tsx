"use client";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-red-500 mb-6">Login As</h1>

      <div className="flex space-x-6">
        <Link href="/auth/login/admin">
          <button className="px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition">
            Login as Admin
          </button>
        </Link>

        <Link href="/auth/login/user">
          <button className="px-6 py-3 text-white bg-gray-500 rounded-lg hover:bg-blue-600 transition">
            Login as User/Client
          </button>
        </Link>
      </div>
    </div>
  );
}
