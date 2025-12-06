import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { getServiceClient } from "@/lib/supabase";
import { buildUnauthorizedResponse, isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!isAdminRequest()) {
    return buildUnauthorizedResponse();
  }

  const supabase = getServiceClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  let query = supabase
    .from("raffle_entries")
    .select("*")
    .order("raffle_number", { ascending: false });

  if (q) {
    query = query.or(
      `kid_name.ilike.%${q}%,parent_name.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[export]", error);
    return NextResponse.json(
      { error: "Unable to export entries" },
      { status: 500 },
    );
  }

  const rows =
    data?.map((entry) => ({
      "Raffle #": entry.raffle_number.toString().padStart(3, "0"),
      "Kid Name": entry.kid_name,
      Grade: entry.grade,
      "Parent Name": entry.parent_name,
      "Parent Phone": entry.parent_phone,
      "Submission Batch ID": entry.submission_batch_id ?? "",
      "Submitted Date": format(
        new Date(entry.created_at),
        "MM/dd/yyyy",
      ),
      "Submitted Time": format(
        new Date(entry.created_at),
        "hh:mm a",
      ),
      "SMS Status": entry.sms_sent ? "Sent" : "Failed",
    })) ?? [];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "raffle_entries");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  const filename = `raffle_entries_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

