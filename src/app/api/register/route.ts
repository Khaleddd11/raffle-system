import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { registrationSchema } from "@/lib/validation";
import { sendSms } from "@/lib/sms";
import { makeRequestId } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const requestId = makeRequestId();

  try {
    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ errors: fieldErrors }, { status: 400 });
    }

    const values = parsed.data;
    const supabase = getServiceClient();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count: submissionsToday, error: rateError } = await supabase
      .from("raffle_entries")
      .select("id", { count: "exact", head: true })
      .eq("parent_phone", values.parentPhone)
      .gte("created_at", startOfDay.toISOString());

    if (rateError) {
      console.error("[rate-limit]", requestId, rateError);
      return NextResponse.json(
        { error: "Unable to check submission limit. Please try again." },
        { status: 500 },
      );
    }

    if ((submissionsToday ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Limit reached: 5 submissions per phone per day" },
        { status: 429 },
      );
    }

    const { data: entry, error: insertError } = await supabase
      .from("raffle_entries")
      .insert({
        kid_name: values.kidName,
        date_of_birth: values.dateOfBirth,
        grade: values.grade,
        parent_name: values.parentName,
        parent_phone: values.parentPhone,
      })
      .select()
      .single();

    if (insertError || !entry) {
      console.error("[insert]", requestId, insertError);
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 500 },
      );
    }

    let smsSent = false;
    let smsError: string | undefined;

    try {
      const smsResult = await sendSms({
        phone: values.parentPhone,
        kidName: values.kidName,
        raffleNumber: entry.raffle_number,
      });

      smsSent = smsResult.success;
      smsError = smsResult.error;

      if (smsResult.success) {
        await supabase
          .from("raffle_entries")
          .update({ sms_sent: true, sms_sent_at: new Date().toISOString() })
          .eq("id", entry.id);
      }
    } catch (err) {
      console.error("[sms]", requestId, err);
      smsError = "SMS failed to send.";
    }

    return NextResponse.json({
      raffleNumber: entry.raffle_number,
      smsSent,
      smsError,
      parentPhone: values.parentPhone,
      kidName: values.kidName,
      issuedAt: entry.created_at,
    });
  } catch (error) {
    console.error("[register]", requestId, error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 },
    );
  }
}

