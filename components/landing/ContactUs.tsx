"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

const ContactUs = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    setTimeout(() => {
      console.log("Form Submitted:", data);
      reset();
      setLoading(false);
    }, 1500);
  };

  return (
    <section className="py-16 px-6 bg-white dark:bg-gray-900">
      <h2 className="text-4xl font-bold text-center">Contact Us</h2>
      <p className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto">
        Have questions? Need a custom advertising solution? Send us a message,
        and our team will get back to you shortly.
      </p>
      <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-900 border p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-medium">Name</label>
            <Input
              type="text"
              {...register("name")}
              className="mt-1"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.root?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <Input
              type="email"
              {...register("email")}
              className="mt-1"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.root?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Phone</label>
            <Input
              type="text"
              {...register("phone")}
              className="mt-1"
              placeholder="1234567890"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.root?.message}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Message</label>
            <Textarea
              {...register("message")}
              className="mt-1"
              placeholder="Write your message here..."
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {errors.root?.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className={cn(
              "w-full text-white font-semibold py-2 rounded-lg transition-all duration-300",
              theme === "dark"
                ? "bg-red-700 hover:bg-red-600"
                : "bg-[#990100] hover:bg-red-700"
            )}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default ContactUs;
