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
import { Toast } from "../ui/toast";
import bcrypt from "bcryptjs";

const formSchema = z
  .object({
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    name: z.string().min(2, "Username is required"),
    fullName: z.string().min(2, "Full name is required"),
    address: z.string().min(5, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    user_role: z.enum(["client", "surveyor"], {
      message: "Please select a valid user_role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export function AdminCreateUserForm() {
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
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const { status, error } = await supabase.from("users").insert([
        {
          phone_number: data.phone_number,
          password: hashedPassword,
          full_name: data.fullName,
          name: data.name,
          address: data.address,
          user_role: data.user_role,
        },
      ]);
      console.log(status);
      if (status === 201) {
        router.push("/admin");
      }
      if (error) {
        throw error;
      }

      Toast({ title: "User created successfully" });
    } catch (error) {
      Toast({ title: "Error creating user", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[450px] mx-auto p-8 space-y-8 bg-white dark:bg-gray-900 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-red-700 dark:text-red-500 text-center">
        Create User
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name">Username</Label>
          <Input id="name" {...register("name")} disabled={isLoading} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register("fullName")} disabled={isLoading} />
          {errors.fullName && (
            <p className="text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone_number">Phone</Label>
          <Input
            id="phone_number"
            {...register("phone_number")}
            disabled={isLoading}
          />
          {errors.phone_number && (
            <p className="text-red-500">{errors.phone_number.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} disabled={isLoading} />
          {errors.address && (
            <p className="text-red-500">{errors.address.message}</p>
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
            <p className="text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor="user_role"
            className="text-gray-900 dark:text-gray-100"
          >
            Role
          </Label>
          <select
            id="user_role"
            className="w-full p-2 border rounded bg-secondary/50 dark:bg-secondary/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            {...register("user_role")}
            disabled={isLoading}
          >
            <option value="">Select a user_role</option>
            <option value="client">Client</option>
            <option value="surveyor">Surveyor</option>
          </select>
          {errors.user_role && (
            <p className="text-red-500">{errors.user_role.message}</p>
          )}
        </div>

        <Button
          className="w-full bg-red-700 dark:bg-red-500 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </div>
  );
}
