"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { IOLOperacion } from "@/lib/iol-types";
import { getTipoCls, getEstadoCls } from "@/lib/operacion";
import {
  fmtFechaHora,
  fmtPrice,
  toDateInput,
  getMonedaPrefix,
} from "@/lib/fmt";
import { PERIODOS_MOVIMIENTOS } from "@/lib/dates";
import {
  filterBtnCls,
  DATE_INPUT_CLS,
  TH_BASE,
  TD_BASE,
  TD_LEFT,
} from "@/lib/ui";
import { OperacionDrawer } from "./OperacionDrawer";

interface Props {
  operaciones: IOLOperacion[];
  defaultDesde: string;
  defaultHasta: string;
}

function isDividendo(tipo: string) {
  return tipo.toLowerCase().includes("dividendo");
}

type SortCol = "fecha" | "activo" | "total";
type SortDir = "asc" | "desc";

export function MovimientosTable({
  operaciones,
  defaultDesde,
  defaultHasta,
}: Props) {
  const router = useRouter();
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "compra" | "venta">(
    "todos",
  );
  const [activePeriod, setActivePeriod] = useState<number | null>(null);
  const [desde, setDesde] = useState(defaultDesde);
  const [hasta, setHasta] = useState(defaultHasta);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("fecha");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [hovRow, setHovRow] = useState<number | null>(null);
  const [selectedNumero, setSelectedNumero] = useState<number | null>(null);

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir(col === "fecha" ? "desc" : "asc");
    }
  }

  function applyPeriod(idx: number) {
    setActivePeriod(idx);
    const { days } = PERIODOS_MOVIMIENTOS[idx];
    const newDesde =
      days === 0 ? "" : toDateInput(new Date(Date.now() - days * 86_400_000));
    setDesde(newDesde);
    setHasta("");
    const params = new URLSearchParams();
    if (newDesde) params.set("desde", newDesde);
    router.push(`/dashboard/movimientos?${params.toString()}`);
  }

  function buscar() {
    setActivePeriod(null);
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    router.push(`/dashboard/movimientos?${params.toString()}`);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = operaciones.filter((op) => {
      if (tipoFiltro !== "todos" && op.tipo.toLowerCase() !== tipoFiltro)
        return false;
      if (q && !op.simbolo.toLowerCase().includes(q)) return false;
      return true;
    });
    const mul = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      if (sortCol === "fecha")
        return (
          mul *
          (new Date(a.fechaOrden).getTime() - new Date(b.fechaOrden).getTime())
        );
      if (sortCol === "activo") return mul * a.simbolo.localeCompare(b.simbolo);
      if (sortCol === "total")
        return (
          mul *
          ((a.montoOperado || a.monto || 0) - (b.montoOperado || b.monto || 0))
        );
      return 0;
    });
    return rows;
  }, [operaciones, tipoFiltro, search, sortCol, sortDir]);

  function sortIcon(col: SortCol) {
    if (sortCol !== col)
      return <span className="ml-0.5 opacity-30 text-[10px]">↕</span>;
    return (
      <span className="ml-0.5 text-[10px]">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  return (
    <>
      <OperacionDrawer
        numero={selectedNumero}
        onClose={() => setSelectedNumero(null)}
      />
      <div className="bg-card rounded-card shadow-sm overflow-clip">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-text1">
              Movimientos
            </span>
            <span className="text-[12px] text-text3">
              {filtered.length} operaciones
            </span>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {/* Filtro tipo */}
            <div className="flex gap-1">
              {(["todos", "compra", "venta"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoFiltro(t)}
                  className={filterBtnCls(tipoFiltro === t)}
                >
                  {t === "todos"
                    ? "Todos"
                    : t === "compra"
                      ? "Compras"
                      : "Ventas"}
                </button>
              ))}
            </div>

            {/* Períodos */}
            <div className="flex gap-1">
              {PERIODOS_MOVIMIENTOS.map((p, idx) => (
                <button
                  key={p.label}
                  onClick={() => applyPeriod(idx)}
                  className={filterBtnCls(activePeriod === idx)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Rango de fechas */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className={DATE_INPUT_CLS}
              />
              <span className="text-[12px] text-text3">—</span>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className={DATE_INPUT_CLS}
              />
              <button
                onClick={buscar}
                className="px-3.5 py-[5px] rounded-md text-[12px] font-semibold cursor-pointer border border-brand-border font-[inherit] bg-brand-muted text-brand"
              >
                Buscar
              </button>
            </div>

            {/* Buscar ticker */}
            <input
              type="text"
              placeholder="Buscar ticker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[13px] px-3 py-[5px] rounded-lg border border-border outline-none font-[inherit] text-text1 bg-card w-[140px] focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 760 }}>
            <thead className="sticky top-0 z-10 bg-card">
              <tr>
                <th
                  onClick={() => toggleSort("fecha")}
                  className={`${TH_BASE} text-left pl-5`}
                >
                  Fecha{sortIcon("fecha")}
                </th>
                <th className={`${TH_BASE} text-left`}>Tipo</th>
                <th
                  onClick={() => toggleSort("activo")}
                  className={`${TH_BASE} text-left`}
                >
                  Activo{sortIcon("activo")}
                </th>
                <th className={`${TH_BASE} text-right`}>Cantidad</th>
                <th className={`${TH_BASE} text-right`}>Precio</th>
                <th
                  onClick={() => toggleSort("total")}
                  className={`${TH_BASE} text-right`}
                >
                  Total{sortIcon("total")}
                </th>
                <th className={`${TH_BASE} text-right pr-5`}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((op, i) => {
                const { cls: tipoCls, label: tipoLabel } = getTipoCls(op.tipo);
                const estadoCls = getEstadoCls(op.estado);
                const monedaPrefix = getMonedaPrefix(op.moneda);
                return (
                  <tr
                    key={op.numero}
                    onClick={() => setSelectedNumero(op.numero)}
                    onMouseEnter={() => setHovRow(i)}
                    onMouseLeave={() => setHovRow(null)}
                    className={`cursor-pointer ${hovRow === i ? "bg-rowHover" : "bg-transparent"}`}
                  >
                    <td className={`${TD_LEFT} pl-5 text-text2`}>
                      {fmtFechaHora(op.fechaOrden)}
                    </td>
                    <td className={TD_LEFT}>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] ${tipoCls}`}
                      >
                        {tipoLabel}
                      </span>
                    </td>
                    <td className={TD_LEFT}>
                      <span className="font-bold text-[13px] text-text1">
                        {op.simbolo}
                      </span>
                      <div className="text-[11px] text-text3 mt-px">
                        {op.mercado}
                      </div>
                    </td>
                    <td
                      className={`${TD_BASE} ${isDividendo(op.tipo) ? "text-text3" : ""}`}
                    >
                      {isDividendo(op.tipo)
                        ? "—"
                        : (
                            (op.cantidadOperada || op.cantidad) ??
                            0
                          ).toLocaleString("es-AR")}
                    </td>
                    <td
                      className={`${TD_BASE} ${isDividendo(op.tipo) ? "text-text3" : ""}`}
                    >
                      {isDividendo(op.tipo)
                        ? "—"
                        : fmtPrice(op.precioOperado || op.precio || 0)}
                    </td>
                    <td
                      className={`${TD_BASE} font-bold ${isDividendo(op.tipo) ? "text-profit" : ""}`}
                    >
                      {op.montoOperado || op.monto
                        ? monedaPrefix +
                          Math.abs(
                            op.montoOperado || op.monto || 0,
                          ).toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </td>
                    <td className={`${TD_BASE} pr-5 font-medium ${estadoCls}`}>
                      {op.estado}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-[13px] text-text3"
                  >
                    No hay operaciones para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
