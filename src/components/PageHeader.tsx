interface Props {
  title: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, description, action }: Props) {
  return (
    <div className={action ? "flex items-center justify-between" : undefined}>
      <div>
        <h1 className="text-[22px] font-bold text-text1 m-0">{title}</h1>
        {subtitle && <p className="text-[13px] text-text3 mt-0.5">{subtitle}</p>}
        {description && <p className="text-[12px] text-text3 mt-1.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}
