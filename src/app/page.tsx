"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { RegistrationForm } from "@/components/registration-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SubmissionResult = {
  smsSent: boolean;
  smsError?: string;
  parentPhone: string;
  parentName: string;
  submissionBatchId: string;
  children: Array<{
    kidName: string;
    raffleNumber: number;
    grade: string;
    dateOfBirth: string;
    issuedAt: string;
  }>;
};

export default function Home() {
  const router = useRouter();

  const heroCopy = useMemo(
    () => ({
      title: "Kids' Raffle Registration",
      subtitle:
        "Enter your child in seconds. You’ll get a raffle number and SMS confirmation right away.",
      supporting:
        "All fields are required. We only use your details for this raffle.",
    }),
    [],
  );

  const handleSuccess = (data: SubmissionResult) => {
    const names = data.children.map((c) => c.kidName).join("|");
    const grades = data.children.map((c) => c.grade).join("|");
    const dobs = data.children.map((c) => c.dateOfBirth).join("|");
    const numbers = data.children.map((c) => String(c.raffleNumber)).join("|");
    const issuedAt = data.children[0]?.issuedAt ?? "";

    const params = new URLSearchParams({
      kidNames: names,
      grades,
      dobs,
      raffleNumbers: numbers,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      issuedAt,
    });
    router.push(`/ticket-preview?${params.toString()}`);
  };

  return (
    <main className="flex min-h-screen items-start justify-center bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Strive Sports Academy @ DISK
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Strive Sports Academy focuses on developing world-class football players through expert
              coaching and global exposure. We nurture both athletic and personal growth for success
              on and off the field.
            </p>
            <p>Register your child for our upcoming raffle below.</p>
          </CardContent>
        </Card>

        <div className="w-full">
          <RegistrationForm onSuccess={handleSuccess} />
        </div>
      </div>
    </main>
  );
}
