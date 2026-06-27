// Lógica compartida para clasificar y colorear tipos de instrumentos IOL

export const TIPO_KEYS = [
  "cedear", "accion", "bono", "fci", "obligacion", "caucion", "opcion",
] as const;

export function tipoKey(tipo: string): string {
  const key = tipo.toLowerCase();
  for (const k of TIPO_KEYS) {
    if (key.includes(k)) return k;
  }
  return "otro";
}

const BADGE_MAP: Record<string, { bg: string; text: string }> = {
  cedear:    { bg: "var(--badge-cedear-bg)",     text: "var(--badge-cedear-text)"     },
  accion:    { bg: "var(--badge-accion-bg)",     text: "var(--badge-accion-text)"     },
  bono:      { bg: "var(--badge-bono-bg)",       text: "var(--badge-bono-text)"       },
  fci:       { bg: "var(--badge-fci-bg)",        text: "var(--badge-fci-text)"        },
  obligacion:{ bg: "var(--badge-obligacion-bg)", text: "var(--badge-obligacion-text)" },
  caucion:   { bg: "var(--badge-caucion-bg)",    text: "var(--badge-caucion-text)"    },
  opcion:    { bg: "var(--badge-opcion-bg)",     text: "var(--badge-opcion-text)"     },
};

export function getBadge(tipo: string): { bg: string; text: string } {
  const key = tipo.toLowerCase();
  for (const [match, style] of Object.entries(BADGE_MAP)) {
    if (key.includes(match)) return style;
  }
  return { bg: "var(--badge-default-bg)", text: "var(--badge-default-text)" };
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
