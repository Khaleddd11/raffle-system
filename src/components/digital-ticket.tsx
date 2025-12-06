"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type DigitalTicketProps = {
  ticketChildren: Array<{
    kidName: string;
    dateOfBirth: string;
    grade: string;
    raffleNumber: number;
  }>;
  parentName: string;
  parentPhone: string;
  issuedDate: string;
};

export function DigitalTicket({
  ticketChildren,
  parentName,
  parentPhone,
  issuedDate,
}: DigitalTicketProps) {
  const ticketRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f3f4f6",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("digital-ticket.pdf");
    } catch (error) {
      console.error("[ticket-download]", error);
    } finally {
      setDownloading(false);
    }
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="relative w-full max-w-sm">
        <div
          ref={ticketRef}
          className="relative overflow-hidden rounded-t-3xl rounded-b-none bg-white px-4 pt-4 pb-10 text-foreground shadow-md before:absolute before:top-1/2 before:-left-3 before:h-6 before:w-6 before:-translate-y-1/2 before:rounded-full before:bg-muted after:absolute after:top-1/2 after:-right-3 after:h-6 after:w-6 after:-translate-y-1/2 after:rounded-full after:bg-muted"
          style={{
            maskImage:
              "radial-gradient(circle at 0% 100%, transparent 12px, black 12px), radial-gradient(circle at 11.11% 100%, transparent 12px, black 12px), radial-gradient(circle at 22.22% 100%, transparent 12px, black 12px), radial-gradient(circle at 33.33% 100%, transparent 12px, black 12px), radial-gradient(circle at 44.44% 100%, transparent 12px, black 12px), radial-gradient(circle at 55.55% 100%, transparent 12px, black 12px), radial-gradient(circle at 66.66% 100%, transparent 12px, black 12px), radial-gradient(circle at 77.77% 100%, transparent 12px, black 12px), radial-gradient(circle at 88.88% 100%, transparent 12px, black 12px), radial-gradient(circle at 100% 100%, transparent 12px, black 12px)",
            WebkitMaskImage:
              "radial-gradient(circle at 0% 100%, transparent 12px, black 12px), radial-gradient(circle at 11.11% 100%, transparent 12px, black 12px), radial-gradient(circle at 22.22% 100%, transparent 12px, black 12px), radial-gradient(circle at 33.33% 100%, transparent 12px, black 12px), radial-gradient(circle at 44.44% 100%, transparent 12px, black 12px), radial-gradient(circle at 55.55% 100%, transparent 12px, black 12px), radial-gradient(circle at 66.66% 100%, transparent 12px, black 12px), radial-gradient(circle at 77.77% 100%, transparent 12px, black 12px), radial-gradient(circle at 88.88% 100%, transparent 12px, black 12px), radial-gradient(circle at 100% 100%, transparent 12px, black 12px)",
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        >
          <div className="mb-10 flex items-start justify-between text-sm uppercase text-foreground">
            <span className="flex flex-col gap-0.5 leading-[0.9] tracking-[0.01em] text-[22px] font-thin">
              <span>STRIVE</span>
            </span>
            <div className="flex flex-col items-end text-[22px] font-thin tracking-tight leading-tight">
              {ticketChildren.map((child) => (
                <span key={child.raffleNumber}>
                  #{child.raffleNumber.toString().padStart(3, "0")}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="space-y-3">
              {ticketChildren.map((child) => (
                <div key={`${child.kidName}-${child.raffleNumber}`} className="space-y-1">
                  <div className="text-3xl font-semibold uppercase leading-tight tracking-tight">
                    {child.kidName}
                  </div>
                  <div className="text-sm uppercase text-muted-foreground">
                    Grade: {child.grade}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Date of Birth: {child.dateOfBirth}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="my-8 h-px w-full bg-muted" />

          <div className="space-y-2 text-sm">
            <div className="uppercase text-muted-foreground">Parent</div>
            <div className="font-medium">{parentName}</div>
            <div className="text-muted-foreground">{parentPhone}</div>
          </div>

          <div className="mt-8 flex items-center justify-end text-[11px] uppercase tracking-wide text-muted-foreground">
            {issuedDate}
          </div>
        </div>
      </div>

      <Button onClick={handleDownload} disabled={downloading} className="w-full max-w-sm">
        {downloading ? "Preparing PDF..." : "Download Ticket"}
      </Button>
    </div>
  );
}

