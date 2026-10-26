// Clasificación por sector. La API de IOL no expone sector/industria,
// así que se mapea a mano por ticker. Lo que no está acá cae en "Sin clasificar".

import { tipoKey } from "@/lib/instrument";

export const SECTORES = {
  tecnologia:   { label: "Tecnología",          color: "#6366F1" },
  semis:        { label: "Semiconductores",     color: "#3B82F6" },
  comunicacion: { label: "Comunicación",        color: "#8B5CF6" },
  consumo:      { label: "Consumo",             color: "#F97066" },
  financiero:   { label: "Financiero / Bancos", color: "#14B8A6" },
  energia:      { label: "Energía",             color: "#F59E0B" },
  utilities:    { label: "Utilities",           color: "#EAB308" },
  salud:        { label: "Salud",               color: "#EC4899" },
  industria:    { label: "Industria",           color: "#64748B" },
  materiales:   { label: "Materiales",          color: "#A16207" },
  realestate:   { label: "Real Estate",         color: "#0EA5E9" },
  etf:          { label: "ETFs / Índices",      color: "#06B6D4" },
  cripto:       { label: "Cripto",              color: "#FB923C" },
  rentafija:    { label: "Renta fija",          color: "#22C55E" },
  fci:          { label: "FCI",                 color: "#84CC16" },
  otro:         { label: "Sin clasificar",      color: "#6B7280" },
} as const;

export type Sector = keyof typeof SECTORES;

const TICKER_SECTOR: Record<string, Sector> = {
  // Tecnología
  AAPL: "tecnologia", MSFT: "tecnologia", ORCL: "tecnologia", CRM: "tecnologia",
  ADBE: "tecnologia", IBM: "tecnologia", CSCO: "tecnologia", SAP: "tecnologia",
  SHOP: "tecnologia", PLTR: "tecnologia", SNOW: "tecnologia", GLOB: "tecnologia",
  MELI: "tecnologia", SE: "tecnologia", SMCI: "tecnologia", DELL: "tecnologia",
  HPQ: "tecnologia", ACN: "tecnologia", NOW: "tecnologia", UBER: "tecnologia",
  ABNB: "tecnologia", PYPL: "tecnologia", SQ: "tecnologia", XYZ: "tecnologia",
  SPOT: "tecnologia",
  // Semiconductores (incluye memoria y almacenamiento)
  NVDA: "semis", AMD: "semis", INTC: "semis", AVGO: "semis", QCOM: "semis",
  TSM: "semis", TXN: "semis", MU: "semis", ASML: "semis", ARM: "semis",
  SKHY: "semis", SNDK: "semis", WDC: "semis", STX: "semis", AMAT: "semis",
  LRCX: "semis", KLAC: "semis", MRVL: "semis", ADI: "semis", NXPI: "semis",
  ON: "semis", SMH: "semis", SOXX: "semis",
  // Comunicación
  GOOGL: "comunicacion", GOOG: "comunicacion", META: "comunicacion",
  NFLX: "comunicacion", DIS: "comunicacion", T: "comunicacion",
  VZ: "comunicacion", BIDU: "comunicacion", TCOM: "comunicacion",
  TEO: "comunicacion", TECO2: "comunicacion", CVH: "comunicacion",
  // Consumo
  AMZN: "consumo", TSLA: "consumo", KO: "consumo", PEP: "consumo",
  WMT: "consumo", COST: "consumo", MCD: "consumo", SBUX: "consumo",
  NKE: "consumo", PG: "consumo", BABA: "consumo", JD: "consumo",
  PDD: "consumo", HD: "consumo", TGT: "consumo", PM: "consumo",
  MO: "consumo", BKNG: "consumo", F: "consumo", GM: "consumo",
  TM: "consumo", STLA: "consumo", NIO: "consumo", LVS: "consumo",
  MOLI: "consumo", MOLA: "consumo", MORI: "consumo", LEDE: "consumo",
  // Financiero / Bancos
  JPM: "financiero", BAC: "financiero", C: "financiero", WFC: "financiero",
  GS: "financiero", MS: "financiero", V: "financiero", MA: "financiero",
  AXP: "financiero", BRKB: "financiero", "BRK.B": "financiero",
  BBVA: "financiero", SAN: "financiero", ITUB: "financiero", BBD: "financiero",
  NU: "financiero", HSBC: "financiero", BLK: "financiero", SCHW: "financiero",
  COIN: "financiero", HOOD: "financiero",
  GGAL: "financiero", BMA: "financiero", BBAR: "financiero", SUPV: "financiero",
  VALO: "financiero", BYMA: "financiero", BHIP: "financiero", BPAT: "financiero",
  // Energía
  XOM: "energia", CVX: "energia", OXY: "energia", SHEL: "energia",
  BP: "energia", PBR: "energia", SLB: "energia", HAL: "energia", VIST: "energia",
  YPF: "energia", YPFD: "energia", PAMP: "energia", TGSU2: "energia",
  TGNO4: "energia", CAPX: "energia", CGPA2: "energia", PGR: "energia",
  // Utilities
  EDN: "utilities", CEPU: "utilities", TRAN: "utilities", CECO2: "utilities",
  CTIO: "utilities", METR: "utilities", NEE: "utilities", DUK: "utilities",
  // Salud
  JNJ: "salud", PFE: "salud", MRK: "salud", ABBV: "salud", LLY: "salud",
  UNH: "salud", NVO: "salud", AZN: "salud", MRNA: "salud", ABT: "salud",
  BMY: "salud", AMGN: "salud", GILD: "salud", RICH: "salud",
  // Industria
  BA: "industria", CAT: "industria", DE: "industria", GE: "industria",
  HON: "industria", LMT: "industria", MMM: "industria", UPS: "industria",
  FDX: "industria", RTX: "industria", ERJ: "industria",
  // Materiales
  VALE: "materiales", RIO: "materiales", BHP: "materiales", GOLD: "materiales",
  NEM: "materiales", FCX: "materiales", AUY: "materiales", HMY: "materiales",
  TXAR: "materiales", ALUA: "materiales", LOMA: "materiales", HAVA: "materiales",
  GGB: "materiales", SID: "materiales", X: "materiales", PAAS: "materiales",
  // Real Estate
  IRSA: "realestate", CRES: "realestate", IRCP: "realestate",
  // ETFs / Índices
  SPY: "etf", QQQ: "etf", DIA: "etf", IWM: "etf", EEM: "etf", EWZ: "etf",
  XLF: "etf", XLE: "etf", XLK: "etf", GLD: "etf", SLV: "etf", ARKK: "etf",
  VEA: "etf", VIG: "etf", ACWI: "etf", FXI: "etf", EWJ: "etf", URA: "etf",
  // Cripto
  IBIT: "cripto", ETHA: "cripto", MSTR: "cripto", BITF: "cripto",
};

export function getSector(ticker: string, tipo: string): Sector {
  const k = tipoKey(tipo);
  if (k === "bono" || k === "obligacion" || k === "caucion") return "rentafija";
  if (k === "fci") return "fci";
  const t = ticker.toUpperCase();
  // CEDEARs en dólares/cable comparten sector con el ticker base (AAPLD, AAPLC)
  return TICKER_SECTOR[t] ?? TICKER_SECTOR[t.replace(/[DC]$/, "")] ?? "otro";
}
