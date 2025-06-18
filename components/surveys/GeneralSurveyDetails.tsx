import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { User } from "@/types/user";
import { useUi } from "@/context/UiContext";
import { useParams, useSearchParams } from "next/navigation";

// Define types for props

interface Errors {
  shopName?: string;
  shopAddress?: string;
  clientName?: string;
  phoneNumber?: string;
  description?: string;
  clientId?: string; // Added missing error field
}

interface GeneralSurveyDetailsProps {
  formData: any;
  clients: User[];
  errors: Errors;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  previewImage: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GeneralSurveyDetails: React.FC<GeneralSurveyDetailsProps> = ({
  formData,
  handleChange,
  clients,
  errors,
  setFormData,
  previewImage,
  handleImageChange,
}) => {
  const { selectedClient, setSelectedClient } = useUi();
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const params = useParams();
  const id = params?.id; // this will be your UUID string
  useEffect(() => {
    if (selectedClient) {
      setFormData((prev: any) => ({ ...prev, clientId: selectedClient }));
    }
  }, [selectedClient]);

  useEffect(() => {
    if (id) {
      setReadOnlyMode(true);
    }
  }, [id, params]);
  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      {/* Shop Name & Shop Address */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <Label
            htmlFor="shopName"
            className="mb-2 font-semibold text-gray-700"
          >
            Shop Name for board <span className="text-red-600">*</span>
          </Label>
          <Input
            name="shopName"
            required
            placeholder="Shop Name for board"
            value={formData.shopName}
            onChange={handleChange}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={readOnlyMode}
          />
          {errors.shopName && (
            <p className="text-red-500 text-sm">{errors.shopName}</p>
          )}
        </div>

        <div className="flex flex-col">
          <Label
            htmlFor="shopAddress"
            className="mb-2 font-semibold text-gray-700"
          >
            Shop Address for board <span className="text-red-600">*</span>
          </Label>
          <Input
            required
            name="shopAddress"
            placeholder="Shop Address for board"
            value={formData.shopAddress}
            onChange={handleChange}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={readOnlyMode}
          />
          {errors.shopAddress && (
            <p className="text-red-500 text-sm">{errors.shopAddress}</p>
          )}
        </div>
      </div>

      {/* Shopkeeper Name & Phone Number */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <Label
            htmlFor="clientName"
            className="mb-2 font-semibold text-gray-700"
          >
            Shopkeeper Name <span className="text-red-600">*</span>
          </Label>
          <Input
            required
            name="clientName"
            placeholder="Shopkeeper Name"
            value={formData.clientName}
            onChange={handleChange}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={readOnlyMode}
          />
          {errors.clientName && (
            <p className="text-red-500 text-sm">{errors.clientName}</p>
          )}
        </div>

        <div className="flex flex-col">
          <Label
            htmlFor="phoneNumber"
            className="mb-2 font-semibold text-gray-700"
          >
            Cell phone number for board <span className="text-red-600">*</span>
          </Label>
          <Input
            required
            name="phoneNumber"
            placeholder="Cell #"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            disabled={readOnlyMode}
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
          )}
        </div>
      </div>

      {/* Client Selection */}
      <div className="w-full flex flex-col">
        <Label
          htmlFor="clientId"
          className="mb-2 font-semibold text-gray-700 dark:text-gray-200"
        >
          Client Name for the board <span className="text-red-600">*</span>
        </Label>

        <Select
          required
          value={formData.clientId}
          onValueChange={(value) =>
            setFormData((prev: any) => ({ ...prev, clientId: value }))
          }
          name="clientId"
          disabled={readOnlyMode}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Client Name" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem disabled value="">
              Select Client Name
            </SelectItem>

            {selectedClient
              ? clients
                  .filter((client) => client.id === selectedClient)
                  .map((client) => (
                    <SelectItem key={client.id} value={client.id as string}>
                      {client.full_name}
                    </SelectItem>
                  ))
              : clients
                  .filter((client) => typeof client.id === "string")
                  .map((client) => (
                    <SelectItem key={client.id} value={client.id as string}>
                      {client.full_name}
                    </SelectItem>
                  ))}
          </SelectContent>
        </Select>

        {errors.clientId && (
          <p className="text-red-500 text-sm">{errors.clientId}</p>
        )}
      </div>

      {/* Surveyor Remarks */}
      <div className="flex flex-col w-full">
        <Label
          htmlFor="description"
          className="mb-2 font-semibold text-gray-700"
        >
          Surveyor Remarks <span className="text-red-600">*</span>
        </Label>
        <Textarea
          name="description"
          placeholder="Surveyor Remarks"
          value={formData.description}
          onChange={handleChange}
          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          disabled={readOnlyMode}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}
      </div>
      {/* Image Upload & Preview */}
      <div className="flex lg:w-4/5 w-full flex-col md:flex-row items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="w-72 h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg overflow-hidden border-2 border-dashed border-gray-400">
          {previewImage || formData.form_image ? (
            <Image
              src={previewImage || formData.form_image}
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
        {!readOnlyMode && (
          <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-md transition-all">
            {!previewImage ? "Upload Image" : "Change image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              // disabled={formData.surveryStatus &&formData.surveryStatus }
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default GeneralSurveyDetails;
