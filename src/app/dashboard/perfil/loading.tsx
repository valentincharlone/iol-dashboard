export default function PerfilLoading() {
  return (
    <div className="p-4 pb-12 md:p-6 md:pb-16 flex flex-col gap-5">
      <div>
        <div className="shimmer h-6 w-36 mb-1.5" />
        <div className="shimmer h-3.5 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Card datos personales */}
        <div className="bg-white rounded-card border border-border-light shadow-card p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="shimmer w-14 h-14 rounded-full shrink-0" />
            <div>
              <div className="shimmer h-[18px] w-40 mb-2" />
              <div className="shimmer h-3 w-48" />
            </div>
          </div>
          {[140, 80, 160, 180].map((w, i) => (
            <div
              key={i}
              className="flex justify-between py-3.5 border-b border-[#F5F7FB]"
            >
              <div className="shimmer h-3 w-24" />
              <div className="shimmer h-3" style={{ width: w }} />
            </div>
          ))}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-3.5">
          <div className="bg-brand-muted rounded-card p-6 md:p-7">
            <div className="shimmer h-3 w-28 mb-2.5 opacity-30" />
            <div className="shimmer h-8 w-48 opacity-30" />
          </div>
          <div className="bg-white rounded-card border border-border-light shadow-card p-5 md:p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between mb-3">
                <div className="shimmer h-3 w-16" />
                <div className="shimmer h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
