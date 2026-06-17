"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { DashboardPosicion } from "@/lib/iol-types";

interface Props {
  posiciones: DashboardPosicion[];
}

export function PnLChart({ posiciones }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = posiciones.map((p) => ({
    ticker: p.ticker,
    pnl: parseFloat(p.pnlPorcentaje.toFixed(2)),
    pnlPesos: p.pnlPesos,
  }));

  const chartHeight = Math.max(posiciones.length * 34 + 40, 180);

  if (!mounted) return <div style={{ height: chartHeight }} />;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 52, left: 0, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1e293b"
          horizontal={false}
        />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "#475569" }}
          tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="ticker"
          width={58}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <ReferenceLine x={0} stroke="#334155" strokeWidth={1} />
        <Tooltip
          formatter={(value: number) => {
            const sign = (value as number) >= 0 ? "+" : "";
            return [`${sign}${(value as number).toFixed(2)}%`, "P&L"];
          }}
          contentStyle={{
            fontSize: 12,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            color: "#f1f5f9",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        />
        <Bar dataKey="pnl" radius={[0, 3, 3, 0]} maxBarSize={18}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
