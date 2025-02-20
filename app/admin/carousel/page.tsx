"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Upload, Trash } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Carousel = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    const { data, error } = await supabase
      .from("slides")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setSlides(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleUpload = async () => {
    if (!image || !title || !subtitle || uploading) return;
    setUploading(true);

    const fileExt = image.name.split(".").pop();
    const originalName = image.name.replace(`.${fileExt}`, "");
    const fileName = `${Date.now()}_${originalName}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("files")
      .upload(filePath, image);
    if (error) {
      console.error("Upload error:", error);
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
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
    } else {
      fetchSlides();
      setTitle("");
      setSubtitle("");
      setImage(null);
    }
    setUploading(false);
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!imageUrl) {
      console.error("No image URL provided, skipping storage deletion.");
    } else {
      try {
        // Extract only the file path from the URL
        const filePath = imageUrl.split("/public/files/")[1];

        if (!filePath) {
          console.error("Invalid image URL format:", imageUrl);
          return;
        }

        console.log("Deleting image from storage:", filePath);

        // Delete the image from Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("files") // Ensure this is the correct bucket name
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting image from storage:", storageError);
          return;
        }

        console.log("Image deleted successfully:", filePath);
      } catch (err) {
        console.error("Error extracting file path:", err);
        return;
      }
    }

    // Delete the slide from the database
    const { error: dbError } = await supabase
      .from("slides")
      .delete()
      .match({ id });

    if (dbError) {
      console.error("Error deleting slide from database:", dbError);
      return;
    }

    console.log("Slide deleted successfully:", id);

    // Refresh the slides list
    fetchSlides();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Carousel Slides</h1>

      <div className="grid gap-4 mb-6">
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />

        <Button
          onClick={handleUpload}
          disabled={!title || !subtitle || !image || uploading}
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="mr-2" /> Upload Slide
            </>
          )}
        </Button>
      </div>

      <div className="overflow-x-auto w-full">
        <Table className="min-w-full border rounded-lg overflow-hidden">
          <TableHead>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableCell className="p-3 font-semibold">Image</TableCell>
              <TableCell className="p-3 font-semibold">Title</TableCell>
              <TableCell className="p-3 font-semibold">Subtitle</TableCell>
              <TableCell className="p-3 text-center font-semibold">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slides.map((slide) => (
              <TableRow key={slide.id} className="border-b">
                <TableCell className="p-3 w-5">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-20 h-12 object-cover rounded-md"
                  />
                </TableCell>
                <TableCell className="p-3">{slide.title}</TableCell>
                <TableCell className="p-3">{slide.subtitle}</TableCell>
                <TableCell className="p-3 text-center">
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(slide.id, slide.image_url)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Carousel;
