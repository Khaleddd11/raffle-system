import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "raffle_admin_token";
const SESSION_TTL_SECONDS = 60 * 60 * 6; // 6 hours

function adminPasswordHash(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return createHash("sha256").update(password).digest("hex");
}

export function setAdminSession(response: NextResponse) {
  const token = adminPasswordHash();
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export function isAdminRequest(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return token === adminPasswordHash();
}

export function buildUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function makeRequestId(): string {
  return randomBytes(12).toString("hex");
}

