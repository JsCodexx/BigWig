"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Save, Trash2, Edit, X } from "lucide-react";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow space-y-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Service Types</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Edit className="text-red-600" /> Service Types
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Add and update service types
        </p>
      </div>

      {/* Add new service type */}
      <div className="flex items-center space-x-2 mb-6">
        <Input
          placeholder="New service type name"
          value={newTypeName}
          onChange={(e) => setNewTypeName(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleAddType} disabled={loading}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* List service types */}
      <div className="space-y-3">
        {serviceTypes.length === 0 && (
          <p className="text-gray-500">No service types found.</p>
        )}
        {serviceTypes.map((type) => (
          <Card key={type.id} className="shadow-sm">
            <CardContent className="flex items-center justify-between">
              {/* Display mode or edit mode */}
              {editingTypeId === type.id ? (
                <div className="flex items-center space-x-2 flex-grow">
                  <Input
                    value={editingTypeName}
                    onChange={(e) => setEditingTypeName(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-lg font-medium flex-grow">{type.name}</p>
              )}

              <div className="flex items-center space-x-2">
                {editingTypeId === type.id ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      disabled={loading}
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={loading}
                      title="Save"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(type)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteType(type.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceTypesManager;
