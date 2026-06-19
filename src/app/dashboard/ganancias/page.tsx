export const dynamic = "force-dynamic";

import { getGananciasRealizadas } from "@/lib/iol-actions";
import { GananciasToolbar } from "@/components/GananciasToolbar";
import { fmtMoney, fmtPct } from "@/lib/fmt";
import type { GananciaItem } from "@/lib/iol-types";

function fmtFecha(iso: string) {
  try {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

function fmtPrecio(n: number) {
  return (
    "$" +
    n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

function KpiCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-card shadow-sm p-5">
      <div className="text-[12px] font-medium text-text3 uppercase tracking-wide mb-1.5">
        {label}
      </div>
      <div className={`text-[24px] font-bold tabular-nums ${valueColor ?? "text-text1"}`}>
        {value}
      </div>
      {sub && <div className="text-[12px] text-text3 mt-0.5 tabular-nums">{sub}</div>}
    </div>
  );
}

function VentaRow({ item }: { item: GananciaItem }) {
  const enDolares = item.moneda?.toLowerCase().includes("dolar");
  const prefix = enDolares ? "US$" : "$";
  const hasPnl = item.pnlEstimado != null;
  const pnlPos = (item.pnlEstimado ?? 0) >= 0;

  return (
    <tr className="border-b border-[#F5F7FB] last:border-0 hover:bg-[#FAFBFE] transition-colors">
      <td className="py-3 px-5 text-[12px] text-text3 tabular-nums whitespace-nowrap">
        {fmtFecha(item.fecha)}
      </td>
      <td className="py-3 px-3 font-bold text-[13px] text-text1 whitespace-nowrap">
        {item.ticker}
      </td>
      <td className="py-3 px-3 text-[13px] text-right tabular-nums text-text2 whitespace-nowrap">
        {item.cantidad.toLocaleString("es-AR")}
      </td>
      <td className="py-3 px-3 text-[13px] text-right tabular-nums text-text2 whitespace-nowrap">
        {fmtPrecio(item.precio)}
      </td>
      <td className="py-3 px-3 text-[13px] text-right font-semibold tabular-nums text-text1 whitespace-nowrap">
        {prefix}{Math.round(item.total).toLocaleString("es-AR")}
      </td>
      <td className="py-3 px-5 text-right whitespace-nowrap">
        {hasPnl ? (
          <div>
            <div className={`text-[13px] font-semibold tabular-nums ${pnlPos ? "text-profit" : "text-loss"}`}>
              {fmtPct(((item.pnlEstimado ?? 0) / (item.costoEstimado ?? 1)) * 100)}
            </div>
            <div className={`text-[10px] tabular-nums opacity-75 ${pnlPos ? "text-profit" : "text-loss"}`}>
              {(item.pnlEstimado ?? 0) >= 0 ? "+" : ""}{fmtMoney(item.pnlEstimado ?? 0)}
            </div>
          </div>
        ) : (
          <span className="text-[12px] text-text3">—</span>
        )}
      </td>
    </tr>
  );
}

type SearchParams = Promise<{ desde?: string; hasta?: string }>;

export default async function GananciasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { desde, hasta } = await searchParams;
  const { items, totalRecibidoARS, pnlEstimado, pnlPct, fechaDesde, fechaHasta } =
    await getGananciasRealizadas(desde, hasta);

  const fmtDate = (s: string) => {
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold text-text1 m-0">Ganancias realizadas</h1>
        <p className="text-[13px] text-text3 mt-0.5">
          {fmtDate(fechaDesde)} — {fmtDate(fechaHasta)} · {items.length} ventas terminadas
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-3.5">
        <KpiCard
          label="Operaciones de venta"
          value={String(items.length)}
          sub={items.length === 0 ? "Sin ventas en el período" : undefined}
        />
        <KpiCard
          label="Total recibido (ARS)"
          value={fmtMoney(totalRecibidoARS)}
        />
        <KpiCard
          label="P&L estimado"
          value={pnlEstimado != null ? fmtMoney(pnlEstimado) : "—"}
          sub={pnlPct != null ? fmtPct(pnlPct) : "Sin costo base disponible"}
          valueColor={
            pnlEstimado == null
              ? "text-text3"
              : pnlEstimado >= 0
                ? "text-profit"
                : "text-loss"
          }
        />
      </div>

      {/* Tabla */}
      {items.length === 0 ? (
        <div className="bg-white rounded-card shadow-sm overflow-clip">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
            <span className="text-[15px] font-semibold text-text1">Detalle de ventas</span>
            <GananciasToolbar defaultDesde={fechaDesde} defaultHasta={fechaHasta} />
          </div>
          <p className="py-10 text-center text-[13px] text-text3">
            No se encontraron ventas terminadas en el período.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-card shadow-sm overflow-clip">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[15px] font-semibold text-text1">Detalle de ventas</span>
              <span className="text-[11px] text-text3 bg-[#F5F7FB] px-2.5 py-1 rounded-full">
                P&L estimado desde compras del mismo período
              </span>
            </div>
            <GananciasToolbar defaultDesde={fechaDesde} defaultHasta={fechaHasta} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 620 }}>
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-5 text-[10px] font-semibold text-text3 uppercase tracking-wide whitespace-nowrap">Fecha</th>
                  <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-text3 uppercase tracking-wide">Ticker</th>
                  <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-text3 uppercase tracking-wide">Cant.</th>
                  <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-text3 uppercase tracking-wide">Precio</th>
                  <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-text3 uppercase tracking-wide">Total</th>
                  <th className="text-right py-2.5 px-5 text-[10px] font-semibold text-text3 uppercase tracking-wide">P&L est.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <VentaRow key={item.numero} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
