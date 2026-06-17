"use client";

import { useState, useMemo } from "react";
import type { CotizacionItem } from "@/lib/iol-types";

interface Props {
  items: CotizacionItem[];
}

const TIPO_BADGE: Record<string, { bg: string; text: string }> = {
  cedear: { bg: "#EEF2FF", text: "#4338CA" },
  accion: { bg: "#FFF7ED", text: "#C2410C" },
  bono: { bg: "#F0FDFA", text: "#0D9488" },
  fci: { bg: "#FFFBEB", text: "#92400E" },
  obligacion: { bg: "#F5F3FF", text: "#6D28D9" },
  caucion: { bg: "#ECFEFF", text: "#0E7490" },
  opcion: { bg: "#FDF2F8", text: "#9D174D" },
};

function getBadge(tipo: string) {
  const key = tipo.toLowerCase();
  for (const [match, style] of Object.entries(TIPO_BADGE)) {
    if (key.includes(match)) return style;
  }
  return { bg: "#F0F2F8", text: "#6E7191" };
}

function tipoLabel(tipo: string): string {
  const key = tipo.toLowerCase();
  if (key.includes("cedear")) return "CEDEAR";
  if (key.includes("accion")) return "Acción";
  if (key.includes("bono")) return "Bono";
  if (key.includes("fci")) return "FCI";
  if (key.includes("obligacion")) return "O.N.";
  if (key.includes("caucion")) return "Cauciones";
  if (key.includes("opcion")) return "Opción";
  return tipo;
}

function fmtMoney(n: number) {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

function fmtPct(n: number) {
  return (
    (n >= 0 ? "+" : "") +
    Math.abs(n).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    "%"
  );
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

const COLUMNS: { key: SortKey; label: string; align?: "left" }[] = [
  { key: "ticker", label: "Activo", align: "left" },
  { key: "precio", label: "Precio" },
  { key: "variacion", label: "Var % hoy" },
  { key: "apertura", label: "Apertura" },
  { key: "maximo", label: "Máx" },
  { key: "minimo", label: "Mín" },
  { key: "volumen", label: "Volumen" },
  { key: "monto", label: "Monto op." },
];

const TH: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "var(--text-3)",
  textTransform: "uppercase",
  letterSpacing: 0.6,
  padding: "10px 12px",
  borderBottom: "1px solid var(--border)",
  textAlign: "right",
  whiteSpace: "nowrap",
  userSelect: "none",
  cursor: "pointer",
};

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

  function sortIndicator(key: SortKey) {
    if (sort.key !== key) return " ↕";
    return sort.dir === "desc" ? " ↓" : " ↑";
  }

  const tdBase: React.CSSProperties = {
    padding: "12px 12px",
    borderBottom: "1px solid #F5F7FB",
    fontSize: 13,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid var(--border-light)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        overflow: "clip",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}
          >
            Cotizaciones
          </span>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            {sorted.length} instrumentos
          </span>
        </div>
        <input
          type="text"
          placeholder="Buscar ticker o nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            fontSize: 13,
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            outline: "none",
            fontFamily: "inherit",
            color: "var(--text-1)",
            width: 220,
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}
        >
          <thead
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "white",
            }}
          >
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    ...TH,
                    textAlign: col.align ?? "right",
                    paddingLeft: col.align === "left" ? 20 : 12,
                  }}
                >
                  {col.label}
                  {sortIndicator(col.key)}
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
                  style={{
                    background: hovRow === i ? "#FAFBFE" : "transparent",
                  }}
                >
                  <td style={{ ...tdBase, textAlign: "left", paddingLeft: 20 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "var(--text-1)",
                        }}
                      >
                        {item.ticker}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: badge.bg,
                          color: badge.text,
                          letterSpacing: 0.3,
                        }}
                      >
                        {tipoLabel(item.tipo)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-3)",
                        marginTop: 1,
                      }}
                    >
                      {item.nombre.length > 30
                        ? item.nombre.slice(0, 30) + "…"
                        : item.nombre}
                    </div>
                  </td>
                  <td style={{ ...tdBase, fontWeight: 700 }}>
                    {fmtMoney(item.precio)}
                  </td>
                  <td style={tdBase}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: pos ? "#059669" : "#EF4444",
                      }}
                    >
                      {fmtPct(item.variacionPorcentual)}
                    </span>
                  </td>
                  <td style={{ ...tdBase, color: "var(--text-2)" }}>
                    {fmtMoney(item.apertura)}
                  </td>
                  <td style={{ ...tdBase, color: "#059669" }}>
                    {fmtMoney(item.maximo)}
                  </td>
                  <td style={{ ...tdBase, color: "#EF4444" }}>
                    {fmtMoney(item.minimo)}
                  </td>
                  <td style={{ ...tdBase, color: "var(--text-2)" }}>
                    {fmtVol(item.volumenNominal)}
                  </td>
                  <td
                    style={{
                      ...tdBase,
                      paddingRight: 20,
                      color: "var(--text-2)",
                    }}
                  >
                    {fmtMoney(item.montoOperado)}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--text-3)",
                  }}
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
