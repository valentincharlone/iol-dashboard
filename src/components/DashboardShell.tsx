"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Eye, EyeOff } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { usePrivacy } from "@/lib/privacy-context";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { privacy, toggle } = usePrivacy();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Backdrop mobile */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        />
      )}

      {/* Sidebar */}
      <div
        className={
          isMobile
            ? `fixed top-0 left-0 h-screen z-40 transition-transform duration-250 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : ""
        }
      >
        <Sidebar
          collapsed={isMobile ? false : collapsed}
          onToggle={
            isMobile
              ? () => setMobileOpen(false)
              : () => setCollapsed((c) => !c)
          }
          isMobile={isMobile}
        />
      </div>

      {/* Main */}
      <main className={`flex-1 overflow-y-auto ${isMobile ? "ml-0" : ""}`}>
        {/* Barra superior mobile */}
        {isMobile && (
          <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1 text-text2 flex"
            >
              <Menu size={22} />
            </button>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-[11px]">
              IOL
            </div>
            <span className="font-semibold text-[15px] text-text1">
              Dashboard
            </span>
            <button onClick={toggle} className="ml-auto p-1 text-text3 hover:text-text1 transition-colors">
              {privacy ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
