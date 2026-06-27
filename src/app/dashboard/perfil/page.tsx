export const dynamic = "force-dynamic";

import { getPerfil, getPortafolio } from "@/lib/iol-actions";
import { ValuacionCard } from "@/components/ValuacionCard";
import { fmtMoney, fmtUSD } from "@/lib/fmt";
import { IOL_LOGO_GRADIENT } from "@/lib/config";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";

const PERFIL_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  conservador: {
    bg: "bg-profit-bg",
    text: "text-profit",
    label: "Conservador",
  },
  moderado: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-400",
    label: "Moderado",
  },
  agresivo: { bg: "bg-loss-bg", text: "text-loss", label: "Agresivo" },
  agresivo_moderado: {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    text: "text-yellow-800 dark:text-yellow-400",
    label: "Agresivo moderado",
  },
  moderado_agresivo: {
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    text: "text-yellow-800 dark:text-yellow-400",
    label: "Moderado agresivo",
  },
};

function perfilBadge(perfil: string) {
  const key = perfil?.toLowerCase().replace(/\s+/g, "_") ?? "";
  return (
    PERFIL_BADGE[key] ?? {
      bg: "bg-brand-muted",
      text: "text-brand",
      label: perfil ?? "—",
    }
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3.5 border-b border-border-light">
      <span className="text-[13px] text-text3 font-medium">{label}</span>
      <span className="text-[13px] text-text1 font-semibold">{value}</span>
    </div>
  );
}

export default async function PerfilPage() {
  const [perfil, portafolio] = await Promise.all([
    getPerfil(),
    getPortafolio(),
  ]);
  const { estadoCuenta, totalValuacion, cantidadPosiciones } = portafolio;
  const badge = perfilBadge(perfil.perfilInversor);
  const initials =
    `${perfil.nombre?.[0] ?? ""}${perfil.apellido?.[0] ?? ""}`.toUpperCase();

  return (
    <PageContainer>
      <PageHeader
        title="Mi perfil"
        subtitle="Datos de tu cuenta en InvertirOnLine"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Datos personales */}
        <div className="bg-card rounded-card shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-14 h-14 rounded-full ${IOL_LOGO_GRADIENT} flex items-center justify-center text-white font-bold text-xl tracking-tight shrink-0`}
            >
              {initials || "?"}
            </div>
            <div>
              <div className="text-[17px] font-bold text-text1">
                {perfil.nombre} {perfil.apellido}
              </div>
              <div className="text-[12px] text-text3 mt-0.5">
                {perfil.email}
              </div>
              <span
                className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${badge.bg} ${badge.text} tracking-wide`}
              >
                {badge.label}
              </span>
            </div>
          </div>

          <div>
            <Row label="N° de cuenta" value={perfil.numeroCuenta} />
            <Row label="DNI" value={perfil.dni} />
            <Row label="CUIT / CUIL" value={perfil.cuitCuil} />
            <Row label="Email" value={perfil.email} />
            <div className="flex justify-between items-center pt-3.5">
              <span className="text-[13px] text-text3 font-medium">
                Estado de cuenta
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded ${perfil.cuentaAbierta ? "bg-profit-bg text-profit" : "bg-loss-bg text-loss"}`}
              >
                {perfil.cuentaAbierta ? "Activa" : "Cerrada"}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen de cuenta */}
        <div className="flex flex-col gap-3.5">
          {/* Valuación */}
          <ValuacionCard valuacion={totalValuacion}>
            <div className="text-[12px] opacity-65">
              {cantidadPosiciones} posiciones activas
            </div>
          </ValuacionCard>

          {/* Efectivo */}
          {estadoCuenta && (
            <div className="bg-card rounded-card shadow-sm p-5 md:p-6">
              <div className="text-[11px] font-semibold text-text3 uppercase tracking-wide mb-4">
                Efectivo disponible
              </div>
              <div className="flex flex-col gap-3">
                {[
                  {
                    moneda: "ARS",
                    valor: fmtMoney(estadoCuenta.disponibleARS),
                  },
                  { moneda: "USD", valor: fmtUSD(estadoCuenta.disponibleUSD) },
                ].map((r) => (
                  <div
                    key={r.moneda}
                    className="flex justify-between items-center"
                  >
                    <span className="text-[13px] text-text3 font-medium">
                      {r.moneda}
                    </span>
                    <span className="text-[16px] font-bold tabular-nums text-text1">
                      {r.valor}
                    </span>
                  </div>
                ))}
                <div className="border-t border-border-light pt-3 flex justify-between items-center">
                  <span className="text-[13px] text-text3 font-medium">
                    Total con efectivo
                  </span>
                  <span className="text-[16px] font-bold tabular-nums text-brand">
                    {fmtMoney(estadoCuenta.totalConEfectivo)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
