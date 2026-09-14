export default function Loading() {
  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-5">
      <div>
        <div className="shimmer h-7 w-40 rounded mb-2" />
        <div className="shimmer h-4 w-72 rounded" />
      </div>

      {/* Resultado total */}
      <div className="bg-card rounded-card shadow-sm p-5 md:p-6 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-6 md:gap-10">
        <div>
          <div className="shimmer h-3.5 w-44 rounded mb-3" />
          <div className="shimmer h-9 w-56 rounded mb-2" />
          <div className="shimmer h-4 w-48 rounded mb-4" />
          <div className="shimmer h-3 w-full rounded mb-1.5" />
          <div className="shimmer h-3 w-3/4 rounded" />
        </div>
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex justify-between gap-4 py-3 border-b border-border-light"
            >
              <div className="flex-1">
                <div className="shimmer h-4 w-40 rounded mb-2" />
                <div className="shimmer h-3 w-4/5 rounded" />
              </div>
              <div className="shimmer h-5 w-24 rounded" />
            </div>
          ))}
          <div className="flex justify-between pt-3">
            <div className="shimmer h-4 w-32 rounded" />
            <div className="shimmer h-5 w-28 rounded" />
          </div>
        </div>
      </div>

      <div className="shimmer h-20 rounded-card" />

      {/* Período */}
      <div className="bg-card rounded-card shadow-sm overflow-clip">
        <div className="px-5 py-4 border-b border-border">
          <div className="shimmer h-5 w-56 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-light border-b border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card p-4 md:p-5">
              <div className="shimmer h-3 w-24 rounded mb-2.5" />
              <div className="shimmer h-6 w-28 rounded" />
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center px-5 py-3.5 border-b border-border-light"
          >
            <div className="shimmer h-4 w-24 rounded" />
            <div className="shimmer h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
