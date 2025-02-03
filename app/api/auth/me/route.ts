import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SECRET_KEY = process.env.JWT_SECRET!;
interface DecodedToken extends JwtPayload {
  id: string; // The id is expected to be a string
}
export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1]; // Extract token from 'Bearer <token>'

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;

    // Fetch user from Supabase (optional)
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
