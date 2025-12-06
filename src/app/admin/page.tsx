import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
      <AdminDashboard />
    </main>
  );
}

