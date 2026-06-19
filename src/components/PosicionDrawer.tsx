"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getCotizacionDetalle, getOperacionesByTicker } from "@/lib/iol-actions";
import type { DashboardPosicion, IOLCotizacionDetalle, IOLOperacion } from "@/lib/iol-types";
import { fmtMoney, fmtPct } from "@/lib/fmt";
import { getBadge, tipoLabel } from "@/lib/instrument";
import { getTipoCls } from "@/lib/operacion";

function fmtPrice(n: number) {
  return (
    "$" +
    n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

function fmtCant(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("es-AR");
}

function fmtFecha(iso: string) {
  try {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return iso;
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-[10px] font-semibold text-text3 uppercase tracking-wide mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-[#F5F7FB] last:border-0 gap-4">
      <span className="text-[12px] text-text3 font-medium shrink-0">{label}</span>
      <span className={`text-[13px] text-text1 font-semibold text-right ${mono ? "tabular-nums" : ""}`}>
        {value}
      </span>
    </div>
  );
}

interface Props {
  posicion: DashboardPosicion | null;
  onClose: () => void;
}

export function PosicionDrawer({ posicion, onClose }: Props) {
  const [cotiz, setCotiz] = useState<IOLCotizacionDetalle | null>(null);
  const [ops, setOps] = useState<IOLOperacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!posicion) { setCotiz(null); setOps([]); return; }
    setLoading(true);
    setError(false);
    Promise.all([
      getCotizacionDetalle(posicion.mercado, posicion.ticker),
      getOperacionesByTicker(posicion.ticker),
    ])
      .then(([c, o]) => { setCotiz(c); setOps(o); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [posicion]);

  useEffect(() => {
    if (!posicion) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [posicion, onClose]);

  const open = posicion != null;
  const badge = posicion ? getBadge(posicion.tipo) : null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-[420px] bg-white z-50 flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.08)] transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            {posicion && (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[17px] font-bold text-text1">{posicion.ticker}</span>
                    {badge && (
                      <span
                        className="text-[9px] font-semibold px-1.5 py-px rounded-[3px] tracking-[0.3px]"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {tipoLabel(posicion.tipo)}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-text3 mt-0.5 truncate max-w-[280px]">{posicion.nombre}</div>
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="text-text3 hover:text-text1 transition-colors p-1 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">

          {loading && (
            <div className="flex flex-col gap-3 pt-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2.5 border-b border-[#F5F7FB]">
                  <div className="shimmer h-3.5 w-24" />
                  <div className="shimmer h-3.5 w-28" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-[13px] text-text3 text-center pt-8">
              No se pudo cargar el detalle.
            </p>
          )}

          {!loading && !error && posicion && (
            <div>
              {/* Precio hero */}
              {cotiz && (
                <div className="bg-[#F8F9FE] rounded-xl p-4 mb-1">
                  <div className="text-[26px] font-bold text-text1 tabular-nums">
                    {fmtPrice(cotiz.ultimoPrecio)}
                  </div>
                  <div className={`text-[13px] font-semibold tabular-nums mt-0.5 ${cotiz.variacion >= 0 ? "text-profit" : "text-loss"}`}>
                    {fmtPct(cotiz.variacion)}
                    <span className="text-text3 font-normal ml-1.5 text-[11px]">{cotiz.tendencia}</span>
                  </div>
                </div>
              )}

              {/* Tu posición */}
              <Section title="Tu posición">
                <Row label="Cantidad" value={fmtCant(posicion.cantidad)} mono />
                <Row label="PPC" value={fmtPrice(posicion.ppc)} mono />
                <Row label="Valuación" value={fmtMoney(posicion.valuacion)} mono />
                <Row
                  label="P&L total"
                  value={
                    <span className={posicion.pnlPorcentaje >= 0 ? "text-profit" : "text-loss"}>
                      {fmtPct(posicion.pnlPorcentaje)}
                      <span className="block text-[11px] opacity-75">
                        {posicion.pnlPesos >= 0 ? "+" : ""}{fmtMoney(posicion.pnlPesos)}
                      </span>
                    </span>
                  }
                  mono
                />
              </Section>

              {/* Hoy */}
              {cotiz && (
                <Section title="Hoy">
                  <Row label="Apertura"        value={fmtPrice(cotiz.apertura)}       mono />
                  <Row label="Máximo"          value={fmtPrice(cotiz.maximo)}         mono />
                  <Row label="Mínimo"          value={fmtPrice(cotiz.minimo)}         mono />
                  <Row label="Cierre anterior" value={fmtPrice(cotiz.cierreAnterior)} mono />
                  {cotiz.montoOperado > 0 && (
                    <Row label="Monto operado" value={fmtMoney(cotiz.montoOperado)} mono />
                  )}
                </Section>
              )}

              {/* Puntas */}
              {cotiz?.puntas && cotiz.puntas.length > 0 && (
                <Section title="Puntas">
                  {cotiz.puntas.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#F5F7FB] last:border-0">
                      <div className="flex gap-4">
                        <div>
                          <div className="text-[10px] text-text3 font-medium mb-0.5">Compra</div>
                          <div className="text-[13px] font-semibold text-profit tabular-nums">{fmtPrice(p.precioCompra)}</div>
                          <div className="text-[10px] text-text3 tabular-nums">{fmtCant(p.cantidadCompra)} ud.</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-text3 font-medium mb-0.5">Venta</div>
                          <div className="text-[13px] font-semibold text-loss tabular-nums">{fmtPrice(p.precioVenta)}</div>
                          <div className="text-[10px] text-text3 tabular-nums">{fmtCant(p.cantidadVenta)} ud.</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Section>
              )}

              {/* Últimas operaciones */}
              <Section title={`Operaciones (${ops.length})`}>
                {ops.length === 0 ? (
                  <p className="text-[12px] text-text3 py-2">Sin operaciones registradas.</p>
                ) : (
                  <div className="flex flex-col gap-0">
                    {ops.slice(0, 8).map((op) => {
                      const { cls, label } = getTipoCls(op.tipo);
                      const precio = op.precioOperado ?? op.precio;
                      const cantidad = op.cantidadOperada ?? op.cantidad;
                      const monedaPrefix = op.moneda?.toLowerCase().includes("dolar") ? "US$" : "$";
                      const total = op.montoOperado ?? op.monto;
                      return (
                        <div key={op.numero} className="flex items-center justify-between py-2.5 border-b border-[#F5F7FB] last:border-0 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`text-[10px] font-semibold px-1.5 py-px rounded-[3px] shrink-0 ${cls}`}>
                              {label || "—"}
                            </span>
                            <span className="text-[11px] text-text3 shrink-0">
                              {fmtFecha(op.fechaOrden)}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            {precio != null && (
                              <div className="text-[12px] font-semibold text-text1 tabular-nums">
                                {monedaPrefix}{precio.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {cantidad != null && (
                                  <span className="text-text3 font-normal"> × {fmtCant(cantidad)}</span>
                                )}
                              </div>
                            )}
                            {total != null && (
                              <div className="text-[10px] text-text3 tabular-nums">
                                Total {monedaPrefix}{Math.abs(total).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
