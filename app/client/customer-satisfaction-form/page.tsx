"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface FormValues {
  client_id: string;
  shop_name: string;
  shop_address: string;
  shopkeeper_name: string;
  cell_number: string;
  client_comments?: string;
}

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
  const { toast } = useToast();
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
      toast({
        title: "User not found",
        description: "You must be logged in to submit the form.",
        variant: "destructive",
      });
      return;
    }

    if (!user.id) {
      toast({
        title: "User ID missing",
        description: "User ID is required to submit the form.",
        variant: "destructive",
      });
      return;
    }

    if (!surveyId) {
      toast({
        title: "Survey ID missing",
        description: "Survey ID is required to submit the form.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // 🔍 Step 1: Check if the user has already submitted the form
    const { data: existingForms, error: checkError } = await supabase
      .from("customer_satisfaction_forms")
      .select("id")
      .eq("survey_id", surveyId)
      .eq("client_id", user.id)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error checking existing form:", checkError.message);
      toast({
        title: "Error checking form",
        description: checkError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (existingForms) {
      toast({
        title: "Form already submitted",
        description:
          "You’ve already submitted a satisfaction form for this survey.",
        variant: "default",
      });
      setIsLoading(false);
      router.push("/client");
      return;
    }

    // 📝 Step 2: Submit form
    const formData = { ...data, client_id: user.id, survey_id: surveyId };

    const { error } = await supabase
      .from("customer_satisfaction_forms")
      .insert([formData]);

    setIsLoading(false);

    if (error) {
      console.error("❌ Error submitting form:", error.message);
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Form submitted",
        description: "Thanks for your feedback!",
      });
      router.push("/client");
    }
  }

  useEffect(() => {
    if (user?.id) {
      setValue("client_id", user.id);
    }
  }, [user, setValue]);
  const fields: { label: string; name: keyof FormValues; type: string }[] = [
    { label: "Shop Name", name: "shop_name", type: "text" },
    { label: "Shop Address", name: "shop_address", type: "text" },
    { label: "Shopkeeper Name", name: "shopkeeper_name", type: "text" },
    { label: "Cell Number", name: "cell_number", type: "tel" },
  ];

  return (
    <div className="py-16 px-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-red-700 flex items-center gap-2">
          <File className="text-red-600" /> Satisfaction Form
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Let us know how your experience was with BigWig.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <p>
          Thank you so much for your cooperation. We appreciate the opportunity
          to serve you with our fascia installation services. Bigwig
          Enterprises, as a vendor of Pakistan Cables, has carried out its
          obligations professionally. You confirm that the fascia was installed
          under your supervision and you are completely satisfied with the
          installation. You further confirm that maintaining the visibility of
          the board is your responsibility and that this space will not be
          provided to any other company.
        </p>
        <p className="rtl text-right">
          لیے ہم آپ کے تعاون کا بہت شکریہ۔ آپ کی دکان پر بورڈ لگانے کی ہماری
          خدمات کے ساتھ آپ کی خدمت کا موقع فراہم کرنے کے لیے ہم آپ کے شکر گزار
          ہیں۔ میسرز بگ وگ انٹرپرائزز، پاکستان کیبلز کے وینڈر کے طور پر، پیشہ
          ورانہ معیار کے مطابق ذمہ داریاں نبھا رہا ہے۔ آپ اس بات کی تصدیق کرتے
          ہیں کہ بورڈ آپ کی نگرانی میں نصب کیا گیا تھا اور آپ انسٹالیشن سے مکمل
          طور پر مطمئن ہیں۔ آپ مزید تصدیق کرتے ہیں کہ بورڈ کی مرئیت کو برقرار
          رکھنا آپ کی ذمہ داری ہوگی اور یہ جگہ کسی دوسری کمپنی کو فراہم نہیں کی
          جائے گی۔
        </p>
      </div>

      <hr className="border-t border-gray-300 dark:border-gray-600" />

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit((data) => onSubmit(data))(e);
        }}
        noValidate
        className="space-y-6"
      >
        <input type="hidden" {...register("client_id")} />

        {fields.map((field) => (
          <div key={field.name}>
            <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800"
              {...register(field.name)}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}

        <div>
          <label className="block font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
            Comments
          </label>
          <textarea
            placeholder="Write your feedback here..."
            rows={4}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800"
            {...register("client_comments")}
          />
          {errors.client_comments && (
            <p className="text-red-500 text-sm mt-1">
              {errors.client_comments.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-medium rounded-xl transition-all"
        >
          {isLoading ? "Submitting..." : "Submit Form"}
        </Button>
      </form>
    </div>
  );
};
export default CustomerSatisfactionForm;
