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
  const [isMain, setIsMain] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    fetchSlides();
  }, []);

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
    if (!image || !title || !subtitle || uploading) return;
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

      // 🔄 Refresh the slide list
      await fetchSlides();

      // ⛔ Reset form and file input manually
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
          🎞 Carousel Manager
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Manage your carousel
        </p>
      </div>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add New Slide</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          /> */}
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
          />

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.length === 0 ? (
          <p className="text-muted-foreground">No slides uploaded yet.</p>
        ) : (
          slides.map((slide) => (
            <Card
              key={slide.id}
              className="shadow-md hover:shadow-lg transition-all"
            >
              <div className="relative w-full aspect-video">
                <Image
                  src={slide.image_url || "/placeholder.jpg"}
                  alt={slide.title}
                  fill
                  className="object-cover rounded-t-md"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = "/placeholder.jpg")
                  }
                />
              </div>
              <CardContent className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{slide.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {slide.subtitle}
                </p>
                {slide.is_main && (
                  <p className="text-xs text-green-600 font-semibold">
                    🌟 Main Image
                  </p>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(slide.id, slide.image_url)}
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Carousel;
