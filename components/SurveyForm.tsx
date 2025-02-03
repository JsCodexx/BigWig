import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase/Clientsupabase";

const SurveyForm = () => {
  const [surveyName, setSurveyName] = useState<string>("");
  const [surveyData, setSurveyData] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch the current user session
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }

      // Check if session exists and extract user id
      if (session && session.user) {
        setUserId(session.user.id);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      console.error("User not logged in");
      return;
    }

    const { data, error } = await supabase.from("surveys").insert([
      {
        survey_name: surveyName,
        survey_data: surveyData,
        status: "pending",
        surveyor_id: userId,
      },
    ]);

    if (error) {
      console.error("Error submitting survey:", error);
    } else {
      console.log("Survey submitted successfully:", data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Survey Name"
        value={surveyName}
        onChange={(e) => setSurveyName(e.target.value)}
      />
      <textarea
        placeholder="Survey Data"
        value={surveyData}
        onChange={(e) => setSurveyData(e.target.value)}
      />
      <button type="submit">Submit Survey</button>
    </form>
  );
};

export default SurveyForm;
