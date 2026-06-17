"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard error]", error);
  }, [error]);

  const is401 = error.message?.includes("401");

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="bg-white rounded-2xl border border-border shadow-sm p-9 text-center max-w-[400px] w-full">
        <div className="w-12 h-12 rounded-full bg-[#FFF1F0] flex items-center justify-center mx-auto mb-4 text-[22px]">
          ⚠
        </div>
        <h2 className="text-[17px] font-bold text-text1 mb-2">
          {is401 ? "Sesión con IOL expirada" : "Algo salió mal"}
        </h2>
        <p className="text-[13px] text-text3 mb-6 leading-relaxed">
          {is401
            ? "No se pudo conectar con la API de InvertirOnline. El token fue rechazado."
            : "Ocurrió un error al cargar el portafolio. Podés reintentar o recargar la página."}
        </p>
        <div className="flex gap-2.5 justify-center">
          <button
            onClick={reset}
            className="bg-brand text-white border-none rounded-lg px-6 py-2.5 text-sm font-semibold cursor-pointer font-[inherit] transition-opacity hover:opacity-90"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-transparent text-text3 border border-border rounded-lg px-6 py-2.5 text-sm font-medium cursor-pointer font-[inherit] hover:bg-[#F5F6FA] transition-colors"
          >
            Recargar
          </button>
        </div>
      </div>
    </div>
  );
}
