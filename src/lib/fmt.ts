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
