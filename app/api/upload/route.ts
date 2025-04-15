import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert image to WebP
    const webpImage = await sharp(buffer).toFormat("webp").toBuffer();

    // Generate unique file name
    const fileName = `images/${Date.now()}.webp`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("files")
      .upload(fileName, webpImage, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get the public URL
    const { data } = supabase.storage.from("files").getPublicUrl(fileName);

    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
