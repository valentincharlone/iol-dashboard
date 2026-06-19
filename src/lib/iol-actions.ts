"use server";

import { getValidToken, invalidateTokens } from "./iol-auth";
import type {
  IOLPortafolio,
  IOLEstadoCuenta,
  DashboardData,
  DashboardPosicion,
  EstadoCuenta,
  IOLCotizacionResponse,
  IOLCotizacionDetalle,
  CotizacionItem,
  IOLOperacion,
  IOLOperacionDetalle,
  IOLPerfil,
  MarketStripItem,
  GananciaItem,
  ResumenGanancias,
} from "./iol-types";

const IOL_API_BASE = "https://api.invertironline.com";

const MERCADO_MAP: Record<string, string> = {
  bcba: "bCBA",
  nyse: "nYSE",
  nasdaq: "nASDAQ",
  amex: "aMEX",
  rofx: "rOFX",
  bcs: "bCS",
};
function normalizeMercado(m: string): string {
  return MERCADO_MAP[m?.toLowerCase()] ?? m ?? "bCBA";
}

async function iolFetch<T>(path: string, retry = true): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`${IOL_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (res.status === 401 && retry) {
    // Token rechazado por el servidor — limpiar caché y reintentar con login fresco
    invalidateTokens();
    return iolFetch<T>(path, false);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IOL API error ${res.status} en ${path}: ${text}`);
  }
  return res.json();
}

export async function getPortafolio(): Promise<DashboardData> {
  const [data, cuentaRaw] = await Promise.allSettled([
    iolFetch<IOLPortafolio>("/api/v2/portafolio/argentina"),
    iolFetch<IOLEstadoCuenta>("/api/v2/estadocuenta"),
  ]);

  if (data.status === "rejected") throw new Error(data.reason);

  const activos = data.value.activos ?? [];

  // variacionDiaria del portafolio llega en 0 fuera del horario de mercado.
  // Usamos variacionPorcentual de cada cotización, que refleja el cierre del día.
  const cotizResults = await Promise.allSettled(
    activos.map(async (a) => {
      const mercado = normalizeMercado(a.titulo.mercado);
      const simbolo = encodeURIComponent(a.titulo.simbolo);
      const cot = await iolFetch<IOLCotizacionResponse>(
        `/api/v2/${mercado}/Titulos/${simbolo}/Cotizacion`,
      );
      const variacion =
        cot.variacion !== 0
          ? cot.variacion
          : cot.cierreAnterior > 0
            ? ((cot.ultimoPrecio - cot.cierreAnterior) / cot.cierreAnterior) *
              100
            : 0;
      return { ticker: a.titulo.simbolo, variacion };
    }),
  );

  const variacionMap = new Map<string, number>();
  for (const r of cotizResults) {
    if (r.status === "fulfilled")
      variacionMap.set(r.value.ticker, r.value.variacion);
  }

  const posiciones: DashboardPosicion[] = activos.map((a) => {
    const valorizado = a.valorizado ?? a.cantidad * a.ultimoPrecio;
    const ppc = a.ppc ?? 0;
    const costoPos = a.cantidad * ppc;
    const pnlPesos =
      a.gananciaDinero != null && !isNaN(a.gananciaDinero)
        ? a.gananciaDinero
        : costoPos > 0
          ? valorizado - costoPos
          : 0;
    const pnlPorcentaje =
      a.gananciaPorcentaje != null && !isNaN(a.gananciaPorcentaje)
        ? a.gananciaPorcentaje
        : costoPos > 0
          ? ((valorizado - costoPos) / costoPos) * 100
          : 0;
    return {
      ticker: a.titulo.simbolo,
      nombre: a.titulo.descripcion,
      tipo: a.titulo.tipo,
      mercado: normalizeMercado(a.titulo.mercado),
      cantidad: a.cantidad,
      precioActual: a.ultimoPrecio ?? 0,
      ppc,
      valuacion: valorizado,
      pnlPesos,
      pnlPorcentaje,
      variacionDiaria:
        variacionMap.get(a.titulo.simbolo) ?? a.variacionDiaria ?? 0,
    };
  });

  posiciones.sort((a, b) => b.valuacion - a.valuacion);

  const totalValuacion = posiciones.reduce(
    (acc, p) => acc + (isFinite(p.valuacion) ? p.valuacion : 0),
    0,
  );
  const totalPnlPesos = posiciones.reduce(
    (acc, p) => acc + (isFinite(p.pnlPesos) ? p.pnlPesos : 0),
    0,
  );
  const costoTotal = totalValuacion - totalPnlPesos;
  const totalPnlPorcentaje =
    costoTotal > 0 ? (totalPnlPesos / costoTotal) * 100 : 0;
  // Promedio ponderado por valuación — evita sumar porcentajes de distintas posiciones
  const variacionHoy =
    totalValuacion > 0
      ? posiciones.reduce(
          (acc, p) =>
            acc +
            (isFinite(p.variacionDiaria) ? p.variacionDiaria * p.valuacion : 0),
          0,
        ) / totalValuacion
      : 0;
  const variacionHoyPesos = posiciones.reduce(
    (acc, p) =>
      acc +
      (isFinite(p.variacionDiaria) && isFinite(p.valuacion)
        ? (p.valuacion * p.variacionDiaria) / 100
        : 0),
    0,
  );

  let estadoCuenta: EstadoCuenta | null = null;
  if (cuentaRaw.status === "fulfilled") {
    const ec = cuentaRaw.value;
    const cuentas = ec.cuentas ?? [];
    const cuentaARS = cuentas.find((c) => c.moneda === "peso_Argentino");
    const cuentaUSD = cuentas.find((c) => c.moneda === "dolar_Estadounidense");
    estadoCuenta = {
      disponibleARS: cuentaARS?.disponible ?? 0,
      disponibleUSD: cuentaUSD?.disponible ?? 0,
      // totalEnPesos es el grand total real (efectivo + títulos) en pesos
      totalConEfectivo:
        ec.totalEnPesos ?? totalValuacion + (cuentaARS?.disponible ?? 0),
      // estadocuenta no devuelve ganancia/%; usamos los calculados del portafolio
      gananciaTotalPesos: totalPnlPesos,
      gananciaTotalPorcentaje: totalPnlPorcentaje,
    };
  }

  return {
    posiciones,
    totalValuacion,
    costoTotal,
    totalPnlPesos,
    totalPnlPorcentaje,
    variacionHoy,
    variacionHoyPesos,
    cantidadPosiciones: posiciones.length,
    estadoCuenta,
  };
}

export async function getCotizacionesPortafolio(): Promise<CotizacionItem[]> {
  const portafolio = await iolFetch<IOLPortafolio>(
    "/api/v2/portafolio/argentina",
  );
  const activos = portafolio.activos ?? [];

  const results = await Promise.allSettled(
    activos.map(async (a) => {
      const mercado = normalizeMercado(a.titulo.mercado);
      const simbolo = encodeURIComponent(a.titulo.simbolo);
      const data = await iolFetch<IOLCotizacionResponse>(
        `/api/v2/${mercado}/Titulos/${simbolo}/Cotizacion`,
      );
      return {
        ticker: a.titulo.simbolo,
        nombre: a.titulo.descripcion,
        tipo: a.titulo.tipo,
        mercado,
        precio: data.ultimoPrecio,
        variacionPorcentual: data.variacion,
        apertura: data.apertura,
        maximo: data.maximo,
        minimo: data.minimo,
        cierreAnterior: data.cierreAnterior,
        volumenNominal: data.volumenNominal,
        montoOperado: data.montoOperado,
        cantidadOperaciones: data.cantidadOperaciones ?? 0,
        moneda: data.moneda,
        tendencia: data.tendencia,
      } satisfies CotizacionItem;
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<CotizacionItem> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .sort((a, b) => b.variacionPorcentual - a.variacionPorcentual);
}

export async function getGananciasRealizadas(
  desde?: string,
  hasta?: string,
): Promise<ResumenGanancias> {
  const hoy = new Date();
  const unAnioAtras = new Date(hoy);
  unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const fechaDesde = desde || fmt(unAnioAtras);
  const fechaHasta = hasta || fmt(hoy);

  const all = await getOperaciones(fechaDesde, fechaHasta);

  const esTerminada = (op: IOLOperacion) => {
    const est = op.estado?.toLowerCase() ?? "";
    return est === "terminada" || est === "parcialmente_terminada";
  };

  const ventas = all.filter(
    (op) => op.tipo?.toLowerCase() === "venta" && esTerminada(op),
  );
  const compras = all.filter(
    (op) => op.tipo?.toLowerCase() === "compra" && esTerminada(op),
  );

  // Costo promedio ponderado por ticker desde las compras del período
  const costMap = new Map<string, number>();
  const comprasByTicker = new Map<string, IOLOperacion[]>();
  for (const c of compras) {
    const t = (c.simbolo ?? "").toUpperCase();
    if (!comprasByTicker.has(t)) comprasByTicker.set(t, []);
    comprasByTicker.get(t)!.push(c);
  }
  for (const [ticker, ops] of comprasByTicker) {
    let totalQty = 0;
    let totalMonto = 0;
    for (const op of ops) {
      const qty = op.cantidadOperada ?? op.cantidad ?? 0;
      const monto = Math.abs(op.montoOperado ?? op.monto ?? 0);
      if (qty > 0 && monto > 0) {
        totalQty += qty;
        totalMonto += monto;
      }
    }
    if (totalQty > 0) costMap.set(ticker, totalMonto / totalQty);
  }

  const items: GananciaItem[] = ventas
    .map((op) => {
      const ticker = (op.simbolo ?? "").toUpperCase();
      const cantidad = op.cantidadOperada ?? op.cantidad ?? 0;
      const precio = op.precioOperado ?? op.precio ?? 0;
      const total = Math.abs(op.montoOperado ?? op.monto ?? cantidad * precio);
      const moneda = op.moneda ?? "";
      const enDolares = moneda.toLowerCase().includes("dolar");

      const avgCosto = costMap.get(ticker);
      const costoEstimado =
        avgCosto != null && cantidad > 0 && !enDolares
          ? avgCosto * cantidad
          : null;
      const pnlEstimado =
        costoEstimado != null ? total - costoEstimado : null;

      return {
        numero: op.numero,
        fecha: op.fechaOperada ?? op.fechaOrden,
        ticker,
        cantidad,
        precio,
        total,
        moneda,
        costoEstimado,
        pnlEstimado,
      };
    })
    .sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );

  const totalRecibidoARS = items
    .filter((i) => !i.moneda.toLowerCase().includes("dolar"))
    .reduce((acc, i) => acc + i.total, 0);

  const itemsConPnl = items.filter((i) => i.pnlEstimado != null);
  const pnlEstimado =
    itemsConPnl.length > 0
      ? itemsConPnl.reduce((acc, i) => acc + (i.pnlEstimado ?? 0), 0)
      : null;

  const totalCostoEstimado = itemsConPnl.reduce(
    (acc, i) => acc + (i.costoEstimado ?? 0),
    0,
  );
  const pnlPct =
    pnlEstimado != null && totalCostoEstimado > 0
      ? (pnlEstimado / totalCostoEstimado) * 100
      : null;

  return { items, totalRecibidoARS, pnlEstimado, pnlPct, fechaDesde, fechaHasta };
}

export async function getPerfil(): Promise<IOLPerfil> {
  return iolFetch<IOLPerfil>("/api/v2/datos-perfil");
}

export async function getOperacionDetalle(numero: number): Promise<IOLOperacionDetalle> {
  return iolFetch<IOLOperacionDetalle>(`/api/v2/operaciones/${numero}`);
}

export async function getMarketStrip(): Promise<MarketStripItem[]> {
  const [spyResult] = await Promise.allSettled([
    iolFetch<IOLCotizacionResponse>("/api/v2/bCBA/Titulos/SPY/Cotizacion"),
  ]);

  const items: MarketStripItem[] = [];

  if (spyResult.status === "fulfilled") {
    const d = spyResult.value;
    const variacion =
      d.variacion !== 0
        ? d.variacion
        : d.cierreAnterior > 0
          ? ((d.ultimoPrecio - d.cierreAnterior) / d.cierreAnterior) * 100
          : null;
    items.push({
      label: "S&P 500",
      sublabel: "SPY",
      precio: d.ultimoPrecio,
      variacion,
      moneda: "ARS",
    });
  }

  return items;
}

export async function getCotizacionDetalle(
  mercado: string,
  simbolo: string,
): Promise<IOLCotizacionDetalle> {
  return iolFetch<IOLCotizacionDetalle>(
    `/api/v2/${mercado}/Titulos/${encodeURIComponent(simbolo)}/CotizacionDetalle`,
  );
}

export async function getOperacionesByTicker(
  simbolo: string,
): Promise<IOLOperacion[]> {
  const all = await getOperaciones();
  return all.filter(
    (op) => op.simbolo?.toUpperCase() === simbolo.toUpperCase(),
  );
}

export async function getOperaciones(
  fechaDesde?: string,
  fechaHasta?: string,
): Promise<IOLOperacion[]> {
  const params = new URLSearchParams();
  if (fechaDesde) params.set("fechaDesde", fechaDesde);
  if (fechaHasta) params.set("fechaHasta", fechaHasta);
  const query = params.toString() ? `?${params.toString()}` : "";
  return iolFetch<IOLOperacion[]>(`/api/v2/operaciones${query}`);
}
