"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SurveyorSurveysPage = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();
  // Fetch logged-in surveyor ID

  // Fetch assigned surveys
  const fetchSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("surveyor_id", user?.id);

    if (error) {
      console.error(error);
    } else {
      setSurveys(data);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (!user?.id) return;

    fetchSurveys();
  }, [user]);
  const markCompleted = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("quotes") // Update the quotes table
        .update({ status: "conducted" }) // Set status to conducted
        .eq("id", id); // Find the specific survey by ID

      if (error) {
        console.error("Error updating status:", error.message);
        return;
      }
      return;
      fetchSurveys();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-600">My Surveys</h2>

      {loading ? (
        <p className="text-gray-500">Loading surveys...</p>
      ) : surveys.length === 0 ? (
        <p className="text-gray-500">No assigned surveys.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-red-700 text-white">
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey.id} className="border-t">
                  <td className="p-3">{survey.name}</td>
                  <td className="p-3">{survey.email}</td>
                  <td className="p-3">{survey.phone_number}</td>
                  <td className="p-3">{survey.status || "Pending"}</td>
                  <td className="p-3 cursor-pointer flex gap-2">
                    {survey.status === "pending" && (
                      <button
                        className="p-1 text-red-500 border rounded bg-red-200"
                        onClick={() => router.push("/surveyor/add-survey")}
                      >
                        Conduct
                      </button>
                    )}
                    <button
                      className="p-1  text-green-500 border rounded bg-green-200"
                      onClick={() => markCompleted(survey.id)}
                      disabled={survey.status === "conducted"}
                    >
                      {survey.status === "pending"
                        ? "Mark as completed"
                        : "Completed"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SurveyorSurveysPage;
