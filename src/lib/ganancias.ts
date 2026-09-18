// src/lib/ganancias.ts
// Reconstruye el costo promedio ponderado de cada activo recorriendo TODO el historial
// de operaciones (mismo método que el "ppc" de IOL) para calcular la ganancia realizada
// real de cada venta y vencimiento. En paralelo lleva el costo en dólares MEP de la fecha
// de cada operación, para medir el resultado en moneda dura. Lógica pura, sin API.

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
  /** Mismo evento en dólares MEP de cada fecha. null sin serie MEP o sin costo. */
  recibidoUSD: number | null;
  costoUSD: number | null;
  gananciaUSD: number | null;
  gananciaUSDPct: number | null;
  estado: EstadoEvento;
}

export interface Cobro {
  fecha: string;
  ticker: string;
  tipo: "dividendo" | "renta";
  monto: number;
  moneda: "ARS" | "USD";
  montoUSD: number | null;
}

export interface CalculoRealizado {
  eventos: EventoRealizado[]; // más recientes primero
  cobros: Cobro[]; // más recientes primero
  primeraOperacion: string | null;
  /** Costo en US$ MEP de lo que se sigue teniendo. null si no hay serie MEP. */
  costoUSDPorTicker: Record<string, number | null>;
  conDolares: boolean;
}

export interface TotalesUSD {
  recibido: number;
  costo: number;
  ganancia: number;
  gananciaPct: number | null;
  /** Dividendos y rentas: los cobrados en pesos convertidos al MEP del día, más los cobrados en US$. */
  dividendosRentas: number;
}

export interface TotalesRealizado {
  eventos: EventoRealizado[];
  /** Solo eventos en pesos con costo conocido. */
  recibido: number;
  costo: number;
  ganancia: number;
  gananciaPct: number | null;
  /** Eventos que no entran en los totales en pesos (en US$ o sin historial de compra). */
  excluidos: number;
  dividendosRentasARS: number;
  /** Dividendos y rentas cobrados directamente en dólares. */
  cobrosUSD: number;
  usd: TotalesUSD | null;
}

export interface PuntoCotizacion {
  fechaHora: string;
  ultimoPrecio: number;
}

/** Devuelve el dólar MEP vigente para una fecha (YYYY-MM-DD o ISO). */
export type ConversorMEP = (fecha: string) => number;

const EPS = 1e-6;

/**
 * Dólar MEP implícito por día: cierre de AL30 (pesos) / cierre de AL30D (dólares).
 * Fines de semana y feriados usan el último día hábil anterior.
 */
export function crearConversorMEP(
  al30: PuntoCotizacion[],
  al30d: PuntoCotizacion[],
): ConversorMEP | null {
  const cierrePorDia = (serie: PuntoCotizacion[]) => {
    const dias = new Map<string, PuntoCotizacion>();
    for (const p of serie) {
      const dia = p.fechaHora.slice(0, 10);
      const previo = dias.get(dia);
      if (!previo || p.fechaHora > previo.fechaHora) dias.set(dia, p);
    }
    return dias;
  };

  const pesos = cierrePorDia(al30);
  const dolares = cierrePorDia(al30d);
  const serie: [string, number][] = [];
  for (const [dia, p] of pesos) {
    const usd = dolares.get(dia)?.ultimoPrecio ?? 0;
    if (p.ultimoPrecio > 0 && usd > 0) serie.push([dia, p.ultimoPrecio / usd]);
  }
  if (serie.length === 0) return null;
  serie.sort((a, b) => a[0].localeCompare(b[0]));

  return (fecha) => {
    const dia = fecha.slice(0, 10);
    let lo = 0;
    let hi = serie.length - 1;
    let idx = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (serie[mid][0] <= dia) {
        idx = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return serie[idx][1];
  };
}

const fechaDe = (op: IOLOperacion) => op.fechaOperada ?? op.fechaOrden ?? "";
const cantidadDe = (op: IOLOperacion) => op.cantidadOperada ?? op.cantidad ?? 0;
const montoDe = (op: IOLOperacion) => Math.abs(op.montoOperado ?? op.monto ?? 0);
const esTerminada = (op: IOLOperacion) => {
  const e = op.estado?.toLowerCase() ?? "";
  return e === "terminada" || e === "parcialmente_terminada";
};
const pct = (ganancia: number | null, costo: number | null) =>
  ganancia != null && costo ? (ganancia / costo) * 100 : null;

/** Fecha de la operación terminada más antigua del historial. */
export function primeraOperacionDe(ops: IOLOperacion[]): string | null {
  let primera: string | null = null;
  for (const op of ops) {
    const f = fechaDe(op);
    if (!esTerminada(op) || !f) continue;
    if (primera == null || f.localeCompare(primera) < 0) primera = f;
  }
  return primera;
}

interface Tenencia {
  cantidad: number;
  costo: number;
  /** false si entraron títulos sin costo en pesos conocido (ej. compra en US$). */
  costoConocido: boolean;
  costoUSD: number;
}

export function calcularRealizado(
  ops: IOLOperacion[],
  mep?: ConversorMEP | null,
): CalculoRealizado {
  const aUSD = (monto: number, fecha: string) => (mep ? monto / mep(fecha) : null);

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
      t = { cantidad: 0, costo: 0, costoConocido: true, costoUSD: 0 };
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
      if (liquidaEnDolares) {
        t.costoConocido = false;
        t.costoUSD += monto;
      } else {
        t.costo += monto;
        t.costoUSD += aUSD(monto, fecha) ?? 0;
      }
      continue;
    }

    if (tipo === "Venta") {
      const t = tenencia(tickerTenencia);
      const completa = t.cantidad + EPS >= cantidad;
      const completaPesos = completa && t.costoConocido;
      const ppc = t.cantidad > EPS ? t.costo / t.cantidad : null;
      const costo = completaPesos && ppc != null ? ppc * cantidad : null;
      const estado: EstadoEvento = liquidaEnDolares
        ? "enDolares"
        : completaPesos
          ? "ok"
          : "historialIncompleto";
      const ganancia = estado === "ok" && costo != null ? monto - costo : null;

      const costoUSD =
        mep && completa && t.cantidad > EPS
          ? (t.costoUSD / t.cantidad) * cantidad
          : null;
      const recibidoUSD = liquidaEnDolares ? (mep ? monto : null) : aUSD(monto, fecha);
      const gananciaUSD =
        costoUSD != null && recibidoUSD != null ? recibidoUSD - costoUSD : null;

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
        gananciaPct: pct(ganancia, costo),
        recibidoUSD,
        costoUSD,
        gananciaUSD,
        gananciaUSDPct: pct(gananciaUSD, costoUSD),
        estado,
      });

      const vendida = Math.min(cantidad, t.cantidad);
      if (t.cantidad > EPS) {
        const fraccion = vendida / t.cantidad;
        t.costo -= t.costo * fraccion;
        t.costoUSD -= t.costoUSD * fraccion;
      }
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
        montoUSD: enUSD ? (mep ? monto : null) : aUSD(monto, fecha),
      });
      continue;
    }

    if (tipo === "Pago de Amortización") {
      // Una amortización devuelve capital: baja el costo y lo que exceda es ganancia.
      const t = tenencias.get(ticker);
      const tiene = t != null && t.cantidad > EPS;

      if (enUSD) {
        // En pesos no se puede comparar; en dólares baja directo el costo en US$.
        const costoUSD = tiene && mep ? Math.min(monto, t!.costoUSD) : null;
        if (costoUSD != null) t!.costoUSD -= costoUSD;
        const gananciaUSD = costoUSD != null ? monto - costoUSD : null;
        eventos.push({
          numero: op.numero,
          fecha,
          ticker,
          tipo: "amortizacion",
          cantidad: null,
          precio: null,
          recibido: monto,
          ppc: null,
          costo: null,
          ganancia: null,
          gananciaPct: null,
          recibidoUSD: mep ? monto : null,
          costoUSD,
          gananciaUSD,
          gananciaUSDPct: pct(gananciaUSD, costoUSD),
          estado: "enDolares",
        });
        continue;
      }

      const conocido = tiene && t!.costoConocido;
      const costo = conocido ? Math.min(monto, t!.costo) : null;
      const fraccion = conocido && t!.costo > 0 ? costo! / t!.costo : 0;
      const costoUSD = conocido && mep ? t!.costoUSD * fraccion : null;
      if (conocido) {
        t!.costo -= costo!;
        t!.costoUSD -= costoUSD ?? 0;
      }
      const ganancia = costo != null ? monto - costo : null;
      const recibidoUSD = aUSD(monto, fecha);
      const gananciaUSD =
        costoUSD != null && recibidoUSD != null ? recibidoUSD - costoUSD : null;
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
        gananciaPct: pct(ganancia, costo),
        recibidoUSD,
        costoUSD,
        gananciaUSD,
        gananciaUSDPct: pct(gananciaUSD, costoUSD),
        estado: conocido ? "ok" : "historialIncompleto",
      });
    }
  }

  const desc = <T extends { fecha: string }>(a: T, b: T) =>
    b.fecha.localeCompare(a.fecha);

  const costoUSDPorTicker: Record<string, number | null> = {};
  for (const [ticker, t] of tenencias) {
    if (t.cantidad > EPS) costoUSDPorTicker[ticker] = mep ? t.costoUSD : null;
  }

  return {
    eventos: eventos.sort(desc),
    cobros: cobros.sort(desc),
    primeraOperacion: ordenadas[0] ? fechaDe(ordenadas[0]) : null,
    costoUSDPorTicker,
    conDolares: mep != null,
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
  const suma = <T>(items: T[], valor: (item: T) => number) =>
    items.reduce((acc, item) => acc + valor(item), 0);

  const eventos = calculo.eventos.filter((e) => enRango(e.fecha));
  const conCosto = eventos.filter((e) => e.estado === "ok" && e.costo != null);
  const recibido = suma(conCosto, (e) => e.recibido);
  const costo = suma(conCosto, (e) => e.costo ?? 0);
  const ganancia = recibido - costo;

  const cobros = calculo.cobros.filter((c) => enRango(c.fecha));

  let usd: TotalesUSD | null = null;
  if (calculo.conDolares) {
    const conCostoUSD = eventos.filter((e) => e.gananciaUSD != null);
    const recibidoUSD = suma(conCostoUSD, (e) => e.recibidoUSD ?? 0);
    const costoUSD = suma(conCostoUSD, (e) => e.costoUSD ?? 0);
    usd = {
      recibido: recibidoUSD,
      costo: costoUSD,
      ganancia: recibidoUSD - costoUSD,
      gananciaPct: costoUSD > 0 ? ((recibidoUSD - costoUSD) / costoUSD) * 100 : null,
      dividendosRentas: suma(cobros, (c) => c.montoUSD ?? 0),
    };
  }

  return {
    eventos,
    recibido,
    costo,
    ganancia,
    gananciaPct: costo > 0 ? (ganancia / costo) * 100 : null,
    excluidos: eventos.length - conCosto.length,
    dividendosRentasARS: suma(
      cobros.filter((c) => c.moneda === "ARS"),
      (c) => c.monto,
    ),
    cobrosUSD: suma(
      cobros.filter((c) => c.moneda === "USD"),
      (c) => c.monto,
    ),
    usd,
  };
}

export interface ResultadoUSD {
  noRealizada: number;
  noRealizadaPct: number | null;
  costoCartera: number;
  realizada: number;
  dividendosRentas: number;
  total: number;
  patrimonio: number | null;
  capitalPropio: number | null;
  totalPct: number | null;
  mepHoy: number;
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
  /** El mismo resultado medido en dólares MEP. null si falta la serie MEP. */
  usd: ResultadoUSD | null;
}

export function resultadoTotal(
  cartera: {
    noRealizada: number;
    costoCartera: number;
    patrimonio: number | null;
    posiciones: { ticker: string; valuacion: number }[];
    mepHoy: number | null;
  },
  calculo: CalculoRealizado,
): ResultadoTotal {
  const acumulado = totalesRealizado(calculo);
  const total =
    cartera.noRealizada + acumulado.ganancia + acumulado.dividendosRentasARS;
  const capitalPropio =
    cartera.patrimonio != null ? cartera.patrimonio - total : null;

  let usd: ResultadoUSD | null = null;
  const costosUSD = cartera.posiciones.map(
    (p) => calculo.costoUSDPorTicker[p.ticker],
  );
  if (
    acumulado.usd &&
    cartera.mepHoy &&
    costosUSD.every((c) => c != null)
  ) {
    const mepHoy = cartera.mepHoy;
    const costoCarteraUSD = costosUSD.reduce<number>((acc, c) => acc + c!, 0);
    const valorUSD = cartera.posiciones.reduce(
      (acc, p) => acc + p.valuacion / mepHoy,
      0,
    );
    const noRealizadaUSD = valorUSD - costoCarteraUSD;
    const totalUSD =
      noRealizadaUSD + acumulado.usd.ganancia + acumulado.usd.dividendosRentas;
    const patrimonioUSD =
      cartera.patrimonio != null ? cartera.patrimonio / mepHoy : null;
    const capitalUSD = patrimonioUSD != null ? patrimonioUSD - totalUSD : null;
    usd = {
      noRealizada: noRealizadaUSD,
      noRealizadaPct:
        costoCarteraUSD > 0 ? (noRealizadaUSD / costoCarteraUSD) * 100 : null,
      costoCartera: costoCarteraUSD,
      realizada: acumulado.usd.ganancia,
      dividendosRentas: acumulado.usd.dividendosRentas,
      total: totalUSD,
      patrimonio: patrimonioUSD,
      capitalPropio: capitalUSD,
      totalPct:
        capitalUSD != null && capitalUSD > 0 ? (totalUSD / capitalUSD) * 100 : null,
      mepHoy,
    };
  }

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
    usd,
  };
}

export interface ResumenGanancias {
  resultado: ResultadoTotal;
  periodo: TotalesRealizado;
  primeraOperacion: string | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
  mepHoy: number | null;
}
