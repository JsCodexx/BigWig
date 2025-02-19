"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@/context/UserContext";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { LogIn, KeyRound, Shield, Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  identifier: z.string().min(3, "Enter a valid email, username, or phone"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "user"]),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: "admin" },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      if (data.role === "admin") {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: data.identifier,
            password: data.password,
          });

        if (authError || !authData.user) {
          throw authError || new Error("Invalid admin credentials");
        }

        setUser(authData.user);
        router.push("/admin");
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Invalid credentials");
        }

        const result = await response.json();
        setUser(result);
        router.push("/");
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 px-6">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl shadow-lg bg-white">
        {/* Left - Stacked Images */}
        <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-200 p-6 relative">
          <div className="relative w-60 h-80">
            <img
              src="/images/slide1.webp"
              alt="Login visual 1"
              className="absolute bottom-0 left-10 w-full h-full object-cover rounded-xl shadow-xl z-10"
            />
            <img
              src="/images/slide2.webp"
              alt="Login visual 2"
              className="absolute top-5 right-10 w-full h-full object-cover rounded-xl shadow-xl z-20 opacity-90"
            />
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="w-full lg:w-1/2 p-10 flex flex-col justify-center items-center bg-white">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-red-500">Sign In</h1>
            <p className="text-gray-600">Access your account</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm mt-6 space-y-6"
          >
            <div>
              <Label className="text-gray-700">Login as</Label>
              <select
                {...register("role")}
                className="w-full p-3 border rounded-md bg-gray-100 border-gray-300 text-gray-700"
              >
                <option value="admin">Admin (Email & Password)</option>
                <option value="user">User (Username/Phone & Password)</option>
              </select>
            </div>

            <div>
              <Label className="text-gray-700">
                {selectedRole === "admin" ? "Email" : "Username or Phone"}
              </Label>
              <Input
                className="w-full p-3 border rounded-md bg-gray-100 border-gray-300 text-gray-700"
                {...register("identifier")}
                disabled={isLoading}
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm">
                  {errors.identifier.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  className="w-full p-3 border rounded-md bg-gray-100 border-gray-300 text-gray-700"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
