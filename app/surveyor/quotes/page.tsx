"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { useUi } from "@/context/UiContext";

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
  // Fetch logged-in surveyor ID

  // Fetch assigned quotes
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
        .from("quotes") // Update the quotes table
        .update({ status: "conducted" }) // Set status to conducted
        .eq("id", id); // Find the specific quotes by ID

      if (error) {
        console.error("Error updating status:", error.message);
        return;
      }
      fetchquotes();
      return;
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };
  const conductSurvey = (phone_number: string, quotesId: string) => {
    const foundUser = users.find((user) => user.phone_number === phone_number);
    if (quotesId) {
      setSelectedQuote(quotesId);
    }
    if (foundUser && foundUser.id) {
      setSelectedClient(foundUser?.id);
    }
    router.push("/surveyor/add-survey");
  };
  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-600">My quotes</h2>

      {loading ? (
        <p className="text-gray-500">Loading quotes...</p>
      ) : quotes?.length === 0 ? (
        <p className="text-gray-500">No assigned quotes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr className="bg-red-700 text-white">
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotes?.map((quotes) => (
                <tr key={quotes.id} className="border-t">
                  <td className="p-3">{quotes.full_name}</td>
                  <td className="p-3">{quotes.email}</td>
                  <td className="p-3">{quotes.phone_number}</td>
                  <td className="p-3">{quotes.status || "Pending"}</td>
                  <td className="p-3 cursor-pointer flex gap-2">
                    {quotes.status === "pending" && (
                      <button
                        className="p-1 text-red-500 border rounded bg-red-200"
                        onClick={() =>
                          conductSurvey(quotes.phone_number, quotes.id)
                        }
                      >
                        Conduct
                      </button>
                    )}
                    <button
                      className="p-1  text-green-500 border rounded bg-green-200"
                      onClick={() => markCompleted(quotes.id)}
                      disabled={quotes.status === "conducted"}
                    >
                      {quotes.status === "pending"
                        ? "Mark as completed"
                        : "Completed"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SurveyorQuotesPage;
