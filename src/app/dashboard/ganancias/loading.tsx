export default function Loading() {
  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-5">
      <div>
        <div className="shimmer h-7 w-52 rounded mb-2" />
        <div className="shimmer h-4 w-36 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-card shadow-sm p-5">
            <div className="shimmer h-3.5 w-28 rounded mb-3" />
            <div className="shimmer h-7 w-36 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-card shadow-sm overflow-clip">
        <div className="px-5 py-4 border-b border-border">
          <div className="shimmer h-5 w-32 rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center px-5 py-3.5 border-b border-[#F5F7FB]">
            <div className="shimmer h-4 w-24 rounded" />
            <div className="shimmer h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
