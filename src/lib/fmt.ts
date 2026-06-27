export function fmtMoney(n: number) {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

export function fmtUSD(n: number) {
  return (
    "US$" +
    n.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function fmtPct(n: number) {
  return (
    (n >= 0 ? "+" : "-") +
    Math.abs(n).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    "%"
  );
}

export function fmtPrice(n: number): string {
  return (
    "$" +
    n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export function fmtFecha(iso: string): string {
  try {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

export function fmtFechaHora(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

export function toDateInput(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function getMonedaPrefix(moneda?: string | null): string {
  return moneda?.toLowerCase().includes("dolar") ? "US$" : "$";
}

export function fmtDateStr(s: string): string {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
