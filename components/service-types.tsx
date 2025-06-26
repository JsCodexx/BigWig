"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash2, Edit, X } from "lucide-react";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { Label } from "./ui/label";
interface ServiceType {
  id: number;
  name: string;
}

interface Props {
  onTypesChange?: (types: ServiceType[]) => void;
}

const ServiceTypesManager: React.FC<Props> = ({ onTypesChange }) => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [editingTypeName, setEditingTypeName] = useState("");

  // Fetch service types from Supabase
  const fetchServiceTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setServiceTypes(data || []);
      if (onTypesChange) onTypesChange(data || []);
    } catch (error) {
      console.error("Failed to fetch service types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  // Add new service type
  const handleAddType = async () => {
    if (!newTypeName.trim()) {
      alert("Please enter a service type name.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("service_types")
        .insert([{ name: newTypeName.trim() }]);
      if (error) throw error;
      setNewTypeName("");
      await fetchServiceTypes();
    } catch (error) {
      console.error("Failed to add service type:", error);
      alert("Failed to add service type.");
    } finally {
      setLoading(false);
    }
  };

  // Start editing a service type
  const startEdit = (type: ServiceType) => {
    setEditingTypeId(type.id);
    setEditingTypeName(type.name);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTypeId(null);
    setEditingTypeName("");
  };

  // Save edited service type
  const saveEdit = async () => {
    if (!editingTypeName.trim()) {
      alert("Please enter a valid name.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("service_types")
        .update({ name: editingTypeName.trim() })
        .eq("id", editingTypeId);
      if (error) throw error;
      setEditingTypeId(null);
      setEditingTypeName("");
      await fetchServiceTypes();
    } catch (error) {
      console.error("Failed to update service type:", error);
      alert("Failed to update service type.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a service type
  const deleteType = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service type?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("service_types")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await fetchServiceTypes();
    } catch (error) {
      console.error("Failed to delete service type:", error);
      alert("Failed to delete service type.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full shadow space-y-8">
      {/* Add new service type */}
      <div className="mb-6 space-y-2 w-full">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Service Name
        </Label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full">
          <Input
            placeholder="New service type name"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            disabled={loading}
            maxLength={20}
            className="flex-1 max-w-md"
          />
          <Button
            onClick={handleAddType}
            disabled={loading}
            variant="outline"
            className="border-red-200 hover:bg-red-100 whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* List service types */}
      <div className="space-y-4">
        {serviceTypes.length === 0 && (
          <p className="text-gray-500 italic text-center">
            No service types found.
          </p>
        )}

        {serviceTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between px-5 py-3 rounded-lg border-l-4 border-blue-600 bg-gradient-to-r from-white to-blue-50 shadow hover:shadow-md transition-shadow duration-300"
          >
            {/* Edit Mode */}
            {editingTypeId === type.id ? (
              <div className="flex-grow flex items-center space-x-3">
                <Input
                  value={editingTypeName}
                  onChange={(e) => setEditingTypeName(e.target.value)}
                  disabled={loading}
                  autoFocus
                  className="w-full border-blue-400 focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
              </div>
            ) : (
              <p className="text-lg font-semibold text-gray-800 flex-grow">
                {type.name}
              </p>
            )}

            <div className="flex items-center space-x-2">
              {editingTypeId === type.id ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cancelEdit}
                    disabled={loading}
                    className="hover:bg-red-100 text-red-600"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={saveEdit}
                    disabled={loading}
                    className="hover:bg-green-100 text-green-600"
                    title="Save"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(type)}
                    className="hover:bg-blue-100 text-blue-600"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteType(type.id)}
                    className="hover:bg-red-100 text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceTypesManager;
