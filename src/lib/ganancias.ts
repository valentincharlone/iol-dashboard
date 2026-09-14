// src/lib/ganancias.ts
// Reconstruye el costo promedio ponderado de cada activo recorriendo TODO el historial
// de operaciones (mismo método que el "ppc" de IOL) para calcular la ganancia realizada
// real de cada venta y vencimiento. Lógica pura, sin llamadas a la API.

import type { IOLOperacion } from "./iol-types";

export type EstadoEvento = "ok" | "historialIncompleto" | "enDolares";

export interface EventoRealizado {
  numero: number;
  fecha: string;
  ticker: string;
  tipo: "venta" | "amortizacion";
  cantidad: number | null;
  precio: number | null;
  /** Monto cobrado. En US$ si estado === "enDolares", en pesos en otro caso. */
  recibido: number;
  /** Precio promedio de compra al momento del evento. */
  ppc: number | null;
  costo: number | null;
  ganancia: number | null;
  gananciaPct: number | null;
  estado: EstadoEvento;
}

export interface Cobro {
  fecha: string;
  ticker: string;
  tipo: "dividendo" | "renta" | "amortizacion";
  monto: number;
  moneda: "ARS" | "USD";
}

export interface CalculoRealizado {
  eventos: EventoRealizado[]; // más recientes primero
  cobros: Cobro[]; // más recientes primero
  primeraOperacion: string | null;
}

export interface TotalesRealizado {
  eventos: EventoRealizado[];
  /** Solo eventos en pesos con costo conocido. */
  recibido: number;
  costo: number;
  ganancia: number;
  gananciaPct: number | null;
  /** Eventos que no entran en los totales (en US$ o sin historial de compra). */
  excluidos: number;
  dividendosRentasARS: number;
  cobrosUSD: number;
}

const EPS = 1e-6;

const fechaDe = (op: IOLOperacion) => op.fechaOperada ?? op.fechaOrden ?? "";
const cantidadDe = (op: IOLOperacion) => op.cantidadOperada ?? op.cantidad ?? 0;
const montoDe = (op: IOLOperacion) => Math.abs(op.montoOperado ?? op.monto ?? 0);
const esTerminada = (op: IOLOperacion) => {
  const e = op.estado?.toLowerCase() ?? "";
  return e === "terminada" || e === "parcialmente_terminada";
};

interface Tenencia {
  cantidad: number;
  costo: number;
  /** false si entraron títulos sin costo en pesos conocido (ej. compra en US$). */
  costoConocido: boolean;
}

export function calcularRealizado(ops: IOLOperacion[]): CalculoRealizado {
  const ordenadas = ops
    .filter(esTerminada)
    .sort(
      (a, b) =>
        fechaDe(a).localeCompare(fechaDe(b)) || a.numero - b.numero,
    );

  const tenencias = new Map<string, Tenencia>();
  const tenencia = (ticker: string) => {
    let t = tenencias.get(ticker);
    if (!t) {
      t = { cantidad: 0, costo: 0, costoConocido: true };
      tenencias.set(ticker, t);
    }
    return t;
  };

  const eventos: EventoRealizado[] = [];
  const cobros: Cobro[] = [];

  for (const op of ordenadas) {
    const fecha = fechaDe(op);
    const simbolo = (op.simbolo ?? "").trim();
    const enUSD = simbolo.includes("US$");
    const ticker = simbolo.replace(/\s*US\$$/, "");
    const cantidad = cantidadDe(op);
    const monto = montoDe(op);
    const tipo = op.tipo ?? "";

    // Compra/venta liquidada en dólares (ej. AL30D): mueve la tenencia del ticker en pesos.
    const base = ticker.endsWith("D") ? ticker.slice(0, -1) : null;
    const liquidaEnDolares =
      (tipo === "Compra" || tipo === "Venta") &&
      base != null &&
      (tenencias.get(base)?.cantidad ?? 0) > EPS;
    const tickerTenencia = liquidaEnDolares ? base! : ticker;

    if (tipo === "Compra") {
      const t = tenencia(tickerTenencia);
      t.cantidad += cantidad;
      if (liquidaEnDolares) t.costoConocido = false;
      else t.costo += monto;
      continue;
    }

    if (tipo === "Venta") {
      const t = tenencia(tickerTenencia);
      const completa = t.costoConocido && t.cantidad + EPS >= cantidad;
      const ppc = t.cantidad > EPS ? t.costo / t.cantidad : null;
      const costo = completa && ppc != null ? ppc * cantidad : null;
      const estado: EstadoEvento = liquidaEnDolares
        ? "enDolares"
        : completa
          ? "ok"
          : "historialIncompleto";
      const ganancia = estado === "ok" && costo != null ? monto - costo : null;
      eventos.push({
        numero: op.numero,
        fecha,
        ticker: tickerTenencia,
        tipo: "venta",
        cantidad,
        precio: op.precioOperado ?? op.precio,
        recibido: monto,
        ppc: t.costoConocido ? ppc : null,
        costo,
        ganancia,
        gananciaPct: ganancia != null && costo ? (ganancia / costo) * 100 : null,
        estado,
      });
      const vendida = Math.min(cantidad, t.cantidad);
      if (t.cantidad > EPS) t.costo -= (t.costo / t.cantidad) * vendida;
      t.cantidad -= vendida;
      if (t.cantidad <= EPS) tenencias.delete(tickerTenencia);
      continue;
    }

    if (tipo === "Pago de Dividendos" && cantidad > 0 && monto === 0) {
      // Dividendo en acciones o cambio de ratio de CEDEAR: entran títulos a costo cero.
      tenencia(ticker).cantidad += cantidad;
      continue;
    }

    if (monto === 0) continue;

    if (tipo === "Pago de Dividendos" || tipo === "Pago de Renta") {
      cobros.push({
        fecha,
        ticker,
        tipo: tipo === "Pago de Renta" ? "renta" : "dividendo",
        monto,
        moneda: enUSD ? "USD" : "ARS",
      });
      continue;
    }

    if (tipo === "Pago de Amortización") {
      if (enUSD) {
        cobros.push({ fecha, ticker, tipo: "amortizacion", monto, moneda: "USD" });
        continue;
      }
      // Amortización en pesos: devuelve capital. Baja el costo; lo que exceda es ganancia.
      const t = tenencias.get(ticker);
      const conocido = t != null && t.costoConocido && t.cantidad > EPS;
      const costo = conocido ? Math.min(monto, t!.costo) : null;
      if (conocido) t!.costo -= costo!;
      const ganancia = costo != null ? monto - costo : null;
      eventos.push({
        numero: op.numero,
        fecha,
        ticker,
        tipo: "amortizacion",
        cantidad: null,
        precio: null,
        recibido: monto,
        ppc: null,
        costo,
        ganancia,
        gananciaPct: ganancia != null && costo ? (ganancia / costo) * 100 : null,
        estado: conocido ? "ok" : "historialIncompleto",
      });
    }
  }

  const desc = <T extends { fecha: string }>(a: T, b: T) =>
    b.fecha.localeCompare(a.fecha);

  return {
    eventos: eventos.sort(desc),
    cobros: cobros.sort(desc),
    primeraOperacion: ordenadas[0] ? fechaDe(ordenadas[0]) : null,
  };
}

/** Totales de un rango de fechas (YYYY-MM-DD, inclusive). Sin límites = todo el historial. */
export function totalesRealizado(
  calculo: CalculoRealizado,
  desde?: string,
  hasta?: string,
): TotalesRealizado {
  const enRango = (fecha: string) => {
    const dia = fecha.slice(0, 10);
    return (!desde || dia >= desde) && (!hasta || dia <= hasta);
  };

  const eventos = calculo.eventos.filter((e) => enRango(e.fecha));
  const conCosto = eventos.filter((e) => e.estado === "ok" && e.costo != null);
  const recibido = conCosto.reduce((acc, e) => acc + e.recibido, 0);
  const costo = conCosto.reduce((acc, e) => acc + (e.costo ?? 0), 0);
  const ganancia = recibido - costo;

  const cobros = calculo.cobros.filter((c) => enRango(c.fecha));

  return {
    eventos,
    recibido,
    costo,
    ganancia,
    gananciaPct: costo > 0 ? (ganancia / costo) * 100 : null,
    excluidos: eventos.length - conCosto.length,
    dividendosRentasARS: cobros
      .filter((c) => c.moneda === "ARS")
      .reduce((acc, c) => acc + c.monto, 0),
    cobrosUSD: cobros
      .filter((c) => c.moneda === "USD")
      .reduce((acc, c) => acc + c.monto, 0),
  };
}

export interface ResultadoTotal {
  /** Posiciones abiertas: lo que muestra IOL como ganancia del portafolio. */
  noRealizada: number;
  noRealizadaPct: number | null;
  costoCartera: number;
  realizada: number;
  dividendosRentasARS: number;
  cobrosUSD: number;
  total: number;
  /** Títulos + efectivo en pesos (estado de cuenta). */
  patrimonio: number | null;
  /** Patrimonio − resultado total. Estimado: supone que no hubo retiros. */
  capitalPropio: number | null;
  totalPct: number | null;
  excluidos: number;
}

export function resultadoTotal(
  cartera: { noRealizada: number; costoCartera: number; patrimonio: number | null },
  acumulado: TotalesRealizado,
): ResultadoTotal {
  const total =
    cartera.noRealizada + acumulado.ganancia + acumulado.dividendosRentasARS;
  const capitalPropio =
    cartera.patrimonio != null ? cartera.patrimonio - total : null;

  return {
    noRealizada: cartera.noRealizada,
    noRealizadaPct:
      cartera.costoCartera > 0
        ? (cartera.noRealizada / cartera.costoCartera) * 100
        : null,
    costoCartera: cartera.costoCartera,
    realizada: acumulado.ganancia,
    dividendosRentasARS: acumulado.dividendosRentasARS,
    cobrosUSD: acumulado.cobrosUSD,
    total,
    patrimonio: cartera.patrimonio,
    capitalPropio,
    totalPct:
      capitalPropio != null && capitalPropio > 0
        ? (total / capitalPropio) * 100
        : null,
    excluidos: acumulado.excluidos,
  };
}

export interface ResumenGanancias {
  resultado: ResultadoTotal;
  periodo: TotalesRealizado;
  primeraOperacion: string | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
}
