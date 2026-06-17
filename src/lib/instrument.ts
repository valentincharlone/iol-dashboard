// Lógica compartida para clasificar y colorear tipos de instrumentos IOL

const BADGE_MAP: Record<string, { bg: string; text: string }> = {
  cedear:    { bg: "#EEF2FF", text: "#4338CA" },
  accion:    { bg: "#FFF7ED", text: "#C2410C" },
  bono:      { bg: "#F0FDFA", text: "#0D9488" },
  fci:       { bg: "#FFFBEB", text: "#92400E" },
  obligacion:{ bg: "#F5F3FF", text: "#6D28D9" },
  caucion:   { bg: "#ECFEFF", text: "#0E7490" },
  opcion:    { bg: "#FDF2F8", text: "#9D174D" },
};

export function getBadge(tipo: string): { bg: string; text: string } {
  const key = tipo.toLowerCase();
  for (const [match, style] of Object.entries(BADGE_MAP)) {
    if (key.includes(match)) return style;
  }
  return { bg: "#F0F2F8", text: "#6E7191" };
}

export function tipoLabel(tipo: string): string {
  const key = tipo.toLowerCase();
  if (key.includes("cedear"))     return "CEDEAR";
  if (key.includes("accion"))     return "Acción";
  if (key.includes("bono"))       return "Bono";
  if (key.includes("fci"))        return "FCI";
  if (key.includes("obligacion")) return "O.N.";
  if (key.includes("caucion"))    return "Cauciones";
  if (key.includes("opcion"))     return "Opción";
  return tipo;
}

const CHART_COLOR_MAP: [string, string][] = [
  ["cedear",    "#6366F1"],
  ["accion",    "#F97066"],
  ["bono",      "#14B8A6"],
  ["fci",       "#F59E0B"],
  ["obligacion","#8B5CF6"],
  ["caucion",   "#06B6D4"],
  ["opcion",    "#EC4899"],
];

export function getTipoColor(tipo: string): string {
  const key = tipo.toLowerCase();
  for (const [match, color] of CHART_COLOR_MAP) {
    if (key.includes(match)) return color;
  }
  return "#6B7280";
}

const CHART_LABEL_MAP: [string, string][] = [
  ["cedear",    "CEDEARs"],
  ["accion",    "Acciones"],
  ["bono",      "Títulos Públicos"],
  ["fci",       "FCI"],
  ["obligacion","O.N."],
  ["caucion",   "Cauciones"],
  ["opcion",    "Opciones"],
];

export function getTipoLegendLabel(tipo: string): string {
  const key = tipo.toLowerCase();
  for (const [match, label] of CHART_LABEL_MAP) {
    if (key.includes(match)) return label;
  }
  return tipo;
}
