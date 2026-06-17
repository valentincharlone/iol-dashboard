"use client";

import { useState } from "react";
import type { DashboardPosicion } from "@/lib/iol-types";

interface Segment {
  tipo: string;
  label: string;
  value: number;
  color: string;
  pct: number;
}

const TIPO_COLORS: [string, string][] = [
  ["cedear",    "#6366F1"],
  ["accion",    "#F97066"],
  ["bono",      "#14B8A6"],
  ["fci",       "#F59E0B"],
  ["obligacion","#8B5CF6"],
  ["caucion",   "#06B6D4"],
  ["opcion",    "#EC4899"],
];

const TIPO_LABELS: [string, string][] = [
  ["cedear",    "CEDEARs"],
  ["accion",    "Acciones"],
  ["bono",      "Títulos Públicos"],
  ["fci",       "FCI"],
  ["obligacion","O.N."],
  ["caucion",   "Cauciones"],
  ["opcion",    "Opciones"],
];

function getColor(tipo: string) {
  const k = tipo.toLowerCase();
  for (const [m, c] of TIPO_COLORS) if (k.includes(m)) return c;
  return "#6B7280";
}
function getLabel(tipo: string) {
  const k = tipo.toLowerCase();
  for (const [m, l] of TIPO_LABELS) if (k.includes(m)) return l;
  return tipo;
}
function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

interface Props {
  posiciones: DashboardPosicion[];
}

type ChartType = "donut" | "bar";

export function AllocationChart({ posiciones }: Props) {
  const [chartType, setChartType] = useState<ChartType>("donut");

  const byTipo = posiciones.reduce<Record<string, number>>((acc, p) => {
    acc[p.tipo] = (acc[p.tipo] ?? 0) + p.valuacion;
    return acc;
  }, {});

  const total = Object.values(byTipo).reduce((a, b) => a + b, 0);
  const segments: Segment[] = Object.entries(byTipo)
    .map(([tipo, value]) => ({
      tipo, label: getLabel(tipo), value,
      color: getColor(tipo),
      pct: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6,
    border: "none", cursor: "pointer", transition: "all 0.15s",
    background: active ? "#EEF2FF" : "transparent",
    color: active ? "#4338CA" : "var(--text-3)",
    fontFamily: "inherit",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        <button style={btnStyle(chartType === "donut")} onClick={() => setChartType("donut")}>Donut</button>
        <button style={btnStyle(chartType === "bar")}   onClick={() => setChartType("bar")}>Barras</button>
      </div>

      {chartType === "donut"
        ? <DonutChart segments={segments} total={total} />
        : <BarDistribution segments={segments} />
      }
    </div>
  );
}

function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  const size = 190, thickness = 26;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const gap = 5;
  let cumulative = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: "100%", maxWidth: size, aspectRatio: "1" }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {segments.map((seg, i) => {
              const len = (seg.pct / 100) * C;
              const dashLen = Math.max(0, len - gap);
              const dashGap = C - dashLen;
              const offset = -cumulative;
              cumulative += len;
              return (
                <circle key={i}
                  cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke={seg.color} strokeWidth={thickness}
                  strokeDasharray={`${dashLen} ${dashGap}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  style={{ transition: "all 0.5s ease" }}
                />
              );
            })}
          </g>
        </svg>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center", whiteSpace: "nowrap",
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", fontVariantNumeric: "tabular-nums", letterSpacing: -0.5 }}>
            {fmt(total)}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1 }}>
            Títulos
          </div>
        </div>
      </div>
      <Legend segments={segments} />
    </div>
  );
}

function BarDistribution({ segments }: { segments: Segment[] }) {
  const maxPct = Math.max(...segments.map((s) => s.pct));
  const BAR_HEIGHT = 140;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: BAR_HEIGHT + 32, paddingBottom: 0 }}>
        {segments.map((seg) => {
          const barH = maxPct > 0 ? (seg.pct / maxPct) * BAR_HEIGHT : 0;
          return (
            <div key={seg.tipo} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, justifyContent: "flex-end", height: "100%" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: seg.color, fontVariantNumeric: "tabular-nums" }}>
                {seg.pct.toFixed(1)}%
              </span>
              <div style={{
                width: "100%", height: barH, background: seg.color,
                borderRadius: "5px 5px 0 0", transition: "height 0.5s ease",
                opacity: 0.9,
              }} />
              <span style={{
                fontSize: 10, color: "var(--text-3)", fontWeight: 500,
                textAlign: "center", lineHeight: 1.2, maxWidth: "100%",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {seg.label}
              </span>
            </div>
          );
        })}
      </div>
      <Legend segments={segments} />
    </div>
  );
}

function Legend({ segments }: { segments: Segment[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {segments.map((seg) => (
        <div key={seg.tipo} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>{seg.label}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(seg.value)}</span>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontVariantNumeric: "tabular-nums", minWidth: 40, textAlign: "right" }}>
              {seg.pct.toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
