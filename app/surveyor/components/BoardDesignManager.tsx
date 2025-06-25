"use client";

import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SurveyBillboard } from "@/types/survey";
import Image from "next/image";
import { useState } from "react";

interface Props {
  board: SurveyBillboard;
  index: number;
  surveyStatus: string | null;
  mode: "design" | "installation"; // 👈 NEW
  handleUpload: (
    index: number,
    newFiles: File[],
    mode: "design" | "installation"
  ) => void;
  handleUpdates: (
    board: SurveyBillboard,
    mode: "design" | "installation"
  ) => Promise<void>;
}

const BoardDesignManager: React.FC<Props> = ({
  board,
  index,
  mode,
  handleUpload,
  handleUpdates,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const images =
    mode === "design" ? board.board_designs : board.installation_images;

  const hasValidUrls =
    images && images.length > 0 && images.every((d) => typeof d === "string");

  // if (surveyStatus !== "client_approved") return null;

  return (
    <div className="mt-4">
      {/* Design Section */}
      {hasValidUrls ? (
        <>
          <Label className="mb-2 font-semibold text-gray-700 block">
            {mode === "design"
              ? "Uploaded Designs"
              : "Uploaded Installation Images"}
          </Label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => {
              const src =
                typeof img === "string" ? img : URL.createObjectURL(img);

              return (
                <div
                  key={i}
                  className="relative w-20 h-20 cursor-pointer"
                  onClick={() => setSelectedImage(src)}
                >
                  <Image
                    src={src}
                    alt={`${mode}-${i}`}
                    fill
                    className="object-cover rounded-md border"
                    sizes="80px"
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <Label className="mb-2 font-semibold text-gray-700">
            Upload {mode === "design" ? "Designs" : "Installation Images"}
          </Label>
          <ImageUploader
            multiple
            files={images || []}
            onFilesChange={(newFiles) => handleUpload(index, newFiles, mode)}
          />
          <Button
            onClick={() => handleUpdates(board, mode)}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Update {mode === "design" ? "Design" : "Installation Images"}
          </Button>
        </>
      )}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="relative bg-white p-4 rounded shadow-lg max-w-[90%] max-h-[90%] w-full">
            <div className="relative w-full aspect-video max-h-[80vh]">
              <Image
                src={selectedImage!}
                alt="Large preview"
                fill
                className="object-contain rounded"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>

            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-sm rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDesignManager;
