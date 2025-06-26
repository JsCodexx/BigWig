import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// Utility: Capitalize words (e.g., "facia board" → "Facia Board")
function normalizeName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // remove extra spaces
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Handle GET request: Fetch all billboard names
export async function GET() {
  const { data, error } = await supabase
    .from("billboard_names")
    .select("id, name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const normalizedName = normalizeName(name);

    // 1. Check for duplicate
    const { data: existing } = await supabase
      .from("billboard_names")
      .select("id")
      .eq("name", normalizedName)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Name already exists", duplicate: true },
        { status: 409 }
      );
    }

    // 2. Insert if not duplicate
    const { data, error } = await supabase
      .from("billboard_names")
      .insert([{ name: normalizedName }])
      .select()
      .single();

    if (error) {
      console.error("Error inserting:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
