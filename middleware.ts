import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const SECRET_KEY = process.env.JWT_SECRET as string;
  let sessionUser = null;

  // 🔹 Check Supabase Session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    sessionUser = { id: session.user.id, role: session.user.role };
  }

  // 🔹 Check JWT Token for Manual Users
  const authToken = req.cookies.get("auth_token")?.value;
  if (!sessionUser && authToken) {
    try {
      const decoded = jwt.verify(authToken, SECRET_KEY) as {
        id: string;
        role: string;
      };
      sessionUser = { id: decoded.id, role: decoded.role };
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  // 🔹 Redirect unauthenticated users
  if (
    !sessionUser &&
    (req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/admin") ||
      req.nextUrl.pathname.startsWith("/surveyor"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔹 Role-based Redirects
  if (sessionUser) {
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      sessionUser.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (
      req.nextUrl.pathname.startsWith("/surveyor") &&
      sessionUser.role !== "surveyor"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/surveyor/:path*",
    "/auth/:path*",
  ],
};
