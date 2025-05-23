"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { useUser } from "@/context/UserContext";
import {
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  FileQuestion,
  Loader,
  Wrench,
} from "lucide-react";

const ClientDashboard = () => {
  const { user } = useUser();
  const [counts, setCounts] = useState({
    pendingReview: 0,
    pendingInstallation: 0,
    completed: 0,
    installationInProgress: 0,
    others: 0,
  });

  useEffect(() => {
    if (!user) return;

    async function fetchSurveys() {
      const { data, error } = await supabase
        .from("surveys")
        .select("survey_status")
        .eq("client_id", user.id);

      if (error) {
        console.error("Error fetching surveys:", error.message);
        return;
      }

      const pendingReview = data.filter(
        (s) => s.survey_status === "pending_admin_review"
      ).length;
      const pendingInstallation = data.filter(
        (s) => s.survey_status === "pending_installation"
      ).length;
      const installationInProgress = data.filter(
        (s) => s.survey_status === "installation_in_progress"
      ).length;
      const completed = data.filter(
        (s) => s.survey_status === "completed"
      ).length;
      const others = data.filter(
        (s) =>
          ![
            "installation_in_progress",
            "pending_installation",
            "completed",
            "pending_admin_review",
          ].includes(s.survey_status)
      ).length;

      setCounts({
        pendingReview,
        pendingInstallation,
        installationInProgress,
        completed,
        others,
      });
    }

    fetchSurveys();
  }, [user]);

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg flex flex-col space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Client Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <ClipboardList className="text-blue-600" size={28} />
          <div>
            <p className="text-lg font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-gray-700">
              {counts.pendingReview}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <Loader className="text-yellow-500" size={28} />
          <div>
            <p className="text-lg font-medium">Pending Installation</p>
            <p className="text-2xl font-bold text-gray-700">
              {counts.pendingInstallation}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <Wrench className="text-yellow-500" size={28} />
          <div>
            <p className="text-lg font-medium">Installation in Progress</p>
            <p className="text-2xl font-bold text-gray-700">
              {counts.installationInProgress}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <CheckCircle className="text-green-500" size={28} />
          <div>
            <p className="text-lg font-medium">Completed</p>
            <p className="text-2xl font-bold text-gray-700">
              {counts.completed}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <FileQuestion className="text-gray-500" size={28} />
          <div>
            <p className="text-lg font-medium">Others</p>
            <p className="text-2xl font-bold text-gray-700">{counts.others}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ClientDashboard;
