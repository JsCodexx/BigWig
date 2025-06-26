import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Utility to normalize type name (e.g. "3D Electric" → "3d Electric")
function normalizeTypeName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("billboard_types")
      .select(
        `
        id,
        type_name,
        billboard_name_id,
        billboard_names!inner (
          id,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Safely extract the name from nested object
    const transformed = data.map((item) => ({
      id: item.id,
      type_name: item.type_name,
      billboard_name_id: item.billboard_name_id,
      billboard_name: (item as any).billboard_names?.name || "Unknown",
    }));

    return NextResponse.json(transformed, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch billboard types" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { type_name, billboard_name_id } = await req.json();

    if (!type_name || !billboard_name_id) {
      return NextResponse.json(
        { error: "type_name and billboard_name_id are required" },
        { status: 400 }
      );
    }

    const normalizedName = normalizeTypeName(type_name);

    // 1. Check for duplicate under same name_id
    const { data: existing } = await supabase
      .from("billboard_types")
      .select("id")
      .eq("type_name", normalizedName)
      .eq("billboard_name_id", billboard_name_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Type already exists for this name", duplicate: true },
        { status: 409 }
      );
    }

    // 2. Insert new type
    const { data, error } = await supabase
      .from("billboard_types")
      .insert([{ type_name: normalizedName, billboard_name_id }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
