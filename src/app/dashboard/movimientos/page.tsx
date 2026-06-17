import { getOperaciones } from "@/lib/iol-actions";
import { MovimientosTable } from "@/components/MovimientosTable";
import { Suspense } from "react";

type SearchParams = Promise<{ desde?: string; hasta?: string }>;

async function MovimientosContent({ searchParams }: { searchParams: SearchParams }) {
  const { desde, hasta } = await searchParams;
  const operaciones = await getOperaciones(desde, hasta);

  return (
    <div style={{ padding: "24px", paddingBottom: 48, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
          Movimientos
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "2px 0 0" }}>
          Historial de operaciones · Argentina
        </p>
      </div>

      <MovimientosTable
        operaciones={operaciones}
        defaultDesde={desde ?? ""}
        defaultHasta={hasta ?? ""}
      />
    </div>
  );
}

export default function MovimientosPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", height: "100%", alignItems: "center",
            justifyContent: "center", minHeight: "50vh" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              border: "2px solid #6366F1", borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite", margin: "0 auto 10px",
            }} />
            <p style={{ fontSize: 14, color: "var(--text-3)" }}>Cargando movimientos…</p>
          </div>
        </div>
      }
    >
      <MovimientosContent searchParams={searchParams} />
    </Suspense>
  );
}
