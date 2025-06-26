import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { Button } from "../ui/button";
import type { ImageType } from "@/types/survey";
import ImageUploader from "../ImageUploader";
import { useParams } from "next/navigation";
import AddBillboardItemDialog from "@/components/landing/billboard-name-type";

// ✅ Define Zod validation schema
const boardSchema = z.object({
  billboard_name_id: z.string().min(1, "Board type is required"),
  billboard_type_id: z.string().min(1, "Board detail is required"),
  height: z
    .number()
    .min(1, "Height must be at least 1 ft")
    .max(100, "Height can't exceed 1000 ft"),
  width: z
    .number()
    .min(1, "Width must be at least 1 ft")
    .max(100, "Width can't exceed 1000 ft"),
  quantity: z.number().min(1, "At least 1 quantity is required"),
});

interface BoardDetailsProps {
  newBoard: any;
  billboardNames: { id: string; name: string }[];
  billboardTypes: {
    billboard_name_id: any;
    id: string;
    type_name: string;
  }[];
  updateNewBoard: (field: any, value: string | number | any[]) => void;
  userRole: string;
  openModal?: (type: "name" | "type") => void;
  resetPreview: boolean;
  setNewBoard: any;
}

const BoardDetailsForm: React.FC<BoardDetailsProps> = ({
  newBoard,
  billboardNames,
  billboardTypes,
  updateNewBoard,
  resetPreview,
  setNewBoard,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [boardImagePreviews, setBoardImagePreviews] = useState<string[]>([]);

  const handleValidation = (field: string, value: string | number) => {
    let parsedValue = value;
    if (["height", "width", "quantity"].includes(field)) {
      parsedValue = Number(value);
    }
    const result = boardSchema.safeParse({
      ...newBoard,
      [field]: parsedValue,
    });

    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors as Record<
        string,
        string[] | undefined
      >;

      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field]?.[0] || "",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    updateNewBoard(field, value);
  };
  useEffect(() => {
    if (newBoard?.board_images?.length > 0) {
      const previews = newBoard.board_images
        .filter((img: any) => img.preview)
        .map((img: any) => img.preview);

      setBoardImagePreviews(previews);
    }
  }, [newBoard.board_images]);

  const handleBoardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      // Convert new files into preview objects
      const newImageObjects: ImageType[] = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      updateNewBoard("board_images", [
        ...(newBoard.board_images || []),
        ...newImageObjects,
      ]);

      setBoardImagePreviews((prev) => [
        ...prev,
        ...newImageObjects.map((img) => img.preview),
      ]);
    }
  };
  const removeImage = (url: string) => {
    setNewBoard((prev: any) => ({
      ...prev,
      board_images: prev.board_images.filter((img: any) => img.preview !== url),
    }));
    setBoardImagePreviews((pre) => pre.filter((f) => f !== url));
  };

  useEffect(() => {
    if (resetPreview) {
      setBoardImagePreviews([]);
    }
  }, [resetPreview]);
  // inside your parent component or page
  const [dialogType, setDialogType] = useState<"name" | "type" | null>(null);

  const handleAddDialogSubmit = async (data: any) => {
    if (dialogType === "name") {
      await fetch("/api/billboard-names", {
        method: "POST",
        body: JSON.stringify({ name: data.name }),
        headers: { "Content-Type": "application/json" },
      });
    } else if (dialogType === "type") {
      await fetch("/api/billboard-types", {
        method: "POST",
        body: JSON.stringify({
          type_name: data.type_name,
          billboard_name_id: data.nameId,
        }),
        headers: { "Content-Type": "application/json" },
      });
    }

    // Optionally refresh your names/types from DB here
  };

  return (
    <div className="mt-4 p-4 space-y-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
      {/* Select Board Type & Board Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Board Type */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <Label htmlFor="board_type" className="font-semibold text-gray-700">
              Select Board Type <span className="text-red-600">*</span>
            </Label>
          </div>
          <select
            required
            name="board_type"
            value={newBoard.billboard_name_id}
            onChange={(e) =>
              handleValidation("billboard_name_id", e.target.value)
            }
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 p-2 rounded-md border"
          >
            <option value="">Select Board Type</option>
            {billboardNames.map((name) => (
              <option key={name.id} value={name.id}>
                {name.name}
              </option>
            ))}
          </select>
          {errors.billboard_name_id && (
            <p className="text-red-500 text-sm">{errors.billboard_name_id}</p>
          )}
        </div>

        {/* Board Detail */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="board_detail"
              className="font-semibold text-gray-700"
            >
              Select Board Detail <span className="text-red-600">*</span>
            </Label>
          </div>
          <select
            required
            name="board_detail"
            value={newBoard.billboard_type_id}
            onChange={(e) =>
              handleValidation("billboard_type_id", e.target.value)
            }
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600 p-2 rounded-md border"
          >
            <option value="">Select Details</option>
            {billboardTypes
              .filter(
                (type) => type.billboard_name_id === newBoard.billboard_name_id
              )
              .map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type_name}
                </option>
              ))}
          </select>
          {errors.billboard_type_id && (
            <p className="text-red-500 text-sm">{errors.billboard_type_id}</p>
          )}
        </div>

        {errors.billboard_type_id && (
          <p className="text-red-500 text-sm">{errors.billboard_type_id}</p>
        )}
      </div>

      {/* Height & Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["height", "width"].map((field) => (
          <div key={field} className="flex flex-col">
            <Label
              htmlFor={`board_${field}`}
              className="mb-2 font-semibold text-gray-700"
            >
              {field.charAt(0).toUpperCase() + field.slice(1)} in Feet{" "}
              <span className="text-red-600">*</span>
            </Label>
            <Input
              required
              name={`board_${field}`}
              type="number"
              placeholder={`${
                field.charAt(0).toUpperCase() + field.slice(1)
              } in ft`}
              value={newBoard[field]}
              onChange={(e) => handleValidation(field, e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors[field] && (
              <p className="text-red-500 text-sm">{errors[field]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quantity */}
      <div className="flex flex-col">
        <Label
          htmlFor="board_quantity"
          className="mb-2 font-semibold text-gray-700"
        >
          Quantity <span className="text-red-600">*</span>
        </Label>
        <Input
          required
          name="board_quantity"
          type="number"
          placeholder="Quantity"
          value={newBoard.quantity}
          onChange={(e) => handleValidation("quantity", e.target.value)}
          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
        {errors.quantity && (
          <p className="text-red-500 text-sm">{errors.quantity}</p>
        )}

        {/* Price Display */}
        <div className="mt-2 text-lg font-bold text-gray-600 dark:text-gray-200">
          Price:{" "}
          {newBoard.quantity && newBoard.height && newBoard.width
            ? newBoard.quantity * newBoard.height * newBoard.width
            : 0}
        </div>
      </div>

      <div>
        <Label className="mb-2 font-semibold text-gray-700">
          Upload Board Images
        </Label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleBoardImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
      file:rounded-lg file:border-0
      file:text-sm file:font-semibold
      file:bg-red-50 file:text-red-700
      hover:file:bg-red-100
      dark:file:bg-gray-700 dark:file:text-white dark:hover:file:bg-gray-600"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {boardImagePreviews.map((url, idx) => (
          <div className="relative w-20 h-20" key={idx}>
            <img
              src={url}
              alt={`preview-${idx}`}
              className="w-full object-cover rounded-md border"
            />
            <span
              onClick={() => removeImage(url)}
              className="h-5 w-5 absolute right-0 top-0 flex justify-center items-center bg-red-300 rounded-full"
            >
              X
            </span>
          </div>
        ))}

        {newBoard.length && !boardImagePreviews && (
          <div className="relative w-20 h-20">
            <img
              src={newBoard.board_images[0].preview}
              alt={`preview-`}
              className="w-full object-cover rounded-md border"
            />
            <span
              onClick={() => removeImage(newBoard.board_images[0].preview)}
              className="h-5 w-5 absolute right-0 top-0 flex justify-center items-center bg-red-300 rounded-full"
            >
              X
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardDetailsForm;
