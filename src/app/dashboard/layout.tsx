import { DashboardShell } from "@/components/DashboardShell";
import { PrivacyProvider } from "@/lib/privacy-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivacyProvider>
      <DashboardShell>{children}</DashboardShell>
    </PrivacyProvider>
  );
}
