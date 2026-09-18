import { DashboardShell } from "@/components/DashboardShell";
import { getPrimeraOperacion } from "@/lib/iol-actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cacheada en memoria del proceso: no vuelve a pegarle a la API en cada navegación.
  const primeraOperacion = await getPrimeraOperacion();

  return (
    <DashboardShell primeraOperacion={primeraOperacion}>{children}</DashboardShell>
  );
}
