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
import { Separator } from "../ui/separator";
import { LogIn, KeyRound, Shield, Eye, EyeOff } from "lucide-react";
import { UserRole } from "@/types/user";

// 🔹 Define the form schema for validation
const formSchema = z.object({
  identifier: z.string().min(3, "Enter a valid email, username, or phone"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "user"]), // Role selection
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { setUser, user } = useUser(); // ✅ Use user context
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  // 🔹 React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { role: "user" },
  });

  // 🔹 Watch the role selection
  const selectedRole = watch("role");

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      if (data.role === "admin") {
        // 🔹 Admin login via Supabase Auth (Email & Password)
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: data.identifier,
            password: data.password,
          });

        if (authError || !authData.user) {
          throw authError || new Error("Invalid admin credentials");
        }

        // 🔹 Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("user_id", authData.user.id)
          .single();

        if (profileError || !profile || profile.role !== "admin") {
          throw new Error("You are not authorized as an admin");
        }

        setUser(authData.user);

        router.push("/admin");
      } else {
        // 🔹 Regular User Login (via /api/auth/login)
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: data.identifier, // Phone or Username
            password: data.password,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Invalid credentials");
        }
        console.log(result, "result");
        // Redirect based on role

        console.log(result.user.role);
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  }
  React.useEffect(() => {
    if (user) {
      const roleRedirects: Record<UserRole, string> = {
        admin: "/admin",
        surveyor: "/surveyor",
        client: "/client",
      };

      // Ensure that user.role is one of the keys of roleRedirects
      router.push(roleRedirects[user.role as UserRole] || "/");
    }
  }, [user, router]);
  return (
    <div className="w-full max-w-[450px] mx-auto p-8 space-y-8">
      <div className="space-y-2 text-center">
        <KeyRound className="w-12 h-12 mx-auto text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to continue</p>
      </div>

      <div className="p-4 rounded-lg bg-secondary/50 flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Your session is secured with enterprise-grade encryption
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* 🔹 Role Selection */}
          <div>
            <Label>Login as</Label>
            <select
              {...register("role")}
              className="w-full p-2 border rounded-md bg-white"
            >
              <option value="admin">Admin (Email & Password)</option>
              <option value="user">User (Username/Phone & Password)</option>
            </select>
          </div>

          {/* 🔹 Dynamic Identifier Field */}
          <div>
            <Label htmlFor="identifier">
              {selectedRole === "admin" ? "Email" : "Username or Phone"}
            </Label>
            <Input
              id="identifier"
              placeholder={
                selectedRole === "admin"
                  ? "admin@example.com"
                  : "username or phone number"
              }
              type={selectedRole === "admin" ? "email" : "text"}
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="mt-1 text-sm text-destructive">
                {errors.identifier.message}
              </p>
            )}
          </div>

          {/* 🔹 Password Field */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        {/* 🔹 Submit Button */}
        <Button className="w-full bg-red-700" disabled={isLoading}>
          {isLoading ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : (
            <LogIn className="w-4 h-4 mr-2" />
          )}
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        By signing in, you agree to our{" "}
        <a href="/terms" className="underline hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
