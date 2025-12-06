import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminRequest, buildUnauthorizedResponse } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!isAdminRequest()) {
    return buildUnauthorizedResponse();
  }

  const supabase = getServiceClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  let query = supabase
    .from("raffle_entries")
    .select("*", { count: "exact" })
    .order("raffle_number", { ascending: false });

  if (q) {
    query = query.or(
      `kid_name.ilike.%${q}%,parent_name.ilike.%${q}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[entries]", error);
    return NextResponse.json(
      { error: "Unable to load entries" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    entries: data ?? [],
    total: count ?? 0,
  });
}

