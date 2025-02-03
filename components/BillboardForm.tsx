"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useTheme } from "next-themes";
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
import { Upload, Image as ImageIcon, Trash } from "lucide-react";
import Image from "next/image";

// 🎯 Define form validation schema
const formSchema = z.object({
  length: z.string().min(1, "Required"),
  width: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  facing_to: z.string().min(1, "Required"),
  status: z.enum(["equipped", "available", "out_of_order"]),
  equipped_until: z.string().optional(), // Only needed when status = equipped
  avatar: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function BillboardForm() {
  const { theme } = useTheme();
  const supabase = createClientComponentClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

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
      .from("files") // 👈 Your Supabase storage bucket name
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
    console.log("Form Data:", data); // ✅ Log data to check values before submitting
    const { error } = await supabase.from("bill_boards").insert(data);

    if (error) {
      console.error("Error saving billboard:", error);
    } else {
      alert("Billboard saved successfully!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-red-700 dark:text-red-500">
        Billboard Form
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="length">Length</Label>
            <Input id="length" {...register("length")} />
            {errors.length && (
              <p className="text-red-500">{errors.length.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="width">Width</Label>
            <Input id="width" {...register("width")} />
            {errors.width && (
              <p className="text-red-500">{errors.width.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} />
          {errors.location && (
            <p className="text-red-500">{errors.location.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="facing_to">Facing To</Label>
          <Input id="facing_to" {...register("facing_to")} />
          {errors.facing_to && (
            <p className="text-red-500">{errors.facing_to.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) => {
              setValue(
                "status",
                value as "equipped" | "available" | "out_of_order"
              ); // Type assertion
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equipped">Equipped</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="out_of_order">Out of Order</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-red-500">{errors.status.message}</p>
          )}
        </div>

        {/* Equipped Time */}
        {watch("status") === "equipped" && (
          <div>
            <Label htmlFor="equipped_until">Equipped Until</Label>
            <Input
              id="equipped_until"
              type="datetime-local"
              {...register("equipped_until")}
            />
          </div>
        )}

        {/* Avatar Upload */}
        <div>
          <Label>Avatar (Main Image)</Label>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                width={80}
                height={80}
                className="rounded-lg"
                alt="Avatar Preview"
              />
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
          <div className="flex gap-4">
            {galleryPreviews.map((src, index) => (
              <div key={index} className="relative">
                <Image
                  src={src}
                  width={60}
                  height={60}
                  className="rounded-lg"
                  alt={`Gallery Image ${index + 1}`}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-red-500 p-1 rounded-full text-white"
                  onClick={() => {
                    setGalleryPreviews(
                      galleryPreviews.filter((_, i) => i !== index)
                    );
                  }}
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

        <Button type="submit" className="bg-red-700 text-white w-full">
          Save Billboard
        </Button>
      </form>
    </div>
  );
}
