"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { z } from "zod";
import type { ImageType, SurveyBillboard } from "@/types/survey";
import GeneralSurveyDetails from "@/components/surveys/GeneralSurveyDetails";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import BoardDetailsForm from "@/components/surveys/BoardDetailsForm";

// Validation Schema
const surveySchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  shopName: z.string().min(1, "Shop name is required"),
  shopAddress: z.string().min(1, "Shop address is required"),
  description: z.string().min(1, "Survey description is required"),
  phoneNumber: z
    .string()
    .regex(/^\d{10,15}$/, "Phone number must be 10-15 digits"),
});

// Interfaces
interface Billboard {
  id: string;
  name: string;
}

interface BillboardType {
  id: string;
  type_name: string;
}

export default function EditSurvey() {
  const { user } = useUser();
  const router = useRouter();
  const { id: surveyId } = useParams();

  const [billboardNames, setBillboardNames] = useState<Billboard[]>([]);
  const [billboardTypes, setBillboardTypes] = useState<BillboardType[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [billboards, setBillboards] = useState<SurveyBillboard[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newBoard, setNewBoard] = useState<SurveyBillboard>({
    billboard_name_id: "",
    width: "",
    height: "",
    billboard_type_id: "",
    quantity: "",
    board_images: [],
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [boardImagePreviews, setBoardImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: "",
    clientName: "",
    phoneNumber: "",
    clientId: "",
    description: "",
    survey_billboards: [],
  });
  const mapSurveyToFormData = (data: any) => ({
    shopName: data.shop_name,
    shopAddress: data.shop_address,
    clientName: data.client_name,
    phoneNumber: data.phone_number,
    clientId: data.client_id,
    description: data.description,
    survey_billboards: data.survey_billboards,
    form_image: data.form_image,
  });
  console.log(billboards, "billboards");
  useEffect(() => {
    if (!surveyId) return;
    fetch(`/api/surveys/${surveyId}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData(mapSurveyToFormData(data));
        setBillboards(data.survey_billboards);
      });
    fetch("/api/billboards/billboard-names")
      .then((res) => res.json())
      .then(setBillboardNames);
    fetch("/api/billboards/billboard-types")
      .then((res) => res.json())
      .then(setBillboardTypes);
  }, [surveyId]);
  const addBillboard = () => {
    setBillboards([...billboards, newBoard]);
  };

  const handleUpdate = async () => {
    const updatedBillboards = await Promise.all(
      billboards.map(async (board) => {
        const uploadedUrls: string[] = [];

        for (const img of board.board_images || []) {
          if (typeof img === "string") {
            // ✅ Already a URL, keep it
            uploadedUrls.push(img);
          } else if (img?.file instanceof File) {
            // ✅ New image that needs uploading
            const fileUpload = new FormData();
            fileUpload.append("file", img.file);

            try {
              const res = await fetch("/api/upload", {
                method: "POST",
                body: fileUpload,
              });

              const imgData = await res.json();
              if (imgData.url) {
                uploadedUrls.push(imgData.url);
              } else {
                console.warn("One board image failed to upload");
              }
            } catch (err) {
              console.error("Upload error:", err);
            }
          } else if (img instanceof File) {
            // Edge case: direct File (not wrapped in object)
            const fileUpload = new FormData();
            fileUpload.append("file", img);

            try {
              const res = await fetch("/api/upload", {
                method: "POST",
                body: fileUpload,
              });

              const imgData = await res.json();
              if (imgData.url) {
                uploadedUrls.push(imgData.url);
              } else {
                console.warn("One board image failed to upload");
              }
            } catch (err) {
              console.error("Upload error:", err);
            }
          }
        }

        return {
          ...board,
          board_images: uploadedUrls, // ✅ Now a clean array of strings
        };
      })
    );

    const payload = {
      formData,
      billboards: updatedBillboards,
    };

    const response = await fetch(`/api/surveys/${surveyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Survey updated successfully!");
      router.push("/surveyor");
    } else {
      alert("Something went wrong while updating.");
    }
  };

  const removeBillboard = (index: number) => {
    setBillboards(billboards.filter((_, i) => i !== index));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
      }
      setImage(file);
    }
  };
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    const fetchSurveyors = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("user_role", "client");
      console.log("clients", data);
      if (error) console.error(error);
      else setClients(data);
    };
    fetchSurveyors();
  }, []);

  const handleBoardChange = (
    index: number,
    field: keyof SurveyBillboard,
    value: string | number | File | (string | File)[]
  ) => {
    setBillboards((prev) =>
      prev.map((board, i) =>
        i === index
          ? {
              ...board,
              [field]: value,
            }
          : board
      )
    );
  };
  function fileToObjectURL(file: File) {
    const blob = new Blob([file], { type: file.type });
    const objectURL = URL.createObjectURL(blob);
    return { blob, objectURL };
  }
  const handleBoardImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    boardIndex: number
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    // const filePreview = newFiles.map((file) => fileToObjectURL(file));

    // Update the state with the new files and their preview URLs
    setBillboards((prev) => {
      const updated = [...prev];
      updated[boardIndex] = {
        ...updated[boardIndex],
        board_images: [
          ...(updated[boardIndex].board_images || []),
          ...newFiles.map((file) => ({
            file: file,
            preview: URL.createObjectURL(file),
          })),
        ],
      };
      return updated;
    });
  };

  return (
    <div className="py-16 px-6 max-w-7xl space-y-8 mx-auto bg-secondary/50 dark:bg-gray-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-red-700 mb-6">Update Survey</h1>
      {/* General Survey Details */}
      <GeneralSurveyDetails
        errors={errors}
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        clients={clients}
        previewImage={previewImage}
        handleImageChange={handleImageChange}
      />
      {/* List of Existing Billboards with Edit & Remove */}
      {billboards.length > 0 && (
        <div className="space-y-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Existing Boards
          </h2>
          {billboards.map((board, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md"
            >
              {/* Billboard Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Billboard Name
                </label>
                <select
                  value={board.billboard_name_id}
                  onChange={(e) =>
                    handleBoardChange(
                      index,
                      "billboard_name_id",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border rounded-md p-2"
                >
                  <option value="">Select</option>
                  {billboardNames.map((name) => (
                    <option key={name.id} value={name.id}>
                      {name.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Billboard Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Billboard Type
                </label>
                <select
                  value={board.billboard_type_id}
                  onChange={(e) =>
                    handleBoardChange(
                      index,
                      "billboard_type_id",
                      e.target.value
                    )
                  }
                  className="mt-1 block w-full border rounded-md p-2"
                >
                  <option value="">Select</option>
                  {billboardTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Width */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Width
                </label>
                <Input
                  type="number"
                  value={board.width}
                  onChange={(e) =>
                    handleBoardChange(index, "width", e.target.value)
                  }
                />
              </div>

              {/* Height */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Height
                </label>
                <Input
                  type="number"
                  value={board.height}
                  onChange={(e) =>
                    handleBoardChange(index, "height", e.target.value)
                  }
                />
              </div>

              {/* Quantity */}
              <div className="w-full">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity
                </label>
                <Input
                  type="number"
                  value={board.quantity}
                  onChange={(e) =>
                    handleBoardChange(index, "quantity", e.target.value)
                  }
                />
              </div>
              <div>
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Upload Board Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleBoardImageChange(e, index)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
    file:rounded-lg file:border-0
    file:text-sm file:font-semibold
    file:bg-red-50 file:text-red-700
    hover:file:bg-red-100
    dark:file:bg-gray-700 dark:file:text-white dark:hover:file:bg-gray-600"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {board.board_images.map((img: ImageType, idx: number) => {
                    const imageUrl =
                      typeof img === "string" ? img : img.preview;

                    return (
                      <img
                        key={idx}
                        src={imageUrl}
                        alt={`preview-${idx}`}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    );
                  })}
                </div>

                {/* Remove Button */}
                <div className="flex items-end justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => removeBillboard(index)}
                    className="bg-red-500 hover:bg-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full flex justify-start gap-4 items-center">
        <Button
          onClick={addBillboard}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Add Shopboard
        </Button>
        <Button
          onClick={handleUpdate}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Update Survey
        </Button>
      </div>
    </div>
  );
}
