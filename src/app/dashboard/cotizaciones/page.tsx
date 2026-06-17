import { getCotizacionesPortafolio } from "@/lib/iol-actions";
import { CotizacionesTable } from "@/components/CotizacionesTable";

export default async function CotizacionesPage() {
  const items = await getCotizacionesPortafolio();

  return (
    <div
      style={{
        padding: "24px",
        paddingBottom: 48,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-1)",
              margin: 0,
            }}
          >
            Cotizaciones
          </h1>
          <p
            style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}
          >
            Mercado en tiempo real · tus posiciones
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#059669",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10B981",
              boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
              animation: "livePulse 2s ease-in-out infinite",
              display: "inline-block",
            }}
          />
          En vivo
        </span>
      </div>

      <CotizacionesTable items={items} />
    </div>
  );
}
