export const dynamic = "force-dynamic";

import { getCotizacionesPortafolio } from "@/lib/iol-actions";
import { CotizacionesTable } from "@/components/CotizacionesTable";
import { MarketStatusBadge } from "@/components/MarketStatusBadge";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";

export default async function CotizacionesPage() {
  const items = await getCotizacionesPortafolio();

  return (
    <PageContainer>
      <PageHeader
        title="Cotizaciones"
        subtitle="Mercado en tiempo real · tus posiciones"
        description="Precios de mercado de tus instrumentos en tiempo real."
        action={<MarketStatusBadge />}
      />
      <CotizacionesTable items={items} />
    </PageContainer>
  );
}
