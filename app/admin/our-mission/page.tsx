"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Edit } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
interface SectionContent {
  title: string;
  subtitle: string;
  paragraphs: string[];
  image_url: string;
}

const AdminEditOurMission = () => {
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

  useEffect(() => {
    setLoading(true);
    supabase
      .from("page_sections")
      .select("*")
      .eq("section_slug", "our-mission")
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
    } catch (err: any) {
      setError("Image upload failed: " + err.message);
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
        section_slug: "our-mission",
        ...payload,
      },
      { onConflict: "section_slug" }
    );

    if (error) {
      setError("Failed to save content: " + error.message);
    } else {
      setSuccessMsg("Content saved successfully!");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow-md space-y-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Our Mission</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <Edit className="text-red-600" /> Edit Our Mission Section
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Edit your landing page
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
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            maxLength={20}
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            required
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block mb-1 font-semibold">Subtitle</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={2}
            maxLength={120}
            value={content.subtitle}
            onChange={(e) =>
              setContent({ ...content, subtitle: e.target.value })
            }
            required
          />
        </div>

        {/* Paragraphs */}
        <div>
          <label className="block mb-1 font-semibold">Paragraphs</label>
          {content.paragraphs.map((para, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={6}
                maxLength={600}
                value={para}
                onChange={(e) => updateParagraph(idx, e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-1 font-semibold">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mb-2"
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
        <div>
          <label className="block mb-1 font-semibold">Image URL</label>
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
        </div>

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

export default AdminEditOurMission;
