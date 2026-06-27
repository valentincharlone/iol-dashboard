export const dynamic = "force-dynamic";

import { getPortafolio } from "@/lib/iol-actions";
import { HoldingsTable } from "@/components/HoldingsTable";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";

export default async function HoldingsPage() {
  const { posiciones, totalValuacion } = await getPortafolio();

  return (
    <PageContainer gap="4">
      <PageHeader
        title="Holdings"
        subtitle={`${posiciones.length} posiciones · Argentina · BCBA`}
        description="Posiciones actuales ordenadas por valuación. Hacé click en cualquier fila para ver el detalle."
      />
      <HoldingsTable posiciones={posiciones} totalValuacion={totalValuacion} />
    </PageContainer>
  );
}
