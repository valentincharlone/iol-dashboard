export const dynamic = "force-dynamic";

import { getGanancias } from "@/lib/iol-actions";
import { GananciasToolbar } from "@/components/GananciasToolbar";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import {
  fmtMoney,
  fmtMoneySigned,
  fmtPct,
  fmtPrice,
  fmtUSD,
  fmtFecha,
  fmtDateStr,
  toDateInput,
} from "@/lib/fmt";
import type { DateRangeSearchParams } from "@/lib/iol-types";
import type { EventoRealizado } from "@/lib/ganancias";

function colorDe(n: number | null | undefined) {
  if (n == null) return "text-text3";
  return n >= 0 ? "text-profit" : "text-loss";
}

function Componente({
  titulo,
  detalle,
  valor,
  nota,
}: {
  titulo: string;
  detalle: string;
  valor: number;
  nota?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border-light">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-text1">{titulo}</div>
        <p className="text-[12px] text-text3 mt-0.5 leading-relaxed">{detalle}</p>
        {nota && <p className="text-[11px] text-text3 mt-1 italic">{nota}</p>}
      </div>
      <div
        className={`text-[15px] font-bold tabular-nums whitespace-nowrap ${colorDe(valor)}`}
      >
        {fmtMoneySigned(valor)}
      </div>
    </div>
  );
}

function Kpi({
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
    <div className="bg-card p-4 md:p-5">
      <div className="text-[11px] font-medium text-text3 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div
        className={`text-[20px] font-bold tabular-nums ${valueColor ?? "text-text1"}`}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[12px] text-text3 mt-0.5 tabular-nums">{sub}</div>
      )}
    </div>
  );
}

const TD_NUM =
  "py-3 px-3 text-[13px] text-right tabular-nums text-text2 whitespace-nowrap";
const TH =
  "py-2.5 px-3 text-[10px] font-semibold text-text3 uppercase tracking-wide whitespace-nowrap text-right";

function EventoRow({ e }: { e: EventoRealizado }) {
  const enUSD = e.estado === "enDolares";

  return (
    <tr className="border-b border-border-light last:border-0 hover:bg-rowHover transition-colors">
      <td className="py-3 px-5 text-[12px] text-text3 tabular-nums whitespace-nowrap">
        {fmtFecha(e.fecha)}
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <span className="font-bold text-[13px] text-text1">{e.ticker}</span>
        <span className="ml-2 text-[10px] font-semibold text-text3 bg-surface2 px-1.5 py-0.5 rounded">
          {e.tipo === "venta" ? "Venta" : "Amortización"}
        </span>
      </td>
      <td className={TD_NUM}>
        {e.cantidad != null ? e.cantidad.toLocaleString("es-AR") : "—"}
      </td>
      <td className={TD_NUM}>
        {e.precio == null ? "—" : enUSD ? fmtUSD(e.precio) : fmtPrice(e.precio)}
      </td>
      <td className={TD_NUM}>{e.ppc != null ? fmtPrice(e.ppc) : "—"}</td>
      <td className={`${TD_NUM} font-semibold !text-text1`}>
        {enUSD ? fmtUSD(e.recibido) : fmtMoney(e.recibido)}
      </td>
      <td className={TD_NUM}>
        {e.costo != null && !enUSD ? fmtMoney(e.costo) : "—"}
      </td>
      <td className="py-3 px-5 text-right whitespace-nowrap">
        {e.ganancia != null ? (
          <div>
            <div
              className={`text-[13px] font-semibold tabular-nums ${colorDe(e.ganancia)}`}
            >
              {fmtMoneySigned(e.ganancia)}
            </div>
            {e.gananciaPct != null && (
              <div
                className={`text-[10px] tabular-nums opacity-75 ${colorDe(e.ganancia)}`}
              >
                {fmtPct(e.gananciaPct)}
              </div>
            )}
          </div>
        ) : (
          <span
            className="text-[11px] text-text3"
            title={
              enUSD
                ? "Venta liquidada en dólares: no se puede comparar contra un costo en pesos."
                : "No hay compras registradas en el historial para calcular el costo."
            }
          >
            {enUSD ? "Cobrado en US$" : "Sin costo de compra"}
          </span>
        )}
      </td>
    </tr>
  );
}

export default async function GananciasPage({
  searchParams,
}: {
  searchParams: DateRangeSearchParams;
}) {
  const { desde, hasta } = await searchParams;
  const {
    resultado: r,
    periodo: p,
    primeraOperacion,
    fechaDesde,
    fechaHasta,
  } = await getGanancias(desde, hasta);

  const hoy = toDateInput(new Date());
  const rango = fechaDesde
    ? `${fmtDateStr(fechaDesde)} — ${fmtDateStr(fechaHasta ?? hoy)}`
    : "Todo el historial";

  return (
    <PageContainer>
      <PageHeader
        title="Ganancias"
        subtitle={
          primeraOperacion
            ? `Calculado sobre todas tus operaciones, desde la primera (${fmtFecha(primeraOperacion)})`
            : undefined
        }
      />

      {/* Resultado total acumulado */}
      <section className="bg-card rounded-card shadow-sm p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-6 md:gap-10">
          <div>
            <div className="text-[12px] font-medium text-text3 uppercase tracking-wide">
              Resultado total acumulado
            </div>
            <div
              className={`text-[32px] font-bold tabular-nums tracking-tight mt-1 ${colorDe(r.total)}`}
            >
              {fmtMoneySigned(r.total)}
            </div>
            {r.totalPct != null && (
              <div className="text-[14px] tabular-nums">
                <span className={`font-semibold ${colorDe(r.total)}`}>
                  {fmtPct(r.totalPct)}
                </span>{" "}
                <span className="text-text3">sobre tu capital propio</span>
              </div>
            )}
            <p className="text-[12px] text-text2 mt-3 leading-relaxed">
              Todo lo que ganaste desde que empezaste a invertir: lo que
              todavía tenés, lo que ya vendiste y lo que cobraste.
            </p>
            {r.capitalPropio != null && r.patrimonio != null && (
              <p className="text-[11px] text-text3 mt-2 leading-relaxed">
                Capital propio estimado: {fmtMoney(r.capitalPropio)} =
                patrimonio actual ({fmtMoney(r.patrimonio)}) − resultado total.
                Supone que no retiraste dinero de la cuenta.
              </p>
            )}
          </div>

          <div>
            <Componente
              titulo="Ganancia no realizada"
              detalle={`Posiciones que todavía tenés. Es el ${
                r.noRealizadaPct != null ? fmtPct(r.noRealizadaPct) : "—"
              } que muestra IOL, sobre un costo de ${fmtMoney(r.costoCartera)}.`}
              valor={r.noRealizada}
            />
            <Componente
              titulo="Ganancia realizada"
              detalle="Ventas y vencimientos ya cerrados, contra lo que realmente te costó cada activo."
              valor={r.realizada}
              nota={
                r.excluidos > 0
                  ? `${r.excluidos} ${r.excluidos === 1 ? "operación no incluida" : "operaciones no incluidas"} (cobradas en dólares o sin compras en el historial).`
                  : undefined
              }
            />
            <Componente
              titulo="Dividendos y rentas"
              detalle="Cobrados en pesos."
              valor={r.dividendosRentasARS}
              nota={
                r.cobrosUSD > 0
                  ? `Además cobraste ${fmtUSD(r.cobrosUSD)} en dólares (dividendos, rentas y amortizaciones), que no se suman.`
                  : undefined
              }
            />
            <div className="flex items-baseline justify-between gap-4 pt-3">
              <span className="text-[13px] font-bold text-text1">
                = Resultado total
              </span>
              <span
                className={`text-[17px] font-bold tabular-nums ${colorDe(r.total)}`}
              >
                {fmtMoneySigned(r.total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Explicación */}
      <section className="bg-brand-muted border border-brand-border rounded-card p-4 md:p-5">
        <p className="text-[13px] font-semibold text-text1 mb-1">
          ¿Por qué el rendimiento de tu cartera es menor que el resultado total?
        </p>
        <p className="text-[12px] text-text2 leading-relaxed">
          El{" "}
          {r.noRealizadaPct != null ? fmtPct(r.noRealizadaPct) : "porcentaje"}{" "}
          de IOL mide solo las posiciones abiertas. Cuando vendés algo con
          ganancia y reinvertís la plata, esa ganancia pasa a{" "}
          <strong>realizada</strong> y lo que comprás entra a su precio de hoy,
          así que arranca en 0%. El porcentaje de la cartera baja, pero la
          ganancia no se pierde: queda sumada en el resultado total.
        </p>
      </section>

      {/* Período */}
      <section className="bg-card rounded-card shadow-sm overflow-clip">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[15px] font-semibold text-text1">
              Ganancia realizada por período
            </div>
            <div className="text-[12px] text-text3 mt-0.5">
              {rango} · {p.eventos.length}{" "}
              {p.eventos.length === 1 ? "venta o vencimiento" : "ventas y vencimientos"}
            </div>
          </div>
          <GananciasToolbar
            defaultDesde={fechaDesde ?? ""}
            defaultHasta={fechaHasta ?? hoy}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-light border-b border-border">
          <Kpi
            label="Recibido"
            value={fmtMoney(p.recibido)}
            sub="por ventas y vencimientos"
          />
          <Kpi
            label="Costo de lo vendido"
            value={fmtMoney(p.costo)}
            sub="a precio promedio de compra"
          />
          <Kpi
            label="Ganancia realizada"
            value={fmtMoneySigned(p.ganancia)}
            sub={p.gananciaPct != null ? fmtPct(p.gananciaPct) : undefined}
            valueColor={p.costo > 0 ? colorDe(p.ganancia) : undefined}
          />
          <Kpi
            label="Dividendos y rentas"
            value={fmtMoney(p.dividendosRentasARS)}
            sub={
              p.cobrosUSD > 0
                ? `+ ${fmtUSD(p.cobrosUSD)} cobrados en dólares`
                : "cobrados en pesos"
            }
          />
        </div>

        {p.excluidos > 0 && (
          <p className="px-5 py-2.5 text-[11px] text-text3 border-b border-border-light">
            {p.excluidos}{" "}
            {p.excluidos === 1
              ? "operación no entra en los totales"
              : "operaciones no entran en los totales"}
            : ventas cobradas en dólares o sin compras registradas en el historial.
          </p>
        )}

        {p.eventos.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-text3">
            No hay ventas ni vencimientos en el período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 820 }}>
              <thead>
                <tr className="border-b border-border">
                  <th className={`${TH} !text-left px-5`}>Fecha</th>
                  <th className={`${TH} !text-left`}>Activo</th>
                  <th className={TH}>Cant.</th>
                  <th className={TH}>Precio</th>
                  <th className={TH}>Costo prom.</th>
                  <th className={TH}>Recibido</th>
                  <th className={TH}>Costo</th>
                  <th className={`${TH} px-5`}>Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {p.eventos.map((e) => (
                  <EventoRow key={e.numero} e={e} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="px-5 py-3 text-[11px] text-text3 border-t border-border leading-relaxed">
          Costo = precio promedio ponderado de compra (el mismo método que usa
          IOL), recorriendo todo tu historial e incluyendo cambios de ratio y
          amortizaciones. Montos informados por IOL, sin descontar aranceles.
        </p>
      </section>
    </PageContainer>
  );
}
