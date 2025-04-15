"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  client_id: z.string().uuid(),
  shop_name: z.string().min(3, "Shop Name is required"),
  shop_address: z.string().min(5, "Shop Address is required"),
  shopkeeper_name: z.string().min(3, "Shopkeeper Name is required"),
  cell_number: z.string().min(1, "phone number should be of 10 digits"),
  client_comments: z
    .string()
    .min(1, "Please add some comments about your experience"),
});

type FormData = z.infer<typeof formSchema>;

const CustomerSatisfactionForm = () => {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("survey_id");
  const {
    register,
    handleSubmit,
    setValue, // ✅ Allows setting `client_id`
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      client_id: user?.id || "", // ✅ Pre-fill client_id
    },
  });

  async function onSubmit(data: FormData) {
    if (!user) {
      console.log("❌ User not found");
      alert("You must be logged in to submit the form.");
      return;
    }

    if (!user.id) {
      console.log("❌ User ID is missing");
      alert("User ID is required.");
      return;
    }

    if (!surveyId) {
      console.log("❌ Survey ID is missing");
      alert("Survey ID is required.");
      return;
    }

    setIsLoading(true);

    // 🔍 Step 1: Check if the user has already submitted the form for this survey
    const { data: existingForms, error: checkError } = await supabase
      .from("customer_satisfaction_forms")
      .select("id")
      .eq("survey_id", surveyId)
      .eq("client_id", user.id)
      .maybeSingle(); // Expecting either one result or null

    if (checkError) {
      console.error("❌ Error checking existing form:", checkError.message);
      alert("Error checking existing form: " + checkError.message);
      setIsLoading(false);
      return;
    }

    if (existingForms) {
      console.warn("⚠️ User already submitted form for this survey");
      alert("You have already submitted a satisfaction form for this survey.");
      setIsLoading(false);
      router.push("/client");
      return;
    }

    // 📝 Step 2: Proceed with form submission if no previous record exists
    const formData = { ...data, client_id: user.id, survey_id: surveyId };

    const { error } = await supabase
      .from("customer_satisfaction_forms")
      .insert([formData]);
    setIsLoading(false);

    if (error) {
      console.error("❌ Error submitting form:", error.message);
      alert("Error submitting form: " + error.message);
    } else {
      console.log("✅ Form submitted successfully!");
      router.push("/client");
      // alert("Form submitted successfully!");
    }
  }

  useEffect(() => {
    console.log("Validation Errors:", errors);
  }, [errors]);
  useEffect(() => {
    if (user?.id) {
      setValue("client_id", user.id);
      console.log("✅ Client ID set:", user.id);
    }
  }, [user, setValue]);

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Customer Satisfaction Form</h2>
      <p className="mb-4">
        Thank you so much for your cooperation. We appreciate the opportunity to
        serve you with our fascia installation services. Bigwig Enterprises, as
        a vendor of Pakistan Cables, has carried out its obligations
        professionally. You confirm that the fascia was installed under your
        supervision and you are completely satisfied with the installation. You
        further confirm that maintaining the visibility of the board is your
        responsibility and that this space will not be provided to any other
        company.
      </p>
      <p className="mb-4 rtl">
        لیے ہم آپ کے تعاون کا بہت شکریہ۔ آپ کی دکان پر بورڈ لگانے کی ہماری خدمات
        کے ساتھ آپ کی خدمت کا موقع فراہم کرنے کے لیے ہم آپ کے شکر گزار ہیں۔
        میسرز بگ وگ انٹرپرائزز، پاکستان کیبلز کے وینڈر کے طور پر، پیشہ ورانہ
        معیار کے مطابق ذمہ داریاں نبھا رہا ہے۔ آپ اس بات کی تصدیق کرتے ہیں کہ
        بورڈ آپ کی نگرانی میں نصب کیا گیا تھا اور آپ انسٹالیشن سے مکمل طور پر
        مطمئن ہیں۔ آپ مزید تصدیق کرتے ہیں کہ بورڈ کی مرئیت کو برقرار رکھنا آپ کی
        ذمہ داری ہوگی اور یہ جگہ کسی دوسری کمپنی کو فراہم نہیں کی جائے گی۔
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Form submission triggered!"); // ✅ You already see this
          handleSubmit((data) => {
            console.log("Data received:", data); // 🔴 This should appear
            onSubmit(data);
          })(e);
        }}
        noValidate
      >
        <div className="mb-4">
          <input type="hidden" {...register("client_id")} />
          <label className="block">Shop Name:</label>
          <input className="w-full p-2 border" {...register("shop_name")} />
          {errors.shop_name && (
            <p className="text-red-500">{errors.shop_name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block">Shop Address:</label>
          <input className="w-full p-2 border" {...register("shop_address")} />
          {errors.shop_address && (
            <p className="text-red-500">{errors.shop_address.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block">Shopkeeper Name:</label>
          <input
            className="w-full p-2 border"
            {...register("shopkeeper_name")}
          />
          {errors.shopkeeper_name && (
            <p className="text-red-500">{errors.shopkeeper_name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block">Cell Number:</label>
          <input
            className="w-full p-2 border"
            type="tel"
            {...register("cell_number")}
          />
          {errors.cell_number && (
            <p className="text-red-500">{errors.cell_number.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block">Comments:</label>
          <textarea
            className="w-full p-2 border"

            {...register("client_comments")}
          />
          {errors.client_comments && (
            <p className="text-red-500">{errors.client_comments.message}</p>
          )}
        </div>

        <Button
          className="w-full bg-red-600 dark:bg-red-500 text-white hover:bg-red-700"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};
export default CustomerSatisfactionForm;
