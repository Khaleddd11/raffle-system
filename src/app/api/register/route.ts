import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServiceClient } from "@/lib/supabase";
import { registrationSchema } from "@/lib/validation";
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

    if ((submissionsToday ?? 0) + values.children.length > 10) {
      return NextResponse.json(
        { error: "Limit reached: 10 submissions per phone per day" },
        { status: 429 },
      );
    }

    const submissionBatchId = randomUUID();

    const insertPayload = values.children.map((child) => ({
      kid_name: child.kidName,
      date_of_birth: child.dateOfBirth,
      grade: child.grade,
      parent_name: values.parentName,
      parent_phone: values.parentPhone,
      submission_batch_id: submissionBatchId,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("raffle_entries")
      .insert(insertPayload)
      .select();

    if (insertError || !inserted || inserted.length === 0) {
      console.error("[insert]", requestId, insertError);
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 500 },
      );
    }

    const lines = inserted.map(
      (entry) =>
        `${entry.kid_name} — Raffle Number: #${entry.raffle_number
          .toString()
          .padStart(3, "0")}`,
    );
    const message = `Congratulations! The following children are entered in the raffle:\n${lines.join(
      "\n",
    )}`;

    let smsSent = false;
    let smsError: string | undefined;

    const edgeFunctionUrl =
      process.env.SUPABASE_EDGE_FUNCTION_URL || process.env.NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL;

    try {
      if (edgeFunctionUrl) {
        const edgeResponse = await fetch(`${edgeFunctionUrl}/send-raffle-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parentPhone: values.parentPhone,
            parentName: values.parentName,
            submissionBatchId,
            children: inserted.map((child) => ({
              kidName: child.kid_name,
              raffleNumber: child.raffle_number,
            })),
          }),
        });

        if (!edgeResponse.ok) {
          const errText = await edgeResponse.text();
          console.error("[sms edge]", requestId, errText);
          smsError = "SMS failed to send.";
        } else {
          smsSent = true;
          await supabase
            .from("raffle_entries")
            .update({ sms_sent: true, sms_sent_at: new Date().toISOString() })
            .in(
              "id",
              inserted.map((entry) => entry.id),
            );
        }
      }
    } catch (err) {
      console.error("[sms]", requestId, err);
      smsError = "SMS failed to send.";
    }

    return NextResponse.json({
      parentPhone: values.parentPhone,
      parentName: values.parentName,
      submissionBatchId,
      smsSent,
      smsError,
      children: inserted.map((entry) => ({
        kidName: entry.kid_name,
        raffleNumber: entry.raffle_number,
        issuedAt: entry.created_at,
        grade: entry.grade,
        dateOfBirth: entry.date_of_birth,
      })),
    });
  } catch (error) {
    console.error("[register]", requestId, error);
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 },
    );
  }
}

