import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageType {
  preview: string;
  file?: File;
}

interface BillboardCardProps {
  board: any;
  index: number;
  billboardNames: any[];
  billboardTypes: any[];
  formData: any;
  onDelete: (index: number) => void;
  userRole: string | undefined;
}

const BillboardCard: React.FC<BillboardCardProps> = ({
  board,
  index,
  billboardNames,
  billboardTypes,
  userRole,
  onDelete,
}) => {
  const billboardName =
    billboardNames.find((n) => n.id === board.billboard_name_id)?.name || "N/A";
  const billboardType =
    billboardTypes.find((t) => t.id === board.billboard_type_id)?.type_name ||
    "N/A";

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-4 py-3 rounded-2xl shadow-sm overflow-x-auto max-w-full">
      {/* Billboard Details */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-500">Name:</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {billboardName}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-500">Type:</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {billboardType}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-500">Size:</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {board.width}w × {board.height}h
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-500">Qty:</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            {board.quantity}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block" />

      {/* Board Images */}
      <div className="flex gap-2">
        {board.board_images?.slice(0, 3).map((img: ImageType, idx: number) => {
          const imageUrl = typeof img === "string" ? img : img.preview;
          return (
            <img
              key={idx}
              src={imageUrl}
              alt={`preview-${idx}`}
              className="w-10 h-10 rounded-md object-cover border"
            />
          );
        })}
        {board.board_images?.length > 3 && (
          <span className="text-xs text-gray-500 self-center">
            +{board.board_images.length - 3} more
          </span>
        )}
      </div>

      {/* Remove Button */}
      {userRole === "admin" && (
        <div className="ml-auto">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(index)}
            className="rounded-full px-3 py-1 text-xs"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export default BillboardCard;
