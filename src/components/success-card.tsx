"use client";

import { CheckCircle2, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SuccessCardProps = {
  raffleNumber: number;
  kidName: string;
  phone: string;
  smsSent: boolean;
  smsError?: string;
  onReset: () => void;
};

export function SuccessCard({
  raffleNumber,
  kidName,
  phone,
  smsSent,
  smsError,
  onReset,
}: SuccessCardProps) {
  const displayNumber = `#${raffleNumber.toString().padStart(3, "0")}`;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col items-center text-center">
        <CheckCircle2 className="mb-2 h-10 w-10 text-primary" aria-hidden />
        <CardTitle className="text-xl font-semibold">
          Congratulations! You entered the raffle
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Your raffle number is
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-semibold tracking-tight">
            {displayNumber}
          </div>
          <div className="text-sm text-muted-foreground">
            for {kidName}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Send className="h-4 w-4" aria-hidden />
            <span>
              An SMS has been sent to {phone}
            </span>
          </div>
          <Badge variant={smsSent ? "default" : "secondary"}>
            {smsSent ? "SMS sent" : "SMS pending"}
          </Badge>
        </div>

        {!smsSent && smsError ? (
          <Alert variant="destructive">
            <AlertTitle>SMS not sent</AlertTitle>
            <AlertDescription>{smsError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex justify-center">
          <Button type="button" onClick={onReset}>
            Register Another Child
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

