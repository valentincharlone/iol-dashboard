"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  PieChart,
  TrendingUp,
  Activity,
  User,
  FileText,
  X,
  LogOut,
  PanelLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePrivacy } from "@/lib/privacy-context";

const NAV_MAIN = [
  { href: "/dashboard", label: "Portafolio", icon: <PieChart size={18} /> },
  {
    href: "/dashboard/cotizaciones",
    label: "Cotizaciones",
    icon: <TrendingUp size={18} />,
  },
  {
    href: "/dashboard/movimientos",
    label: "Movimientos",
    icon: <Activity size={18} />,
  },
];
const NAV_SECONDARY = [
  { href: "/dashboard/perfil", label: "Mi perfil", icon: <User size={18} /> },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, isMobile }: Props) {
  const pathname = usePathname();
  const { privacy, toggle: togglePrivacy } = usePrivacy();
  const w = collapsed ? "w-16 min-w-16" : "w-[220px] min-w-[220px]";

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  function navLink(href: string, label: string, icon: React.ReactNode) {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        className={[
          "flex items-center gap-3 rounded-lg text-sm font-normal no-underline transition-colors",
          collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
          active
            ? "bg-brand-muted text-brand font-semibold"
            : "text-text2 hover:bg-[#F5F6FA]",
        ].join(" ")}
      >
        <span className="shrink-0">{icon}</span>
        {!collapsed && <span className="whitespace-nowrap">{label}</span>}
      </Link>
    );
  }

  return (
    <aside
      className={`${w} h-screen sticky top-0 bg-white border-r border-border flex flex-col transition-[width,min-width] duration-250 ease-in-out overflow-hidden z-20 shrink-0`}
    >
      {/* Header: Logo + Toggle */}
      {collapsed ? (
        <div
          onClick={onToggle}
          title="Expandir sidebar"
          className="flex items-center justify-center border-b border-border min-h-16 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-xs tracking-tight">
            IOL
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-4 border-b border-border min-h-16 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-xs tracking-tight shrink-0">
              IOL
            </div>
            <span className="font-semibold text-[15px] text-text1 whitespace-nowrap">
              Dashboard
            </span>
          </div>
          <button
            onClick={onToggle}
            title={isMobile ? "Cerrar menú" : "Colapsar sidebar"}
            className="text-text3 shrink-0 flex hover:text-brand transition-colors"
          >
            {isMobile ? <X size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>
      )}

      {/* Nav principal */}
      <nav className="px-2.5 pt-3 pb-1 flex flex-col gap-0.5">
        {NAV_MAIN.map(({ href, label, icon }) => navLink(href, label, icon))}
      </nav>

      {/* Divisor */}
      <div className="mx-2.5 my-1 border-t border-border" />

      {/* Nav secundaria */}
      <nav className="px-2.5 py-1 flex flex-col gap-0.5">
        {NAV_SECONDARY.map(({ href, label, icon }) =>
          navLink(href, label, icon),
        )}

        <a
          href="/api-docs.html"
          target="_blank"
          rel="noopener noreferrer"
          title="Documentación API IOL"
          className={[
            "flex items-center gap-3 rounded-lg text-sm no-underline transition-colors text-text3 hover:bg-[#F5F6FA] hover:text-text2",
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
          ].join(" ")}
        >
          <span className="shrink-0">
            <FileText size={18} />
          </span>
          {!collapsed && <span className="whitespace-nowrap">API Docs</span>}
        </a>
      </nav>

      <div className="flex-1" />

      {/* Footer: Privacidad + Cerrar sesión */}
      <div className="px-2.5 py-3 border-t border-border flex flex-col gap-1">
        <button
          onClick={togglePrivacy}
          title={privacy ? "Mostrar valores" : "Ocultar valores"}
          className={[
            "w-full flex items-center gap-3 rounded-lg text-sm transition-colors",
            privacy ? "text-brand bg-brand-muted" : "text-text3 hover:bg-[#F5F6FA]",
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
          ].join(" ")}
        >
          {privacy ? <EyeOff size={16} /> : <Eye size={16} />}
          {!collapsed && (
            <span className="font-medium whitespace-nowrap">
              {privacy ? "Mostrar valores" : "Ocultar valores"}
            </span>
          )}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
          className={[
            "w-full flex items-center gap-3 rounded-lg text-sm text-text3 transition-colors hover:bg-loss-bg hover:text-loss",
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
          ].join(" ")}
        >
          <LogOut size={16} />
          {!collapsed && (
            <span className="font-medium whitespace-nowrap">Cerrar sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
}
