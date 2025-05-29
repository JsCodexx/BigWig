"use client";

import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex h-[83vh] w-full items-center justify-center px-2">
      <div className="flex h-full w-[80%] items-center justify-center px-2">
        <div className="flex w-full max-w-7xl overflow-hidden rounded-2xl shadow-lg bg-white">
          {/* Left - Stacked Images */}
          <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-200 p-2 relative">
            <div className="relative w-60 h-80">
              <img
                src="/images/slide1.webp"
                alt="Admin login visual 1"
                className="absolute bottom-0 left-10 w-full h-full object-cover rounded-xl shadow-xl z-10"
              />
              <img
                src="/images/slide2.webp"
                alt="Admin login visual 2"
                className="absolute top-5 right-10 w-full h-full object-cover rounded-xl shadow-xl z-20 opacity-90"
              />
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center items-center bg-white">
            <LoginForm role="admin" />
          </div>
        </div>
      </div>
    </div>
  );
}
