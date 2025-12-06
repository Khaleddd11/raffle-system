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
  const namesParam = typeof searchParams.kidNames === "string" ? searchParams.kidNames : "";
  const gradesParam = typeof searchParams.grades === "string" ? searchParams.grades : "";
  const dobsParam = typeof searchParams.dobs === "string" ? searchParams.dobs : "";
  const numbersParam =
    typeof searchParams.raffleNumbers === "string" ? searchParams.raffleNumbers : "";
  const parentName =
    typeof searchParams.parentName === "string" ? searchParams.parentName : "";
  const parentPhone =
    typeof searchParams.parentPhone === "string" ? searchParams.parentPhone : "";
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

  const names = namesParam ? namesParam.split("|").map((n) => n.trim()).filter(Boolean) : [];
  const grades = gradesParam ? gradesParam.split("|") : [];
  const dobs = dobsParam ? dobsParam.split("|") : [];
  const numbers = numbersParam ? numbersParam.split("|").map((n) => Number(n)) : [];

  const children = names.map((name, index) => ({
    kidName: name,
    grade: grades[index] ?? "",
    dateOfBirth: dobs[index] ?? "",
    raffleNumber: numbers[index] ?? NaN,
  })).filter((child) => child.kidName && !Number.isNaN(child.raffleNumber));

  const hasData =
    children.length > 0 &&
    parentName &&
    parentPhone &&
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
            ticketChildren={children}
            parentName={parentName}
            parentPhone={parentPhone}
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

