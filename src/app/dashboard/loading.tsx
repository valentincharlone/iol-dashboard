function Sk({ w, h = 13, className = "" }: { w: number | string; h?: number; className?: string }) {
  return <div className={`shimmer ${className}`} style={{ height: h, width: w }} />;
}

const card = "bg-white rounded-card border border-border-light shadow-card";

export default function DashboardLoading() {
  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-4 md:gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <Sk w={120} h={22} />
          <Sk w={160} />
        </div>
        <Sk w={70} h={14} />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-kpi gap-3 md:gap-3.5">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-brand to-brand-light rounded-card p-6 md:p-7">
          <div className="shimmer h-3 w-36 mb-2.5 opacity-40" />
          <div className="shimmer h-8 w-48 mb-3 opacity-40" />
          <div className="flex gap-4">
            <div className="shimmer h-[11px] w-28 opacity-30" />
            <div className="shimmer h-[11px] w-28 opacity-30" />
          </div>
        </div>
        {[
          [100, 28, 80],
          [90, 28, 70],
          [70, 28, 50],
        ].map(([lw, vh, vw], i) => (
          <div key={i} className={`${card} p-5 flex flex-col gap-2 ${i === 2 ? "col-span-2 md:col-span-1" : ""}`}>
            <Sk w={lw} h={10} />
            <Sk w={vw} h={vh} />
            <Sk w={80} h={12} />
          </div>
        ))}
      </div>

      {/* Top movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-3.5">
        {[0, 1].map((i) => (
          <div key={i} className={`${card} p-4 md:p-5`}>
            <Sk w={80} h={10} />
            <div className="flex flex-col gap-3.5 mt-3.5">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Sk w={40} />
                    <Sk w={90} h={11} />
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Sk w={55} />
                    <Sk w={70} h={10} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Distribución + Holdings */}
      <div className="grid grid-cols-1 md:grid-cols-bottom gap-4 md:gap-5 items-start">
        <div className={`${card} p-5 md:p-6`}>
          <Sk w={90} h={14} />
          <div className="flex justify-center mt-6">
            <div className="shimmer w-[180px] h-[180px] rounded-full" />
          </div>
          <div className="flex flex-col gap-2.5 mt-5">
            {[100, 80, 110, 70].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="shimmer w-2.5 h-2.5 rounded-full shrink-0" />
                <Sk w={w} h={12} />
                <Sk w={50} h={12} className="ml-auto" />
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} overflow-clip`}>
          <div className="px-5 py-4 border-b border-border-light flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Sk w={100} h={16} />
              <Sk w={80} h={12} />
            </div>
            <div className="flex gap-1.5">
              {[36, 36, 36, 140].map((w, i) => <Sk key={i} w={w} h={28} />)}
            </div>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[160, 70, 70, 80, 80, 80, 70].map((w, i) => (
                  <th key={i} className={`py-2.5 px-3 border-b border-border ${i === 0 ? "pl-5" : ""} ${i === 6 ? "pr-5" : ""}`}>
                    <div className="shimmer" style={{ height: 10, width: w, marginLeft: i === 0 ? 0 : "auto" }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="pl-5 pr-3 py-3 border-b border-[#F5F7FB]">
                    <Sk w={50} h={14} className="mb-1" />
                    <Sk w={110} h={11} />
                  </td>
                  {[50, 60, 70, 65, 65, 55].map((w, j) => (
                    <td key={j} className={`px-3 py-3 border-b border-[#F5F7FB] text-right ${j === 5 ? "pr-5" : ""}`}>
                      <div className="shimmer ml-auto" style={{ height: 14, width: w }} />
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
