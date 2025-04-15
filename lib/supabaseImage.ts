// utils/supabaseImage.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function deleteImageFromURL(imageUrl: string) {
  try {
    // Extract the file path after "/object/public/files/"
    const urlParts = imageUrl.split("/object/public/files/");
    if (urlParts.length < 2) {
      throw new Error("Invalid image URL format");
    }

    const filePath = urlParts[1]; // Extracted path e.g., "images/1742920958099.webp"

    // Delete the image from Supabase Storage
    const { error } = await supabase.storage.from("files").remove([filePath]);
    console.log(error);
    if (error) {
      console.error("Error deleting image:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false, error: (error as Error).message };
  }
}
