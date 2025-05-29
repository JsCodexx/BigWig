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
import { CardContent } from "@/components/ui/card";
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
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>("");

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

        toast({
          title: "Upload Successful",
          description: "Image uploaded successfully.",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: "No URL received from upload.",
          variant: "destructive",
        });
      }
    } catch (error) {
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

  const addNewServiceRow = () => {
    setNewServices((prev) => [...prev, { title: "", image_url: "" }]);
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
  const handleSaveEdit = async (id: number) => {
    const { error } = await supabase
      .from("services")
      .update({ title: editedTitle })
      .eq("id", id);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Service Updated" });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title: editedTitle } : s))
      );
      setEditingServiceId(null);
    }
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto p-6rounded shadow space-y-8 px-6 py-12">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
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

        {/* Service Type Select */}
        <div className="bg-white p-6 ">
          <Label className=" font-semibold mb-2 text-muted text-gray-600 block">
            Select Service Type
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a service type..." />
            </SelectTrigger>
            <SelectContent className="!min-w-xl">
              {serviceTypes.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Services Form Grid */}
        <div className="grid gap-4">
          {newServices.map((entry, idx) => (
            <CardContent
              className="space-y-4 p-6 bg-white dark:bg-neutral-900"
              key={idx}
            >
              <Label className=" font-semibold mb-2 text-muted text-gray-600 block">
                Service Title
              </Label>
              <Input
                placeholder="Service title"
                value={entry.title}
                onChange={(e) => handleServiceChange(idx, e.target.value)}
                className="text-lg"
              />

              {/* Upload Drop Area */}
              <div className="relative border-2 border-dashed border-red-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-red-50 dark:hover:bg-neutral-800 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0])
                      handleFileUpload(e.target.files[0], idx);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center text-red-600 z-0">
                  <span className="text-2xl">📁</span>
                  <span className="mt-2 text-sm font-medium">
                    Click or Drag to Upload Image
                  </span>
                </div>
              </div>

              {/* Preview */}
              {entry.image_url && (
                <div className="pt-4 flex justify-center">
                  <img
                    src={entry.image_url}
                    alt="Preview"
                    onClick={() => setSelectedImage(entry.image_url)}
                    className="w-64 h-48 object-cover rounded-lg shadow-md border hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              )}
            </CardContent>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Button
            onClick={addNewServiceRow}
            variant="outline"
            className="border-red-500 text-red-700 hover:bg-red-100"
          >
            Add More
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={cn(
              "bg-red-700 hover:bg-red-800 text-white font-semibold shadow-lg px-6 py-2 rounded-md",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? "Saving..." : "Submit Services"}
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-red-700 mt-12 mb-4 text-center">
          Existing Services
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Map through services here */}
          {services.map((service) => (
            <div
              key={service.id}
              className="rounded-xl bg-white/80 dark:bg-neutral-900 p-6 shadow-lg space-y-4"
            >
              <img
                src={service.image_url}
                className="w-full h-48 object-cover rounded-lg"
              />
              {editingServiceId === service.id ? (
                <>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-lg"
                  />
                  <div className="flex gap-3">
                    <Button onClick={() => handleSaveEdit(service.id)}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingServiceId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-red-700">
                    {service.title}
                  </h2>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingServiceId(service.id);
                        setEditedTitle(service.title);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
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
