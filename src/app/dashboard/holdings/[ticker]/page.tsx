export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPortafolio, getCotizacionDetalle } from "@/lib/iol-actions";
import { PriceChart } from "@/components/PriceChart";
import { getBadge, tipoLabel } from "@/lib/instrument";
import { fmtMoney, fmtPct } from "@/lib/fmt";
import { PageContainer } from "@/components/PageContainer";

function Stat({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[11px] font-medium text-text3 uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div
        className={`text-[15px] font-bold tabular-nums text-text1 ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}

export default async function TickerPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const decodedTicker = decodeURIComponent(ticker);

  const { posiciones } = await getPortafolio();
  const posicion = posiciones.find(
    (p) => p.ticker.toUpperCase() === decodedTicker.toUpperCase(),
  );

  if (!posicion) notFound();

  const badge = getBadge(posicion.tipo);
  const isPos = posicion.pnlPorcentaje >= 0;
  const hoyPos = posicion.variacionDiaria >= 0;

  const cotizacion = await getCotizacionDetalle(
    posicion.mercado,
    posicion.ticker,
  ).catch(() => null);

  return (
    <PageContainer>
      {/* Header */}
      <div>
        <Link
          href="/dashboard/holdings"
          className="inline-flex items-center gap-1.5 text-[12px] text-text3 hover:text-text2 transition-colors mb-3 no-underline"
        >
          <ArrowLeft size={13} />
          Holdings
        </Link>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[22px] font-bold text-text1 m-0">
            {posicion.ticker}
          </h1>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px] tracking-[0.3px]"
            style={{ background: badge.bg, color: badge.text }}
          >
            {tipoLabel(posicion.tipo)}
          </span>
        </div>
        <p className="text-[13px] text-text3 mt-0.5">{posicion.nombre}</p>
      </div>

      {/* Gráfico */}
      <div className="bg-card rounded-card shadow-sm p-5 md:p-6">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-[26px] font-bold tabular-nums text-text1">
            {fmtMoney(posicion.precioActual)}
          </span>
          <span
            className={`text-[14px] font-semibold tabular-nums ${hoyPos ? "text-profit" : "text-loss"}`}
          >
            {hoyPos ? "+" : ""}
            {posicion.variacionDiaria.toFixed(2)}% hoy
          </span>
        </div>
        <PriceChart ticker={posicion.ticker} mercado={posicion.mercado} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mi posición */}
        <div className="bg-card rounded-card shadow-sm p-5 md:p-6">
          <div className="text-[12px] font-semibold text-text3 uppercase tracking-wide mb-4">
            Mi posición
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Stat
              label="Cantidad"
              value={posicion.cantidad.toLocaleString("es-AR")}
            />
            <Stat label="P. Prom. Compra" value={fmtMoney(posicion.ppc)} />
            <Stat label="Valuación" value={fmtMoney(posicion.valuacion)} />
            <Stat
              label="P&L total"
              value={`${fmtPct(posicion.pnlPorcentaje)} (${posicion.pnlPesos >= 0 ? "+" : ""}${fmtMoney(posicion.pnlPesos)})`}
              valueClass={isPos ? "text-profit" : "text-loss"}
            />
          </div>
        </div>

        {/* Cotización del día */}
        <div className="bg-card rounded-card shadow-sm p-5 md:p-6">
          <div className="text-[12px] font-semibold text-text3 uppercase tracking-wide mb-4">
            Cotización del día
          </div>
          {cotizacion ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Stat label="Apertura" value={fmtMoney(cotizacion.apertura)} />
              <Stat
                label="Cierre anterior"
                value={fmtMoney(cotizacion.cierreAnterior)}
              />
              <Stat label="Máximo" value={fmtMoney(cotizacion.maximo)} />
              <Stat label="Mínimo" value={fmtMoney(cotizacion.minimo)} />
              <Stat
                label="Monto operado"
                value={fmtMoney(cotizacion.montoOperado)}
              />
              <Stat
                label="Operaciones"
                value={cotizacion.cantidadOperaciones.toLocaleString("es-AR")}
              />
            </div>
          ) : (
            <p className="text-[13px] text-text3">
              No se pudo cargar la cotización.
            </p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
