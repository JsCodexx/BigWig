"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@/context/UserContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogIn, Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  identifier: z.string().min(3, "Enter a valid email, username, or phone"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm({ role }: { role: "admin" | "user" }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    console.log("role", role);
    try {
      if (role === "admin") {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: data.identifier,
            password: data.password,
          });

        if (authError || !authData.user) {
          throw authError || new Error("Invalid admin credentials");
        }
        console.log(authData);
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
        console.log(result);
        setUser(result);
        if (result.user.user_role === "client") {
          router.push("/client");
        } else {
          router.push("/surveyor/dashboard");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm mt-6 space-y-6"
    >
      <div>
        <Label className="text-gray-700">
          {role === "admin" ? "Email" : "Phone"}
        </Label>
        <Input {...register("identifier")} disabled={isLoading} />
        {errors.identifier && (
          <p className="text-red-500 text-sm">{errors.identifier.message}</p>
        )}
      </div>

      <div>
        <Label className="text-gray-700">Password</Label>
        <Input
          type={showPassword ? "text" : "password"}
          {...register("password")}
          disabled={isLoading}
        />
      </div>

      <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition duration-300">
        {isLoading ? (
          "Signing in..."
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" /> Sign In
          </>
        )}
      </Button>
    </form>
  );
}
