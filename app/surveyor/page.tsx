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
          "id, title, description, client_id, client_name, phone_number, shop_name, shop_address, survey_status, created_at"
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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Surveyor Dashboard
      </h1>

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
                        className="mt-4 bg-blue-500 text-white w-full"
                        onClick={() => setSelectedSurvey(survey.id)}
                      >
                        Assign Client
                      </Button>
                    )}

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
                            survey?.survey_status.replace(/_/g, " ")}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "pending_admin_review",
                          "admin_approved",
                          "client_review",
                          "client_approved",
                          "in_progress",
                          "completed",
                        ].map((status) => (
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
