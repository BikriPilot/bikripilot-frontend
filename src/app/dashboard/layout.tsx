import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SocketProvider } from "@/components/layout/SocketProvider";
import { ImpersonationBanner } from "@/components/admin/ImpersonationBanner";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SocketProvider />
      <ImpersonationBanner />
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
