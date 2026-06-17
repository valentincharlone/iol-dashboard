const COLS = ["180px", "90px", "80px", "80px", "80px", "80px", "80px", "100px"];

export default function CotizacionesLoading() {
  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-4 md:gap-5">
      <div>
        <div className="shimmer h-6 w-40 mb-1.5" />
        <div className="shimmer h-3.5 w-56" />
      </div>

      <div className="bg-white rounded-card border border-border-light shadow-card overflow-clip">
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="shimmer h-[18px] w-[120px]" />
            <div className="shimmer h-3.5 w-20" />
          </div>
          <div className="shimmer h-8 w-56 rounded-lg" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                {COLS.map((w, i) => (
                  <th key={i} className={`py-2.5 px-3 border-b border-border ${i === 0 ? "pl-5 text-left" : "text-right"}`}>
                    <div className="shimmer" style={{ height: 10, width: w, marginLeft: i === 0 ? 0 : "auto" }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  <td className="pl-5 pr-3 py-3 border-b border-[#F5F7FB]">
                    <div className="shimmer h-3.5 w-14 mb-1" />
                    <div className="shimmer h-[11px] w-28" />
                  </td>
                  {COLS.slice(1).map((w, j) => (
                    <td key={j} className="px-3 py-3 border-b border-[#F5F7FB] text-right">
                      <div className="shimmer ml-auto" style={{ height: 14, width: parseInt(w) * 0.6 }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
