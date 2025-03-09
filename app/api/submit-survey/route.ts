import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  try {
    const {
      title,
      description,
      client_id,
      surveyorId,
      billboards,
      phoneNumber,
      clientName,
      shopAddress,
      shopName,
      survey_status,
      publicURL,
    } = await req.json();
    // Insert survey
    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .insert([
        {
          title,
          description,
          client_id,
          surveyor_id: surveyorId,
          shop_name: shopName,
          shop_address: shopAddress,
          client_name: clientName,
          phone_number: phoneNumber,
          survey_status,
          form_image: publicURL,
        },
      ])
      .select()
      .single();

    if (surveyError) {
      console.log(surveyError);
      return NextResponse.json({ error: surveyError.message }, { status: 500 });
    }

    const surveyId = surveyData.id;
    // Insert billboards
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
      return NextResponse.json(
        { error: billboardsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Survey submitted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
