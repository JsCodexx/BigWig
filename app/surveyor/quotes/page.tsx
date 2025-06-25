"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { useUi } from "@/context/UiContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SurveyorQuotesPage = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const { user } = useUser();
  const { setSelectedClient, setSelectedQuote } = useUi();
  const [selectedComment, setSelectedComment] = useState(null);

  const fetchquotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("surveyor_id", user?.id);

    if (error) {
      console.error(error);
    } else {
      setQuotes(data);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error(error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchUsers();
    fetchquotes();
  }, [user]);

  const markCompleted = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .update({ status: "conducted" })
        .eq("id", id);

      if (error) {
        console.error("Error updating status:", error.message);
        return;
      }
      fetchquotes();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const conductSurvey = (phone_number: string, quotesId: string) => {
    const foundUser = users.find((user) => user.phone_number === phone_number);
    if (quotesId) {
      setSelectedQuote(quotesId);
    }
    if (foundUser?.id) {
      setSelectedClient(foundUser.id);
    }
    router.push("/surveyor/add-survey");
  };

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          Quotes
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          View all quotes for you.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500 flex items-center gap-2">
          <Loader2 className="animate-spin h-5 w-5" />
          Loading quotes...
        </div>
      ) : quotes?.length === 0 ? (
        <p className="text-gray-500">No assigned quotes.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-xl bg-white">
          <table className="min-w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="bg-red-700 text-white">
                <th className="py-4 px-6 text-left rounded-l-lg">Client</th>
                <th className="py-4 px-6 text-left">Email</th>
                <th className="py-4 px-6 text-left">Phone</th>
                <th className="py-4 px-6 text-left">Status</th>
                <th className="py-4 px-6 text-left">Comments</th>
                <th className="py-4 px-6 text-left rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <motion.tr
                  key={quote.id}
                  className="bg-gray-50 hover:bg-gray-100 transition duration-200 shadow-sm rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="py-4 px-6 font-medium text-gray-800">
                    {quote.full_name}
                  </td>
                  <td className="py-4 px-6">{quote.email}</td>
                  <td className="py-4 px-6">{quote.phone_number}</td>
                  <td className="py-4 px-6">
                    <Badge
                      className={
                        quote.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : quote.status === "conducted"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }
                    >
                      {quote.status || "Pending"}
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
                    <div className="flex gap-1">
                      {quote.status === "pending" && (
                        <button
                          className="px-2 py-1 text-xs text-red-700 border border-red-300 bg-red-100 rounded-md hover:bg-red-200"
                          onClick={() =>
                            conductSurvey(quote.phone_number, quote.id)
                          }
                        >
                          Conduct
                        </button>
                      )}

                      {quote.status === "conducted" && (
                        <button
                          className="px-2 py-1 text-xs text-gray-500 bg-gray-200 border border-gray-300 rounded-md cursor-not-allowed"
                          disabled
                        >
                          Completed
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

export default SurveyorQuotesPage;
