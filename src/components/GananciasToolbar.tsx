"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PERIODOS_GANANCIAS } from "@/lib/dates";
import { toDateInput } from "@/lib/fmt";
import { filterBtnCls, DATE_INPUT_CLS } from "@/lib/ui";

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
    const { days } = PERIODOS_GANANCIAS[idx];
    const newDesde =
      days === 0 ? "" : toDateInput(new Date(Date.now() - days * 86_400_000));
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

  return (
    <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
      {/* Períodos rápidos */}
      <div className="flex flex-wrap gap-1">
        {PERIODOS_GANANCIAS.map((p, idx) => (
          <button
            key={p.label}
            onClick={() => applyPeriod(idx)}
            className={filterBtnCls(activePeriod === idx)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Rango manual */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-1.5 w-full sm:w-auto">
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          className={`${DATE_INPUT_CLS} flex-1 min-w-[115px] sm:flex-none`}
        />
        <span className="text-[12px] text-text3">—</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          className={`${DATE_INPUT_CLS} flex-1 min-w-[115px] sm:flex-none`}
        />
        <button
          onClick={buscar}
          className="w-full sm:w-auto px-3.5 py-[5px] rounded-md text-[12px] font-semibold cursor-pointer border border-brand-border font-[inherit] bg-brand-muted text-brand"
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
