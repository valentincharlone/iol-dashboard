export function fmtMoney(n: number) {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

export function fmtMoneySigned(n: number) {
  return (n >= 0 ? "+" : "-") + fmtMoney(Math.abs(n));
}

export function fmtUSDSigned(n: number) {
  return (
    (n >= 0 ? "+" : "-") +
    "US$" +
    Math.round(Math.abs(n)).toLocaleString("es-AR")
  );
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

/** Años, meses y días completos transcurridos desde una fecha. */
function antiguedadDe(iso: string, hasta: Date) {
  const desde = new Date(iso);
  if (Number.isNaN(desde.getTime())) return null;
  if (desde >= hasta) return { anios: 0, meses: 0, dias: 0 };

  let anios = hasta.getFullYear() - desde.getFullYear();
  let meses = hasta.getMonth() - desde.getMonth();
  if (hasta.getDate() < desde.getDate()) meses--;
  if (meses < 0) {
    anios--;
    meses += 12;
  }
  const dias = Math.floor((hasta.getTime() - desde.getTime()) / 86_400_000);
  return { anios, meses, dias };
}

/**
 * Tiempo transcurrido desde una fecha, en formato compacto: "2a 8m", "5m", "12d".
 * Devuelve null si la fecha no es parseable.
 */
export function fmtAntiguedad(
  iso: string,
  hasta: Date = new Date(),
): string | null {
  const a = antiguedadDe(iso, hasta);
  if (!a) return null;
  if (a.anios > 0) return a.meses > 0 ? `${a.anios}a ${a.meses}m` : `${a.anios}a`;
  if (a.meses > 0) return `${a.meses}m`;
  return `${a.dias}d`;
}

/**
 * Igual que fmtAntiguedad pero en palabras: "2 años y 8 meses", "1 mes", "12 días".
 * Devuelve null si la fecha no es parseable.
 */
export function fmtAntiguedadLarga(
  iso: string,
  hasta: Date = new Date(),
): string | null {
  const a = antiguedadDe(iso, hasta);
  if (!a) return null;
  const unidad = (n: number, singular: string, plural: string) =>
    `${n} ${n === 1 ? singular : plural}`;

  if (a.anios > 0) {
    const años = unidad(a.anios, "año", "años");
    return a.meses > 0 ? `${años} y ${unidad(a.meses, "mes", "meses")}` : años;
  }
  if (a.meses > 0) return unidad(a.meses, "mes", "meses");
  return unidad(a.dias, "día", "días");
}
