"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const PortfolioIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
  </svg>
);
const QuotesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);
const MovementsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const DocsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);
const CollapseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const NAV_MAIN = [
  { href: "/dashboard",              label: "Portafolio",   icon: <PortfolioIcon /> },
  { href: "/dashboard/cotizaciones", label: "Cotizaciones", icon: <QuotesIcon /> },
  { href: "/dashboard/movimientos",  label: "Movimientos",  icon: <MovementsIcon /> },
];
const NAV_SECONDARY = [
  { href: "/dashboard/perfil", label: "Mi perfil", icon: <ProfileIcon /> },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, isMobile }: Props) {
  const pathname = usePathname();
  const w = collapsed ? "w-16 min-w-16" : "w-[220px] min-w-[220px]";

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
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
    <aside className={`${w} h-screen sticky top-0 bg-white border-r border-border flex flex-col transition-[width,min-width] duration-250 ease-in-out overflow-hidden z-20 shrink-0`}>

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
            <span className="font-semibold text-[15px] text-text1 whitespace-nowrap">Dashboard</span>
          </div>
          <button
            onClick={onToggle}
            title={isMobile ? "Cerrar menú" : "Colapsar sidebar"}
            className="text-text3 shrink-0 flex hover:text-brand transition-colors"
          >
            {isMobile ? <CloseIcon /> : <CollapseIcon />}
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
        {NAV_SECONDARY.map(({ href, label, icon }) => navLink(href, label, icon))}

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
          <span className="shrink-0"><DocsIcon /></span>
          {!collapsed && <span className="whitespace-nowrap">API Docs</span>}
        </a>
      </nav>

      <div className="flex-1" />

      {/* Footer: Cerrar sesión */}
      <div className="px-2.5 py-3 border-t border-border">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Cerrar sesión"
          className={[
            "w-full flex items-center gap-3 rounded-lg text-sm text-text3 transition-colors hover:bg-loss-bg hover:text-loss",
            collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
          ].join(" ")}
        >
          <LogoutIcon />
          {!collapsed && <span className="font-medium whitespace-nowrap">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
