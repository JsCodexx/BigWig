"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "../../lib/supabase/Clientsupabase";
import { useUser } from "@/context/UserContext";

export default function PaymentsPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [newAdvance, setNewAdvance] = useState("");
  const [newInstallationCharges, setNewInstallationCharges] = useState("");
  const { user } = useUser();
  // Fetch surveys from Supabase
  useEffect(() => {
    async function fetchSurveys() {
      setLoading(true);
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("surveyor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching surveys:", error);
      else setSurveys(data || []);
      setLoading(false);
    }

    fetchSurveys();
  }, [user]);

  // Handle advance & installation charges update
  async function updatePaymentDetails() {
    if (!selectedSurvey) return;

    const installationCost =
      parseFloat(newInstallationCharges) || selectedSurvey.payment_installation;

    if (installationCost < 0) return alert("Enter valid amounts");

    // Recalculate total price & remaining balance
    const updatedTotalPrice =
      selectedSurvey.payment_billboard_total + installationCost;

    const { error } = await supabase
      .from("surveys")
      .update({
        payment_installation: installationCost,
        payment_total: updatedTotalPrice,
      })
      .eq("id", selectedSurvey.id);

    if (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment.");
    } else {
      alert("Payment details updated successfully!");
      setSurveys((prev) =>
        prev.map((s) =>
          s.id === selectedSurvey.id
            ? {
                ...s,
                payment_installation: installationCost,
                payment_total: updatedTotalPrice,
              }
            : s
        )
      );
      setSelectedSurvey(null);
      setNewAdvance("");
      setNewInstallationCharges("");
    }
  }

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-red-700 mb-6">Payment Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Client</th>
              <th className="border p-2">Installation Charges</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey.id} className="border">
                <td className="border p-2">{survey.client_name}</td>
                <td className="border p-2">${survey.payment_installation}</td>
                <td className="border p-2">
                  <Button onClick={() => setSelectedSurvey(survey)}>
                    Update Installation
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Payment Update Modal */}
      {selectedSurvey && (
        <Dialog
          open={!!selectedSurvey}
          onOpenChange={() => setSelectedSurvey(null)}
        >
          <DialogContent>
            <DialogTitle>Update Payment Details</DialogTitle>

            <Label>New Installation Charges:</Label>
            <Input
              type="number"
              value={newInstallationCharges}
              onChange={(e) => setNewInstallationCharges(e.target.value)}
              placeholder="Enter installation charges"
            />

            <Button onClick={updatePaymentDetails} className="mt-4">
              Save
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
