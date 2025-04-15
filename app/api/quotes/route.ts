import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch quotes assigned to a specific surveyor
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const surveyor_id = searchParams.get("surveyor_id");

  if (!surveyor_id) {
    return NextResponse.json(
      { error: "Surveyor ID is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("surveyor_id", surveyor_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// DELETE: Remove a survey by ID
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "quote ID is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("quotes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "quote deleted successfully" },
    { status: 204 }
  );
}
