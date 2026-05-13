import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role?.toLowerCase().trim();

  console.log("=== MIDDLEWARE ===")
  console.log("PATH:", nextUrl.pathname)
  console.log("LOGGED IN:", isLoggedIn)
  console.log("ROLE RAW:", req.auth?.user?.role)
  console.log("ROLE LOWER:", role)

  const pathname = nextUrl.pathname;

  const isLoginPage = pathname === "/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isStatusPage = pathname.startsWith("/status");

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin" : "/status", nextUrl)
    );
  }

  if (!isLoggedIn && (isAdminPage || isStatusPage)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminPage && role !== "admin") {
    return NextResponse.redirect(new URL("/status", nextUrl));
  }

  if (isStatusPage && role === "admin") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/admin",
    "/admin/:path*",
    "/status",
    "/status/:path*",
  ],
};