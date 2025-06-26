"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, File } from "lucide-react";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // adjust path if needed
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [surveyors, setSurveyors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatedQuotes, setUpdatedQuotes] = useState<string[]>([]);
  const [selectedComment, setSelectedComment] = useState(null);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const quotesPerPage = 5;

  const totalPages = Math.ceil(quotes.length / quotesPerPage);
  const startIndex = (currentPage - 1) * quotesPerPage;
  const currentQuotes = quotes.slice(startIndex, startIndex + quotesPerPage);

  useEffect(() => {
    const fetchQuotes = async () => {
      const { data, error } = await supabase.from("quotes").select("*");
      if (error) console.error(error);
      else setQuotes(data);
    };

    const fetchSurveyors = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("user_role", "surveyor");
      if (error) console.error(error);
      else setSurveyors(data);
    };

    fetchQuotes();
    fetchSurveyors();
  }, []);

  const assignQuote = async (quoteId: string, surveyorId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("quotes")
      .update({ surveyor_id: surveyorId })
      .eq("id", quoteId);

    if (!error) {
      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id === quoteId ? { ...quote, surveyor_id: surveyorId } : quote
        )
      );
      setUpdatedQuotes((prev) => [...prev, quoteId]);

      setTimeout(() => {
        setUpdatedQuotes((prev) => prev.filter((id) => id !== quoteId));
      }, 3000);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Our Quotes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
            <File className="text-red-600" /> Quotes Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            View your quotes
          </p>
        </div>
      </motion.h2>

      <div className="overflow-x-auto rounded-xl shadow-xl bg-white ">
        <table className="min-w-full border-separate border-spacing-y-4 min-h-[60vh] table-fixed">
          <thead>
            <tr className="bg-red-700 text-white rounded-t-lg">
              <th className="py-4 px-6 text-left rounded-l-lg">Client</th>
              <th className="py-4 px-6 text-left">Email</th>
              <th className="py-4 px-6 text-left">Phone</th>
              <th className="py-4 px-6 text-left">Surveyor</th>
              <th className="py-4 px-6 text-left">Status</th>
              <th className="py-4 px-6 text-left">Comments</th>
              <th className="py-4 px-6 text-left rounded-r-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentQuotes.map((quote) => (
              <motion.tr
                key={quote.id}
                className="bg-gray-50 hover:bg-gray-100 transition duration-200 rounded-lg !h-20 max-h-[7rem]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <td className="py-4 px-6 font-medium text-gray-800">
                  {quote.full_name}
                </td>
                <td className="py-4 px-6">{quote.email}</td>
                <td className="py-4 px-6">{quote.phone_number}</td>
                <td className="py-4 px-6">
                  {quote.surveyor_id ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      {surveyors.find((s) => s.id === quote.surveyor_id)
                        ?.full_name || "Assigned"}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Not Assigned</Badge>
                  )}
                </td>

                <td className="py-4 px-6 capitalize">
                  <Badge
                    className={
                      quote.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 cursor-default select-none"
                        : quote.status === "conducted"
                        ? "bg-blue-100 text-blue-700 hover:text-blue-900 hover:bg-blue-200 cursor-pointer transition-colors"
                        : quote.status === "completed"
                        ? "bg-green-100 text-green-700 hover:text-green-900 hover:bg-green-200 cursor-pointer transition-colors"
                        : "bg-gray-200 text-gray-700 cursor-default select-none"
                    }
                  >
                    {quote.status || "N/A"}
                  </Badge>
                </td>
                <td className="py-4 px-6">
                  {quote.comments?.length > 5 ? (
                    <>
                      {quote.comments.slice(0, 5)}...
                      <button
                        onClick={() => setSelectedComment(quote.comments)}
                        className="text-blue-500 underline ml-1"
                      >
                        view
                      </button>
                    </>
                  ) : (
                    quote.comments
                  )}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <Select
                      onValueChange={(surveyorId) =>
                        assignQuote(quote.id, surveyorId)
                      }
                      disabled={quote.status !== "pending"}
                    >
                      <SelectTrigger className="w-[200px] border-gray-300 shadow-sm">
                        <SelectValue
                          placeholder={
                            !quote.surveyor_id
                              ? "Assign Surveyor"
                              : "Change Surveyor"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {surveyors.map((surveyor) => (
                          <SelectItem key={surveyor.id} value={surveyor.id}>
                            {surveyor.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {loading && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </div>
                    )}

                    {updatedQuotes.includes(quote.id) && (
                      <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Updated
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}

            {/* Placeholder rows to keep table height consistent */}
            {Array.from({ length: Math.max(0, 5 - currentQuotes.length) }).map(
              (_, i) => (
                <tr key={`placeholder-${i}`} className="h-28">
                  <td
                    colSpan={6}
                    className="py-4 px-6 text-center text-gray-300"
                  >
                    {/* Optional: Add a faint dashed border or keep empty */}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent className="flex gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50 "
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <button
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === i + 1
                        ? "bg-red-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50 "
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      {selectedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-2">Full Comment</h2>
            <p className="text-gray-700">{selectedComment}</p>
            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedComment(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
