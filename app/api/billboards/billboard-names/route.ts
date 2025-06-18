import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

// Handle POST request: Add a new billboard name
export async function POST(req: Request) {
  try {
    const { value } = await req.json();

    if (!value) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("billboard_names")
      .insert([{ name: value }]) // Correct format
      .select()
      .single();

    if (error) {
      console.error("Error inserting:", error.message);
    } else {
      console.log("Inserted data:", data);
    }

    if (error) {
      console.log(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
