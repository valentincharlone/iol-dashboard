const COLS = ["140px", "80px", "120px", "70px", "90px", "100px", "80px"];

export default function MovimientosLoading() {
  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-4 md:gap-5">
      <div>
        <div className="shimmer h-6 w-40 mb-1.5" />
        <div className="shimmer h-3.5 w-60" />
      </div>

      <div className="bg-white rounded-card shadow-card overflow-clip">
        <div className="px-5 py-4 border-b border-border-light flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="shimmer h-[18px] w-28" />
            <div className="shimmer h-3.5 w-24" />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {[70, 70, 70, 60, 70, 80, 80].map((w, i) => (
              <div
                key={i}
                className="shimmer rounded-md"
                style={{ height: 30, width: w }}
              />
            ))}
            <div
              className="shimmer rounded-lg"
              style={{ height: 30, width: 100 }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                {COLS.map((w, i) => (
                  <th
                    key={i}
                    className={`py-2.5 px-3 border-b border-border ${i === 0 ? "pl-5" : ""} ${i === COLS.length - 1 ? "pr-5" : ""} ${i < 3 ? "text-left" : "text-right"}`}
                  >
                    <div
                      className="shimmer"
                      style={{
                        height: 10,
                        width: w,
                        marginLeft: i < 3 ? 0 : "auto",
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  <td className="pl-5 pr-3 py-3 border-b border-[#F5F7FB]">
                    <div className="shimmer h-3 w-28" />
                  </td>
                  <td className="px-3 py-3 border-b border-[#F5F7FB]">
                    <div className="shimmer h-5 w-16 rounded" />
                  </td>
                  <td className="px-3 py-3 border-b border-[#F5F7FB]">
                    <div className="shimmer h-3.5 w-14 mb-1" />
                    <div className="shimmer h-[11px] w-9" />
                  </td>
                  {[50, 80, 90, 60].map((w, j) => (
                    <td
                      key={j}
                      className={`px-3 py-3 border-b border-[#F5F7FB] text-right ${j === 3 ? "pr-5" : ""}`}
                    >
                      <div
                        className="shimmer ml-auto"
                        style={{ height: 14, width: w }}
                      />
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
