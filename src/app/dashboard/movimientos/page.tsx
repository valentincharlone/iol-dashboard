export const dynamic = "force-dynamic";

import { getOperaciones } from "@/lib/iol-actions";
import { MovimientosTable } from "@/components/MovimientosTable";
import type { DateRangeSearchParams } from "@/lib/iol-types";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: DateRangeSearchParams;
}) {
  const { desde, hasta } = await searchParams;
  const operaciones = await getOperaciones(desde, hasta);

  return (
    <PageContainer>
      <PageHeader
        title="Movimientos"
        subtitle="Historial de operaciones · Argentina"
        description="Historial de operaciones ejecutadas. Filtrá por período para acotar la búsqueda."
      />
      <MovimientosTable
        operaciones={operaciones}
        defaultDesde={desde ?? ""}
        defaultHasta={hasta ?? ""}
      />
    </PageContainer>
  );
}
