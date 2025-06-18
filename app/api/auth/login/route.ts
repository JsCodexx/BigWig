import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SECRET_KEY = process.env.JWT_SECRET!; // Store in .env.local

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json(); // Identifier = email, username, or phone

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if the identifier is an email (contains @)
    const isEmail = identifier.includes("@");

    if (isEmail) {
      // 🔹 Use Supabase auth for email users
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      if (error) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        message: "Login successful",
        user: data.user,
      });
    } else {
      // 🔹 Manually authenticate for username/phone users
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", identifier)
        .maybeSingle();
      if (error || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // 🔑 Verify Password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }

      // 🏷️ Generate JWT Token for session
      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        SECRET_KEY,
        { expiresIn: "7d" }
      );

      // 🍪 Store token in HTTP-Only cookie
      const response = NextResponse.json({
        message: "Login successful",
        user: user,
      });
      response.cookies.set("token", token, {
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      }); // Remove httpOnly for client-side access
      return response;
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
