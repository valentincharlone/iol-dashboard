interface Props {
  children: React.ReactNode;
  gap?: "4" | "5";
}

const GAP = { "4": "gap-4 md:gap-5", "5": "gap-5" } as const;

export function PageContainer({ children, gap = "5" }: Props) {
  return (
    <div className={`p-4 pb-12 md:p-6 md:pb-16 flex flex-col ${GAP[gap]}`}>
      {children}
    </div>
  );
}
