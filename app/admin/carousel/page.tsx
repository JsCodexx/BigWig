"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Carousel = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<{
    id: string;
    imageUrl?: string;
  } | null>(null);

  const [isMain, setIsMain] = useState(false);
  const { toast } = useToast();
  const confirmDelete = async () => {
    if (!slideToDelete) return;

    const { id, imageUrl } = slideToDelete;

    if (imageUrl) {
      const filePath = imageUrl.split("/public/files/")[1];
      if (filePath) {
        await supabase.storage.from("files").remove([filePath]);
      }
    }

    const { error: dbError } = await supabase
      .from("slides")
      .delete()
      .match({ id });

    if (dbError) {
      toast({ title: "Error deleting slide", variant: "destructive" });
    } else {
      toast({ title: "Slide deleted" });
      fetchSlides();
    }

    setSlideToDelete(null);
    setShowDeleteDialog(false);
  };

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setSlides(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleUpload = async () => {
    if (!image || uploading) return;
    setUploading(true);

    if (isMain) {
      const { error: updateError } = await supabase
        .from("slides")
        .update({ is_main: false })
        .eq("is_main", true);

      if (updateError) {
        toast({
          title: "Error resetting previous main slide",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }
    }

    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}_${image.name}`;
    const filePath = `images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("files")
      .upload(filePath, image);

    if (uploadError) {
      toast({ title: "Upload failed", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: publicURL } = supabase.storage
      .from("files")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("slides").insert([
      {
        image_url: publicURL.publicUrl,
        title,
        subtitle,
        is_main: isMain || slides.length === 0,
      },
    ]);

    if (insertError) {
      toast({ title: "Failed to save slide data", variant: "destructive" });
    } else {
      toast({ title: "Slide uploaded successfully" });
      await fetchSlides();
      setTitle("");
      setSubtitle("");
      setImage(null);
      setIsMain(false);
      const fileInput =
        document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.value = "";
    }

    setUploading(false);
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    if (imageUrl) {
      const filePath = imageUrl.split("/public/files/")[1];
      if (filePath) {
        await supabase.storage.from("files").remove([filePath]);
      }
    }

    const { error: dbError } = await supabase
      .from("slides")
      .delete()
      .match({ id });

    if (dbError) {
      toast({ title: "Error deleting slide", variant: "destructive" });
    } else {
      toast({ title: "Deleted" });
      fetchSlides();
    }
  };

  const handleSetMain = async (id: string) => {
    const { error: clearError } = await supabase
      .from("slides")
      .update({ is_main: false })
      .eq("is_main", true);

    if (clearError) {
      toast({
        title: "Failed to clear existing main slide",
        variant: "destructive",
      });
      return;
    }

    const { error: setError } = await supabase
      .from("slides")
      .update({ is_main: true })
      .eq("id", id);

    if (setError) {
      toast({ title: "Failed to set as main", variant: "destructive" });
    } else {
      toast({ title: "Slide set as main ✅" });
      fetchSlides();
    }
  };
  useEffect(() => {
    fetchSlides();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow space-y-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Carousel</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          🎞 Carousel Manager
        </h1>
        <p className="text-gray-500 text-sm">Manage your homepage slides</p>
      </div>

      {/* Upload Slide Form */}
      <Card id="upload-form">
        <CardHeader>
          <CardTitle>Add New Slide</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
          />
          {/* <Input
            type="text"
            placeholder="Slide Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Slide Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          /> */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isMain}
              onCheckedChange={(checked: any) => setIsMain(!!checked)}
              id="main-image-checkbox"
            />
            <label htmlFor="main-image-checkbox" className="text-sm">
              Set as Main Image
            </label>
          </div>

          <Button
            disabled={!image || uploading}
            onClick={handleUpload}
            className="w-fit"
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> Upload Slide
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Slides Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Add New Card */}
        <Card
          className="cursor-pointer border-dashed border-2 border-gray-300 hover:border-blue-400 flex items-center justify-center text-center min-h-[220px] transition-all"
          onClick={() => {
            const uploadSection = document.getElementById("upload-form");
            if (uploadSection) {
              uploadSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-blue-500" />
            <p className="font-semibold text-blue-500">Add New Slide</p>
          </CardContent>
        </Card>

        {/* Slides */}
        {slides.map((slide) => (
          <Card
            key={slide.id}
            className={`relative shadow-md hover:shadow-lg transition-all border ${
              slide.is_main ? "ring-2 ring-yellow-400" : ""
            }`}
          >
            <div className="relative w-full aspect-video rounded-t-md overflow-hidden">
              <Image
                src={slide.image_url || "/placeholder.jpg"}
                alt={slide.title}
                fill
                className="object-cover"
              />
              {slide.is_main && (
                <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                  🌟 Main
                </span>
              )}
            </div>
            <CardContent className="p-4 space-y-2">
              <h2 className="text-md font-semibold truncate">{slide.title}</h2>
              <p className="text-sm text-muted-foreground truncate">
                {slide.subtitle}
              </p>
              <div className="flex justify-between items-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSlideToDelete({
                      id: slide.id,
                      imageUrl: slide.image_url,
                    });
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                {!slide.is_main && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetMain(slide.id)}
                  >
                    🌟 Set Main
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slide? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Carousel;
