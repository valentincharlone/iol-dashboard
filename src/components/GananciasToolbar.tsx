"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PERIODOS = [
  { label: "1 mes",   days: 30  },
  { label: "3 meses", days: 90  },
  { label: "6 meses", days: 180 },
  { label: "1 año",   days: 365 },
  { label: "Todo",    days: 0   },
];

function toDateInput(d: Date) {
  return d.toISOString().split("T")[0];
}

function btnCls(active: boolean) {
  return `px-3.5 py-[5px] rounded-md text-[12px] font-medium cursor-pointer border font-[inherit] transition-colors ${
    active
      ? "bg-brand-muted text-brand border-[#C7D2FE]"
      : "bg-white text-text2 border-border hover:bg-[#F5F6FA]"
  }`;
}

interface Props {
  defaultDesde: string;
  defaultHasta: string;
}

export function GananciasToolbar({ defaultDesde, defaultHasta }: Props) {
  const router = useRouter();
  const [desde, setDesde] = useState(defaultDesde);
  const [hasta, setHasta] = useState(defaultHasta);
  const [activePeriod, setActivePeriod] = useState<number | null>(null);

  function applyPeriod(idx: number) {
    setActivePeriod(idx);
    const { days } = PERIODOS[idx];
    const newDesde = days === 0 ? "" : toDateInput(new Date(Date.now() - days * 86_400_000));
    const newHasta = toDateInput(new Date());
    setDesde(newDesde);
    setHasta(newHasta);
    const params = new URLSearchParams();
    if (newDesde) params.set("desde", newDesde);
    if (newHasta) params.set("hasta", newHasta);
    router.push(`/dashboard/ganancias?${params.toString()}`);
  }

  function buscar() {
    setActivePeriod(null);
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    router.push(`/dashboard/ganancias?${params.toString()}`);
  }

  const dateCls =
    "text-[12px] px-2 py-[5px] rounded-lg border border-border outline-none font-[inherit] text-text1 focus:border-brand transition-colors";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Períodos rápidos */}
      <div className="flex gap-1">
        {PERIODOS.map((p, idx) => (
          <button key={p.label} onClick={() => applyPeriod(idx)} className={btnCls(activePeriod === idx)}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Rango manual */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          className={dateCls}
        />
        <span className="text-[12px] text-text3">—</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          className={dateCls}
        />
        <button
          onClick={buscar}
          className="px-3.5 py-[5px] rounded-md text-[12px] font-semibold cursor-pointer border border-[#C7D2FE] font-[inherit] bg-brand-muted text-brand"
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
