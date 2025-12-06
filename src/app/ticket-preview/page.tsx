import { DigitalTicket } from "@/components/digital-ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

type TicketPreviewPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function firstNameOnly(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export default function TicketPreviewPage({ searchParams }: TicketPreviewPageProps) {
  const kidName = typeof searchParams.kidName === "string" ? searchParams.kidName : "";
  const dateOfBirth =
    typeof searchParams.dateOfBirth === "string" ? searchParams.dateOfBirth : "";
  const grade = typeof searchParams.grade === "string" ? searchParams.grade : "";
  const parentName =
    typeof searchParams.parentName === "string" ? searchParams.parentName : "";
  const parentPhone =
    typeof searchParams.parentPhone === "string" ? searchParams.parentPhone : "";
  const raffleNumberParam =
    typeof searchParams.raffleNumber === "string" ? searchParams.raffleNumber : "";
  const raffleNumber = raffleNumberParam ? Number(raffleNumberParam) : NaN;
  const issuedAtParam =
    typeof searchParams.issuedAt === "string" ? searchParams.issuedAt : "";
  const issuedDate = issuedAtParam
    ? (() => {
        const date = new Date(issuedAtParam);
        const datePart = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(date);
        const timePart = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
        return `Submitted on ${datePart} at ${timePart}`;
      })()
    : "";

  const hasData =
    kidName &&
    dateOfBirth &&
    grade &&
    parentName &&
    parentPhone &&
    !Number.isNaN(raffleNumber) &&
    issuedDate;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-10">
      {hasData ? (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex items-center gap-1 text-center text-sm font-medium text-foreground">
            <span>Thank you, {firstNameOnly(parentName)}</span>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" aria-hidden />
          </div>
          <DigitalTicket
            kidName={kidName}
            dateOfBirth={dateOfBirth}
            grade={grade}
            parentName={parentName}
            parentPhone={parentPhone}
            raffleNumber={raffleNumber}
            issuedDate={issuedDate}
          />
        </div>
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Missing ticket data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No ticket details were provided. Please submit a registration to view the ticket.
          </CardContent>
        </Card>
      )}
    </main>
  );
}

