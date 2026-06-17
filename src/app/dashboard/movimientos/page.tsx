import { getOperaciones } from "@/lib/iol-actions";
import { MovimientosTable } from "@/components/MovimientosTable";

type SearchParams = Promise<{ desde?: string; hasta?: string }>;

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { desde, hasta } = await searchParams;
  const operaciones = await getOperaciones(desde, hasta);

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
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-1)",
            margin: 0,
          }}
        >
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
