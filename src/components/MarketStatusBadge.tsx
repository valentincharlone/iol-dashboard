"use client";

function isMarketOpen(): boolean {
  // BYMA: lunes–viernes, 11:00–17:00 ART (UTC-3, sin horario de verano)
  const now = new Date();
  const art = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  );
  const day = art.getDay();
  const minutes = art.getHours() * 60 + art.getMinutes();
  if (day === 0 || day === 6) return false;
  return minutes >= 11 * 60 && minutes < 17 * 60;
}

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
