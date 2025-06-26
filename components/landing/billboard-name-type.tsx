"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Edit } from "lucide-react";

export default function AddBillboardItemPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [newNameInput, setNewNameInput] = useState("");
  const [selectedNameId, setSelectedNameId] = useState("");
  const [types, setTypes] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingBillboards, setExistingBillboards] = useState<
    { id: string; name: string; types: string[] }[]
  >([]);

  // 🔁 Load billboard names and types
  const fetchExistingData = async () => {
    try {
      const [namesRes, typesRes] = await Promise.all([
        fetch("/api/billboards/billboard-names"),
        fetch("/api/billboards/billboard-types"),
      ]);

      const [names, types] = await Promise.all([
        namesRes.json(),
        typesRes.json(),
      ]);

      const typeMap: { [key: string]: string[] } = {};
      types.forEach((t: any) => {
        if (!typeMap[t.billboard_name_id]) {
          typeMap[t.billboard_name_id] = [];
        }
        typeMap[t.billboard_name_id].push(t.type_name);
      });

      const merged = names.map((n: any) => ({
        id: n.id,
        name: n.name,
        types: typeMap[n.id] || [],
      }));

      setExistingBillboards(merged);
    } catch (err) {
      toast({
        title: "Failed to Load",
        description: "Could not fetch existing billboard data.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchExistingData();
  }, []);

  // ✅ Add Billboard Name
  const addBillboardName = async () => {
    const name = newNameInput.trim();
    if (!name) return;

    try {
      const res = await fetch("/api/billboards/billboard-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setExistingBillboards((prev) => [
        ...prev,
        { id: data.id, name: data.name, types: [] },
      ]);
      setNewNameInput("");
      toast({
        title: "Success",
        description: `"${data.name}" added successfully.`,
      });
      fetchExistingData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not add name.",
        variant: "destructive",
      });
    }
  };

  // ✅ Submit Types for a Billboard Name
  const handleSubmit = async () => {
    if (!selectedNameId) {
      return toast({
        title: "Missing Selection",
        description: "Please select a billboard name for the types.",
        variant: "destructive",
      });
    }

    if (!types.some((t) => t.trim())) {
      return toast({
        title: "Missing Type(s)",
        description: "You must enter at least one billboard type.",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);

    try {
      const typePromises = types
        .filter((t) => t.trim())
        .map((type) =>
          fetch("/api/billboards/billboard-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type_name: type,
              billboard_name_id: selectedNameId,
            }),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data;
          })
        );

      await Promise.all(typePromises);
      toast({
        title: "Success",
        description: "All billboard types added successfully.",
      });
      fetchExistingData();
      setTypes([""]);
    } catch (error: any) {
      toast({
        title: "Error Adding Types",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 px-6 py-12">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Names & Types</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Edit className="text-red-600" /> Names and Details
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Create name and details for billboards
        </p>
      </div>

      {/* Create New Billboard Name */}
      <div className="mb-6">
        <Label className="text-gray-700 dark:text-gray-200 mb-1 block">
          Create New Billboard Name
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Facia"
            value={newNameInput}
            onChange={(e) => setNewNameInput(e.target.value)}
            className="dark:bg-gray-800 dark:text-white"
          />
          <Button
            onClick={addBillboardName}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Add Name
          </Button>
        </div>
      </div>

      {/* Select Existing Name for Types */}
      <div className="mb-4">
        <Label className="text-gray-700 dark:text-gray-200 mb-2 block">
          Select Billboard Name for Types
        </Label>
        <Select onValueChange={setSelectedNameId}>
          <SelectTrigger className="w-full dark:bg-gray-800 dark:text-white">
            <SelectValue placeholder="Choose Billboard Name" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:text-white">
            {existingBillboards.map((bn) => (
              <SelectItem key={bn.id} value={bn.id}>
                {bn.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Types Input */}
      <div className="mb-4">
        <Label className="text-gray-700 dark:text-gray-200 mb-2 block">
          Types
        </Label>
        {types.map((type, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input
              placeholder="e.g. Oil, 3D, Electric"
              value={type}
              onChange={(e) => {
                const updated = [...types];
                updated[index] = e.target.value;
                setTypes(updated);
              }}
              className="dark:bg-gray-800 dark:text-white flex-1"
            />
            {types.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() => setTypes(types.filter((_, i) => i !== index))}
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          className="mt-2 border-red-600 text-red-600 hover:bg-red-50"
          onClick={() => setTypes([...types, ""])}
        >
          + Add Another Type
        </Button>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isSubmitting ? "Saving..." : "Save "}
        </Button>
      </div>

      {/* Existing Billboards Table */}
      {existingBillboards.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Existing Billboards
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 dark:border-gray-700 text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white">
                <tr>
                  <th className="p-2 border-b">Name</th>
                  <th className="p-2 border-b">Types</th>
                </tr>
              </thead>
              <tbody>
                {existingBillboards.map((item) => (
                  <tr key={item.id} className="border-t dark:border-gray-700">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 space-x-2 flex flex-wrap">
                      {item.types.map((type, i) => (
                        <span
                          key={i}
                          className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full dark:bg-red-900 dark:text-white"
                        >
                          {type}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
