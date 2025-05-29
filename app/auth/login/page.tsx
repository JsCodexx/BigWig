"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function UserLoginPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-100 via-white to-red-200 flex items-center justify-center px-4 py-6">
      <Card className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl border-0">
        {/* Left Side: Branding & Visuals */}
        <div className="relative flex items-center justify-center bg-red-700 text-white py-10 px-6">
          <div className="absolute inset-0 opacity-10 bg-[url('/images/slide2.webp')] bg-cover bg-center" />
          <div className="relative z-10 space-y-6 text-center max-w-md">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Advertise Smartly
            </h2>
            <p className="text-md text-red-100">
              Manage shop boards, explore billboard options, and control your
              advertising effortlessly.
            </p>
            <div className="relative w-64 h-40 mx-auto">
              <Image
                src="/images/slide2.webp"
                alt="Billboard"
                fill
                className="rounded-xl object-cover shadow-xl border-4 border-white"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-col justify-center px-6 py-12 bg-white">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-700">Welcome Back!</h1>
              <p className="text-sm text-gray-500">
                Login to access your dashboard
              </p>
            </div>
            <CardContent className="p-0">
              <LoginForm role="user" />
            </CardContent>
          </div>
        </div>
      </Card>
    </div>
  );
}
