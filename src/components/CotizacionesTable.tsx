"use client";

import { useState, useMemo } from "react";
import type { CotizacionItem } from "@/lib/iol-types";
import { fmtMoney, fmtPct } from "@/lib/fmt";
import { getBadge, tipoLabel } from "@/lib/instrument";
import { TH_BASE, TD_BASE } from "@/lib/ui";

interface Props {
  items: CotizacionItem[];
}

function fmtVol(n: number) {
  if (n >= 1_000_000)
    return (
      (n / 1_000_000).toLocaleString("es-AR", { maximumFractionDigits: 1 }) +
      "M"
    );
  if (n >= 1_000)
    return (
      (n / 1_000).toLocaleString("es-AR", { maximumFractionDigits: 1 }) + "K"
    );
  return n.toLocaleString("es-AR");
}

type SortKey =
  | "ticker"
  | "precio"
  | "variacion"
  | "apertura"
  | "maximo"
  | "minimo"
  | "volumen"
  | "monto";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; left?: true }[] = [
  { key: "ticker", label: "Activo", left: true },
  { key: "precio", label: "Precio" },
  { key: "variacion", label: "Var % hoy" },
  { key: "apertura", label: "Apertura" },
  { key: "maximo", label: "Máx" },
  { key: "minimo", label: "Mín" },
  { key: "volumen", label: "Volumen" },
  { key: "monto", label: "Monto op." },
];


export function CotizacionesTable({ items }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "variacion",
    dir: "desc",
  });
  const [search, setSearch] = useState("");
  const [hovRow, setHovRow] = useState<number | null>(null);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { key, dir: "desc" },
    );
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        !q ||
        i.ticker.toLowerCase().includes(q) ||
        i.nombre.toLowerCase().includes(q),
    );
  }, [items, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const { key, dir } = sort;
    arr.sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (key) {
        case "ticker":
          va = a.ticker;
          vb = b.ticker;
          break;
        case "precio":
          va = a.precio;
          vb = b.precio;
          break;
        case "variacion":
          va = a.variacionPorcentual;
          vb = b.variacionPorcentual;
          break;
        case "apertura":
          va = a.apertura;
          vb = b.apertura;
          break;
        case "maximo":
          va = a.maximo;
          vb = b.maximo;
          break;
        case "minimo":
          va = a.minimo;
          vb = b.minimo;
          break;
        case "volumen":
          va = a.volumenNominal;
          vb = b.volumenNominal;
          break;
        case "monto":
          va = a.montoOperado;
          vb = b.montoOperado;
          break;
      }
      if (typeof va === "string")
        return dir === "asc"
          ? va.localeCompare(vb as string)
          : (vb as string).localeCompare(va);
      return dir === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });
    return arr;
  }, [filtered, sort]);

  function sortIcon(key: SortKey) {
    if (sort.key !== key) return <span className="ml-0.5 opacity-30">↕</span>;
    return <span className="ml-0.5">{sort.dir === "desc" ? "↓" : "↑"}</span>;
  }

  return (
    <div className="bg-card rounded-card shadow-sm overflow-clip">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-text1">
            Cotizaciones
          </span>
          <span className="text-[12px] text-text3">
            {sorted.length} instrumentos
          </span>
        </div>
        <input
          type="text"
          placeholder="Buscar ticker o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-[13px] px-3 py-1.5 rounded-lg border border-border outline-none font-[inherit] text-text1 bg-card w-[220px] focus:border-brand transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 820 }}>
          <thead className="sticky top-0 z-10 bg-card">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={`${TH_BASE} ${col.left ? "text-left pl-5" : "text-right"}`}
                >
                  {col.label}
                  {sortIcon(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => {
              const pos = item.variacionPorcentual >= 0;
              const badge = getBadge(item.tipo);
              return (
                <tr
                  key={item.ticker}
                  onMouseEnter={() => setHovRow(i)}
                  onMouseLeave={() => setHovRow(null)}
                  className={hovRow === i ? "bg-rowHover" : "bg-transparent"}
                >
                  <td className={`${TD_BASE} text-left pl-5`}>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[13px] text-text1">
                        {item.ticker}
                      </span>
                      <span
                        className="text-[9px] font-semibold px-[5px] py-px rounded-[3px] tracking-[0.3px]"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {tipoLabel(item.tipo)}
                      </span>
                    </div>
                    <div className="text-[11px] text-text3 mt-px truncate max-w-[200px] text-left">
                      {item.nombre}
                    </div>
                  </td>
                  <td className={`${TD_BASE} font-bold`}>
                    {fmtMoney(item.precio)}
                  </td>
                  <td className={TD_BASE}>
                    <span
                      className={`font-semibold ${pos ? "text-profit" : "text-loss"}`}
                    >
                      {fmtPct(item.variacionPorcentual)}
                    </span>
                  </td>
                  <td className={`${TD_BASE} text-text2`}>
                    {fmtMoney(item.apertura)}
                  </td>
                  <td className={`${TD_BASE} text-profit`}>
                    {fmtMoney(item.maximo)}
                  </td>
                  <td className={`${TD_BASE} text-loss`}>
                    {fmtMoney(item.minimo)}
                  </td>
                  <td className={`${TD_BASE} text-text2`}>
                    {fmtVol(item.volumenNominal)}
                  </td>
                  <td className={`${TD_BASE} text-text2 pr-5`}>
                    {fmtMoney(item.montoOperado)}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-[13px] text-text3"
                >
                  No se encontraron instrumentos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
