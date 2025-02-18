import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const surveyId = params.id;

  try {
    // Fetch survey details
    const { data: survey, error } = await supabase
      .from("surveys")
      .select(
        "id, title, description, client_name, phone_number, shop_name, shop_address, survey_status, created_at, surveyor_id, client_id, survey_billboards (billboard_name_id, billboard_type_id, width, height, quantity)"
      )
      .eq("id", surveyId)
      .single();

    if (error) {
      console.log(error);
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    return NextResponse.json(survey, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const surveyId = params.id;

  try {
    const {
      title,
      description,
      clientId,
      surveyorId,
      billboards,
      phoneNumber,
      clientName,
      shopAddress,
      shopName,
    } = await req.json();

    // Update survey details
    const { error: surveyError } = await supabase
      .from("surveys")
      .update({
        title,
        description,
        client_id: clientId,
        surveyor_id: surveyorId,
        shop_name: shopName,
        shop_address: shopAddress,
        client_name: clientName,
        phone_number: phoneNumber,
      })
      .eq("id", surveyId);

    if (surveyError) {
      return NextResponse.json({ error: surveyError.message }, { status: 500 });
    }

    // Delete existing billboards to avoid duplicate entries
    const { error: deleteError } = await supabase
      .from("survey_billboards")
      .delete()
      .eq("survey_id", surveyId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert updated billboards
    const formattedBillboards = billboards.map((b: any) => ({
      survey_id: surveyId,
      billboard_name_id: b.billboard_name_id,
      billboard_type_id: b.billboard_type_id,
      width: b.width,
      height: b.height,
      quantity: parseInt(b.quantity),
    }));

    const { error: billboardsError } = await supabase
      .from("survey_billboards")
      .insert(formattedBillboards);

    if (billboardsError) {
      console.log(billboardsError);
      return NextResponse.json(
        { error: billboardsError.message },
        { status: 500 }
      );
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
