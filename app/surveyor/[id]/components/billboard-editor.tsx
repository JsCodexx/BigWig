import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BoardDesignManager from "../../components/BoardDesignManager";
import { SurveyBillboard } from "@/types/survey";

interface ImageType {
  file?: File;
  preview: string;
}

interface BillboardEditorProps {
  board: any;
  index: number;
  readOnly: boolean;
  formData: any;
  user: any;
  loading: boolean;
  billboardNames: Array<{ id: string; name: string }>;
  billboardTypes: Array<{ id: string; type_name: string }>;
  handleBoardChange: (
    index: number,
    field: keyof SurveyBillboard,
    value: string | number | File | (string | File)[]
  ) => void;
  handleBoardImageChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  removeBillboard: (index: number) => void;
  handleUpload: (
    index: number,
    files: File[],
    mode: "design" | "installation"
  ) => void;

  handleDesignUpdate: (
    board: SurveyBillboard,
    mode: "design" | "installation"
  ) => Promise<void>;
}

const BillboardEditor: React.FC<BillboardEditorProps> = ({
  board,
  index,
  readOnly,
  formData,
  user,
  loading,
  billboardNames,
  billboardTypes,
  handleBoardChange,
  handleBoardImageChange,
  removeBillboard,
  handleUpload,
  handleDesignUpdate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      {/* Billboard Name */}
      <div>
        <Label className="mb-2 font-semibold text-gray-700">
          Billboard Name
        </Label>
        <select
          disabled={readOnly}
          value={board.billboard_name_id}
          onChange={(e) =>
            handleBoardChange(index, "billboard_name_id", e.target.value)
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
          disabled={readOnly}
          value={board.billboard_type_id}
          onChange={(e) =>
            handleBoardChange(index, "billboard_type_id", e.target.value)
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
        <Label className="mb-2 font-semibold text-gray-700">Width</Label>
        <Input
          disabled={readOnly}
          type="number"
          value={board.width}
          onChange={(e) => handleBoardChange(index, "width", e.target.value)}
        />
      </div>

      {/* Height */}
      <div>
        <Label className="mb-2 font-semibold text-gray-700">Height</Label>
        <Input
          disabled={readOnly}
          type="number"
          value={board.height}
          onChange={(e) => handleBoardChange(index, "height", e.target.value)}
        />
      </div>

      {/* Quantity */}
      <div className="w-full">
        <Label className="mb-2 font-semibold text-gray-700">Quantity</Label>
        <Input
          disabled={readOnly}
          type="number"
          value={board.quantity}
          onChange={(e) => handleBoardChange(index, "quantity", e.target.value)}
        />
      </div>

      {/* Board Images */}
      <div>
        {!formData.surveyStatus ? (
          <>
            <Label className="mb-2 font-semibold text-gray-700">
              Upload Board Images
            </Label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleBoardImageChange(e, index)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:text-sm file:font-semibold
              file:bg-red-50 file:text-red-700 hover:file:bg-red-100
              dark:file:bg-gray-700 dark:file:text-white dark:hover:file:bg-gray-600"
            />
          </>
        ) : (
          <Label className="mb-2 font-semibold text-gray-700">
            Board Images
          </Label>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {board.board_images.map((img: ImageType, idx: number) => {
            const imageUrl = typeof img === "string" ? img : img.preview;
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
        {formData.surveyStatus && user.user_role === "admin" && (
          <div className="flex items-end justify-end mt-2">
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

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Design & Installation Managers */}
      {(formData.surveyStatus === "client_approved" ||
        formData.surveyStatus === "installation_completed" ||
        formData.surveyStatus === "completed") && (
        <BoardDesignManager
          board={board}
          index={index}
          surveyStatus={formData.surveyStatus}
          mode="design"
          handleUpload={handleUpload}
          handleUpdates={handleDesignUpdate}
        />
      )}
      {(formData.surveyStatus === "installation_completed" ||
        formData.surveyStatus === "completed") && (
        <BoardDesignManager
          board={board}
          index={index}
          surveyStatus={formData.surveyStatus}
          mode="installation"
          handleUpload={handleUpload}
          handleUpdates={handleDesignUpdate}
        />
      )}
    </div>
  );
};

export default BillboardEditor;
