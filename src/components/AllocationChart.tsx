"use client";

import type { DashboardPosicion } from "@/lib/iol-types";
import { fmtMoney } from "@/lib/fmt";
import { SECTORES, getSector, type Sector } from "@/lib/sectores";

interface Segment {
  sector: Sector;
  label: string;
  value: number;
  color: string;
  pct: number;
}

export function AllocationChart({
  posiciones,
}: {
  posiciones: DashboardPosicion[];
}) {
  const bySector = posiciones.reduce<Partial<Record<Sector, number>>>((acc, p) => {
    const s = getSector(p.ticker, p.tipo);
    acc[s] = (acc[s] ?? 0) + p.valuacion;
    return acc;
  }, {});

  const sinClasificar = posiciones
    .filter((p) => getSector(p.ticker, p.tipo) === "otro")
    .map((p) => p.ticker);

  const total = Object.values(bySector).reduce((a, b) => a + b, 0);
  const segments: Segment[] = (Object.entries(bySector) as [Sector, number][])
    .map(([sector, value]) => ({
      sector,
      label: SECTORES[sector].label,
      value,
      color: SECTORES[sector].color,
      pct: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <DonutChart segments={segments} total={total} />

      {sinClasificar.length > 0 && (
        <p className="text-[11px] text-text3 mt-3 leading-snug">
          Sin clasificar: {sinClasificar.join(", ")}
        </p>
      )}
    </>
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
            {fmtMoney(total)}
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

function Legend({ segments }: { segments: Segment[] }) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {segments.map((seg) => (
        <div key={seg.sector} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-[3px] shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-[13px] text-text2">{seg.label}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold tabular-nums">
              {fmtMoney(seg.value)}
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
