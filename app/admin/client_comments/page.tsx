"use client";

import { supabase } from "@/app/lib/supabase/Clientsupabase";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { formatReadableDate } from "@/lib/utils";
import { FormInputIcon } from "lucide-react";
import { useEffect, useState } from "react";

type SatisfactionForm = {
  id: string;
  shop_name: string;
  shop_address: string;
  shopkeeper_name: string;
  cell_number: string;
  client_comments?: string;
  created_at: string;
};

export default function ClietnComments() {
  const [forms, setForms] = useState<SatisfactionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      const { data, error } = await supabase
        .from("customer_satisfaction_forms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching forms:", error);
      } else {
        setForms(data);
      }
      setLoading(false);
    };

    fetchForms();
  }, []);

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Customer Satisfaction</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <FormInputIcon className="text-red-600" /> User Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          What people think about you.
        </p>
      </div>
      {loading ? (
        <div className="text-center text-red-500 font-semibold">Loading...</div>
      ) : forms.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-300">
          No forms submitted yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-red-200 dark:border-red-700 p-5 transition-transform hover:scale-[1.02]"
            >
              <h3 className="text-lg font-semibold text-red-700">
                {form.shop_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <strong>Address:</strong> {form.shop_address}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <strong>Shopkeeper:</strong> {form.shopkeeper_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <strong>Contact:</strong> {form.cell_number}
              </p>
              {form.client_comments && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    <strong>Comments:</strong> {form.client_comments}
                  </p>
                  <button
                    onClick={() => setSelectedComment(form.client_comments!)}
                    className="text-red-500 text-xs mt-1 underline"
                  >
                    View Full Comment
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Submitted {formatReadableDate(form.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-lg w-full shadow-lg">
            <h3 className="text-lg font-bold text-red-700 mb-3">
              Client Comment
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
              {selectedComment}
            </p>
            <button
              onClick={() => setSelectedComment(null)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
