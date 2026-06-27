import React from "react";

export function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <div className="text-[10px] font-semibold text-text3 uppercase tracking-wide mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

export function DrawerRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border-light last:border-0 gap-4">
      <span className="text-[12px] text-text3 font-medium shrink-0">
        {label}
      </span>
      <span
        className={`text-[13px] text-text1 font-semibold text-right ${mono ? "tabular-nums" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
