"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState, useEffect, use } from "react";
import { useUser } from "@/context/UserContext"; // Assuming a user context exists
import type {
  BillboardType,
  FormDataType,
  Shopboard,
  SurveyBillboard,
} from "@/types/survey";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { useRouter } from "next/navigation";
import { BoardsTable } from "@/components/surveys/BoardsTable";
import GeneralSurveyDetails from "@/components/surveys/GeneralSurveyDetails";
import BoardDetailsForm from "@/components/surveys/BoardDetailsForm";
import { generalSurveySchema } from "@/lib/utils";
import { useUi } from "@/context/UiContext";
import { File } from "lucide-react";
import DialogWrapper from "./components/board-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
interface Errors {
  shopName?: string;
  shopAddress?: string;
  clientName?: string;
  phoneNumber?: string;
  description?: string;
  clientId?: string;
}

export default function SubmitSurvey() {
  const { user } = useUser(); // Get the logged-in user's info
  const [billboardNames, setBillboardNames] = useState<Shopboard[]>([]);
  const [billboardTypes, setBillboardTypes] = useState<BillboardType[]>([]);
  const [billboards, setBillboards] = useState<SurveyBillboard[]>([]);
  const [newBoard, setNewBoard] = useState<SurveyBillboard>({
    billboard_name_id: "",
    width: "",
    height: "",
    billboard_type_id: "",
    quantity: "",
    board_images: [],
    board_designs: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"name" | "type">();
  const [newValue, setNewValue] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [resetPreview, setResetPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setSelectedQuote, selectedQuote } = useUi();
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataType>({
    shopName: "",
    shopAddress: "",
    clientName: "",
    phoneNumber: "",
    clientId: "",
    description: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetch("/api/billboards/billboard-names")
      .then((res) => res.json())
      .then(setBillboardNames);
    fetch("/api/billboards/billboard-types")
      .then((res) => res.json())
      .then(setBillboardTypes);
  }, []);
  const removeBillboard = (index: number) => {
    setBillboards((prev) => prev.filter((_, i) => i !== index));
  };

  // on change add details in the board
  const updateNewBoard = (
    field: keyof SurveyBillboard,
    value: string | number | File[] // accept File[] for board_images
  ) => {
    setNewBoard((prev) => ({
      ...prev,
      [field]: field === "board_images" ? value : value.toString(),
    }));
  };

  // Mark The quote completed
  const markQuoteAsConducted = async () => {
    if (!selectedQuote) return;

    const response = await fetch(`/api/quotes?id=${selectedQuote}`, {
      method: "PATCH",
    });

    if (response.ok) {
      console.log("Survey successfully marked as conducted");
      // Optionally refresh or update UI here
    } else {
      const errorData = await response.json();
      console.error("Failed to update quote status:", errorData.message);
    }
  };

  // Submit the Survey
  const handleSubmit = async () => {
    setLoading(true);
    if (!user) {
      alert("User not logged in");
      setLoading(false);
      return;
    }
    const result = generalSurveySchema.safeParse(formData);

    if (!result.success) {
      // Map Zod errors to your Errors object
      const fieldErrors: Errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof Errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }
    let surveyStatus = "";
    if (user?.user_role === "client") {
      surveyStatus = "client_approved";
    } else if (user?.user_role === "surveyor") {
      surveyStatus = "pending_admin_review";
    } else if (user?.user_role === "admin") {
      surveyStatus = "client_review";
    } else {
      surveyStatus = "in_progress";
    }

    if (!image) {
      setLoading(false);
      alert("Please upload a form image");
      return;
    }

    // 🔼 Upload main form image
    const formUpload = new FormData();
    formUpload.append("file", image);

    const formRes = await fetch("/api/upload", {
      method: "POST",
      body: formUpload,
    });

    const formDataJson = await formRes.json();
    if (!formDataJson.url) {
      setLoading(false);
      alert("Form image upload failed!");
      return;
    }

    // 🔁 Upload each image inside billboards[].board_images using same `/api/upload`
    const updatedBillboards = await Promise.all(
      billboards.map(async (board) => {
        const imagesToUpload = board.board_images
          .map(({ file }) => file)
          .filter((file): file is File => !!file);

        const uploadedUrls = await Promise.all(
          imagesToUpload.map(async (file) => {
            try {
              const fileUpload = new FormData();
              fileUpload.append("file", file);

              const res = await fetch("/api/upload", {
                method: "POST",
                body: fileUpload,
              });

              if (!res.ok) {
                console.warn("Upload failed with status:", res.status);
                return null;
              }

              const imgData = await res.json();
              return imgData.url || null;
            } catch (err) {
              console.error("Upload error:", err);
              return null;
            }
          })
        );

        return {
          ...board,
          board_images: uploadedUrls.filter(Boolean),
        };
      })
    );

    // 🎯 Final payload to save
    const payload = {
      description: formData.description,
      client_id: formData.clientId,
      surveyorId: user?.user_role === "admin" ? null : user?.id,
      billboards: updatedBillboards,
      phoneNumber: formData.phoneNumber,
      clientName: formData.clientName,
      shopAddress: formData.shopAddress,
      shopName: formData.shopName,
      survey_status: surveyStatus,
      publicURL: formDataJson.url, // ✅ Main image
    };

    const saveRes = await fetch("/api/submit-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (saveRes.ok) {
      setLoading(false);
      markQuoteAsConducted();
      alert("Survey Submitted!");
      router.push("/surveyor");
    } else {
      setLoading(false);
      alert("Survey submission failed.");
      router.push("/surveyor");
    }
    setLoading(false);
  };

  const openModal = (type: "name" | "type") => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleAddNew = async () => {
    if (!newValue.trim()) return;

    const endpoint =
      modalType === "name"
        ? "/api/billboards/billboard-names"
        : "/api/billboards/billboard-types";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: newValue }),
    });

    if (response.ok) {
      const newItem = await response.json();
      if (modalType === "name") setBillboardNames([...billboardNames, newItem]);
      else setBillboardTypes([...billboardTypes, newItem]);

      setNewValue("");
      setModalOpen(false);
    } else {
      alert("Error adding new item.");
    }
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
  const handleEditBoard = (index: number) => {
    setNewBoard(billboards[index]);
    setEditIndex(index);
    setShowDialog(true);
  };
  const addOrUpdateBoard = () => {
    if (editIndex !== null) {
      const updated = [...billboards];
      updated[editIndex] = newBoard!;
      setBillboards(updated);
      setEditIndex(null);
    } else {
      setBillboards([...billboards, newBoard!]);
    }
    setNewBoard({
      billboard_name_id: "",
      width: "",
      height: "",
      billboard_type_id: "",
      quantity: "",
      board_images: [],
    });
    // ✅ Trigger reset signal for image preview in child
    setResetPreview(true);

    // Immediately turn it off so future changes can trigger again
    setTimeout(() => setResetPreview(false), 100);
  };
  return (
    <div className="w-full flex flex-col justify-center items-center">
      {/* Left Side: Survey Form */}
      <div className="py-16 px-6 max-w-7xl w-full mx-auto ">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Survey</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
            <File className="text-red-600" /> Create Survey
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Create,View and Edit your surveys at one place.
          </p>
        </div>
        {/* Left: Submit Survey + Board Form (60%) */}

        <div className="w-full space-y-6">
          {/* General Survey Details */}
          <div className="bg-secondary/50 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-8">
            <GeneralSurveyDetails
              errors={errors}
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              clients={clients}
              previewImage={previewImage}
              handleImageChange={handleImageChange}
            />
            {/* Conditional: Boards Table (Full Width) */}
            {billboards.length > 0 && (
              <div className="w-full bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Added Shopboard
                </h2>
                <BoardsTable
                  billboards={billboards}
                  onRemoveBoard={removeBillboard}
                  billboardNames={billboardNames}
                  billboardTypes={billboardTypes}
                  onEditBoard={handleEditBoard}
                />
              </div>
            )}
            {/* Billboard Details Form */}
            {/* <BoardDetailsForm
              billboardNames={billboardNames}
              billboardTypes={billboardTypes}
              newBoard={newBoard}
              userRole={user?.user_role || ""}
              updateNewBoard={updateNewBoard}
              openModal={openModal}
              resetPreview={resetPreview}
              setNewBoard={setNewBoard}
            /> */}
            <DialogWrapper
              billboardNames={billboardNames}
              billboardTypes={billboardTypes}
              newBoard={newBoard}
              user={user}
              updateNewBoard={updateNewBoard}
              resetPreview={resetPreview}
              setNewBoard={setNewBoard}
              onAddBoard={addOrUpdateBoard}
              open={showDialog}
              setOpen={setShowDialog}
            />

            <div className="flex justify-between gap-4 items-center">
              <Button
                onClick={handleSubmit}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? "Submitting.." : "Submit Survey"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for Adding Name/Type */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === "name"
                ? "Add Shopboard Name"
                : "Add Shopboard Type"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder={`Enter ${
              modalType === "name" ? "Shopboard Name" : "Type"
            }`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Button onClick={handleAddNew} className="bg-red-500 text-white">
            Add
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
