import React, { useEffect, useState } from "react";

type FileOrUrl = File | string;

interface ImageUploaderProps {
  multiple?: boolean;
  files: FileOrUrl[];
  onFilesChange: (files: File[]) => void; // only return File[] on change
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  multiple = false,
  files,
  onFilesChange,
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const newPreviews = files.map((file) =>
      typeof file === "string" ? file : URL.createObjectURL(file)
    );
    setPreviews(newPreviews);

    return () => {
      files.forEach((file) => {
        if (file instanceof File)
          URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const updatedFiles = multiple
      ? [...(files.filter((f) => f instanceof File) as File[]), ...newFiles]
      : newFiles;

    onFilesChange(updatedFiles);
  };

  const handleRemove = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    const remainingFiles = updatedFiles.filter(
      (f) => f instanceof File
    ) as File[];
    onFilesChange(remainingFiles);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-0
                   file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100 cursor-pointer"
      />
      <div className="flex gap-4 flex-wrap mt-2">
        {previews.map((src, idx) => (
          <div key={idx} className="relative">
            <img
              src={src}
              alt={`preview-${idx}`}
              className="w-24 h-24 object-cover rounded border"
              onClick={() => setSelectedImage(src)}
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-bl"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="relative bg-white p-4 rounded shadow-lg max-w-[90%] max-h-[90%]">
            <img
              src={selectedImage}
              alt="Large preview"
              className="max-w-full max-h-[80vh] rounded"
            />
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

export default ImageUploader;
