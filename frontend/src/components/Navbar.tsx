"use client";

import React, { useEffect, useState } from "react";
import { SuperAdmin } from "@/types";
import {
  ShieldCheck,
  Terminal,
  LogOut,
  RefreshCw,
  Radio,
  Clock,
  FileText,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

interface NavbarProps {
  user: SuperAdmin | null;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAuditLogs: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function Navbar({
  user,
  onLogout,
  onRefresh,
  isRefreshing,
  onOpenAuditLogs,
  theme = "dark",
  onToggleTheme,
  onToggleMobileSidebar,
}: NavbarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kolkata",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#070b15]/90 backdrop-blur-md transition-colors duration-150">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {onToggleMobileSidebar && (
              <button
                onClick={onToggleMobileSidebar}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Terminal className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider font-mono text-slate-900 dark:text-white">
                  ASTRA<span className="text-blue-500 dark:text-blue-400">TRADING</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                  Terminal V1
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                Super Admin Multi-Broker Mission Control
              </p>
            </div>
          </div>

          {/* Center Info / Live Gateway Clock */}
          <div className="hidden lg:flex items-center gap-3">
            <aside className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
              <span className="text-slate-500 dark:text-zinc-400">Gateway:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FASTAPI ONLINE</span>
            </aside>

            <aside className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-slate-500 dark:text-zinc-400">IST:</span>
              <span className="text-blue-600 dark:text-blue-300 font-medium">
                {time || "--:--:--"}
              </span>
            </aside>
          </div>

          {/* Right User & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                className="p-2 rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                )}
              </button>
            )}

            <button
              onClick={onOpenAuditLogs}
              title="Audit Feed"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>Audit Feed</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Data"
              className="p-2 rounded-lg text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-500" : ""}`} />
            </button>

            {/* Admin Profile Chip */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user?.full_name || "Super Admin"}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight">
                  @{user?.username || "admin"}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Secure Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-zinc-800 text-xs font-medium transition active:scale-95 cursor-pointer ml-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
