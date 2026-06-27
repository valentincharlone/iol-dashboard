"use client";

import { isMarketOpen } from "@/lib/market";

export function MarketStatusBadge() {
  const open = isMarketOpen();

  if (open) {
    return (
      <span className="inline-flex items-center gap-1.5 text-profit text-[13px] font-semibold shrink-0">
        <span className="w-2 h-2 rounded-full bg-profit-subtle shadow-[0_0_0_3px_rgba(16,185,129,0.2)] animate-[livePulse_2s_ease-in-out_infinite] inline-block" />
        En vivo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-text3 text-[13px] font-semibold shrink-0">
      <span className="w-2 h-2 rounded-full bg-text3/40 inline-block" />
      Cerrado
    </span>
  );
}
