"use client";

import { useState } from "react";
import type { DashboardPosicion } from "@/lib/iol-types";
import { fmtMoney } from "@/lib/fmt";
import { getTipoColor, getTipoLegendLabel } from "@/lib/instrument";
import { Private } from "./Private";

interface Segment {
  tipo: string;
  label: string;
  value: number;
  color: string;
  pct: number;
}

type ChartType = "donut" | "bar";

export function AllocationChart({
  posiciones,
}: {
  posiciones: DashboardPosicion[];
}) {
  const [chartType, setChartType] = useState<ChartType>("donut");

  const byTipo = posiciones.reduce<Record<string, number>>((acc, p) => {
    acc[p.tipo] = (acc[p.tipo] ?? 0) + p.valuacion;
    return acc;
  }, {});

  const total = Object.values(byTipo).reduce((a, b) => a + b, 0);
  const segments: Segment[] = Object.entries(byTipo)
    .map(([tipo, value]) => ({
      tipo,
      label: getTipoLegendLabel(tipo),
      value,
      color: getTipoColor(tipo),
      pct: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <div className="flex gap-1 mb-4">
        {(["donut", "bar"] as ChartType[]).map((t) => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border-none cursor-pointer transition-all font-[inherit] ${
              chartType === t
                ? "bg-brand-muted text-brand"
                : "bg-transparent text-text3 hover:text-text2"
            }`}
          >
            {t === "donut" ? "Donut" : "Barras"}
          </button>
        ))}
      </div>

      {chartType === "donut" ? (
        <DonutChart segments={segments} total={total} />
      ) : (
        <BarDistribution segments={segments} />
      )}
    </div>
  );
}

function DonutChart({
  segments,
  total,
}: {
  segments: Segment[];
  total: number;
}) {
  const size = 190,
    thickness = 26;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const gap = 5;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-full aspect-square max-w-[190px]">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {segments.map((seg, i) => {
              const len = (seg.pct / 100) * C;
              const dashLen = Math.max(0, len - gap);
              const dashGap = C - dashLen;
              const offset = -cumulative;
              cumulative += len;
              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${dashLen} ${dashGap}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  className="transition-all duration-500 ease-in-out"
                />
              );
            })}
          </g>
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap">
          <div className="text-[20px] font-bold text-text1 tabular-nums tracking-tight">
            <Private>{fmtMoney(total)}</Private>
          </div>
          <div className="text-[11px] font-medium text-text3 uppercase tracking-widest mt-0.5">
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
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2" style={{ height: BAR_HEIGHT + 32 }}>
        {segments.map((seg) => {
          const barH = maxPct > 0 ? (seg.pct / maxPct) * BAR_HEIGHT : 0;
          return (
            <div
              key={seg.tipo}
              className="flex-1 flex flex-col items-center gap-1.5 justify-end h-full"
            >
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: seg.color }}
              >
                {seg.pct.toFixed(1)}%
              </span>
              <div
                className="w-full rounded-t-[5px] opacity-90 transition-[height] duration-500"
                style={{ height: barH, background: seg.color }}
              />
              <span className="text-[10px] text-text3 font-medium text-center leading-tight w-full truncate">
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
    <div className="flex flex-col gap-2.5 w-full">
      {segments.map((seg) => (
        <div key={seg.tipo} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-[3px] shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-[13px] text-text2">{seg.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold tabular-nums">
              <Private>{fmtMoney(seg.value)}</Private>
            </span>
            <span className="text-[12px] text-text3 tabular-nums min-w-[40px] text-right">
              {seg.pct.toFixed(1)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
