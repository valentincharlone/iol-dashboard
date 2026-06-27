export function getTipoCls(tipo: string | null | undefined): { cls: string; label: string } {
  const key = tipo != null ? String(tipo).toLowerCase() : "";
  if (key === "compra")              return { cls: "bg-profit-bg text-profit",     label: "Compra" };
  if (key === "venta")               return { cls: "bg-loss-bg text-loss",         label: "Venta" };
  if (key.includes("dividendo"))     return { cls: "bg-amber-50 text-amber-800",   label: "Dividendo" };
  if (key.includes("acreditacion"))  return { cls: "bg-brand-muted text-brand",    label: "Acreditación" };
  if (key.includes("transferencia")) return { cls: "bg-purple-50 text-purple-700", label: "Transferencia" };
  return { cls: "bg-[#F0F2F8] text-text3", label: tipo ?? "—" };
}

const ESTADO_CLS: Record<string, string> = {
  terminada:                                    "text-profit",
  parcialmente_terminada:                        "text-profit",
  pendiente:                                    "text-amber-600",
  en_proceso:                                   "text-amber-600",
  iniciada:                                     "text-amber-600",
  pendiente_cancelacion:                        "text-amber-600",
  en_modificacion:                              "text-amber-600",
  parcialmente_terminada_con_pedido_cancelacion:"text-amber-600",
  cancelada:                                    "text-loss",
  cancelada_por_vencimiento_validez:            "text-loss",
};

export function getEstadoCls(estado: string | null | undefined): string {
  return ESTADO_CLS[estado != null ? String(estado).toLowerCase() : ""] ?? "text-text3";
}

const ENUM_LABELS: Record<string, string> = {
  precio_limite:          "Precio límite",
  precio_mercado:         "Precio mercado",
  a24horas:               "24 horas",
  a48horas:               "48 horas",
  a72horas:               "72 horas",
  inmediata:              "Inmediata",
  sinvalor:               "—",
  peso_argentino:         "Peso argentino",
  dolar_estadounidense:   "Dólar estadounidense",
  dolar_bna:              "Dólar BNA",
  dolar_bolsa:            "Dólar bolsa",
};

export function fmtEnum(s?: string | null): string {
  if (!s) return "—";
  return ENUM_LABELS[s.toLowerCase()] ?? s.replace(/_/g, " ");
}

const ESTADO_LABELS: Record<string, string> = {
  iniciada:                                              "Iniciada",
  en_proceso:                                            "En proceso",
  parcialmente_terminada:                                "Parcialmente terminada",
  terminada:                                             "Terminada",
  cancelada:                                             "Cancelada",
  pendiente_cancelacion:                                 "Pendiente de cancelación",
  cancelada_por_vencimiento_validez:                     "Cancelada por vencimiento",
  parcialmente_terminada_con_pedido_cancelacion:         "Parcial con cancelación",
  en_modificacion:                                       "En modificación",
};

export function fmtEstado(s?: string | null): string {
  if (!s) return "—";
  return ESTADO_LABELS[s.toLowerCase()] ?? s.replace(/_/g, " ");
}
