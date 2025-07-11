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
import { useToast } from "@/hooks/use-toast";
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
  const { selectedQuote } = useUi();
  const router = useRouter();
  const { toast } = useToast();
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
      toast({
        title: "User Not Logged In",
        description: "Please log in to submit the survey.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const result = generalSurveySchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof Errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields.",
        variant: "destructive",
      });
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
      toast({
        title: "Missing Image",
        description: "Please upload the form image before submitting.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const formUpload = new FormData();
    formUpload.append("file", image);

    const formRes = await fetch("/api/upload", {
      method: "POST",
      body: formUpload,
    });

    const formDataJson = await formRes.json();
    if (!formDataJson.url) {
      toast({
        title: "Form Upload Failed",
        description: "Could not upload the main form image.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

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
                toast({
                  title: "Upload Failed",
                  description: `Image upload failed with status ${res.status}`,
                  variant: "destructive",
                });
                return null;
              }

              const imgData = await res.json();
              return imgData.url || null;
            } catch (err) {
              console.error("Upload error:", err);
              toast({
                title: "Upload Error",
                description:
                  "An unexpected error occurred during image upload.",
                variant: "destructive",
              });
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
      publicURL: formDataJson.url,
    };

    const saveRes = await fetch("/api/submit-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (saveRes.ok) {
      markQuoteAsConducted();
      toast({
        title: "Survey Submitted",
        description: "Your survey has been successfully submitted.",
      });
      router.push("/surveyor");
    } else {
      toast({
        title: "Submission Failed",
        description: "Could not submit the survey. Please try again.",
        variant: "destructive",
      });
      router.push("/surveyor");
    }

    setLoading(false);
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="w-full flex flex-col justify-center items-center">
        {/* Left Side: Survey Form */}
        <div className="py-16 px-6 max-w-7xl w-full mx-auto ">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/surveyor">Dashboard</BreadcrumbLink>
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
                  <h2 className="text-xl text-red-600 font-semibold  dark:text-white mb-4">
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
      </div>
    </div>
  );
}
