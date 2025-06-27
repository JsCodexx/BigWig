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
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Zod Schema for Form Validation
const contactSchema = z.object({
  full_name: z.string().min(2, "Full Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phone_number: z.string().min(11, "Phone number must be 11 digits."),
  comment: z.string().min(10, "Comment must be at least 10 characters."),
  address: z.string().min(10, "Address must be at least 10 characters."),
});

const ContactUs = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const [rawPassword, setRawPassword] = useState<string>("");
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const [first, ...rest] = data.full_name.trim().split(" ");
      const last = rest.join("_").toLowerCase();
      const phoneLast4 = data.phone_number.slice(-4);
      const raw = `${first.toLowerCase()}_${last}@${phoneLast4}`;
      setRawPassword(raw);
      const hashedPassword = await bcrypt.hash(raw, 10);
      // Step 1: Create a new quote
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .insert([
          {
            email: data.email,
            phone_number: data.phone_number,
            full_name: data.full_name,
            comments: data.comment,
          },
        ])
        .select("email, phone_number, full_name")
        .single();

      if (quoteError) {
        console.log(quoteError);
        setLoading(false);
        toast({
          title: "Unable to create Quote",
          description: "Failed to create the quote  check the log for error",
          variant: "default",
        });
      }

      // Step 2: Check if the user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", data.phone_number)
        .single();

      // Step 3: If user doesn't exist, create a new client user
      if (!existingUser) {
        const { error: userError } = await supabase.from("users").insert([
          {
            full_name: data.full_name,
            email: data.email,
            phone_number: data.phone_number,
            user_role: "client",
            password: hashedPassword,
            address: data.address,
          },
        ]);

        if (userError) {
          console.log(userError);
          setLoading(false);
          toast({
            title: "Unable to create user",
            description:
              "Failed to create the new user check the log for error",
            variant: "default",
          });
        }
      }

      setResponseData(quote);
      toast({
        title: "Quote Submitted",
        description:
          "Your request was submitted successfully. We'll contact you soon!",
        variant: "default",
      });
      reset();
    } catch (error: any) {
      console.error("Submission Error:", error.message);

      toast({
        title: "Submission Failed",
        description:
          error.message ||
          "Something went wrong while submitting your request.",
        variant: "destructive",
      });
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
      <div className="max-w-2xl text-left text-gray-600 mx-auto mt-10 bg-white dark:bg-gray-900 border p-8 rounded-xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label className="block font-medium">Name</Label>
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
            <Label className="block font-medium">Email</Label>
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
            <Label className="block font-medium">Phone</Label>
            <Input
              type="text"
              {...register("phone_number")}
              className="mt-1"
              placeholder="1234567890"
              maxLength={11}
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.phone_number.message)}
              </p>
            )}
          </div>

          <div>
            <Label className="block font-medium">Comments</Label>
            <Textarea
              {...register("comment")}
              className="mt-1"
              placeholder="Write your comments here..."
            />
            {errors.comment && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.comment.message)}
              </p>
            )}
          </div>
          <div>
            <Label className="block font-medium">Address</Label>
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
          <div className="mt-6 p-6 border rounded-lg bg-green-100 text-green-700 max-w-md mx-auto shadow-lg">
            <h3 className="text-lg font-bold mb-2">
              Quote Created Successfully!
            </h3>
            <p>
              <strong>Name:</strong> {responseData.full_name}
            </p>
            <p>
              <strong>Email:</strong> {responseData.email}
            </p>
            <p>
              <strong>Phone:</strong> {responseData.phone_number}
            </p>
            <div className="mt-4 p-4 bg-green-200 border border-green-400 rounded">
              <p>
                You can login using your <strong>phone number</strong> and the
                default password <strong>{rawPassword}</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactUs;
