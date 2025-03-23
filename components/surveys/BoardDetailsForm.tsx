import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { z } from "zod";
import { Button } from "../ui/button";

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
  billboardTypes: { id: string; type_name: string }[];
  updateNewBoard: (field: any, value: string | number) => void;
  userRole: string;
  openModal: (type: "name" | "type") => void;
}

const BoardDetailsForm: React.FC<BoardDetailsProps> = ({
  newBoard,
  billboardNames,
  billboardTypes,
  updateNewBoard,
  userRole,
  openModal,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
            {userRole === "admin" && (
              <Button
                onClick={() => openModal("name")}
                className=" text-gray-600 hover:bg-white underline bg-white  text-sm "
              >
                + Add Type
              </Button>
            )}
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
            {userRole === "admin" && (
              <Button
                onClick={() => openModal("type")}
                className=" text-gray-600 hover:bg-white underline bg-white  text-sm "
              >
                + Add Detail
              </Button>
            )}
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
            {billboardTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.type_name}
              </option>
            ))}
          </select>
          {errors.billboard_type_id && (
            <p className="text-red-500 text-sm">{errors.billboard_type_id}</p>
          )}
        </div>
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
      </div>
    </div>
  );
};

export default BoardDetailsForm;
