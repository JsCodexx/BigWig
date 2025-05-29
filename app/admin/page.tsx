"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Hourglass,
  BarChart3,
  LucideLayoutDashboard,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    // totalReceived: 0,
    pendingPayments: 0,
    surveyStatusCounts: {} as Record<string, number>,
    pendingQuotes: 0,
    totalSurveys: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const surveys = await fetch("/api/surveys?all=true");
        if (!surveys.ok) throw new Error("Failed to fetch surveys");
        const data = await surveys.json();

        const statusCounts: Record<string, number> = {};
        let totalRevenue = 0;
        let totalReceived = 0;
        let pendingPayments = 0;

        data.forEach((survey: any) => {
          statusCounts[survey.survey_status] =
            (statusCounts[survey.survey_status] || 0) + 1;
          totalRevenue += survey.payment_total;
          // totalReceived += survey.payment_advance;
          pendingPayments += survey.payment_pending;
        });

        // data of quotes
        const res = await fetch("/api/quotes?all=true");
        const quoteData = await res.json();
        const pendingQuotes = quoteData.filter(
          (q: any) => q.status === "pending"
        );
        const pendingQuotesCount = pendingQuotes.length;

        // satisfactory forms
        const forms = await fetch("/api/satisfactory-form?all=true");
        const formData = await forms.json();
        setStats({
          totalRevenue,
          // totalReceived,
          pendingPayments,
          surveyStatusCounts: statusCounts,
          pendingQuotes: pendingQuotesCount,
          totalSurveys: data.length,
          totalReviews: formData.length,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-white dark:from-gray-900 dark:to-black p-6">
      <div className="w-full max-w-7xl bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-10 border border-gray-200 dark:border-gray-800 transition-all">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-red-700 dark:text-red-400 flex items-center gap-3">
            <LucideLayoutDashboard className="w-8 h-8" />
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            All breakdowns in one place
          </p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={<DollarSign className="text-red-600" />}
            color="red"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={<Hourglass className="text-yellow-500" />}
            color="yellow"
          />
        </div>

        {/* Survey Status Breakdown */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">
            Survey Status Breakdown
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Object.entries(stats.surveyStatusCounts).map(([status, count]) => (
              <StatusCard key={status} status={status} count={count} />
            ))}
            <StatusCard status="Pending Quotes" count={stats.pendingQuotes} />
            <StatusCard status="Total Surveys" count={stats.totalSurveys} />
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: JSX.Element;
  color: "red" | "green" | "yellow";
}) {
  const colorMap = {
    red: {
      border: "border-red-500",
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-300",
    },
    green: {
      border: "border-green-500",
      bg: "bg-green-100 dark:bg-green-900/40",
      text: "text-green-700 dark:text-green-300",
    },
    yellow: {
      border: "border-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/40",
      text: "text-yellow-700 dark:text-yellow-300",
    },
  };

  const styles = colorMap[color];

  return (
    <div
      className={`flex items-center gap-5 p-6 rounded-2xl shadow-xl border-l-8 ${styles.border} bg-white dark:bg-gray-900/50 hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className={`p-4 rounded-full ${styles.bg}`}>{icon}</div>
      <div>
        <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </h2>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function StatusCard({ status, count }: { status: string; count: number }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-gray-900/50 shadow-md border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center hover:shadow-xl transition duration-300">
      <BarChart3 className="text-red-600 dark:text-red-400 mb-3 w-10 h-10" />
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center break-words capitalize">
        {status.replace(/_/g, " ")}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
        {count}
      </p>
    </div>
  );
}

export default Dashboard;
