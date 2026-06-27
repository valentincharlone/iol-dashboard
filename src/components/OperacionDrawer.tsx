"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getOperacionDetalle } from "@/lib/iol-actions";
import type { IOLOperacionDetalle } from "@/lib/iol-types";
import { getTipoCls, getEstadoCls, fmtEnum, fmtEstado } from "@/lib/operacion";
import { fmtFechaHora, getMonedaPrefix } from "@/lib/fmt";
import { DrawerSection, DrawerRow } from "./DrawerPrimitives";

function fmtNum(n: number | null | undefined, prefix = "$") {
  if (n == null) return "—";
  return (
    prefix +
    Math.abs(n).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function fmtCant(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("es-AR");
}

interface Props {
  numero: number | null;
  onClose: () => void;
}

export function OperacionDrawer({ numero, onClose }: Props) {
  const [op, setOp] = useState<IOLOperacionDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (numero == null) {
      setOp(null);
      return;
    }
    setLoading(true);
    setError(false);
    getOperacionDetalle(numero)
      .then(setOp)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [numero]);

  useEffect(() => {
    if (numero == null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [numero, onClose]);

  const open = numero != null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-[400px] bg-card z-50 flex flex-col shadow-[-8px_0_32px_rgba(0,0,0,0.12)] dark:shadow-[-8px_0_32px_rgba(0,0,0,0.5)] transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <div className="text-[15px] font-bold text-text1">
              Operación #{numero}
            </div>
            <div className="text-[12px] text-text3 mt-0.5">
              Detalle completo
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text3 hover:text-text1 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex flex-col gap-3 pt-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between py-3 border-b border-border-light"
                >
                  <div className="shimmer h-3.5 w-24" />
                  <div className="shimmer h-3.5 w-28" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-[13px] text-text3 text-center pt-8">
              No se pudo cargar el detalle de la operación.
            </p>
          )}

          {op &&
            !loading &&
            (() => {
              const { cls: tipoCls, label: tipoLabel } = getTipoCls(op.tipo);
              const estadoCls = getEstadoCls(op.estadoActual);
              const monedaPrefix = getMonedaPrefix(op.moneda);
              const isDividendo = !op.tipo || op.tipo === "";
              const aranceles = op.aranceles?.filter((a) => a.neto !== 0) ?? [];

              return (
                <div>
                  <div className="flex items-center gap-2 mb-5 pt-1">
                    <span
                      className={`text-[12px] font-semibold px-2.5 py-1 rounded-md ${tipoCls}`}
                    >
                      {tipoLabel || "Acreditación"}
                    </span>
                    <span className={`text-[13px] font-semibold ${estadoCls}`}>
                      {fmtEstado(op.estadoActual)}
                    </span>
                  </div>

                  <div className="bg-surfaceInset rounded-xl p-4 mb-1">
                    <div className="text-[20px] font-bold text-text1">
                      {op.simbolo}
                    </div>
                    <div className="text-[12px] text-text3 mt-0.5">
                      {op.mercado}
                    </div>
                  </div>

                  <DrawerSection title="Fechas">
                    <DrawerRow
                      label="Fecha de alta"
                      value={fmtFechaHora(op.fechaAlta)}
                    />
                    <DrawerRow
                      label="Fecha operada"
                      value={fmtFechaHora(op.fechaOperado)}
                    />
                    {op.validez && (
                      <DrawerRow
                        label="Validez hasta"
                        value={fmtFechaHora(op.validez)}
                      />
                    )}
                  </DrawerSection>

                  {!isDividendo && (
                    <DrawerSection title="Cantidades y precios">
                      <DrawerRow
                        label="Cantidad"
                        value={fmtCant(op.cantidad)}
                        mono
                      />
                      <DrawerRow
                        label="Precio"
                        value={fmtNum(op.precio, monedaPrefix)}
                        mono
                      />
                    </DrawerSection>
                  )}

                  <DrawerSection title="Totales">
                    <DrawerRow
                      label="Monto"
                      value={fmtNum(op.monto, monedaPrefix)}
                      mono
                    />
                    <DrawerRow
                      label="Monto operado"
                      value={fmtNum(op.montoOperacion, monedaPrefix)}
                      mono
                    />
                    {op.fondosParaOperacion != null && (
                      <DrawerRow
                        label="Fondos requeridos"
                        value={fmtNum(op.fondosParaOperacion, monedaPrefix)}
                        mono
                      />
                    )}
                  </DrawerSection>

                  {aranceles.length > 0 && (
                    <DrawerSection title="Aranceles">
                      {aranceles.map((a, i) => (
                        <DrawerRow
                          key={i}
                          label={a.tipo || "Arancel"}
                          value={fmtNum(
                            a.neto + a.iva,
                            getMonedaPrefix(a.moneda),
                          )}
                          mono
                        />
                      ))}
                      {op.arancelesARS != null && op.arancelesARS !== 0 && (
                        <DrawerRow
                          label="Total ARS"
                          value={fmtNum(op.arancelesARS)}
                          mono
                        />
                      )}
                      {op.arancelesUSD != null && op.arancelesUSD !== 0 && (
                        <DrawerRow
                          label="Total USD"
                          value={fmtNum(op.arancelesUSD, "US$")}
                          mono
                        />
                      )}
                    </DrawerSection>
                  )}

                  {!isDividendo && (
                    <DrawerSection title="Condiciones">
                      <DrawerRow
                        label="Modalidad"
                        value={fmtEnum(op.modalidad)}
                      />
                      <DrawerRow label="Plazo" value={fmtEnum(op.plazo)} />
                      <DrawerRow label="Moneda" value={fmtEnum(op.moneda)} />
                    </DrawerSection>
                  )}
                </div>
              );
            })()}
        </div>
      </div>
    </>
  );
}
