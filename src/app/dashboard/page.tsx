export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPortafolio, getHistorialCalculado } from "@/lib/iol-actions";
import { resultadoTotal } from "@/lib/ganancias";
import { HoldingsTable } from "@/components/HoldingsTable";
import { AllocationChart } from "@/components/AllocationChart";
import { ValuacionCard } from "@/components/ValuacionCard";
import {
  fmtMoney,
  fmtMoneySigned,
  fmtUSD,
  fmtUSDSigned,
  fmtPct,
} from "@/lib/fmt";
import { MarketStatusBadge } from "@/components/MarketStatusBadge";

export default async function DashboardContent() {
  const [
    {
      posiciones,
      totalValuacion,
      costoTotal,
      estadoCuenta,
      totalPnlPesos,
      totalPnlPorcentaje,
      variacionHoy,
      variacionHoyPesos,
      cantidadPosiciones,
    },
    historial,
  ] = await Promise.all([
    getPortafolio(),
    // Si falla el historial, la card cae al rendimiento de la cartera actual
    getHistorialCalculado().catch(() => null),
  ]);

  const topGainers = [...posiciones]
    .sort((a, b) => b.variacionDiaria - a.variacionDiaria)
    .slice(0, 3);
  const topLosers = [...posiciones]
    .sort((a, b) => a.variacionDiaria - b.variacionDiaria)
    .slice(0, 3);
  const pct = totalPnlPorcentaje;
  const resultado = historial
    ? resultadoTotal(
        {
          noRealizada: totalPnlPesos,
          costoCartera: costoTotal,
          patrimonio: estadoCuenta?.totalConEfectivo ?? null,
          posiciones: posiciones.map((p) => ({
            ticker: p.ticker,
            valuacion: p.valuacion,
          })),
          mepHoy: historial.mepHoy,
        },
        historial.calculo,
      )
    : null;

  return (
    <div className="p-4 pb-12 md:p-6 md:h-dvh flex flex-col gap-4 md:gap-5">
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

        {/* Resultado total */}
        <div className="bg-card rounded-card shadow-sm p-5 flex flex-col">
          <div className="text-[12px] font-medium text-text3 uppercase tracking-wide">
            {resultado ? "Resultado total" : "Rendimiento cartera"}
          </div>
          {resultado ? (
            <>
              <div
                className={`text-[28px] font-bold mt-1.5 tabular-nums ${resultado.total >= 0 ? "text-profit" : "text-loss"}`}
              >
                {fmtMoneySigned(resultado.total)}
              </div>
              <div className="text-[12px] mt-0.5 tabular-nums text-text3">
                {resultado.totalPct != null ? (
                  <>
                    <span
                      className={`font-semibold ${resultado.total >= 0 ? "text-profit" : "text-loss"}`}
                    >
                      {fmtPct(resultado.totalPct)}
                    </span>{" "}
                    sobre capital propio
                  </>
                ) : (
                  "realizado + no realizado"
                )}
              </div>
              {resultado.usd && (
                <div className="text-[12px] tabular-nums text-text3">
                  <span
                    className={`font-semibold ${resultado.usd.total >= 0 ? "text-profit" : "text-loss"}`}
                  >
                    {fmtUSDSigned(resultado.usd.total)}
                  </span>
                  {resultado.usd.totalPct != null &&
                    ` (${fmtPct(resultado.usd.totalPct)})`}{" "}
                  en dólares
                </div>
              )}
              <Link
                href="/dashboard/ganancias"
                className="mt-auto pt-2.5 text-[11px] text-text3 hover:text-brand transition-colors"
              >
                Cartera actual{" "}
                <span
                  className={`font-semibold tabular-nums ${pct >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {fmtPct(pct)}
                </span>{" "}
                · ver detalle →
              </Link>
            </>
          ) : (
            <>
              <div
                className={`text-[28px] font-bold mt-1.5 tabular-nums ${pct >= 0 ? "text-profit" : "text-loss"}`}
              >
                {fmtPct(pct)}
              </div>
              <div
                className={`text-[12px] mt-0.5 tabular-nums ${pct >= 0 ? "text-profit" : "text-loss"}`}
              >
                {fmtMoneySigned(totalPnlPesos)}
              </div>
              <div className="text-[11px] text-text3 mt-auto pt-2.5">
                Solo posiciones abiertas
              </div>
            </>
          )}
        </div>

        {/* Variación hoy */}
        <div className="bg-card rounded-card shadow-sm p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[12px] font-medium text-text3 uppercase tracking-wide">
              Variación hoy
            </div>
            <MarketStatusBadge />
          </div>
          <div
            className={`text-[28px] font-bold mt-1.5 tabular-nums ${variacionHoy >= 0 ? "text-profit" : "text-loss"}`}
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
                  <span className="text-[22px] font-bold tabular-nums text-text1">
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
                    <span className="font-bold text-[15px] text-text1 shrink-0">
                      {p.ticker}
                    </span>
                    <span className="text-[11px] text-text3 truncate">
                      {p.nombre}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[15px] font-bold tabular-nums ${positive ? "text-profit" : "text-loss"}`}
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
      {/* En desktop ocupa el alto que queda del viewport: nada de scroll */}
      <div className="grid grid-cols-1 md:grid-cols-bottom md:grid-rows-[minmax(0,1fr)] md:flex-1 md:min-h-0 gap-4 md:gap-5 items-stretch">
        <div className="bg-card rounded-card shadow-sm p-5 md:p-6 flex flex-col min-h-0">
          <p className="text-[13px] font-semibold text-text2 mb-3">
            Distribución
          </p>
          <AllocationChart posiciones={posiciones} />
        </div>
        <HoldingsTable
          posiciones={posiciones}
          totalValuacion={totalValuacion}
          fit
        />
      </div>
    </div>
  );
}
