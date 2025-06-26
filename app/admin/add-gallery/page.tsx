"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import Image from "next/image";
import { Trash2, Eye, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
}
interface GallerySection {
  id: string;
  title: string;
  subtitle: string;
  images: GalleryImage[];
}

const GalleryAdmin = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionSubtitle, setSectionSubtitle] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSection();
  }, []);

  const fetchSection = async () => {
    const { data, error } = await supabase
      .from("gallery_section")
      .select("id, title, subtitle, gallery_images(*)")
      .single();

    if (error && error.code !== "PGRST116") {
      toast({
        title: "Fetch Failed",
        description: "Failed to fetch gallery section.",
        variant: "destructive",
      });
    } else if (data) {
      setSectionTitle(data.title);
      setSectionSubtitle(data.subtitle);
      setSelectedSectionId(data.id);
      setImages(data.gallery_images || []);
    }
  };

  const createOrUpdateSection = async () => {
    if (!sectionTitle.trim()) return;

    if (!selectedSectionId) {
      const { data, error } = await supabase
        .from("gallery_section")
        .insert([{ title: sectionTitle, subtitle: sectionSubtitle }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Section Creation Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Section Created",
        description: "Gallery section created!",
      });

      setSelectedSectionId(data.id);
      fetchSection();
    } else {
      const { error } = await supabase
        .from("gallery_sections")
        .update({ title: sectionTitle, subtitle: sectionSubtitle })
        .eq("id", selectedSectionId);

      if (error) {
        toast({
          title: "Update Failed",
          description: "Failed to update section.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Section Updated",
          description: "Gallery section updated.",
        });
        fetchSection();
      }
    }
  };

  const handleFileChange = (f: File | null) => {
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const uploadImage = async () => {
    if (!file || !title.trim() || !selectedSectionId) {
      toast({
        title: "Missing Information",
        description: "Please provide image title and make sure section exists.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Upload Failed",
          description: result.error || "Upload failed.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("gallery_images")
        .insert([
          { image_url: result.url, title, section_id: selectedSectionId },
        ]);

      if (insertError) {
        toast({
          title: "Insert Failed",
          description: "Failed to save image info.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      toast({
        title: "Success",
        description: "Image uploaded!",
        variant: "default",
      });

      setFile(null);
      setPreview(null);
      setTitle("");
      fetchSection();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Upload failed due to an unexpected error.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Image deleted.",
        variant: "default",
      });
      fetchSection();
    }
  };
  const handleConfirmedDelete = async (id: string) => {
    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete image.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Image deleted.",
        variant: "default",
      });
      fetchSection();
    }

    setConfirmDeleteId(null); // close dialog
  };

  return (
    <div className="px-6 py-12 dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-7xl mx-auto space-y-8 ">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Gallery</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
            <Edit className="text-red-600" /> Gallery
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Edit your landing page gallery
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Title
          </Label>
          <Input
            placeholder="Section Title"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            maxLength={20}
          />
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Subtitle
          </Label>
          <Input
            placeholder="Section Subtitle"
            value={sectionSubtitle}
            onChange={(e) => setSectionSubtitle(e.target.value)}
            maxLength={120}
          />
          <Button
            onClick={createOrUpdateSection}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {selectedSectionId ? "Update Section" : "Create Section"}
          </Button>
        </div>

        {/* Upload Form */}
        <div className="grid grid-cols-1 gap-6 mb-10">
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Image Title
            </Label>
            <Input
              placeholder="Image Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Upload Drop Area */}
            <div className="relative border-2 border-dashed border-red-300 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-red-50 dark:hover:bg-neutral-800 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
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

            {preview && (
              <div className="rounded border w-full max-w-xs overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="w-full h-full object-cover rounded-lg shadow-md border hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            )}

            <Button
              onClick={uploadImage}
              disabled={uploading}
              className=" bg-red-600 hover:bg-red-700"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <Card key={img.id} className="group relative overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={img.image_url}
                  alt={img.title}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedImage(img.image_url)}
                />
                <div className="p-2">
                  <p className="text-sm font-semibold truncate">{img.title}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setConfirmDeleteId(img.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setSelectedImage(img.image_url)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fullscreen Preview */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center h-[90vh]"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Full Preview"
              className="max-w-7xl max-h-[70vh] object-contain shadow-2xl rounded-lg"
            />
          </div>
        )}
      </div>
      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this image?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDeleteId) {
                  handleConfirmedDelete(confirmDeleteId);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryAdmin;
