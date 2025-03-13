"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { z } from "zod";
import { SurveyBillboard } from "@/types/survey";

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
  const [clientName, setClientName] = useState("");
  const [shopName, setShopName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [billboards, setBillboards] = useState<SurveyBillboard[]>([]);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [surveyorId, setSurveyorId] = useState<string>("");
  useEffect(() => {
    if (!surveyId) return;
    fetch(`/api/surveys/${surveyId}`)
      .then((res) => res.json())
      .then((data) => {
        setClientName(data.client_name);
        setShopName(data.shop_name);
        setPhoneNumber(data.phone_number);
        setShopAddress(data.shop_address);
        setDescription(data.description);
        setBillboards(data.survey_billboards || []);
        setSurveyorId(data.surveyor_id || null);
      });
    fetch("/api/billboards/billboard-names")
      .then((res) => res.json())
      .then(setBillboardNames);
    fetch("/api/billboards/billboard-types")
      .then((res) => res.json())
      .then(setBillboardTypes);
  }, [surveyId]);
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
  const updateBillboard = (
    index: number,
    field: keyof SurveyBillboard,
    value: string | number
  ) => {
    const updated = [...billboards];
    updated[index][field] = value.toString();
    setBillboards(updated);
  };

  const handleUpdate = async () => {
    const validation = surveySchema.safeParse({
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

    const payload = {
      billboards,
      surveyorId,
      shopAddress,
      shopName,
      clientName,
      phoneNumber,
      description,
    };
    await fetch(`/api/surveys/${surveyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    alert("Survey updated successfully!");
    router.push("/surveyor");
  };
  useEffect(() => {
    console.log(billboards);
  }, [billboards]);
  const removeBillboard = (index: number) => {
    setBillboards(billboards.filter((_, i) => i !== index));
  };
  return (
    <div className="p-6 max-w-3xl space-y-8 mx-auto bg-secondary/50 dark:bg-gray-800 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Update Survey
      </h1>
      <div className="w-full flex flex-col justify-center items-center gap-4">
        <div className="w-full flex justify-center items-center gap-4">
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
          className="p-4 border space-y-4 border-gray-300 dark:border-gray-600 rounded-lg"
        >
          <select
            value={b.billboard_name_id}
            onChange={(e) =>
              updateBillboard(index, "billboard_name_id", e.target.value)
            }
            className="dark:bg-gray-700  min-w-32 dark:text-white dark:border-gray-600 p-2 rounded-md border"
          >
            {billboardNames.map((name) => (
              <option key={name.id} value={name.id} defaultValue={name.name}>
                {name.name}
              </option>
            ))}
          </select>
          <Button
            onClick={() => removeBillboard(index)}
            className=" bg-red-500 text-white ml-4"
          >
            Remove Billboard
          </Button>
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
            onChange={(e) => updateBillboard(index, "quantity", e.target.value)}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <select
            value={b.billboard_type_id}
            onChange={(e) =>
              updateBillboard(index, "billboard_type_id", e.target.value)
            }
            className="dark:bg-gray-700 dark:text-white min-w-32 dark:border-gray-600 p-2 rounded-md border"
          >
            {billboardTypes.map((type) => (
              <option
                key={type.id}
                value={type.id}
                defaultValue={type.type_name}
              >
                {type.type_name}
              </option>
            ))}
          </select>
        </div>
      ))}
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
