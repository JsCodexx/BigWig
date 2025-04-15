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
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Zod Schema for Form Validation
const contactSchema = z.object({
  full_name: z.string().min(2, "Full Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone_number: z.string().min(11, "Phone number must be 10 digits."),
  address: z.string().min(10, "Message must be at least 10 characters."),
});

const ContactUs = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      // Step 1: Create a new quote in the quotes table (without address)
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert([
          {
            email: data.email,
            phone_number: data.phone_number,
            full_name: data.full_name,
          },
        ])
        .select(" email, phone_number, full_name")
        .single();

      if (quoteError) throw quoteError;

      // Step 2: Check if the user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", data.phone_number)
        .single();

      // Step 3: If user doesn't exist, create a new client user (includes address)
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash("12345678", 10);
        const { error: userError } = await supabase.from("users").insert([
          {
            full_name: data.full_name,
            email: data.email,
            phone_number: data.phone_number,
            user_role: "client",
            password: hashedPassword,
            address: data.address, // Storing the address in users table
          },
        ]);

        if (userError) throw userError;
      }

      // Set response data to display confirmation
      setResponseData(quote);
      reset();
    } catch (error: any) {
      console.error("Error submitting form:", error.message);
    } finally {
      setLoading(false);
    }
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
              {...register("full_name")}
              className="mt-1"
              placeholder="John Doe"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.full_name.message)}
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
                {String(errors.email.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Phone</label>
            <Input
              type="text"
              {...register("phone_number")}
              className="mt-1"
              placeholder="1234567890"
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.phone_number.message)}
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium">Message</label>
            <Textarea
              {...register("address")}
              className="mt-1"
              placeholder="Write your address here..."
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.address.message)}
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

        {responseData && (
          <div className="mt-6 p-4 border rounded-lg bg-green-100 text-green-700">
            <h3 className="text-lg font-bold">Quote Created Successfully!</h3>
            <p>
              <strong>Name:</strong> {responseData.full_name}
            </p>
            <p>
              <strong>Email:</strong> {responseData.email}
            </p>
            <p>
              <strong>Phone:</strong> {responseData.phone_number}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactUs;
