"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { DollarSign, CheckCircle, Hourglass, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalReceived: 0,
    pendingPayments: 0,
    surveyStatusCounts: {} as Record<string, number>,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const formattedDate = oneMonthAgo.toISOString();

        const { data, error } = await supabase
          .from("surveys")
          .select(
            "survey_status, payment_total, payment_advance, payment_pending"
          )
          .gte("created_at", formattedDate)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const statusCounts: Record<string, number> = {};
        let totalRevenue = 0;
        let totalReceived = 0;
        let pendingPayments = 0;

        data.forEach((survey) => {
          statusCounts[survey.survey_status] =
            (statusCounts[survey.survey_status] || 0) + 1;
          totalRevenue += survey.payment_total;
          totalReceived += survey.payment_advance;
          pendingPayments += survey.payment_pending;
        });

        setStats({
          totalRevenue,
          totalReceived,
          pendingPayments,
          surveyStatusCounts: statusCounts,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<DollarSign className="text-red-700" />}
        />
        <StatCard
          title="Received Payments"
          value={stats.totalReceived}
          icon={<CheckCircle className="text-green-600" />}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={<Hourglass className="text-yellow-500" />}
        />
      </div>

      {/* Survey Status Breakdown */}
      <h2 className="text-2xl font-semibold text-gray-800 mt-8">
        Survey Status Breakdown
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        {Object.entries(stats.surveyStatusCounts).map(([status, count]) => (
          <StatusCard key={status} status={status} count={count} />
        ))}
      </div>
    </div>
  );
};

// Reusable Statistic Card
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: JSX.Element;
}) {
  return (
    <div className="flex items-center p-5 bg-white rounded-2xl shadow-md border border-gray-200">
      <div className="p-3 bg-red-100 rounded-full">{icon}</div>
      <div className="ml-4">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <p className="text-2xl font-bold text-gray-900">
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Reusable Status Card
function StatusCard({ status, count }: { status: string; count: number }) {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col items-center">
      <BarChart3 className="text-red-700 mb-2" />
      <h3 className="text-lg font-semibold text-gray-700 capitalize">
        {status.replace(/_/g, " ")}
      </h3>
      <p className="text-2xl font-bold text-gray-900">{count}</p>
    </div>
  );
}

export default Dashboard;
