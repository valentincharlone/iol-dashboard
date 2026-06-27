"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fmtPrice } from "@/lib/fmt";

type Periodo = "1S" | "1M" | "3M" | "6M" | "1A";

interface DataPoint {
  fechaHora: string;
  ultimoPrecio: number;
  apertura: number;
  maximo: number;
  minimo: number;
  variacion: number;
}

const PERIODOS: Periodo[] = ["1S", "1M", "3M", "6M", "1A"];

function fmtEje(fechaHora: string, periodo: Periodo): string {
  const d = new Date(fechaHora);
  if (periodo === "1S") {
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });
  }
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function fmtTooltipFecha(fechaHora: string): string {
  return new Date(fechaHora).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-[10px] shadow-md px-3 py-2.5 text-[12px]">
      <div className="text-text3 mb-1">{fmtTooltipFecha(d.fechaHora)}</div>
      <div className="font-bold text-text1">{fmtPrice(d.ultimoPrecio)}</div>
      <div
        className={`text-[11px] mt-0.5 ${d.variacion >= 0 ? "text-profit" : "text-loss"}`}
      >
        {d.variacion >= 0 ? "+" : ""}
        {d.variacion.toFixed(2)}%
      </div>
    </div>
  );
}

interface Props {
  ticker: string;
  mercado: string;
}

export function PriceChart({ ticker, mercado }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>("1M");
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const ajustada = "sinAjustar";
    fetch(
      `/api/historico/${encodeURIComponent(ticker)}?periodo=${periodo}&mercado=${mercado}&ajustada=${ajustada}`,
    )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: DataPoint[]) => {
        const sorted = [...(Array.isArray(d) ? d : [])].sort(
          (a, b) =>
            new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime(),
        );
        // Para períodos ≥ 1M la API mezcla barras diarias con intradía en fechas recientes.
        // Deduplica a un punto por día (el último = precio más reciente del día).
        const points =
          periodo === "1S"
            ? sorted
            : (() => {
                const byDate = new Map<string, DataPoint>();
                for (const p of sorted) {
                  byDate.set(p.fechaHora.split("T")[0], p);
                }
                return Array.from(byDate.values());
              })();
        setData(points);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [ticker, mercado, periodo]);

  const isPositive =
    data.length >= 2
      ? data[data.length - 1].ultimoPrecio >= data[0].ultimoPrecio
      : true;

  const color = isPositive ? "#34D399" : "#F87171";
  const gradientId = `grad-${ticker}`;

  const yMin = data.length
    ? Math.min(...data.map((d) => d.ultimoPrecio)) * 0.995
    : 0;
  const yMax = data.length
    ? Math.max(...data.map((d) => d.ultimoPrecio)) * 1.005
    : 100;

  const Y_TICKS = 7;
  const yTicks = Array.from({ length: Y_TICKS }, (_, i) =>
    yMin + (yMax - yMin) * (i / (Y_TICKS - 1)),
  );

  return (
    <div>
      {/* Selector de período */}
      <div className="flex gap-1 mb-4">
        {PERIODOS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`px-2.5 py-1 rounded-md text-[12px] font-semibold transition-colors ${
              periodo === p
                ? "bg-brand-muted text-brand"
                : "text-text3 hover:text-text2"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      <div className="h-[300px]">
        {loading ? (
          <div className="h-full shimmer rounded-lg" />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-[13px] text-text3">
            No se pudieron cargar los datos históricos.
          </div>
        ) : data.length < 2 ? (
          <div className="h-full flex items-center justify-center text-[13px] text-text3">
            Sin datos para el período seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-light)"
                vertical={false}
              />
              <XAxis
                dataKey="fechaHora"
                tickFormatter={(v) => fmtEje(v, periodo)}
                tick={{ fontSize: 11, fill: "var(--text-3)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                domain={[yMin, yMax]}
                ticks={yTicks}
                tick={{ fontSize: 11, fill: "var(--text-3)" }}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={(v) =>
                  "$" + v.toLocaleString("es-AR", { maximumFractionDigits: 0 })
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ultimoPrecio"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
