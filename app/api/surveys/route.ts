import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const surveyor_id = searchParams.get("surveyor_id");
  const fetchAll = searchParams.get("all");
  const date = searchParams.get("from"); // Optional date string

  // 👉 Fetch all surveys with optional date filter
  if (fetchAll === "true") {
    let query = supabase.from("surveys").select("*");

    if (date) {
      query = query.gte("created_at", date);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  }

  // 👉 Fetch surveys for a specific surveyor
  if (surveyor_id) {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .eq("surveyor_id", surveyor_id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  }

  // 👉 Missing required parameters
  return NextResponse.json(
    { error: "Either 'all=true' or 'surveyor_id' must be provided" },
    { status: 400 }
  );
}

// DELETE: Remove a survey by ID
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Survey ID is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("surveys").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Survey deleted successfully" },
    { status: 204 }
  );
}
