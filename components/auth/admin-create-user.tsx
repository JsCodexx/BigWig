"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import bcrypt from "bcryptjs";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(5, "Address is required"),
    user_role: z.enum(["client", "surveyor"], {
      required_error: "Please select a user role",
    }),
    cnic: z
      .string()
      .regex(/^[0-9]{13}$/, "CNIC must be 13 digits")
      .optional(),
  })
  .refine((data) => (data.user_role === "surveyor" ? !!data.cnic : true), {
    message: "CNIC is required for surveyors",
    path: ["cnic"],
  });

type FormData = z.infer<typeof formSchema>;

export default function AdminCreateUserForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Watch user_role for conditional CNIC field
  const userRole = watch("user_role");

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const [first, ...rest] = data.fullName.trim().split(" ");
      const last = rest.join("_").toLowerCase();
      const phoneLast4 = data.phone_number.slice(-4);
      const rawPassword = `${first.toLowerCase()}_${last}@${phoneLast4}`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const { error } = await supabase.from("users").insert([
        {
          full_name: data.fullName,
          phone_number: data.phone_number,
          address: data.address,
          user_role: data.user_role,
          cnic: data.user_role === "surveyor" ? data.cnic : null,
          password: hashedPassword,
        },
      ]);
      if (error) throw error;

      toast({
        title: "User created!",
        description: "The user was successfully added.",
        variant: "default",
      });
      router.push("/admin/users");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Users className="text-red-600" /> Add User
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Add Surveyors and Clients.
        </p>
      </div>

      <Card className="p-4 border-none">
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-gray-600" htmlFor="fullName">
                Full Name
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                disabled={isLoading}
                placeholder="John Doe"
                aria-invalid={errors.fullName ? "true" : "false"}
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-gray-600" htmlFor="phone_number">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                {...register("phone_number")}
                disabled={isLoading}
                placeholder="03123456789"
                aria-invalid={errors.phone_number ? "true" : "false"}
              />
              {errors.phone_number && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* User Role Select */}
            <div className="space-y-2">
              <Label className="text-gray-600" htmlFor="user_role">
                User Role
              </Label>
              <Controller
                name="user_role"
                control={control}
                defaultValue="client" // 👈 IMPORTANT!
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                    aria-invalid={!!errors.user_role}
                  >
                    <SelectTrigger id="user_role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="surveyor">Surveyor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              {errors.user_role && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.user_role.message}
                </p>
              )}
            </div>

            {/* CNIC (conditional) */}
            {userRole === "surveyor" && (
              <div className="space-y-2">
                <Label className="text-gray-600" htmlFor="cnic">
                  CNIC (13 digits)
                </Label>
                <Input
                  id="cnic"
                  {...register("cnic")}
                  disabled={isLoading}
                  placeholder="1234512345671"
                  aria-invalid={errors.cnic ? "true" : "false"}
                />
                {errors.cnic && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.cnic.message}
                  </p>
                )}
              </div>
            )}

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-gray-600" htmlFor="address">
                Address
              </Label>
              <Input
                id="address"
                {...register("address")}
                disabled={isLoading}
                placeholder="Enter your address"
                aria-invalid={errors.address ? "true" : "false"}
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="button"
              onClick={() => {
                handleSubmit(onSubmit, (errors) => {
                  console.log("Validation Errors:", errors);
                })();
              }}
            >
              Debug Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
