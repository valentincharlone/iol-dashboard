export function isMarketOpen(): boolean {
  // BYMA: lunes–viernes, 10:30–17:00 ART (UTC-3, sin horario de verano)
  const now = new Date();
  const art = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" })
  );
  const day = art.getDay();
  const minutes = art.getHours() * 60 + art.getMinutes();
  if (day === 0 || day === 6) return false;
  return minutes >= 10 * 60 + 30 && minutes < 17 * 60;
}
