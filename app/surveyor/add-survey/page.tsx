"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext"; // Assuming a user context exists
import { SurveyBillboard } from "@/types/survey";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import { useRouter } from "next/navigation";
import { BoardsTable } from "@/components/surveys/BoardsTable";
import GeneralSurveyDetails from "@/components/surveys/GeneralSurveyDetails";
import BoardDetailsForm from "@/components/surveys/BoardDetailsForm";
interface Shopboard {
  id: string;
  name: string;
}

interface BillboardType {
  id: string;
  type_name: string;
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
    clientId: "",
    quantity: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"name" | "type">();
  const [newValue, setNewValue] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [formData, setFormData] = useState({
    shopName: "",
    shopAddress: "",
    clientName: "",
    phoneNumber: "",
    clientId: "",
    description: "",
  });
  useEffect(() => {
    console.log(formData);
  }, [formData]);
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const router = useRouter();
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
  const addBillboard = () => {
    setBillboards([...billboards, newBoard]);
    // Reset form fields for the next board
    setNewBoard({
      billboard_name_id: "",
      width: "",
      height: "",
      billboard_type_id: "",
      clientId: "",
      quantity: "",
    });
  };

  const updateNewBoard = (
    field: keyof SurveyBillboard,
    value: string | number
  ) => {
    console.log(field, value);
    setNewBoard((prev) => ({ ...prev, [field]: value.toString() }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("User not logged in");
      setErrors({});
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
      window.alert("Please upload form image");
    } else {
      const fileExt = image.name.split(".").pop();
      const originalName = image.name.replace(`.${fileExt}`, "");
      const fileName = `${Date.now()}_${originalName}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { data, error } = await supabase.storage
        .from("files")
        .upload(filePath, image);
      if (error) {
        console.error("Upload error:", error);
        return;
      }

      const { data: publicURL } = supabase.storage
        .from("files")
        .getPublicUrl(filePath);

      const payload = {
        description: formData.description,
        client_id: formData.clientId, // Match API expectation
        surveyorId: user?.user_role === "admin" ? null : user?.id,
        billboards,
        phoneNumber: formData.phoneNumber,
        clientName: formData.clientName,
        shopAddress: formData.shopAddress,
        shopName: formData.shopName,
        survey_status: surveyStatus,
        publicURL: publicURL.publicUrl,
      };
      await fetch("/api/submit-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Survey Submitted!");
      // router.push("/surveyor");
    }
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
      console.log("clients", data);
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
  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 p-6">
      {/* Left Side: Survey Form */}
      <div className="w-full lg:w-[55%] bg-secondary/50 dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-8">
        <div className="flex justify-between gap-4 items-center">
          <h1 className="text-3xl font-bold text-red-500">Submit Survey</h1>
          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Submit Survey
          </Button>
        </div>
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

        {/* Billboard Details Form */}
        <BoardDetailsForm
          billboardNames={billboardNames}
          billboardTypes={billboardTypes}
          newBoard={newBoard}
          userRole={user?.user_role || ""}
          updateNewBoard={updateNewBoard}
          openModal={openModal}
        />
        <div className="w-full flex justify-between items-center">
          <Button
            onClick={addBillboard}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Add Shopboard
          </Button>
        </div>
      </div>

      {/* Right Side: Boards Table */}
      <div className="w-full lg:w-[45%] bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Added Billboards
        </h2>
        <BoardsTable billboards={billboards} onRemoveBoard={removeBillboard} />
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
