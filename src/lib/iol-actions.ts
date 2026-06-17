"use server";

import { getValidToken, invalidateTokens } from "./iol-auth";
import type {
  IOLPortafolio, IOLEstadoCuenta, DashboardData, DashboardPosicion, EstadoCuenta,
  IOLCotizacionResponse, CotizacionItem, IOLOperacion,
} from "./iol-types";

const IOL_API_BASE = "https://api.invertironline.com";

async function iolFetch<T>(path: string, retry = true): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`${IOL_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

  const posiciones: DashboardPosicion[] = activos.map((a) => {
    const valorizado = a.valorizado ?? (a.cantidad * a.ultimoPrecio);
    const ppc = a.ppc ?? 0;
    const costoPos = a.cantidad * ppc;
    const pnlPesos = (a.gananciaDinero != null && !isNaN(a.gananciaDinero))
      ? a.gananciaDinero
      : costoPos > 0 ? valorizado - costoPos : 0;
    const pnlPorcentaje = (a.gananciaPorcentaje != null && !isNaN(a.gananciaPorcentaje))
      ? a.gananciaPorcentaje
      : costoPos > 0 ? ((valorizado - costoPos) / costoPos) * 100 : 0;
    return {
      ticker: a.titulo.simbolo,
      nombre: a.titulo.descripcion,
      tipo: a.titulo.tipo,
      cantidad: a.cantidad,
      precioActual: a.ultimoPrecio ?? 0,
      ppc,
      valuacion: valorizado,
      pnlPesos,
      pnlPorcentaje,
      variacionDiaria: a.variacionDiaria ?? 0,
    };
  });

  posiciones.sort((a, b) => b.valuacion - a.valuacion);

  const totalValuacion = posiciones.reduce((acc, p) => acc + (isFinite(p.valuacion) ? p.valuacion : 0), 0);
  const totalPnlPesos = posiciones.reduce((acc, p) => acc + (isFinite(p.pnlPesos) ? p.pnlPesos : 0), 0);
  const costoTotal = totalValuacion - totalPnlPesos;
  const totalPnlPorcentaje = costoTotal > 0 ? (totalPnlPesos / costoTotal) * 100 : 0;
  // Promedio ponderado por valuación — evita sumar porcentajes de distintas posiciones
  const variacionHoy = totalValuacion > 0
    ? posiciones.reduce((acc, p) => acc + (isFinite(p.variacionDiaria) ? p.variacionDiaria * p.valuacion : 0), 0) / totalValuacion
    : 0;
  const variacionHoyPesos = posiciones.reduce(
    (acc, p) => acc + (isFinite(p.variacionDiaria) && isFinite(p.valuacion) ? p.valuacion * p.variacionDiaria / 100 : 0), 0
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
      totalConEfectivo: ec.totalEnPesos ?? totalValuacion + (cuentaARS?.disponible ?? 0),
      // estadocuenta no devuelve ganancia/%; usamos los calculados del portafolio
      gananciaTotalPesos: totalPnlPesos,
      gananciaTotalPorcentaje: totalPnlPorcentaje,
    };
  }

  return { posiciones, totalValuacion, costoTotal, totalPnlPesos, totalPnlPorcentaje, variacionHoy, variacionHoyPesos, cantidadPosiciones: posiciones.length, estadoCuenta };
}

export async function getCotizacionesPortafolio(): Promise<CotizacionItem[]> {
  const portafolio = await iolFetch<IOLPortafolio>("/api/v2/portafolio/argentina");
  const activos = portafolio.activos ?? [];

  const results = await Promise.allSettled(
    activos.map(async (a) => {
      const mercado = a.titulo.mercado || "bCBA";
      const simbolo = encodeURIComponent(a.titulo.simbolo);
      const data = await iolFetch<IOLCotizacionResponse>(`/api/v2/${mercado}/Titulos/${simbolo}/Cotizacion`);
      return {
        ticker: a.titulo.simbolo,
        nombre: a.titulo.descripcion,
        tipo: a.titulo.tipo,
        mercado,
        precio: data.ultimo.precio,
        variacionPorcentual: data.ultimo.variacionPorcentual,
        apertura: data.ultimo.apertura,
        maximo: data.ultimo.maximo,
        minimo: data.ultimo.minimo,
        cierreAnterior: data.ultimo.cierreAnterior,
        volumenNominal: data.ultimo.volumenNominal,
        montoOperado: data.ultimo.montoOperado,
        cantidadOperaciones: data.ultimo.cantidadOperaciones,
        moneda: data.ultimo.moneda,
        tendencia: data.ultimo.tendencia,
      } satisfies CotizacionItem;
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<CotizacionItem> => r.status === "fulfilled")
    .map((r) => r.value)
    .sort((a, b) => b.variacionPorcentual - a.variacionPorcentual);
}

export async function getOperaciones(fechaDesde?: string, fechaHasta?: string): Promise<IOLOperacion[]> {
  const params = new URLSearchParams();
  if (fechaDesde) params.set("fechaDesde", fechaDesde);
  if (fechaHasta) params.set("fechaHasta", fechaHasta);
  const query = params.toString() ? `?${params.toString()}` : "";
  return iolFetch<IOLOperacion[]>(`/api/v2/operaciones${query}`);
}
