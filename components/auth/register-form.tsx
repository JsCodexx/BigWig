"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserPlus, CheckCircle2, Shield, Lock } from "lucide-react";
import { Toast } from "../ui/toast";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name is required"),
  role: z.enum(["client", "surveyor"], {
    message: "Please select a valid role",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      // Step 1: Create the user in auth.users
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: data.role,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      // Step 2: Get the user ID from the response
      const userId = signUpData?.user?.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      // Step 3: Insert into profiles table
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          user_id: userId,
          full_name: data.fullName,
          email: data.email,
          role: data.role,
          status: data.role === "surveyor" ? "pending" : "accepted",
        },
      ]);

      if (profileError) {
        throw profileError;
      }

      // Redirect to dashboard
      router.push("/dashboard");
      Toast({ title: "Account created" });
    } catch (error) {
      Toast({
        title: "Error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[450px] mx-auto p-8 space-y-8">
      <div className="space-y-2 text-center">
        <UserPlus className="w-12 h-12 mx-auto text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Create an Account</h1>
        <p className="text-muted-foreground">
          Join thousands of users who trust our platform
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              type="text"
              {...register("fullName")}
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="w-full p-2 border rounded"
              {...register("role")}
              disabled={isLoading}
            >
              <option value="">Select a role</option>
              <option value="client">Client</option>
              <option value="surveyor">Surveyor</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-destructive">
                {errors.role.message}
              </p>
            )}
          </div>
        </div>

        <Button className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        By signing up, you agree to our{" "}
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
