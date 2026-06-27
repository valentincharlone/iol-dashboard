export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getPortafolio } from "@/lib/iol-actions";
import { HoldingsTable } from "@/components/HoldingsTable";
import { AllocationChart } from "@/components/AllocationChart";
import { MarketStrip } from "@/components/MarketStrip";
import { ValuacionCard } from "@/components/ValuacionCard";
import { fmtMoney, fmtUSD, fmtPct } from "@/lib/fmt";
import { MarketStatusBadge } from "@/components/MarketStatusBadge";

export default async function DashboardContent() {
  const {
    posiciones,
    totalValuacion,
    costoTotal,
    estadoCuenta,
    totalPnlPesos,
    totalPnlPorcentaje,
    variacionHoy,
    variacionHoyPesos,
    cantidadPosiciones,
  } = await getPortafolio();

  const topGainers = [...posiciones]
    .sort((a, b) => b.variacionDiaria - a.variacionDiaria)
    .slice(0, 3);
  const topLosers = [...posiciones]
    .sort((a, b) => a.variacionDiaria - b.variacionDiaria)
    .slice(0, 3);
  const pct = estadoCuenta?.gananciaTotalPorcentaje ?? totalPnlPorcentaje;
  const pesos = estadoCuenta?.gananciaTotalPesos ?? totalPnlPesos;

  return (
    <div className="p-4 pb-12 md:p-6  flex flex-col gap-4 md:gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-text1 m-0">Portafolio</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-text3">Argentina · BCBA</span>
            <span className="text-text3/40 text-[12px] select-none">·</span>
            <Suspense
              fallback={
                <span className="text-[12px] text-text3/40">cargando…</span>
              }
            >
              <MarketStrip />
            </Suspense>
          </div>
        </div>
        <MarketStatusBadge />
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-kpi gap-3 md:gap-3.5">
        {/* Hero */}
        <ValuacionCard
          valuacion={totalValuacion}
          className="col-span-2 md:col-span-1"
        >
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="text-[12px] opacity-65">
              <span className="opacity-80">Invertido </span>
              {fmtMoney(costoTotal)}
            </div>
            {estadoCuenta && (
              <div className="text-[12px] opacity-65">
                <span className="opacity-80">Con efectivo </span>
                {fmtMoney(estadoCuenta.totalConEfectivo)}
              </div>
            )}
            <div className="text-[12px] opacity-65">
              <span className="opacity-80">{cantidadPosiciones} </span>activos
            </div>
          </div>
        </ValuacionCard>

        {/* Rendimiento */}
        <div className="bg-card rounded-card shadow-sm p-5">
          <div className="text-[12px] font-medium text-text3 uppercase tracking-wide">
            Rendimiento total
          </div>
          <div
            className={`text-[26px] font-bold mt-1.5 tabular-nums ${pct >= 0 ? "text-profit" : "text-loss"}`}
          >
            {fmtPct(pct)}
          </div>
          <div
            className={`text-[12px] mt-0.5 tabular-nums ${pct >= 0 ? "text-profit" : "text-loss"}`}
          >
            {pesos >= 0 ? "+" : ""}
            {fmtMoney(pesos)}
          </div>
        </div>

        {/* Variación hoy */}
        <div className="bg-card rounded-card shadow-sm p-5">
          <div className="text-[12px] font-medium text-text3 uppercase tracking-wide">
            Variación hoy
          </div>
          <div
            className={`text-[26px] font-bold mt-1.5 tabular-nums ${variacionHoy >= 0 ? "text-profit" : "text-loss"}`}
          >
            {fmtPct(variacionHoy)}
          </div>
          <div
            className={`text-[12px] mt-0.5 tabular-nums ${variacionHoy >= 0 ? "text-profit" : "text-loss"}`}
          >
            {variacionHoyPesos >= 0 ? "+" : ""}
            {fmtMoney(variacionHoyPesos)}
          </div>
        </div>

        {/* Disponible */}
        <div className="col-span-2 md:col-span-1 bg-card rounded-card shadow-sm p-5">
          <div className="text-[12px] font-medium text-text3 uppercase tracking-wide mb-2.5">
            Disponible
          </div>
          {estadoCuenta ? (
            <div className="flex flex-col gap-2">
              {[
                { label: "ARS", value: fmtMoney(estadoCuenta.disponibleARS) },
                { label: "USD", value: fmtUSD(estadoCuenta.disponibleUSD) },
              ].map((r) => (
                <div key={r.label} className="flex items-baseline gap-1.5">
                  <span className="text-[10px] text-text3 font-semibold min-w-[24px]">
                    {r.label}
                  </span>
                  <span className="text-[18px] font-bold tabular-nums text-text1">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[13px] text-text3">—</div>
          )}
        </div>
      </div>

      {/* Top movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-3.5">
        {[
          { title: "Subieron hoy", items: topGainers, positive: true },
          { title: "Bajaron hoy", items: topLosers, positive: false },
        ].map(({ title, items, positive }) => (
          <div
            key={title}
            className="bg-card rounded-card shadow-sm p-4 md:p-5"
          >
            <div className="text-[11px] font-semibold text-text3 uppercase tracking-wide mb-3">
              {title}
            </div>
            <div className="flex flex-col gap-2">
              {items.map((p) => (
                <div
                  key={p.ticker}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[13px] text-text1 shrink-0">
                      {p.ticker}
                    </span>
                    <span className="text-[11px] text-text3 truncate">
                      {p.nombre}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[13px] font-bold tabular-nums ${positive ? "text-profit" : "text-loss"}`}
                    >
                      {fmtPct(p.variacionDiaria)}
                    </span>
                    <div className="text-[10px] text-text3 tabular-nums">
                      {p.variacionDiaria >= 0 ? "+" : ""}
                      {fmtMoney((p.valuacion * p.variacionDiaria) / 100)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Distribución + Holdings */}
      <div className=" grid grid-cols-1 md:grid-cols-bottom gap-4 md:gap-5 items-start">
        <div className="h-[100%] bg-card rounded-card shadow-sm p-5 md:p-6">
          <p className="text-[13px] font-semibold text-text2 mb-1">
            Distribución
          </p>
          <AllocationChart posiciones={posiciones} />
        </div>
        <HoldingsTable
          posiciones={posiciones}
          totalValuacion={totalValuacion}
          limit={5}
        />
      </div>
    </div>
  );
}
