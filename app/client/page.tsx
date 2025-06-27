"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  AtSign,
  Phone,
  CheckCircle,
  ArrowRight,
  Zap,
  UploadCloud,
  LucideLoader2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { supabase } from "../lib/supabase/Clientsupabase";
import { Survey } from "@/types/survey";
import { useToast } from "@/hooks/use-toast";

export type QuoteStatus = "pending" | "conducted" | "approved" | "rejected";

export interface Quote {
  id: string;
  client_id: string;
  phone_number: string;
  status: QuoteStatus;
  created_at: string;
  updated_at: string;
}

const getStatusMessage = (status: string) => {
  const fancyMap: Record<string, string> = {
    pending_admin_review: "Survey submitted. Awaiting admin review.",
    client_review: "Survey ready for your review and feedback.",
    client_approved: "Survey approved! Installation preparation underway.",
    admin_approved: "Survey approved by admin! Awaiting next steps.",
    in_progress: "Thanks for your patience The design are being finalized",
    installation_pending: "Installation has been scheduled. Stay tuned!",
    installation_in_progress: "Installation in progress! 🛠️",
    installation_completed: "Installation completed. Final checks ongoing.",
    completed: "🎉 Everything is complete! Thank you for choosing BigWig.",
  };

  return fancyMap[status] ?? `Current status: ${status}`;
};

const ClientDashboard = () => {
  const { user, setUser } = useUser();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const { toast } = useToast();

  // Fetch quote by phone number
  useEffect(() => {
    if (!user?.phone_number) return;
    (async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("phone_number", user.phone_number)
        .single();

      if (error) {
        toast({
          title: "Failed to fetch quote",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setQuote(data);
      }
    })();
  }, [user]);

  // Fetch survey if quote is conducted
  useEffect(() => {
    if (!quote || quote.status !== "conducted" || !user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("client_id", user.id)
        .single();

      if (error) {
        toast({
          title: "Failed to fetch survey",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSurvey(data);
      }
    })();
  }, [quote, user]);

  // Handle profile update with toast
  const handleUpdateProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("users")
      .update({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUser(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  if (!user) return <div className="text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      {/* STATUS SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 p-8 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Survey Status</h2>
            {quote?.status === "pending" ? (
              <div className="flex items-center gap-3 text-lg animate-pulse">
                <LucideLoader2 className="w-6 h-6 animate-spin" />
                <span>BigWig is assigning a surveyor. Hang tight!</span>
              </div>
            ) : quote?.status === "conducted" && survey ? (
              <div className="space-y-2">
                <p className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-300" />
                  Status:
                  {getStatusMessage(survey.survey_status)}
                </p>

                {survey.survey_status === "client_review" && (
                  <Link href={`/surveyor/${survey.id}`}>
                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-gray-100 transition">
                      Update Survey Info
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                )}

                {survey.survey_status === "completed" && (
                  <Link
                    href={`/client/customer-satisfaction-form?survey_id=${survey.id}`}
                  >
                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-100 transition">
                      Upload Satisfactory Form
                      <UploadCloud className="w-5 h-5" />
                    </div>
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-white/80 text-lg">
                {quote
                  ? "Your quote is in progress. Please wait for the next update."
                  : "No quote found for your account."}
              </p>
            )}
          </div>
          <div className="hidden md:block">
            <LucideLoader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      </div>

      {/* PROFILE SECTION */}
      <div className="bg-white/80 backdrop-blur-md border border-white/30 shadow-xl rounded-3xl p-6 space-y-4">
        <h3 className="text-xl text-red-600 font-semibold flex items-center gap-2 text-gray-800">
          <UserIcon className="w-6 h-6 text-indigo-600" /> Your Profile
        </h3>
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-gray-500" /> Name
          </label>
          <input
            type="text"
            className="w-full p-2 mt-1 border rounded-md"
            value={user.full_name}
            onChange={(e) => setUser({ ...user, full_name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <AtSign className="w-4 h-4 text-gray-500" /> Email
          </label>
          <input
            type="email"
            className="w-full p-2 mt-1 border rounded-md"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" /> Phone
          </label>
          <input
            type="tel"
            className="w-full p-2 mt-1 border rounded-md"
            value={user.phone_number}
            onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
          />
        </div>
        <button
          onClick={handleUpdateProfile}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <CheckCircle className="w-5 h-5" /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default ClientDashboard;
