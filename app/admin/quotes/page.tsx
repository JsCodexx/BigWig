"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [surveyors, setSurveyors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      const { data, error } = await supabase.from("quotes").select("*");
      if (error) console.error(error);
      else setQuotes(data);
    };

    const fetchSurveyors = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("user_role", "surveyor");
      if (error) console.error(error);
      else setSurveyors(data);
    };

    fetchQuotes();
    fetchSurveyors();
  }, []);

  // Assign a quote to a surveyor
  const assignQuote = async (quoteId: string, surveyorId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("quotes")
      .update({ surveyor_id: surveyorId })
      .eq("id", quoteId);

    if (error) {
      console.error(error);
    } else {
      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id === quoteId ? { ...quote, surveyor_id: surveyorId } : quote
        )
      );
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quotes Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-red-700 text-white">
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Surveyor</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {quotes?.map((quote) => (
              <tr key={quote.id} className="border-t">
                <td className="p-3">{quote.name}</td>
                <td className="p-3">{quote.email}</td>
                <td className="p-3">{quote.phone_number}</td>
                <td className="p-3">
                  {quote.surveyor_id
                    ? surveyors.find((s) => s.id === quote.surveyor_id)?.name ||
                      "Assigned"
                    : "Not Assigned"}
                </td>
                <td className="p-3">{quote.status}</td>
                <td className="p-3">
                  <Select
                    onValueChange={(surveyorId) =>
                      assignQuote(quote.id, surveyorId)
                    }
                  >
                    <SelectTrigger className="w-[200px]">
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
                          {surveyor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {loading && (
                    <p className="text-sm text-gray-500 mt-1">Updating...</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotesPage;
