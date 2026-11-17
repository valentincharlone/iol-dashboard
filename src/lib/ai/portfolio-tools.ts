import { tool } from "ai";
import { z } from "zod";
import { getPortafolio } from "@/lib/iol-actions";

// El token de IOL lo maneja iol-auth.ts del lado del servidor (getValidToken),
// así que las tools no necesitan recibir credenciales.
export function createPortfolioTools() {
  return {
    getPortfolio: tool({
      description:
        "Devuelve la cartera actual del usuario en IOL: posiciones (ticker, tipo, cantidad, precio, PPC, valuación, resultado en $ y %, variación diaria), totales y efectivo disponible.",
      inputSchema: z.object({}),
      execute: async () => {
        const data = await getPortafolio();
        return {
          totalValuacion: data.totalValuacion,
          costoTotal: data.costoTotal,
          resultadoNoRealizadoPesos: data.totalPnlPesos,
          resultadoNoRealizadoPct: data.totalPnlPorcentaje,
          variacionHoyPct: data.variacionHoy,
          variacionHoyPesos: data.variacionHoyPesos,
          efectivo: data.estadoCuenta
            ? {
                disponibleARS: data.estadoCuenta.disponibleARS,
                disponibleUSD: data.estadoCuenta.disponibleUSD,
                totalConEfectivo: data.estadoCuenta.totalConEfectivo,
              }
            : null,
          posiciones: data.posiciones.map((p) => ({
            ticker: p.ticker,
            nombre: p.nombre,
            tipo: p.tipo,
            cantidad: p.cantidad,
            precioActual: p.precioActual,
            ppc: p.ppc,
            valuacion: p.valuacion,
            resultadoPesos: p.pnlPesos,
            resultadoPct: p.pnlPorcentaje,
            variacionDiariaPct: p.variacionDiaria,
          })),
        };
      },
    }),
  };
}
