import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const boardId = params.id;
  try {
    const { billboards } = await req.json();
    // Insert updated billboards
    const rest = billboards[0];
    const { error: updateError } = await supabase
      .from("survey_billboards")
      .update({
        billboard_name_id: rest.billboard_name_id,
        billboard_type_id: rest.billboard_type_id,
        width: rest.width,
        height: rest.height,
        board_images: rest.board_images,
        quantity: parseInt(rest.quantity),
        board_designs: rest.board_designs,
        installation_images: rest.installation_images,
      })
      .eq("id", boardId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Survey updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
