"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type DigitalTicketProps = {
  kidName: string;
  dateOfBirth: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  raffleNumber: number;
  issuedDate: string;
};

export function DigitalTicket({
  kidName,
  dateOfBirth,
  grade,
  parentName,
  parentPhone,
  raffleNumber,
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
          className="relative overflow-hidden rounded-3xl bg-white px-4 pt-4 pb-8 text-foreground shadow-md before:absolute before:top-1/2 before:-left-3 before:h-6 before:w-6 before:-translate-y-1/2 before:rounded-full before:bg-muted after:absolute after:top-1/2 after:-right-3 after:h-6 after:w-6 after:-translate-y-1/2 after:rounded-full after:bg-muted"
        >
          <div className="mb-10 flex items-start justify-between text-sm uppercase text-foreground">
            <span className="flex flex-col gap-0.5 leading-[0.9] tracking-[0.01em] text-[22px] font-thin">
              <span>GESUND</span>
              <span>KUCHE</span>
            </span>
            <span className="text-[22px] font-thin tracking-tight">
              #{raffleNumber.toString().padStart(3, "0")}
            </span>
          </div>

          <div className="space-y-2">
            <div className="text-3xl font-semibold uppercase leading-tight tracking-tight">
              {kidName}
            </div>
            <div className="text-sm uppercase text-muted-foreground">
              Grade: {grade}
            </div>
            <div className="text-sm text-muted-foreground">
              Date of Birth: {dateOfBirth}
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

