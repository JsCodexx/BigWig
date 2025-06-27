"use client";
import { useUser } from "@/context/UserContext";
import {
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  FileQuestion,
  Loader,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

const Surveys = () => {
  const { user } = useUser();
  const [surveys, setSurveys] = useState([]);
  const [counts, setCounts] = useState({
    assigned: 0,
    completed: 0,
    assignedQuotes: 0,
  });

  useEffect(() => {
    async function fetchSurveys() {
      const responseForSurveys = await fetch(
        `/api/surveys?surveyor_id=${user?.id}`
      );
      const responseForQuotes = await fetch(
        `/api/quotes?surveyor_id=${user?.id}`
      );
      const data = await responseForSurveys.json();
      const data2 = await responseForQuotes.json();
      setSurveys(data);
      const assignedQuotes = data2.length;
      const assigned = data.length;

      const completed = data.filter(
        (s: any) => s.survey_status === "completed"
      ).length;
      setCounts({
        assigned,
        completed,
        assignedQuotes,
      });
    }
    fetchSurveys();
    // Example Usage
  }, [user]);
  async function deleteImage(imageUrl: string) {
    try {
      const res = await fetch("/api/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Error deleting image: " + data.error);
      } else {
        alert("Image deleted successfully!");
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      alert("Something went wrong!");
    }
  }

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto bg-gray-100 rounded-lg shadow-lg flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          View all at one place.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <ClipboardList className="text-blue-600" size={28} />
          <div>
            <p className="text-lg font-medium text-gray-500">
              Assigned Surveys
            </p>
            <p className="text-2xl font-bold text-gray-700">
              {counts.assigned}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <ClipboardCheck className="text-blue-500" size={28} />
          <div>
            <p className="text-lg font-medium text-gray-500">
              Non Conducted Surveys
            </p>
            <p className="text-2xl font-bold text-gray-700">
              {counts.assignedQuotes}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-3">
          <CheckCircle className="text-green-500" size={28} />
          <div>
            <p className="text-lg font-medium text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-700">
              {counts.completed}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Surveys;
