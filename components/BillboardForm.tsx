"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Image as ImageIcon, Trash, Edit } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
const formSchema = z.object({
  length: z.string().min(1, "Required"),
  width: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  facing_to: z.string().min(1, "Required"),
  status: z.enum(["equipped", "available", "out_of_order"]),
  equipped_until: z.string().optional(),
  avatar: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function BillboardForm() {
  const supabase = createClientComponentClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "gallery"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data, error } = await supabase.storage
      .from("files")
      .upload(`images/${Date.now()}_${file.name}`, file);

    if (error) {
      console.error("Upload Error:", error);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${data.path}`;

    if (type === "avatar") {
      setAvatarPreview(imageUrl);
      setValue("avatar", imageUrl);
    } else {
      setGalleryPreviews((prev) => [...prev, imageUrl]);
      setValue("gallery", [...(watch("gallery") || []), imageUrl]);
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log("Form Data:", data);
    const { error } = await supabase.from("bill_boards").insert(data);

    if (error) {
      console.error("Error saving billboard:", error);
    } else {
      alert("Billboard saved successfully!");
      router.push("/products");
    }
  };
  const handleDelete = async (imageUrl: string) => {
    if (!imageUrl) {
      console.error("No image URL provided, skipping storage deletion.");
      return;
    }

    try {
      // Extract correct file path from URL
      const filePath = imageUrl.split("/public/files/images/")[1];

      if (!filePath) {
        console.error("Invalid image URL format:", imageUrl);
        return;
      }

      console.log("Deleting image from storage:", `images/${filePath}`);

      // Delete the image from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("files") // Ensure this is the correct bucket name
        .remove([`images/${filePath}`]); // Make sure to include "images/"

      if (storageError) {
        console.error("Error deleting image from storage:", storageError);
        return;
      }

      console.log("Image deleted successfully:", filePath);
    } catch (err) {
      console.error("Error extracting file path:", err);
      return;
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Add Board</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Edit className="text-red-600" /> Add Board
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Add and edit your boards
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
        {/* Length & Width */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="length">Length</Label>
            <Input id="length" {...register("length")} className="mt-1" />
            {errors.length && (
              <p className="text-red-500 text-sm mt-1">
                {errors.length.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="width">Width</Label>
            <Input id="width" {...register("width")} className="mt-1" />
            {errors.width && (
              <p className="text-red-500 text-sm mt-1">
                {errors.width.message}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} className="mt-1" />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        {/* Facing To */}
        <div>
          <Label htmlFor="facing_to">Facing To</Label>
          <Input id="facing_to" {...register("facing_to")} className="mt-1" />
          {errors.facing_to && (
            <p className="text-red-500 text-sm mt-1">
              {errors.facing_to.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) =>
              setValue(
                "status",
                value as "equipped" | "available" | "out_of_order"
              )
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equipped">Equipped</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="out_of_order">Out of Order</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Equipped Until */}
        {watch("status") === "equipped" && (
          <div>
            <Label htmlFor="equipped_until">Equipped Until</Label>
            <Input
              id="equipped_until"
              type="datetime-local"
              {...register("equipped_until")}
              className="mt-1"
            />
          </div>
        )}

        {/* Avatar Upload */}
        <div>
          <Label>Avatar (Main Image)</Label>
          <div className="flex items-center gap-4 mt-2">
            {avatarPreview ? (
              <div className="relative">
                <Image
                  src={avatarPreview}
                  width={80}
                  height={80}
                  className="rounded-lg shadow-md"
                  alt="Avatar Preview"
                />
                {/* Delete Button */}
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-600 p-1 rounded-full text-white shadow-md"
                  onClick={() => handleDelete(avatarPreview)}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <ImageIcon className="w-20 h-20 text-gray-500" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "avatar")}
            />
          </div>
        </div>

        {/* Gallery Upload */}
        <div>
          <Label>Gallery Images</Label>
          <div className="flex gap-4 mt-2">
            {galleryPreviews.map((src, index) => (
              <div key={index} className="relative">
                <Image
                  src={src}
                  width={60}
                  height={60}
                  className="rounded-lg shadow-md"
                  alt={`Gallery Image ${index + 1}`}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-600 p-1 rounded-full text-white shadow-md"
                  onClick={() => handleDelete(src)}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "gallery")}
              multiple
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-red-700 text-white py-2">
          Save Billboard
        </Button>
      </form>
    </div>
  );
}
