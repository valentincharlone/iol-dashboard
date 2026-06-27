"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { REFRESH_INTERVAL_MS, IOL_LOGO_GRADIENT } from "@/lib/config";

export function DashboardShell({ children }: { children: React.ReactNode }) {
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
          <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1 text-text2 flex"
            >
              <Menu size={22} />
            </button>
            <div
              className={`w-7 h-7 rounded-lg ${IOL_LOGO_GRADIENT} flex items-center justify-center text-white font-bold text-[11px]`}
            >
              IOL
            </div>
            <span className="font-semibold text-[15px] text-text1 flex-1">
              Dashboard
            </span>
            <ThemeToggle className="p-1 text-text3 hover:text-text1 transition-colors" />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
