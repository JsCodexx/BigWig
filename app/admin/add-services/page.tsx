"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ServiceTypesManager from "@/components/service-types";
interface ServiceType {
  id: number;
  name: string;
}

interface Service {
  id: number;
  title: string;
  service_type_id: number;
  image_url: string;
}

const ManageServices = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newServices, setNewServices] = useState<
    { title: string; image_url: string }[]
  >([{ title: "", image_url: "" }]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: types } = await supabase.from("service_types").select("*");
      const { data: allServices } = await supabase.from("services").select("*");
      setServiceTypes(types || []);
      setServices(allServices || []);
    };
    fetchData();
  }, []);

  const handleFileUpload = async (file: File, index: number) => {
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    toast({
      title: "Uploading...",
      description: "Image is being uploaded",
    });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data?.url) {
        setNewServices((prev) => {
          const updated = [...prev];
          updated[index].image_url = data.url;
          return updated;
        });
        setLoading(false);
        toast({
          title: "Upload Successful",
          description: "Image uploaded successfully.",
        });
      } else {
        setLoading(false);
        toast({
          title: "Upload Failed",
          description: "No URL received from upload.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setLoading(false);
      toast({
        title: "Upload Error",
        description: "Something went wrong during image upload.",
        variant: "destructive",
      });
    }
  };

  const handleServiceChange = (index: number, value: string) => {
    setNewServices((prev) => {
      const updated = [...prev];
      updated[index].title = value;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!categoryId) {
      return toast({
        title: "Missing Service Type",
        description: "Please select a service type.",
        variant: "destructive",
      });
    }

    if (newServices.some((s) => !s.title || !s.image_url)) {
      return toast({
        title: "Incomplete Fields",
        description: "Please fill all titles and upload images.",
        variant: "destructive",
      });
    }

    setLoading(true);
    toast({ title: "Submitting Services", description: "Please wait..." });

    const entries = newServices.map((s) => ({
      service_type_id: categoryId,
      title: s.title,
      image_url: s.image_url,
    }));

    const { error } = await supabase.from("services").insert(entries);
    setLoading(false);

    if (error) {
      toast({
        title: "Submission Failed",
        description: "Could not add services.",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Success",
        description: "Services have been added successfully.",
      });

      setNewServices([{ title: "", image_url: "" }]);
      const { data: updated } = await supabase.from("services").select("*");
      setServices(updated || []);
    }
  };
  const handleDeleteService = async (id: number) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Service Deleted" });
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
  };

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
    } catch (error) {
      console.error("Failed to fetch service types:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="">
      <div className="max-w-7xl mx-auto p-6 space-y-8 px-6 py-12">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Our Services</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
            <Edit className="text-red-600" /> Edit Our Services Section
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Edit your landing page
          </p>
        </div>
        <ServiceTypesManager onTypesChange={fetchServiceTypes} />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Create New Service */}
          <div className="col-span-12 md:col-span-4">
            <div className="p-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md">
              <h2 className="text-2xl font-bold text-red-700 mb-6 text-center md:text-left">
                Create New Service
              </h2>
              {/* Service Type */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Service Type
                </Label>
                <Select
                  value={categoryId || ""}
                  onValueChange={(value) => setCategoryId(value)}
                >
                  <SelectTrigger className="w-full dark:bg-neutral-800 dark:border-neutral-700 rounded-md">
                    <SelectValue placeholder="Choose a service type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-neutral-900">
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title Input */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Service Title
                </Label>
                <Input
                  placeholder="Enter service title"
                  value={newServices[0]?.title || ""}
                  onChange={(e) => handleServiceChange(0, e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Upload Image
                </Label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="upload-button"
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium cursor-pointer transition"
                  >
                    {newServices[0].image_url ? "Change File" : "Choose File"}
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {newServices[0]?.image_url
                      ? "Image selected"
                      : "No image selected"}
                  </span>
                </div>
                <input
                  id="upload-button"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      handleFileUpload(e.target.files[0], 0);
                  }}
                  className="hidden"
                />
              </div>

              {/* Preview */}
              {newServices[0]?.image_url && (
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Image Preview
                  </Label>
                  <div className="flex justify-center">
                    <img
                      src={newServices[0].image_url}
                      alt="Preview"
                      onClick={() => setSelectedImage(newServices[0].image_url)}
                      className="max-w-xs h-48 object-cover rounded-lg border shadow-sm hover:scale-105 transition cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={cn(
                    "bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-md transition-all",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading ? "Saving..." : "Submit Service"}
                </Button>
              </div>
            </div>
          </div>
          {/* Right: Existing Services */}

          <div className="col-span-12 md:col-span-8">
            <h2 className="text-2xl font-bold text-red-700 mb-6 text-center md:text-left">
              Existing Services
            </h2>

            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg bg-white dark:bg-neutral-900 p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Small image preview */}
                  <img
                    src={service.image_url}
                    className="w-full h-24 object-cover rounded-md"
                  />

                  <>
                    <div className="mt-2 flex justify-between items-center">
                      <h2 className="text-sm font-semibold text-red-700 truncate">
                        {service.title}
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Preview"
            className="max-w-7xl max-h-[90vh] object-contain shadow-2xl rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default ManageServices;
