"use client";

import { usePrivacy } from "@/lib/privacy-context";

interface Props {
  children: React.ReactNode;
  prefix?: string;
}

export function Private({ children, prefix = "$" }: Props) {
  const { privacy } = usePrivacy();
  if (privacy) {
    return (
      <span className="select-none align-middle">
        <span className="text-text2 font-semibold">{prefix}</span>
        <span className="pl-1 text-text3/50 tracking-wider">
          {"*".repeat(6)}
        </span>
      </span>
    );
  }
  return <>{children}</>;
}
