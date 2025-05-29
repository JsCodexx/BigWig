import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch satisfaction forms
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const client_id = searchParams.get("client_id");
  const surveyor_id = searchParams.get("surveyor_id");
  const fetchAll = searchParams.get("all");
  const date = searchParams.get("from");

  let query = supabase.from("customer_satisfaction_forms").select("*");

  if (fetchAll === "true") {
    if (date) query = query.gte("created_at", date);
    query = query.order("created_at", { ascending: false });
  } else if (client_id) {
    query = query
      .eq("client_id", client_id)
      .order("created_at", { ascending: false });
  } else if (surveyor_id) {
    query = query
      .eq("surveyor_id", surveyor_id)
      .order("created_at", { ascending: false });
  } else {
    return NextResponse.json(
      { error: "Provide 'all=true', 'client_id', or 'surveyor_id'" },
      { status: 400 }
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// DELETE: Delete satisfaction form by ID
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("customer_satisfaction_form")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Form deleted successfully" },
    { status: 204 }
  );
}
