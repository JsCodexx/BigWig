"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Survey } from "@/types/survey";
import { useUser } from "@/context/UserContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { getAllowedStatusOptions } from "@/lib/utils";

const SurveyorDashboard = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;

      let query = supabase
        .from("surveys")
        .select(
          "id, description, client_id, client_name, phone_number, shop_name, shop_address, survey_status, created_at, form_image"
        )
        .eq("client_id", user.id);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching surveys:", error);
        return;
      }

      if (data) setSurveys(data);
    };
    fetchSurveys();
  }, [user]);

  // Function to update survey status
  const updateStatus = async (surveyId: string, newStatus: string) => {
    const { error } = await supabase
      .from("surveys")
      .update({ survey_status: newStatus })
      .eq("id", surveyId);

    if (error) {
      console.error("Error updating status:", error);
      return;
    }

    setSurveys((prevSurveys) =>
      prevSurveys.map((survey) =>
        survey.id === surveyId
          ? { ...survey, survey_status: newStatus }
          : survey
      )
    );
  };

  // Group surveys by status
  const groupedSurveys = surveys.reduce((acc, survey) => {
    if (!acc[survey.survey_status]) acc[survey.survey_status] = [];
    acc[survey.survey_status].push(survey);
    return acc;
  }, {} as Record<string, Survey[]>);

  const statuses = Object.keys(groupedSurveys);

  useEffect(() => {
    if (statuses.length > 0 && !activeTab) {
      setActiveTab(statuses[0]);
    }
  }, [statuses, activeTab]);

  return (
    <>
      {loading ? (
        <p className="text-gray-500">Loading your Orders...</p>
      ) : surveys.length === 0 ? (
        <p className="text-gray-500">You do not have any active Order.</p>
      ) : (
        <div className="py-16 px-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-red-700 mb-6">Surveys</h1>
          </div>
          {/* Tabs Navigation */}
          <Tabs
            value={activeTab || ""}
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
              {statuses.map((status) => (
                <TabsTrigger key={status} value={status} className="capitalize">
                  {status.replace(/_/g, " ")}
                </TabsTrigger>
              ))}
            </TabsList>

            {statuses.map((status) => (
              <TabsContent key={status} value={status}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedSurveys[status].map((survey) => (
                    <Card
                      key={survey.id}
                      className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
                    >
                      <CardHeader className="pb-0">
                        <div className="flex justify-center items-center">
                          <div
                            className="w-48 h-60 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-gray-400 shadow-lg"
                            style={{
                              backgroundImage: `url(${survey.form_image})`,
                              backgroundSize: "contain",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                            }}
                          ></div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(survey.created_at).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 dark:text-gray-300">
                          {survey.description || "No description provided."}
                        </p>
                        <div className="mt-1 space-y-1">
                          <p>
                            <strong>Client:</strong>{" "}
                            {survey.client_name || "Not assigned"}
                          </p>
                          <p>
                            <strong>Phone:</strong>{" "}
                            {survey.phone_number || "N/A"}
                          </p>
                          <p>
                            <strong>Shop:</strong> {survey.shop_name || "N/A"}
                          </p>
                          <p>
                            <strong>Address:</strong>{" "}
                            {survey.shop_address || "N/A"}
                          </p>
                        </div>
                        {/* Status Dropdown */}
                        <Select
                          value={survey.survey_status}
                          onValueChange={(newStatus) =>
                            updateStatus(survey.id, newStatus)
                          }
                        >
                          <SelectTrigger className="mt-4 w-full bg-gray-100 dark:bg-gray-700">
                            <SelectValue>
                              {survey.survey_status &&
                                survey.survey_status.replace(/_/g, " ")}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {getAllowedStatusOptions(
                              user.user_role ? user?.user_role : "",
                              survey.survey_status
                            ).map((status) => (
                              <SelectItem
                                key={status}
                                value={status}
                                className="capitalize"
                              >
                                {status.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {survey.survey_status === "completed" && (
                          <Button
                            onClick={() =>
                              router.push(
                                `/client/customer-satisfaction-form?survey_id=${survey.id}`
                              )
                            }
                          >
                            Fill Satisfactory Form
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </>
  );
};

export default SurveyorDashboard;
