import { getValidToken, invalidateTokens } from "@/lib/iol-auth";
import { IOL_API_BASE } from "@/lib/config";
import { toDateInput } from "@/lib/fmt";
import { NextRequest } from "next/server";

function fechaDesde(periodo: string): string {
  const d = new Date();
  switch (periodo) {
    case "1S": d.setDate(d.getDate() - 7); break;
    case "1M": d.setMonth(d.getMonth() - 1); break;
    case "3M": d.setMonth(d.getMonth() - 3); break;
    case "6M": d.setMonth(d.getMonth() - 6); break;
    case "1A": d.setFullYear(d.getFullYear() - 1); break;
    default:   d.setMonth(d.getMonth() - 1);
  }
  return toDateInput(d);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await params;
  const url = new URL(req.url);
  const periodo = url.searchParams.get("periodo") ?? "1M";
  const mercado = url.searchParams.get("mercado") ?? "bCBA";

  const hoy = toDateInput(new Date());
  const desde = fechaDesde(periodo);

  let token: string;
  try {
    token = await getValidToken();
  } catch {
    return Response.json({ error: "Auth error" }, { status: 401 });
  }

  const ajustada = url.searchParams.get("ajustada") ?? "sinAjustar";
  const endpoint = `${IOL_API_BASE}/api/v2/${mercado}/Titulos/${encodeURIComponent(ticker)}/Cotizacion/seriehistorica/${desde}/${hoy}/${ajustada}`;

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    invalidateTokens();
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!res.ok) {
    return Response.json({ error: `IOL error ${res.status}` }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
