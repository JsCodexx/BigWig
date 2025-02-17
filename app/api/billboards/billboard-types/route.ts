import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch all billboard types
export async function GET() {
  const { data, error } = await supabase
    .from("billboard_types")
    .select("id, type_name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// POST: Add a new billboard type
export async function POST(req: Request) {
  try {
    const { value } = await req.json();

    if (!value) {
      return NextResponse.json(
        { error: "Type name is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("billboard_types")
      .insert([{ type_name: value }])
      .select();

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
