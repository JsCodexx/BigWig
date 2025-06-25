"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import html2pdf from "html2pdf.js";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { DollarSign } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import dynamic from "next/dynamic";
type Survey = {
  id: string;
  client_name: string;
  payment_installation: number;
  payment_billboard_total: number;
  payment_total: number;
  payment_advance: number;
  payment_pending: number;
  created_at: string;
  installation_comments: string;
};

export default function PaymentsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [newAdvance, setNewAdvance] = useState("");
  const [filter, setFilter] = useState("month");
  const [newInstallation, setNewInstallation] = useState("");

  const ExportToPDFButton = dynamic(() => import("@/components/export-2-pdf"), {
    ssr: false, // ✅ disables server-side rendering
  });
  useEffect(() => {
    async function fetchSurveys() {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSurveys(data);
        setFilteredSurveys(data);
      }
    }
    fetchSurveys();
  }, []);

  useEffect(() => {
    const now = new Date();
    let filtered = surveys;
    if (filter === "day") {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      filtered = surveys.filter((s) => new Date(s.created_at) >= startOfDay);
    } else if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      filtered = surveys.filter((s) => new Date(s.created_at) > weekAgo);
    } else if (filter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      filtered = surveys.filter((s) => new Date(s.created_at) > monthAgo);
    } else if (filter === "year") {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      filtered = surveys.filter((s) => new Date(s.created_at) > yearAgo);
    }

    setFilteredSurveys(filtered);
  }, [filter, surveys]);

  const totalRevenue = filteredSurveys.reduce(
    (acc, s) => acc + s.payment_total,
    0
  );
  const totalPending = filteredSurveys.reduce(
    (acc, s) => acc + s.payment_pending,
    0
  );

  const groupPayments = (
    data: Survey[],
    filter: string,
    field: "payment_total" | "payment_pending"
  ) => {
    const grouped: Record<string, number> = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (const survey of data) {
      const date = new Date(survey.created_at);
      let key = "";

      if (filter === "day") {
        key = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (filter === "week") {
        key = date.toLocaleDateString("en-US", { weekday: "short" }); // Mon, Tue...
      } else if (filter === "month") {
        const weekNum = Math.floor((date.getDate() - 1) / 7) + 1;
        key = `Week ${weekNum}`;
      } else if (filter === "year") {
        key = date.toLocaleDateString("en-US", { month: "short" }); // Jan, Feb...
      }

      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += survey[field];
    }

    let result = Object.entries(grouped).map(([label, total]) => ({
      label,
      total,
    }));

    // Sort
    if (filter === "week") {
      result.sort((a, b) => days.indexOf(a.label) - days.indexOf(b.label));
    } else if (filter === "year") {
      result.sort((a, b) => months.indexOf(a.label) - months.indexOf(b.label));
    } else if (filter === "month") {
      result.sort(
        (a, b) =>
          parseInt(a.label.split(" ")[1]) - parseInt(b.label.split(" ")[1])
      );
    }

    return result;
  };

  const revenueChartData = groupPayments(
    filteredSurveys,
    filter,
    "payment_total"
  );
  const pendingChartData = groupPayments(
    filteredSurveys,
    filter,
    "payment_pending"
  );
  useEffect(() => {
    if (selectedSurvey) {
      setNewAdvance(selectedSurvey.payment_advance.toString());
      setNewInstallation(selectedSurvey.payment_installation.toString());
    }
  }, [selectedSurvey]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Payments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
            <DollarSign className="text-red-600" />
            Payments
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            View and manage all payments in the system.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select onValueChange={(val) => setFilter(val)} defaultValue="month">
            <SelectTrigger className="w-36 rounded-md border border-red-500 bg-red-50 focus:ring-2 focus:ring-red-400 focus:outline-none">
              <SelectValue className="text-red-700 font-semibold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <ExportToPDFButton />
        </div>
      </div>

      {/* Summary and Chart */}
      <div id="payment-summary" className="space-y-10 mb-10">
        {/* Charts Section: Side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card className="shadow-lg rounded-lg border border-red-100 hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">
                Revenue Chart
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <XAxis dataKey="label" stroke="#15803d" />
                  <YAxis
                    stroke="#15803d"
                    tickFormatter={(value) => {
                      if (value >= 1000) return `${value / 1000}K`;
                      return value;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#dcfce7",
                      borderRadius: 6,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pending Payments Chart */}
          <Card className="shadow-lg rounded-lg border border-red-100 hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">
                Pending Payments Chart
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pendingChartData}>
                  <XAxis dataKey="label" stroke="#b91c1c" />
                  <YAxis
                    stroke="#b91c1c"
                    tickFormatter={(value) => {
                      if (value >= 1000) return `${value / 1000}K`;
                      return value;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fee2e2",
                      borderRadius: 6,
                    }}
                  />
                  <Bar dataKey="total" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards Below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <Card className="shadow-lg rounded-lg border border-red-100 hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-green-600">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold text-green-600 tracking-wide">
              <span className="text-xl">Rs</span>
              {totalRevenue.toFixed(2)}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg border border-red-100 hover:shadow-xl transition">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-700">
                Total Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-extrabold text-red-600 tracking-wide">
              <span className="text-xl">Rs</span>
              {totalPending.toFixed(2)}
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-red-100 sticky top-0 z-10">
              <tr>
                {[
                  "Client",
                  "Boards",
                  "Installation",
                  "Total",
                  "Advance",
                  "Remaining",
                  "Comments",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="p-4 font-semibold text-red-700 whitespace-nowrap"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSurveys.map((survey) => (
                <tr
                  key={survey.id}
                  className="hover:bg-red-50 cursor-pointer transition"
                  onClick={() => setSelectedSurvey(survey)}
                >
                  <td className="p-4 whitespace-nowrap font-medium text-gray-900">
                    {survey.client_name}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    Rs{survey.payment_billboard_total.toFixed(2)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    Rs{survey.payment_installation.toFixed(2)}
                  </td>
                  <td className="p-4 whitespace-nowrap font-bold text-red-700">
                    Rs{survey.payment_total.toFixed(2)}
                  </td>
                  <td className="p-4 whitespace-nowrap text-green-600">
                    Rs{survey.payment_advance.toFixed(2)}
                  </td>
                  <td className="p-4 whitespace-nowrap text-red-600">
                    Rs{survey.payment_pending.toFixed(2)}
                  </td>
                  <td className="p-4 whitespace-nowrap text-red-600">
                    {survey.installation_comments?.length > 30 ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className="text-left underline underline-offset-2 text-red-600 hover:text-red-800"
                            onClick={(e) => e.stopPropagation()} // prevent row click
                          >
                            {survey.installation_comments?.slice(0, 30)}...{" "}
                            <span className="text-blue-600">View</span>
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          className="w-full max-w-5xl max-h-[80vh] min-h-[30vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DialogHeader>
                            <DialogTitle>Installation Comments</DialogTitle>
                            <div className="mt-4 text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-lg ">
                              {survey.installation_comments}
                            </div>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      survey.installation_comments
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Payment Dialog */}
      {selectedSurvey && (
        <Dialog
          open={!!selectedSurvey}
          onOpenChange={() => setSelectedSurvey(null)}
        >
          <DialogContent className="max-w-md rounded-lg p-6 bg-white shadow-xl">
            <DialogTitle className="text-xl font-semibold text-red-700 mb-4">
              Update Payment Details for {selectedSurvey.client_name}
            </DialogTitle>
            <div className="space-y-4">
              {/* Installation Charges Field */}
              <div>
                <Label
                  htmlFor="newInstallation"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Installation Charges
                </Label>
                <Input
                  id="newInstallation"
                  type="number"
                  min={0}
                  value={newInstallation}
                  onChange={(e) => setNewInstallation(e.target.value)}
                  placeholder="Enter new installation charges"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              {/* Advance Field */}
              <div>
                <Label
                  htmlFor="newAdvance"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Advance Amount
                </Label>
                <Input
                  id="newAdvance"
                  type="number"
                  min={0}
                  value={newAdvance}
                  onChange={(e) => setNewAdvance(e.target.value)}
                  placeholder="Enter new advance"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              {/* Calculated Summary */}
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Total:</strong>
                  {(
                    selectedSurvey.payment_billboard_total +
                    (parseFloat(newInstallation) || 0)
                  ).toFixed(2)}
                </p>
                <p>
                  <strong>Pending:</strong>
                  {(
                    selectedSurvey.payment_billboard_total +
                    (parseFloat(newInstallation) || 0) -
                    (parseFloat(newAdvance) || 0)
                  ).toFixed(2)}
                </p>
              </div>

              {/* Save Button */}
              <Button
                className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white font-semibold rounded-md py-2"
                onClick={async () => {
                  const advance = parseFloat(newAdvance) || 0;
                  const installation = parseFloat(newInstallation) || 0;
                  const total =
                    selectedSurvey.payment_billboard_total + installation;
                  const pending = total - advance;

                  const { error } = await supabase
                    .from("surveys")
                    .update({
                      payment_advance: advance,
                      payment_installation: installation,
                      payment_total: total,
                      payment_pending: pending,
                    })
                    .eq("id", selectedSurvey.id);

                  if (!error) {
                    setSurveys((prev) =>
                      prev.map((s) =>
                        s.id === selectedSurvey.id
                          ? {
                              ...s,
                              payment_advance: advance,
                              payment_installation: installation,
                              payment_total: total,
                              payment_pending: pending,
                            }
                          : s
                      )
                    );
                    setSelectedSurvey(null);
                    setNewAdvance("");
                    setNewInstallation("");
                  }
                }}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
