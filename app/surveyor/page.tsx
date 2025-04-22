"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase/Clientsupabase";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { getAllowedStatusOptions } from "@/lib/utils";
import { json } from "node:stream/consumers";

const SurveyorDashboard = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>(
    []
  );
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;

      let query = supabase
        .from("surveys")
        .select(
          "id, description, client_id, client_name, phone_number, shop_name, shop_address, survey_status, created_at, form_image"
        );

      if (user.user_role !== "admin") {
        query = query.eq("surveyor_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching surveys:", error);
        return;
      }

      if (data) setSurveys(data);
    };

    const fetchClients = async () => {
      if (user?.user_role === "admin") {
        const { data, error } = await supabase
          .from("users")
          .select("id, full_name")
          .eq("user_role", "client");

        if (error) {
          console.error("Error fetching clients:", error);
          return;
        }

        if (data) setClients(data);
      }
    };

    fetchSurveys();
    fetchClients();
  }, [user]);

  // Function to update survey status
  const updateStatus = async (surveyId: string, newStatus: string) => {
    try {
      // Check for installation status before proceeding
      if (newStatus === "installation_completed") {
        const { data, error: fetchError } = await supabase
          .from("surveys")
          .select("payment_installation")
          .eq("id", surveyId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching payment data:", fetchError);
          alert("Something went wrong while checking installation charges.");
          return;
        }

        if (
          !data ||
          !data.payment_installation ||
          data.payment_installation === 0
        ) {
          alert(
            "Please update the installation charges before completing installation."
          );
          return;
        }
      }

      // Proceed to update status
      const { error: updateError } = await supabase
        .from("surveys")
        .update({ survey_status: newStatus })
        .eq("id", surveyId);

      if (updateError) {
        console.error("Error updating status:", updateError);
        alert("Failed to update survey status.");
        return;
      }

      // Update local state
      setSurveys((prevSurveys) =>
        prevSurveys.map((survey) =>
          survey.id === surveyId
            ? { ...survey, survey_status: newStatus }
            : survey
        )
      );
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Unexpected error occurred. Please try again.");
    }
  };

  // Function to assign a client to a survey
  const assignClient = async () => {
    if (!selectedSurvey || !selectedClient) return;

    const { error } = await supabase
      .from("surveys")
      .update({ client_id: selectedClient })
      .eq("id", selectedSurvey);

    if (error) {
      console.error("Error assigning client:", error);
      return;
    }

    setSurveys((prevSurveys) =>
      prevSurveys.map((survey) =>
        survey.id === selectedSurvey
          ? { ...survey, client_id: selectedClient }
          : survey
      )
    );

    setSelectedSurvey(null); // Close the dialog
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
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-700 mb-6">Surveys</h1>
        <Button
          className="bg-red-600 hover:bg-red-700"
          onClick={() => router.push("/surveyor/add-survey")}
        >
          <Plus />
          Add Survey
        </Button>
      </div>
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab || ""}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          {statuses.map((status) => (
            <TabsTrigger
              key={status}
              value={status}
              className="capitalize flex items-center space-x-2"
            >
              <span>{status.replace(/_/g, " ")}</span>
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {groupedSurveys[status]?.length}
              </span>
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
                          backgroundSize: "contain", // Ensures the full image is visible
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
                        <strong>Phone:</strong> {survey.phone_number || "N/A"}
                      </p>
                      <p>
                        <strong>Shop:</strong> {survey.shop_name || "N/A"}
                      </p>
                      <p>
                        <strong>Address:</strong> {survey.shop_address || "N/A"}
                      </p>
                    </div>

                    {/* Assign Client Button (Admin Only) */}
                    {user?.user_role === "admin" && !survey.client_id && (
                      <Button
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full"
                        onClick={() => setSelectedSurvey(survey.id)}
                      >
                        Assign Client
                      </Button>
                    )}
                    {/* Update surveys */}

                    {(() => {
                      const role = user?.user_role?.toLowerCase();
                      const status = survey?.survey_status?.trim();

                      if (
                        (role === "admin" &&
                          status === "pending_admin_review") ||
                        (role === "client" && status === "client_review")
                      ) {
                        return (
                          <Button
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full"
                            onClick={() => router.push(`surveyor/${survey.id}`)}
                          >
                            Update Survey
                          </Button>
                        );
                      }

                      if (role === "admin" && status === "client_approved") {
                        return (
                          <Button
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full"
                            onClick={() => router.push(`surveyor/${survey.id}`)}
                          >
                            Update Design
                          </Button>
                        );
                      }

                      if (
                        role === "surveyor" &&
                        status === "installation_completed"
                      ) {
                        return (
                          <Button
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full"
                            onClick={() => router.push(`surveyor/${survey.id}`)}
                          >
                            Upload Installation Images
                          </Button>
                        );
                      }

                      return null;
                    })()}

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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Assign Client Modal */}
      <Dialog
        open={!!selectedSurvey}
        onOpenChange={() => setSelectedSurvey(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Client</DialogTitle>
          </DialogHeader>
          <Select
            value={selectedClient || ""}
            onValueChange={setSelectedClient}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client">
                {clients.find((client) => client.id === selectedClient)
                  ?.full_name || "Select a client"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={assignClient} disabled={!selectedClient}>
            Assign
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SurveyorDashboard;
