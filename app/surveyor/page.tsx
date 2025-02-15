"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/Clientsupabase";

interface Survey {
  id: string;
  status: string;
  data: {
    survey_name: string;
  };
}

const SurveyorDashboard = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("surveyor_id", (await supabase.auth.getUser()).data.user?.id);
      if (data) setSurveys(data);
    };

    fetchSurveys();
  }, []);

  return (
    <div>
      <h1>Surveyor Dashboard</h1>
      <ul>
        {surveys.map((survey) => (
          <li key={survey.id}>
            {survey.data?.survey_name} - {survey.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SurveyorDashboard;
