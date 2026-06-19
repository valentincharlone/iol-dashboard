import { getMarketStrip } from "@/lib/iol-actions";
import { fmtPct } from "@/lib/fmt";

export async function MarketStrip() {
  const items = await getMarketStrip();
  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map((item, i) => {
        const positive = (item.variacion ?? 0) >= 0;
        const varColor =
          item.variacion === null
            ? "text-text3"
            : positive
              ? "text-profit"
              : "text-loss";
        const precio = "$" + Math.round(item.precio).toLocaleString("es-AR");

        return (
          <span key={item.label} className="flex items-center gap-1.5 text-[12px]">
            {i > 0 && (
              <span className="text-text3/40 select-none">·</span>
            )}
            <span className="text-text3 font-medium">{item.label}</span>
            <span className="text-text1 font-semibold tabular-nums">{precio}</span>
            {item.variacion !== null && (
              <span className={`font-semibold tabular-nums ${varColor}`}>
                {fmtPct(item.variacion)}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
