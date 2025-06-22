"use client";

import { useEffect, useState } from "react";
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
import { Upload, Image as ImageIcon, Trash, Edit, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
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
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [billboards, setBillboards] = useState<any[]>([]);
  const [loadingBillboards, setLoadingBillboards] = useState(true);
  const { toast } = useToast();
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
      setIsAvatarLoading(true);
      setAvatarPreview(imageUrl);
      setValue("avatar", imageUrl);
    } else {
      setIsGalleryLoading(true);
      setGalleryPreviews((prev) => [...prev, imageUrl]);
      setValue("gallery", [...(watch("gallery") || []), imageUrl]);
    }
    setIsAvatarLoading(false);
    setIsGalleryLoading(false);
  };

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from("bill_boards").insert(data);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save billboard.",
        variant: "destructive",
      });
      console.error("Error saving billboard:", error);
    } else {
      toast({
        title: "Success",
        description: "Billboard saved successfully.",
      });
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!imageUrl) {
      toast({
        title: "Invalid Action",
        description: "No image URL provided.",
        variant: "destructive",
      });
      return;
    }

    try {
      const filePath = imageUrl.split("/public/files/images/")[1];
      if (!filePath) {
        toast({
          title: "Error",
          description: "Invalid image URL format.",
          variant: "destructive",
        });
        return;
      }

      const { error: storageError } = await supabase.storage
        .from("files")
        .remove([`images/${filePath}`]);

      if (storageError) {
        toast({
          title: "Storage Error",
          description: "Failed to delete image from storage.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Image Deleted",
        description: "Image removed from storage.",
      });
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Unexpected Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const deleteBillboard = async (id: number) => {
    const { error } = await supabase.from("bill_boards").delete().eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete billboard.",
        variant: "destructive",
      });
      console.error("Error deleting billboard:", error);
    } else {
      setBillboards((prev) => prev.filter((bb) => bb.id !== id));
      toast({
        title: "Deleted",
        description: "Billboard deleted successfully.",
      });
    }
  };

  useEffect(() => {
    const fetchBillboards = async () => {
      const { data, error } = await supabase.from("bill_boards").select("*");
      if (error) {
        console.error("Error fetching billboards:", error);
      } else {
        setBillboards(data);
      }
      setLoadingBillboards(false);
    };

    fetchBillboards();
  }, []);

  return (
    <div className="w-full bg-white dark:bg-gray-900 p-8 ">
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 mt-4 bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
      >
        {/* Length & Width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="length"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Length
            </Label>
            <Input
              id="length"
              {...register("length")}
              className="mt-1"
              placeholder="Enter length"
            />
            {errors.length && (
              <p className="text-xs text-red-500 mt-1">
                {errors.length.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="width"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Width
            </Label>
            <Input
              id="width"
              {...register("width")}
              className="mt-1"
              placeholder="Enter width"
            />
            {errors.width && (
              <p className="text-xs text-red-500 mt-1">
                {errors.width.message}
              </p>
            )}
          </div>
        </div>

        {/* Location & Facing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label
              htmlFor="location"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Location
            </Label>
            <Input
              id="location"
              {...register("location")}
              className="mt-1"
              placeholder="Enter location"
            />
            {errors.location && (
              <p className="text-xs text-red-500 mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="facing_to"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Facing To
            </Label>
            <Input
              id="facing_to"
              {...register("facing_to")}
              className="mt-1"
              placeholder="Enter direction"
            />
            {errors.facing_to && (
              <p className="text-xs text-red-500 mt-1">
                {errors.facing_to.message}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <Label
            htmlFor="status"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Status
          </Label>
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
            <Label
              htmlFor="equipped_until"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Equipped Until
            </Label>
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
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Avatar
          </Label>
          <div className="flex items-center gap-4 mt-2">
            {avatarPreview ? (
              <div className="relative w-[64px] h-[64px]">
                <Image
                  src={avatarPreview}
                  fill
                  className="rounded-md object-cover shadow"
                  alt="Avatar Preview"
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white shadow"
                  onClick={() => handleDelete(avatarPreview)}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <ImageIcon className="w-12 h-12 text-gray-400" />
            )}

            <label className="cursor-pointer inline-flex items-center bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 px-3 py-1.5 rounded-md shadow transition disabled:opacity-50">
              {isAvatarLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : avatarPreview ? (
                "Change Image"
              ) : (
                "Upload Image"
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "avatar")}
                className="hidden"
                disabled={isAvatarLoading}
              />
            </label>
          </div>
        </div>

        {/* Gallery Upload */}
        <div>
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Gallery Images
          </Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {galleryPreviews.map((src, index) => (
              <div key={index} className="relative w-[56px] h-[56px]">
                <Image
                  src={src}
                  fill
                  className="rounded-md object-cover shadow"
                  alt={`Gallery Image ${index + 1}`}
                />
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-red-600 p-1 rounded-full text-white shadow"
                  onClick={async () => {
                    await handleDelete(src); // remove from storage
                    setGalleryPreviews((prev) =>
                      prev.filter((img) => img !== src)
                    ); // update UI
                    const updatedGallery = (watch("gallery") || []).filter(
                      (img: string) => img !== src
                    );
                    setValue("gallery", updatedGallery);
                  }}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}

            <label className="cursor-pointer inline-flex items-center bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 px-3 py-1.5 rounded-md shadow transition disabled:opacity-50">
              {isGalleryLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : galleryPreviews.length > 0 ? (
                "Add More"
              ) : (
                "Select Image"
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "gallery")}
                className="hidden"
                disabled={isGalleryLoading}
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="ml-auto px-4 py-1.5 text-sm bg-red-700 hover:bg-red-800 text-white rounded-md shadow"
        >
          Save
        </Button>
      </form>
      {loadingBillboards ? (
        <p className="text-gray-500 mt-6">Loading billboards...</p>
      ) : (
        <div className="mt-10">
          <div>
            <h1 className="text-2xl font-bold text-red-700 flex items-center gap-2">
              Existing Billboards
            </h1>
          </div>
          {billboards.length === 0 ? (
            <p className="text-gray-500">No billboards found.</p>
          ) : (
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500 scrollbar-track-gray-200 pr-2 mt-4 space-y-4">
              {billboards.map((bb) => (
                <div
                  key={bb.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-md p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {bb.location} ({bb.length} x {bb.width})
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Facing: {bb.facing_to} | Status: {bb.status}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteBillboard(bb.id)}
                  >
                    <Trash className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
