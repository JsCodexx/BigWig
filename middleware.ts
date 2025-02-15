import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 🔹 Check Supabase Session (Only for Admins)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Fetch admin profile from Supabase
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("user_role")
      .eq("user_id", session.user.id)
      .single();

    // If session exists but user is not an admin, redirect them
    if (!profile || profile.user_role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // ✅ Clients & Surveyors are NOT checked in middleware
  return res;
}

export const config = {
  matcher: ["/admin/:path*"], // Only apply middleware for admin routes
};
