"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase/Clientsupabase";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
const surveySchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  shopName: z.string().min(1, "Shop name is required"),
  shopAddress: z.string().min(1, "Shop address is required"),
  description: z.string().min(1, "Survey Description is required"),
  clientId: z.string().nonempty("Select the client"),
  phoneNumber: z
    .string()
    .regex(/^\d{10,15}$/, "Phone number must be between 10-15 digits"),
});
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
  const [clientName, setClientName] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [shopName, setShopName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [shopAddress, setShopAddress] = useState<string>("");
  const [billboards, setBillboards] = useState<SurveyBillboard[]>([]);
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"name" | "type">();
  const [newValue, setNewValue] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const router = useRouter();
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
      clientName,
      shopName,
      shopAddress,
      phoneNumber,
      description,
      clientId,
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
    if (user.user_role === "client") {
      surveyStatus = "client_approved";
    } else if (user.user_role === "surveyor") {
      surveyStatus = "pending_admin_review";
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
        billboards,
        surveyorId: user.user_role === "admin" ? null : user.id,
        client_id: clientId,
        shopAddress,
        shopName,
        clientName,
        phoneNumber,
        description,
        survey_status: surveyStatus,
        publicURL: publicURL.publicUrl,
      };

      await fetch("/api/submit-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Survey Submitted!");
      router.push("/surveyor");
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
        .select("id, name")
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
  useEffect(() => {
    console.log(clientId);
  }, [clientId]);
  return (
    <div className="py-16 px-6 max-w-3xl space-y-8 mx-auto bg-secondary/50 dark:bg-gray-800 rounded-xl shadow-md">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-4xl font-bold text-red-500">Submit Survey</h1>

        <Button
          onClick={addBillboard}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Add Shopboard
        </Button>
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
              <option value="" className="text-gray-500">
                Select Shop Name
              </option>
              {billboardNames.map((name) => (
                <option key={name.id} value={name.id}>
                  {name.name}
                </option>
              ))}
            </select>

            {user.user_role === "admin" && (
              <Button
                onClick={() => openModal("name")}
                className="bg-red-500 text-white"
              >
                +Add Name
              </Button>
            )}
            <Button
              onClick={() => removeBillboard(index)}
              className=" bg-red-500 text-white"
            >
              Remove Shopboard
            </Button>
          </div>
          <Input
            type="number"
            placeholder="Width in cm"
            value={b.width}
            onChange={(e) => updateBillboard(index, "width", e.target.value)}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Input
            type="number"
            placeholder="Height in cm"
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
            {user.user_role === "admin" && (
              <Button
                onClick={() => openModal("type")}
                className="bg-red-500 text-white"
              >
                +Add Type
              </Button>
            )}
          </div>
        </div>
      ))}
      <div className="flex flex-col items-center space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg">
        {/* Image Preview Box */}
        <div className="w-72 h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg overflow-hidden border-2 border-dashed border-gray-400">
          {previewImage ? (
            <Image
              src={previewImage}
              alt="Uploaded preview"
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
          ) : (
            <span className="text-gray-500 dark:text-gray-300">
              No image selected
            </span>
          )}
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-md transition-all">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
      </div>
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <div className="w-full flex justify-center items-center gap-4">
          <div className="flex flex-col w-full">
            <Input
              placeholder="Shopkeeper Name"
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
              placeholder="Shop Address for board"
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
              placeholder="Cell #"
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
              placeholder="Shop Name for board"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.shopName && (
              <p className="text-red-500 text-sm">{errors.shopName}</p>
            )}
          </div>

          <div className="flex flex-col w-full">
            <Select onValueChange={(clientId) => setClientId(clientId)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Assign Client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <Textarea
          placeholder="Surveyor Remarks"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>
      <div className="w-full flex justify-start gap-4 items-center">
        <Button
          onClick={handleSubmit}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Submit Survey
        </Button>
      </div>
      {/* ADD NAME ADD TYPE */}
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
