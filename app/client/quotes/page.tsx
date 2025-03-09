"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@/context/UserContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SurveyorSurveysPage = () => {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  // Fetch logged-in surveyor ID

  const fetchSurveys = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("phone_number", user?.phone_number);

    if (error) {
      console.error(error);
    } else {
      setSurveys(data);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchSurveys();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-red-600">My Quotes</h2>

      {loading ? (
        <p className="text-gray-500">Loading your quotes...</p>
      ) : surveys.length === 0 ? (
        <p className="text-gray-500">You do not have any active quotes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-red-700 text-white">
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey.id} className="border-t">
                  <td className="p-3">{survey.name}</td>
                  <td className="p-3">{survey.email}</td>
                  <td className="p-3">{survey.phone_number}</td>
                  <td className="p-3">{survey.status || "Pending"}</td>
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
