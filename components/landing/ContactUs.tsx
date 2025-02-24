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

import { motion } from "framer-motion";
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
    <section className="py-16 px-6 bg-white dark:bg-gray-900 text-center">
      <motion.h2
        className="text-4xl font-bold text-red-500"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Contact Us
      </motion.h2>
      <motion.p
        className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        Have questions? Need a custom advertising solution? Send us a message,
        and our team will get back to you shortly.
      </motion.p>
      <div className="max-w-lg text-left text-gray-600 mx-auto mt-10 bg-white dark:bg-gray-900 border p-8 rounded-xl shadow-lg">
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
                : "bg-red-600 hover:bg-red-700"
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
