"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/Clientsupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Survey } from "@/types/survey";
import { useUser } from "@/context/UserContext";

const SurveyorDashboard = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("surveys")
        .select(
          "id, title, description, client_name, phone_number, shop_name, shop_address, status, created_at"
        )
        .eq("surveyor_id", user.id);

      if (error) {
        console.error("Error fetching surveys:", error);
        return;
      }

      if (data) setSurveys(data);
    };

    fetchSurveys();
  }, [user]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Surveyor Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card
            key={survey.id}
            className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-red-500">
                {survey.title}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(survey.created_at).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">
                {survey.description || "No description provided."}
              </p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Client:</strong> {survey.client_name || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong> {survey.phone_number || "N/A"}
                </p>
                <p>
                  <strong>Shop:</strong> {survey.shop_name || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {survey.shop_address || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-medium ${
                      survey.status === "pending"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {survey.status}
                  </span>
                </p>
              </div>
              <Button
                className="mt-4 bg-red-500 text-white w-full"
                onClick={() => router.push(`/surveyor/${survey.id}`)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SurveyorDashboard;
