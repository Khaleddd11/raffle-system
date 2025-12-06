"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, LogOut, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { RaffleEntry } from "@/types/raffle";
import { useToast } from "@/hooks/use-toast";

type EntriesResponse = { entries: RaffleEntry[]; total: number };

export function AdminDashboard() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadEntries = async (query?: string) => {
    setLoading(true);
    setError(null);
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    const response = await fetch(`/api/admin/entries${params}`, {
      cache: "no-store",
    });

    if (response.status === 401) {
      setAuthed(false);
      setEntries([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const data = (await response.json()) as EntriesResponse;
    setEntries(data.entries ?? []);
    setTotal(data.total ?? 0);
    setAuthed(true);
    setLoading(false);
  };

  useEffect(() => {
    loadEntries().catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleLogin = async () => {
    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data?.error ?? "Incorrect password");
      setSubmitting(false);
      return;
    }

    setAuthed(true);
    setSubmitting(false);
    setPassword("");
    await loadEntries();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setEntries([]);
    setTotal(0);
  };

  const handleSearch = async () => {
    await loadEntries(search);
  };

  const handleExport = async () => {
    const params = search ? `?q=${encodeURIComponent(search)}` : "";
    const response = await fetch(`/api/admin/export${params}`);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      toast({
        title: "Export failed",
        description: data?.error ?? "Unable to export entries.",
        variant: "destructive",
      });
      return;
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition");
    const filenameMatch = disposition?.match(/filename="(.+)"/);
    const filename = filenameMatch?.[1] ?? "raffle_entries.xlsx";

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const smsStats = useMemo(() => {
    const sent = entries.filter((e) => e.sms_sent).length;
    return { sent, failed: entries.length - sent };
  }, [entries]);

  if (!authed) {
    return (
      <Card className="max-w-md shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5" aria-hidden />
            Admin Access
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the admin password to view raffle entries.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Access denied</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={!password || submitting}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Raffle Entries Admin</h1>
          <p className="text-sm text-muted-foreground">
            View, search, and export all registrations.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" aria-hidden />
          Log out
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {total}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SMS Sent
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {smsStats.sent}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SMS Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {smsStats.failed}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-sm text-muted-foreground">
              Search by kid or parent name
            </span>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-72"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSearch} disabled={loading}>
                Apply
              </Button>
              <Button onClick={handleExport} variant="default">
                Export to Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Raffle #</TableHead>
                <TableHead>Kid Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Parent Name</TableHead>
                <TableHead>Parent Phone</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>SMS Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Loading entries...
                    </div>
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                    No entries found.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {`#${entry.raffle_number.toString().padStart(3, "0")}`}
                    </TableCell>
                    <TableCell>{entry.kid_name}</TableCell>
                    <TableCell>{entry.grade}</TableCell>
                    <TableCell>{entry.parent_name}</TableCell>
                    <TableCell>{entry.parent_phone}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.submission_batch_id ?? "—"}
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(entry.created_at))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.sms_sent ? "default" : "secondary"}>
                        {entry.sms_sent ? "Sent" : "Failed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

