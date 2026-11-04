import { fmtMoney } from "@/lib/fmt";

interface Props {
  valuacion: number;
  className?: string;
  children?: React.ReactNode;
}

export function ValuacionCard({ valuacion, className = "", children }: Props) {
  return (
    <div
      className={`bg-gradient-to-br from-[#4338CA] to-[#818CF8] rounded-card p-6 md:p-7 text-white relative overflow-hidden [contain:paint] ${className}`}
    >
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/[0.08]" />
      <div className="absolute top-[60px] -right-20 w-[200px] h-[200px] rounded-full bg-white/[0.04]" />
      <div className="relative">
        <div className="text-[13px] font-medium opacity-80 mb-1.5">
          Valuación de títulos
        </div>
        <div className="text-[27px] font-bold tabular-nums tracking-tight">
          {fmtMoney(valuacion)}
        </div>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}
