// src/lib/iol-types.ts
// Tipos que mapean la respuesta real de GET /api/v2/portafolio/argentina

export interface IOLTitulo {
  simbolo: string;
  descripcion: string;
  pais: string;
  mercado: string;
  tipo: string;
  plazo: string;
  moneda: string;
}

export interface IOLUltimoPrecio {
  fechaHora: string;
  precio: number;
  variacionPorcentual: number;
  apertura: number;
  maximo: number;
  minimo: number;
  ultimoOperado: number;
  cantidadOperaciones: number;
  volumenNominal: number;
  montoOperado: number;
  puntas: null | unknown;
  tendencia: string;
  cierreAnterior: number;
  moneda: string;
  volumenHistorico: number | null;
  decimales: number;
}

export interface IOLPosicion {
  titulo: IOLTitulo;
  cantidad: number;
  comprometido: number;
  puntosVariacion: number;
  variacionDiaria: number;
  ultimoPrecio: number;
  ppc: number;
  valorizado: number;
  gananciaPorcentaje: number;
  gananciaDinero: number; // P&L en pesos (campo real de la API)
  parking?: { disponibleInmediato: number };
}

export interface IOLPortafolio {
  pais: string;
  activos: IOLPosicion[];
  totalValorizado: number | null;
  estadoCuenta: null | unknown;
}

// Tipo procesado para el dashboard (lo que usamos en la UI)
export interface DashboardPosicion {
  ticker: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  precioActual: number;
  ppc: number; // precio promedio de compra
  valuacion: number;
  pnlPesos: number;
  pnlPorcentaje: number;
  variacionDiaria: number;
}

export interface IOLSaldoLiquidacion {
  liquidacion: string; // "inmediato" | "24hs" | "48hs"
  saldo: number;
  comprometido: number;
  disponible: number;
  disponibleOperar: number;
}

export interface IOLCuenta {
  numero: string;
  tipo: string; // "inversion_Argentina_Pesos" | "inversion_Argentina_Dolares" | etc.
  moneda: string; // "peso_Argentino" | "dolar_Estadounidense"
  disponible: number;
  comprometido: number;
  saldo: number;
  titulosValorizados: number;
  total: number;
  margenDescubierto: number;
  saldos: IOLSaldoLiquidacion[];
  estado: string;
}

export interface IOLEstadoCuenta {
  cuentas: IOLCuenta[];
  estadisticas: Array<{
    descripcion: string;
    cantidad: number;
    volumen: number;
  }>;
  totalEnPesos: number;
}

export interface EstadoCuenta {
  disponibleARS: number;
  disponibleUSD: number;
  totalConEfectivo: number;
  gananciaTotalPesos: number;
  gananciaTotalPorcentaje: number;
}

export interface DashboardData {
  posiciones: DashboardPosicion[];
  totalValuacion: number;
  costoTotal: number;
  totalPnlPesos: number;
  totalPnlPorcentaje: number;
  variacionHoy: number;
  variacionHoyPesos: number;
  cantidadPosiciones: number;
  estadoCuenta: EstadoCuenta | null;
}

// Respuesta real de GET /api/v2/{mercado}/Titulos/{simbolo}/Cotizacion — estructura plana
export interface IOLCotizacionResponse {
  ultimoPrecio: number;
  variacion: number; // % de variación diaria
  apertura: number;
  maximo: number;
  minimo: number;
  fechaHora: string;
  tendencia: string; // "sube" | "baja" | "mantiene"
  cierreAnterior: number;
  montoOperado: number;
  volumenNominal: number;
  precioPromedio?: number;
  cantidadOperaciones?: number;
  moneda: string;
}

export interface CotizacionItem {
  ticker: string;
  nombre: string;
  tipo: string;
  mercado: string;
  precio: number;
  variacionPorcentual: number;
  apertura: number;
  maximo: number;
  minimo: number;
  cierreAnterior: number;
  volumenNominal: number;
  montoOperado: number;
  cantidadOperaciones: number;
  moneda: string;
  tendencia: string;
}

export interface IOLPerfil {
  nombre: string;
  apellido: string;
  numeroCuenta: string;
  dni: string;
  cuitCuil: string;
  sexo: string;
  perfilInversor: string;
  email: string;
  cuentaAbierta: boolean;
  actualizarDDJJ: boolean;
  actualizarTestInversor: boolean;
}

export interface MarketStripItem {
  label: string;
  value: string;
  variacion: number | null;
}

export interface IOLOperacion {
  numero: number;
  fechaOrden: string;
  fechaOperada?: string | null;
  tipo: string;
  estado: string;
  mercado: string;
  simbolo: string;
  cantidad: number | null;
  cantidadOperada: number | null;
  precio: number | null;
  precioOperado: number | null;
  monto: number | null;
  montoOperado: number | null;
  modalidad: string;
  plazo: string;
  moneda?: string | null;
}
