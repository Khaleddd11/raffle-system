"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { RegistrationForm } from "@/components/registration-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SubmissionResult = {
  raffleNumber: number;
  smsSent: boolean;
  smsError?: string;
  parentPhone: string;
  kidName: string;
  grade: string;
  dateOfBirth: string;
  parentName: string;
  raffleNumber: number;
  issuedAt: string;
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
    const params = new URLSearchParams({
      kidName: data.kidName,
      dateOfBirth: data.dateOfBirth,
      grade: data.grade,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      raffleNumber: String(data.raffleNumber),
      issuedAt: data.issuedAt,
    });
    router.push(`/ticket-preview?${params.toString()}`);
  };

  return (
    <main className="flex min-h-screen items-start justify-center bg-background px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-4 lg:max-w-sm">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                {heroCopy.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{heroCopy.subtitle}</p>
              <p>{heroCopy.supporting}</p>
            </CardContent>
          </Card>
        </div>

        <div className="w-full">
          <RegistrationForm onSuccess={handleSuccess} />
        </div>
      </div>
    </main>
  );
}
