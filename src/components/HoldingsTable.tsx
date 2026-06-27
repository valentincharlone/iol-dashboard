"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DashboardPosicion } from "@/lib/iol-types";
import { fmtMoney, fmtPct } from "@/lib/fmt";
import { getBadge, tipoLabel, tipoKey } from "@/lib/instrument";

interface Props {
  posiciones: DashboardPosicion[];
  totalValuacion: number;
  limit?: number;
}

type Density = "compact" | "normal" | "spacious";
type SortBy =
  | "name"
  | "cantidad"
  | "precio"
  | "costo"
  | "valuacion"
  | "pnl"
  | "hoy"
  | "peso";
type SortDir = "asc" | "desc";
type ColKey =
  | "cantidad"
  | "precio"
  | "costo"
  | "valuacion"
  | "pnl"
  | "hoy"
  | "peso";

const ALL_COLS: { key: ColKey; label: string }[] = [
  { key: "cantidad", label: "Cant." },
  { key: "precio", label: "Precio" },
  { key: "costo", label: "Costo" },
  { key: "valuacion", label: "Valuación" },
  { key: "pnl", label: "P&L" },
  { key: "hoy", label: "Hoy" },
  { key: "peso", label: "Peso" },
];

const DENSITY_PY: Record<Density, string> = {
  compact: "py-1.5",
  normal: "py-3",
  spacious: "py-[18px]",
};

export function HoldingsTable({ posiciones, totalValuacion, limit }: Props) {
  const router = useRouter();
  const [density, setDensity] = useState<Density>("normal");
  const [sortBy, setSortBy] = useState<SortBy>("valuacion");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [hovRow, setHovRow] = useState<number | null>(null);
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(
    new Set<ColKey>([
      "cantidad",
      "precio",
      "costo",
      "valuacion",
      "pnl",
      "hoy",
      "peso",
    ]),
  );
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  const availableTipos = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of posiciones) {
      const k = tipoKey(p.tipo);
      if (!seen.has(k)) seen.set(k, tipoLabel(p.tipo));
    }
    return Array.from(seen.entries());
  }, [posiciones]);

  useEffect(() => {
    if (!colsOpen) return;
    function handleClick(e: MouseEvent) {
      if (colsRef.current && !colsRef.current.contains(e.target as Node))
        setColsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [colsOpen]);

  function toggleSort(col: SortBy) {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  }
  function toggleCol(key: ColKey) {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const col = (key: ColKey) => visibleCols.has(key);

  const sorted = useMemo(() => {
    const arr = [...posiciones];
    const mul = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return mul * a.ticker.localeCompare(b.ticker);
        case "cantidad":
          return mul * (a.cantidad - b.cantidad);
        case "precio":
          return mul * (a.precioActual - b.precioActual);
        case "costo":
          return mul * (a.ppc - b.ppc);
        case "valuacion":
          return mul * (a.valuacion - b.valuacion);
        case "pnl":
          return mul * (a.pnlPorcentaje - b.pnlPorcentaje);
        case "hoy":
          return mul * (a.variacionDiaria - b.variacionDiaria);
        case "peso":
          return mul * (a.valuacion - b.valuacion);
        default:
          return 0;
      }
    });
    return arr;
  }, [posiciones, sortBy, sortDir]);

  const filtered = useMemo(
    () =>
      filterTipo === "all"
        ? sorted
        : sorted.filter((p) => tipoKey(p.tipo) === filterTipo),
    [sorted, filterTipo],
  );

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  const maxWeight =
    posiciones.length > 0
      ? Math.max(
          ...posiciones.map((p) =>
            totalValuacion > 0 ? (p.valuacion / totalValuacion) * 100 : 0,
          ),
        )
      : 0;

  const tdCls = `${DENSITY_PY[density]} px-2.5 border-b border-border-light text-[13px] tabular-nums text-right whitespace-nowrap transition-[padding] duration-200`;
  const tdClsLeft = `${DENSITY_PY[density]} px-2.5 border-b border-border-light text-[13px] tabular-nums text-left  whitespace-nowrap transition-[padding] duration-200`;

  const densityBtn = (d: Density, label: string) => (
    <button
      key={d}
      onClick={() => setDensity(d)}
      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
        density === d
          ? "bg-brand-muted text-brand border-brand-border"
          : "bg-card text-text3 border-border hover:bg-surface2"
      }`}
    >
      {label}
    </button>
  );

  const thSort = (
    key: SortBy,
    label: string,
    extra = "",
    align: "left" | "right" = "right",
  ) => (
    <th
      onClick={() => toggleSort(key)}
      className={`text-[10px] font-semibold text-text3 uppercase tracking-[0.6px] py-2.5 px-2.5 border-b border-border ${align === "left" ? "text-left" : "text-right"} whitespace-nowrap cursor-pointer select-none ${extra}`}
    >
      {label}
      <span
        className={`ml-0.5 ${sortBy === key ? "opacity-100" : "opacity-30"}`}
      >
        {sortBy === key ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
      </span>
    </th>
  );

  return (
    <>
      <div className="bg-card rounded-card shadow-sm overflow-clip">
        {/* Toolbar */}
        <div className="border-b border-border-light">
          <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-text1">
                Holdings
              </span>
              <span className="text-[12px] text-text3">
                {filterTipo !== "all"
                  ? `${filtered.length} / ${posiciones.length} posiciones`
                  : `${posiciones.length} posiciones`}
              </span>
            </div>

            {limit ? (
              <Link
                href="/dashboard/holdings"
                className="text-[13px] font-medium text-brand hover:underline"
              >
                Ver todos →
              </Link>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1">
                  {densityBtn("compact", "C")}
                  {densityBtn("normal", "N")}
                  {densityBtn("spacious", "S")}
                </div>

                {/* Columnas dropdown */}
                <div ref={colsRef} className="relative">
                  <button
                    onClick={() => setColsOpen((o) => !o)}
                    className={`px-2.5 py-1 rounded text-[12px] font-medium border transition-colors ${
                      colsOpen
                        ? "bg-brand-muted text-brand border-brand-border"
                        : "bg-card text-text2 border-border hover:bg-surface2"
                    }`}
                  >
                    Columnas ▾
                  </button>
                  {colsOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] z-50 bg-card border border-border rounded-[10px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-2 px-1 min-w-[140px]">
                      {ALL_COLS.map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-md text-[13px] text-text1 hover:bg-surface2"
                        >
                          <input
                            type="checkbox"
                            checked={visibleCols.has(key)}
                            onChange={() => toggleCol(key)}
                            className="w-3.5 h-3.5 cursor-pointer accent-[#6366F1]"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filter pills */}
          {!limit && availableTipos.length > 1 && (
            <div className="flex items-center gap-1.5 px-5 pt-1 pb-3 flex-wrap">
              <button
                onClick={() => setFilterTipo("all")}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                  filterTipo === "all"
                    ? "bg-brand-muted text-brand border-brand-border"
                    : "bg-card text-text3 border-border hover:bg-surface2"
                }`}
              >
                Todos
              </button>
              {availableTipos.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterTipo(key)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors ${
                    filterTipo === key
                      ? "bg-brand-muted text-brand border-brand-border"
                      : "bg-card text-text3 border-border hover:bg-surface2"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 760 }}>
            <thead className="sticky top-0 z-10 bg-card">
              <tr>
                {thSort("name", "Activo", "pl-5 w-[22%]", "left")}
                {col("cantidad") && thSort("cantidad", "Cant.")}
                {col("precio") && thSort("precio", "Precio")}
                {col("costo") && thSort("costo", "Costo")}
                {col("valuacion") && thSort("valuacion", "Valuación")}
                {col("pnl") && thSort("pnl", "P&L")}
                {col("hoy") && thSort("hoy", "Hoy")}
                {col("peso") && thSort("peso", "Peso", "pr-5")}
              </tr>
            </thead>
            <tbody>
              {displayed.map((p, i) => {
                const peso =
                  totalValuacion > 0 ? (p.valuacion / totalValuacion) * 100 : 0;
                const isPos = p.pnlPorcentaje >= 0;
                const hoyPos = p.variacionDiaria >= 0;
                const badge = getBadge(p.tipo);
                return (
                  <tr
                    key={p.ticker}
                    onMouseEnter={() => setHovRow(i)}
                    onMouseLeave={() => setHovRow(null)}
                    onClick={() =>
                      router.push(
                        `/dashboard/holdings/${encodeURIComponent(p.ticker)}`,
                      )
                    }
                    className={`cursor-pointer ${hovRow === i ? "bg-rowHover" : "bg-transparent"}`}
                  >
                    <td className={`${tdClsLeft} pl-5`}>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[13px] text-text1">
                              {p.ticker}
                            </span>
                            <span
                              className="text-[9px] font-semibold px-1 py-px rounded-[3px] tracking-[0.3px]"
                              style={{
                                background: badge.bg,
                                color: badge.text,
                              }}
                            >
                              {tipoLabel(p.tipo)}
                            </span>
                          </div>
                          <div className="text-[11px] text-text3 mt-px">
                            {p.nombre}
                          </div>
                        </div>
                      </div>
                    </td>

                    {col("cantidad") && (
                      <td className={tdCls}>
                        {p.cantidad.toLocaleString("es-AR")}
                      </td>
                    )}
                    {col("precio") && (
                      <td className={tdCls}>{fmtMoney(p.precioActual)}</td>
                    )}
                    {col("costo") && (
                      <td className={`${tdCls} text-text3`}>
                        {fmtMoney(p.ppc)}
                      </td>
                    )}
                    {col("valuacion") && (
                      <td className={`${tdCls} font-bold`}>
                        {fmtMoney(p.valuacion)}
                      </td>
                    )}

                    {col("pnl") && (
                      <td className={tdCls}>
                        <div
                          className={`font-semibold ${isPos ? "text-profit" : "text-loss"}`}
                        >
                          {fmtPct(p.pnlPorcentaje)}
                        </div>
                        <div
                          className={`text-[10px] opacity-80 ${isPos ? "text-profit" : "text-loss"}`}
                        >
                          {p.pnlPesos >= 0 ? "+" : ""}
                          {fmtMoney(p.pnlPesos)}
                        </div>
                      </td>
                    )}

                    {col("hoy") && (
                      <td className={tdCls}>
                        <span
                          className={`font-semibold text-[12px] ${hoyPos ? "text-profit" : "text-loss"}`}
                        >
                          {fmtPct(p.variacionDiaria)}
                        </span>
                      </td>
                    )}

                    {col("peso") && (
                      <td className={`${tdCls} pr-5`}>
                        <div className="font-medium text-[12px]">
                          {peso.toFixed(1)}%
                        </div>
                        <div className="h-[3px] rounded-sm bg-brand-muted mt-0.5 w-14">
                          <div
                            className="h-full rounded-sm bg-brand-light transition-[width] duration-300"
                            style={{
                              width:
                                (maxWeight > 0 ? (peso / maxWeight) * 100 : 0) +
                                "%",
                            }}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
