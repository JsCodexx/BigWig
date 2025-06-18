"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { z } from "zod";
import type {
  BillboardType,
  ImageType,
  Shopboard,
  SurveyBillboard,
} from "@/types/survey";
import GeneralSurveyDetails from "@/components/surveys/GeneralSurveyDetails";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { Label } from "@/components/ui/label";
import { uploadImages } from "@/lib/utils";
import BoardDesignManager from "../components/BoardDesignManager";
import { File, Info } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";

export default function EditSurvey() {
  const { user } = useUser();
  const router = useRouter();
  const { id: surveyId } = useParams();
  const { toast } = useToast();
  const [billboardNames, setBillboardNames] = useState<Shopboard[]>([]);
  const [billboardTypes, setBillboardTypes] = useState<BillboardType[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [billboards, setBillboards] = useState<SurveyBillboard[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
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
  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: "",
    clientName: "",
    phoneNumber: "",
    clientId: "",
    description: "",
    survey_billboards: [],
    surveyStatus: null,
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
    surveyStatus: data.survey_status,
    board_designs: data.board_designs,
    installation_images: data.installation_images,
  });

  const params = useParams();
  const id = params?.id; // this will be your UUID string
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  useEffect(() => {
    if (id) {
      setReadOnlyMode(true);
    }
  }, [id, params]);
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
          } else if (typeof img === "object" && img?.file instanceof File) {
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
      if (user.user_role === "surveyor") {
        router.push("/surveyor");
      } else if (user.user_role === "client") {
        router.push("/client/surveys");
      } else {
        router.push("/surveyor");
      }
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

  const handleBoardImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    boardIndex: number
  ) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

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

  const handleDesignUpdate = async (board: SurveyBillboard, mode: any) => {
    let updatedBoard;
    setLoading(true);
    if (mode === "installation") {
      const uploadedUrls = await uploadImages(board.installation_images || []);
      updatedBoard = {
        ...board,
        installation_images: uploadedUrls,
      };
      if (updatedBoard && updatedBoard?.installation_images.length === 0) {
        setLoading(false);
        toast({
          title: "Select Images to upload",
          description: "Failed to upload images.",
          variant: "destructive",
        });
        return;
      }
    } else {
      const uploadedUrls = await uploadImages(board.board_designs || []);
      updatedBoard = {
        ...board,
        board_designs: uploadedUrls,
      };
      if (updatedBoard && updatedBoard?.board_designs.length === 0) {
        setLoading(false);
        toast({
          title: "Select Images to upload",
          description: "Failed to upload images.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const res = await fetch(`/api/billboards/${board.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billboards: [updatedBoard], // Send as an array
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Successfull",
          description: " Images are uploaded successfully",
          variant: "default",
        });
      } else {
        console.error("Update failed", data);
        toast({
          title: "Uoload fail",
          description: " Failed to upload imags check logs",
          variant: "destructive",
        });
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error("Error during update:", err);
    }
  };
  const handleUpload = (
    index: number,
    newFiles: File[],
    mode: "design" | "installation"
  ) => {
    setBillboards((prev: any[]) => {
      const updated = [...prev];
      if (!updated[index]) updated[index] = {};

      updated[index] = {
        ...updated[index],
        [mode === "design" ? "board_designs" : "installation_images"]: newFiles,
      };

      return updated;
    });
  };
  useEffect(() => {
    console.log(loading);
  }, [loading]);
  return (
    <div className="py-16 px-6 max-w-7xl space-y-8 mx-auto bg-secondary/50 dark:bg-gray-800 rounded-xl shadow-md">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/surveyor">Surveys</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
          <File className="text-red-600" /> Update Survey
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          View and update the survey.
        </p>
      </div>
      {(formData.surveyStatus === "client_review" ||
        formData.surveyStatus === "admin_approved") && (
        <div className="mb-4 p-4 border-l-4 border-yellow-500 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-md shadow-sm">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 mt-1 text-yellow-500" />
            <div>
              <p className="font-semibold">Notice:</p>
              <p className="text-sm">
                You cannot change the survey details. Only removal of boards is
                allowed.
              </p>
            </div>
          </div>
        </div>
      )}
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
                <Label className="mb-2 font-semibold text-gray-700">
                  Billboard Name
                </Label>
                <select
                  disabled={readOnlyMode}
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
                <Label className="mb-2 font-semibold text-gray-700">
                  Billboard Type
                </Label>
                <select
                  disabled={readOnlyMode}
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
                <Label className="mb-2 font-semibold text-gray-700">
                  Width
                </Label>
                <Input
                  disabled={readOnlyMode}
                  type="number"
                  value={board.width}
                  onChange={(e) =>
                    handleBoardChange(index, "width", e.target.value)
                  }
                />
              </div>

              {/* Height */}
              <div>
                <Label className="mb-2 font-semibold text-gray-700">
                  Height
                </Label>
                <Input
                  disabled={readOnlyMode}
                  type="number"
                  value={board.height}
                  onChange={(e) =>
                    handleBoardChange(index, "height", e.target.value)
                  }
                />
              </div>

              {/* Quantity */}
              <div className="w-full">
                <Label className="mb-2 font-semibold text-gray-700">
                  Quantity
                </Label>
                <Input
                  disabled={readOnlyMode}
                  type="number"
                  value={board.quantity}
                  onChange={(e) =>
                    handleBoardChange(index, "quantity", e.target.value)
                  }
                />
              </div>
              {/* Board Images */}
              <div>
                {!formData.surveyStatus ? (
                  <div>
                    <Label className="mb-2 font-semibold text-gray-700">
                      Upload Board Images
                    </Label>
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
                ) : (
                  <>
                    <Label className="mb-2 font-semibold text-gray-700">
                      Board Images
                    </Label>
                  </>
                )}
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
                {!formData.surveyStatus && (
                  <div className="flex items-end justify-end">
                    <Button
                      variant="destructive"
                      onClick={() => removeBillboard(index)}
                      className="bg-red-500 hover:bg-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
              {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {(formData.surveyStatus === "client_approved" ||
                formData.surveyStatus === "installation_completed" ||
                formData.surveyStatus === "completed") && (
                <div>
                  <BoardDesignManager
                    board={board}
                    index={index}
                    surveyStatus={formData.surveyStatus}
                    mode="design"
                    handleUpload={handleUpload}
                    handleUpdates={handleDesignUpdate}
                  />
                </div>
              )}
              {(formData.surveyStatus === "installation_completed" ||
                formData.surveyStatus === "completed") && (
                <div>
                  <BoardDesignManager
                    board={board}
                    index={index}
                    surveyStatus={formData.surveyStatus}
                    mode="installation"
                    handleUpload={handleUpload}
                    handleUpdates={handleDesignUpdate}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="w-full flex justify-start gap-4 items-center">
        {user?.user_role === "admin" &&
          formData?.surveyStatus === "pending_admin_review" && (
            <Button
              onClick={addBillboard}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              Add Shopboard
            </Button>
          )}

        {(user?.user_role === "admin" || user?.user_role === "client") &&
          (formData?.surveyStatus === "pending_admin_review" ||
            formData?.surveyStatus === "client_review") && (
            <Button
              onClick={handleUpdate}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              Update Survey
            </Button>
          )}
      </div>
    </div>
  );
}
