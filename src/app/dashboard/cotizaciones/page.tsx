export const dynamic = "force-dynamic";

import { getCotizacionesPortafolio } from "@/lib/iol-actions";
import { CotizacionesTable } from "@/components/CotizacionesTable";
import { MarketStatusBadge } from "@/components/MarketStatusBadge";

export default async function CotizacionesPage() {
  const items = await getCotizacionesPortafolio();

  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-text1 m-0">Cotizaciones</h1>
          <p className="text-[13px] text-text3 mt-0.5">
            Mercado en tiempo real · tus posiciones
          </p>
          <p className="text-[12px] text-text3 mt-1.5">
            Precios de mercado de tus instrumentos en tiempo real.
          </p>
        </div>
        <MarketStatusBadge />
      </div>

      <CotizacionesTable items={items} />
    </div>
  );
}
