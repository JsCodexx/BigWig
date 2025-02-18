"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext"; // Assuming a user context exists
import { SurveyBillboard } from "@/types/survey";
const surveySchema = z.object({
  surveyTitle: z.string().min(1, "Survey title is required"),
  clientName: z.string().min(1, "Client name is required"),
  shopName: z.string().min(1, "Shop name is required"),
  shopAddress: z.string().min(1, "Shop address is required"),
  description: z.string().min(1, "Survey Description is required"),
  phoneNumber: z
    .string()
    .regex(/^\d{10,15}$/, "Phone number must be between 10-15 digits"),
});
interface Billboard {
  id: string;
  name: string;
}

interface BillboardType {
  id: string;
  type_name: string;
}

export default function SubmitSurvey() {
  const { user } = useUser(); // Get the logged-in user's info
  const [billboardNames, setBillboardNames] = useState<Billboard[]>([]);
  const [billboardTypes, setBillboardTypes] = useState<BillboardType[]>([]);
  const [surveyTitle, setSurveyTitle] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [shopName, setShopName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [shopAddress, setShopAddress] = useState<string>("");
  const [billboards, setBillboards] = useState<SurveyBillboard[]>([]);
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"name" | "type">();
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    fetch("/api/billboards/billboard-names")
      .then((res) => res.json())
      .then(setBillboardNames);
    fetch("/api/billboards/billboard-types")
      .then((res) => res.json())
      .then(setBillboardTypes);
  }, []);

  const addBillboard = () => {
    setBillboards([
      ...billboards,
      {
        billboard_name_id: "",
        width: "",
        height: "",
        billboard_type_id: "",
        clientId: "",
        quantity: "",
      },
    ]);
  };
  const removeBillboard = (index: number) => {
    setBillboards(billboards.filter((_, i) => i !== index));
  };

  const updateBillboard = (
    index: number,
    field: keyof SurveyBillboard,
    value: string | number
  ) => {
    const updated = [...billboards];
    updated[index][field] = value.toString();
    setBillboards(updated);
  };

  const handleSubmit = async () => {
    const validation = surveySchema.safeParse({
      surveyTitle,
      clientName,
      shopName,
      shopAddress,
      phoneNumber,
      description,
    });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (!user) {
      alert("User not logged in");
      setErrors({});
      return;
    }
    let surveyStatus = "";
    console.log(user);
    if (user.user_role === "client") {
      surveyStatus = "client_approved";
    } else if (user.user_role === "surveyor") {
      surveyStatus = "pending_admin_review";
    } else {
      surveyStatus = "in_progress";
    }
    const payload = {
      title: surveyTitle,
      billboards,
      surveyorId: user.id,
      clientId: null,
      shopAddress,
      shopName,
      clientName,
      phoneNumber,
      description,
      survey_status: surveyStatus,
    };
    await fetch("/api/submit-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    alert("Survey submitted!");
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
    console.log(billboards);
  }, [billboards]);

  return (
    <div className="p-6 max-w-3xl space-y-8 mx-auto bg-secondary/50 dark:bg-gray-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Submit Survey
      </h1>
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <div className="w-full flex justify-center items-center gap-4">
          <div className="flex flex-col w-full">
            <Input
              placeholder="Survey Title"
              value={surveyTitle}
              onChange={(e) => setSurveyTitle(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.surveyTitle && (
              <p className="text-red-500 text-sm">{errors.surveyTitle}</p>
            )}
          </div>
          <div className="flex flex-col w-full">
            <Input
              placeholder="Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.clientName && (
              <p className="text-red-500 text-sm">{errors.clientName}</p>
            )}
          </div>
        </div>

        <div className="w-full flex justify-center items-center gap-4">
          <div className="flex flex-col w-full">
            <Input
              placeholder="Shop Address"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.shopAddress && (
              <p className="text-red-500 text-sm">{errors.shopAddress}</p>
            )}
          </div>
          <div className="flex flex-col w-full">
            <Input
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
            )}
          </div>
        </div>
        <div className="w-full flex justify-center items-center gap-4">
          <div className="flex flex-col w-full">
            <Input
              placeholder="Shop Name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.shopName && (
              <p className="text-red-500 text-sm">{errors.shopName}</p>
            )}
          </div>
          <div className="flex flex-col w-full">
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      {billboards.map((b, index) => (
        <div
          key={index}
          className="mt-4 p-4 space-y-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
        >
          <div className="flex gap-2">
            <select
              value={b.billboard_name_id}
              onChange={(e) =>
                updateBillboard(index, "billboard_name_id", e.target.value)
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600 p-2 rounded-md border"
            >
              <option value="">Select Billboard Name</option>
              {billboardNames.map((name) => (
                <option key={name.id} value={name.id}>
                  {name.name}
                </option>
              ))}
            </select>
            <Button
              onClick={() => openModal("name")}
              className="bg-red-500 text-white"
            >
              +Add Name
            </Button>
            <Button
              onClick={() => removeBillboard(index)}
              className=" bg-red-500 text-white"
            >
              Remove Billboard
            </Button>
          </div>
          <Input
            type="number"
            placeholder="Width"
            value={b.width}
            onChange={(e) => updateBillboard(index, "width", e.target.value)}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Input
            type="number"
            placeholder="Height"
            value={b.height}
            onChange={(e) => updateBillboard(index, "height", e.target.value)}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={b.quantity}
            defaultValue={1}
            min={1}
            max={100}
            onChange={(e) => updateBillboard(index, "quantity", e.target.value)}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <div className="flex gap-2">
            <select
              value={b.billboard_type_id}
              onChange={(e) =>
                updateBillboard(index, "billboard_type_id", e.target.value)
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600 p-2 rounded-md border"
            >
              <option value="">Select Type</option>
              {billboardTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type_name}
                </option>
              ))}
            </select>
            <Button
              onClick={() => openModal("type")}
              className="bg-red-500 text-white"
            >
              +Add Type
            </Button>
          </div>
        </div>
      ))}
      <div className="w-full flex justify-start gap-4 items-center">
        <Button onClick={addBillboard} className="mt-4 bg-red-500 text-white">
          Add Billboard
        </Button>

        <Button onClick={handleSubmit} className="mt-4 bg-red-500 text-white">
          Submit Survey
        </Button>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalType === "name"
                ? "Add Billboard Name"
                : "Add Billboard Type"}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder={`Enter ${
              modalType === "name" ? "Billboard Name" : "Type"
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
