import { getPerfil, getPortafolio } from "@/lib/iol-actions";
import { fmtMoney, fmtUSD } from "@/lib/fmt";

const PERFIL_BADGE: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  conservador: {
    bg: "bg-profit-bg",
    text: "text-profit",
    label: "Conservador",
  },
  moderado: { bg: "bg-orange-50", text: "text-orange-700", label: "Moderado" },
  agresivo: { bg: "bg-loss-bg", text: "text-loss", label: "Agresivo" },
  agresivo_moderado: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    label: "Agresivo moderado",
  },
  moderado_agresivo: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
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
    <div className="flex justify-between items-center py-3.5 border-b border-[#F5F7FB]">
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
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-bold text-text1 m-0">Mi perfil</h1>
        <p className="text-[13px] text-text3 mt-0.5">
          Datos de tu cuenta en InvertirOnLine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Datos personales */}
        <div className="bg-white rounded-card shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-xl tracking-tight shrink-0">
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
          <div className="bg-gradient-to-br from-brand to-brand-light rounded-card p-6 md:p-7 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.08]" />
            <div className="text-[12px] font-medium opacity-80 mb-1.5">
              Valuación de títulos
            </div>
            <div className="text-[28px] font-bold tabular-nums tracking-tight">
              {fmtMoney(totalValuacion)}
            </div>
            <div className="text-[12px] opacity-65 mt-1.5">
              {cantidadPosiciones} posiciones activas
            </div>
          </div>

          {/* Efectivo */}
          {estadoCuenta && (
            <div className="bg-white rounded-card shadow-sm p-5 md:p-6">
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
                <div className="border-t border-[#F5F7FB] pt-3 flex justify-between items-center">
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
    </div>
  );
}
