"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
interface SectionContent {
  title: string;
  subtitle: string;
  paragraphs: string[];
  image_url: string;
}

const AdminEditWeOffer = () => {
  const supabase = createClientComponentClient();

  const [content, setContent] = useState<SectionContent>({
    title: "",
    subtitle: "",
    paragraphs: [""],
    image_url: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    setLoading(true);
    supabase
      .from("page_sections")
      .select("*")
      .eq("section_slug", "we-offer")
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError("Failed to fetch content");
        } else if (data) {
          let paragraphs = data.paragraphs;
          if (typeof paragraphs === "string") {
            try {
              paragraphs = JSON.parse(paragraphs);
            } catch {
              paragraphs = [paragraphs];
            }
          }
          setContent({
            title: data.title || "",
            subtitle: data.subtitle || "",
            paragraphs: Array.isArray(paragraphs) ? paragraphs : [""],
            image_url: data.image_url || "",
          });
          setError(null);
        }
        setLoading(false);
      });
  }, [supabase]);

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...content.paragraphs];
    newParagraphs[index] = value;
    setContent({ ...content, paragraphs: newParagraphs });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setContent((prev) => ({ ...prev, image_url: data.url }));
      setSuccessMsg("Image uploaded successfully!");

      toast({
        title: "Upload Successful 🎉",
        description: "Image uploaded successfully.",
      });
    } catch (err: any) {
      setError("Image upload failed: " + err.message);
      toast({
        title: "Upload Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      title: content.title,
      subtitle: content.subtitle,
      paragraphs: content.paragraphs,
      image_url: content.image_url,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("page_sections").upsert(
      {
        section_slug: "we-offer",
        ...payload,
      },
      { onConflict: "section_slug" }
    );

    if (error) {
      setError("Failed to save content: " + error.message);
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSuccessMsg("Content saved successfully!");
      toast({
        title: "Saved Successfully 🎉",
        description: "Your changes have been saved.",
      });
    }

    setSaving(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow space-y-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>We Offer</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          We Offer
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Manage your landing page
        </p>
      </div>

      {error && (
        <p className="mb-4 text-red-600 font-semibold bg-red-100 p-2 rounded">
          {error}
        </p>
      )}
      {successMsg && (
        <p className="mb-4 text-green-600 font-semibold bg-green-100 p-2 rounded">
          {successMsg}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="relative mb-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Title
          </Label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 pr-16"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            required
            maxLength={20}
          />
          <div className="absolute bottom-[-20px] right-2 text-xs text-gray-500">
            {content.title.length}/20
          </div>
        </div>

        {/* Subtitle */}
        <div className="relative mb-4">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Subtitle
          </Label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 pr-16"
            rows={2}
            value={content.subtitle}
            onChange={(e) =>
              setContent({ ...content, subtitle: e.target.value })
            }
            required
            maxLength={120}
          />
          <div className="absolute bottom-[-20px] right-2 text-xs text-gray-500">
            {content.subtitle.length}/120
          </div>
        </div>

        {/* Paragraphs */}
        {content.paragraphs.map((para, idx) => (
          <div key={idx} className="relative mb-4">
            {idx === 0 && (
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Paragraph
              </Label>
            )}
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 pr-16"
              rows={6}
              value={para}
              onChange={(e) => updateParagraph(idx, e.target.value)}
              required
              maxLength={600}
            />
            <div className="absolute bottom-[-20px] right-2 text-xs text-gray-500">
              {para.length}/600
            </div>
          </div>
        ))}

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
              {content.image_url ? "Change File" : "Choose File"}
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {content.image_url ? "Image selected" : "No image selected"}
            </span>
          </div>
          <input
            id="upload-button"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />

          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}

          {content.image_url && (
            <img
              src={content.image_url}
              alt="Our Mission"
              className="mt-3 max-h-48 rounded border"
            />
          )}
        </div>

        {/* Image URL */}
        {/* <div>
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
            Image URL
          </Label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={content.image_url}
            onChange={(e) =>
              setContent({ ...content, image_url: e.target.value })
            }
            placeholder="Image URL will appear here after upload"
            required
          />
        </div> */}

        {/* Submit button */}
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-red-600 text-white font-semibold px-6 py-3 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default AdminEditWeOffer;
