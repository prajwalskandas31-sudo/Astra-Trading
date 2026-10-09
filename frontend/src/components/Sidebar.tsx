"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  Zap,
  FileText,
  ShieldCheck,
  Settings,
  Moon,
  Sun,
  Terminal,
  LogOut,
  Radio,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SuperAdmin } from "@/types";

export type NavTab = "overview" | "users" | "simulator" | "telemetry" | "health" | "settings";

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  user: SuperAdmin | null;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  userCount?: number;
}

export function Sidebar({
  currentTab,
  onTabChange,
  user,
  onLogout,
  theme,
  onToggleTheme,
  userCount = 0,
}: SidebarProps) {
  const navItems = [
    {
      id: "overview" as NavTab,
      label: "Mission Control",
      sublabel: "Overview & Metrics",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "users" as NavTab,
      label: "User & Brokers",
      sublabel: "Account Management",
      icon: Users,
      badge: userCount > 0 ? `${userCount}` : null,
    },
    {
      id: "simulator" as NavTab,
      label: "Order Testbench",
      sublabel: "Routing Simulation",
      icon: Zap,
      badge: "LIVE",
    },
    {
      id: "telemetry" as NavTab,
      label: "Audit Telemetry",
      sublabel: "System Event Stream",
      icon: FileText,
      badge: null,
    },
    {
      id: "health" as NavTab,
      label: "Gateway Health",
      sublabel: "Fernet AES-256 Vault",
      icon: ShieldCheck,
      badge: "SECURE",
    },
    {
      id: "settings" as NavTab,
      label: "Terminal Settings",
      sublabel: "Theme & Security",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 bg-zinc-950 dark:bg-[#070b15] light:bg-white text-zinc-200 transition-colors duration-200 select-none">
      {/* Top Branding Section */}
      <div>
        <div className="h-16 px-5 border-b border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Terminal className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-sm tracking-wider font-mono text-white dark:text-white light:text-slate-900">
                  ASTRA<span className="text-blue-400">TRADING</span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 font-mono tracking-tight">
                MISSION CONTROL
              </span>
            </div>
          </div>

          {/* Quick Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-1.5 rounded-lg border border-zinc-800 dark:border-zinc-800 light:border-slate-200 bg-zinc-900 dark:bg-zinc-900 light:bg-slate-100 text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 transition cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-blue-600" />
            )}
          </button>
        </div>

        {/* Status Pill Indicator */}
        <div className="px-4 py-3 border-b border-zinc-900 dark:border-zinc-900 light:border-slate-100">
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900/60 dark:bg-zinc-900/60 light:bg-slate-50 border border-zinc-800/60 dark:border-zinc-800/60 light:border-slate-200 text-xs">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gateway Online
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Port :8000
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer text-left",
                  isActive
                    ? "bg-blue-600/15 dark:bg-blue-600/15 light:bg-blue-50 text-blue-400 dark:text-blue-400 light:text-blue-700 border border-blue-500/30 dark:border-blue-500/30 light:border-blue-200 shadow-sm"
                    : "text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-zinc-900/60 dark:hover:bg-zinc-900/60 light:hover:bg-slate-100 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-zinc-900 dark:bg-zinc-900 light:bg-slate-100 text-zinc-500 group-hover:text-zinc-300"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="truncate">
                    <span className="block font-semibold leading-tight">
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-400 leading-tight">
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tracking-tight shrink-0",
                      item.badge === "LIVE"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : item.badge === "SECURE"
                        ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                        : "bg-zinc-800 text-zinc-400"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout Footer */}
      <div className="p-3 border-t border-zinc-900 dark:border-zinc-900 light:border-slate-200 space-y-2">
        {/* Super Admin Profile Card */}
        <div className="p-2.5 rounded-xl bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-50 border border-zinc-800/80 dark:border-zinc-800/80 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 font-bold text-xs font-mono">
              SA
            </div>
            <div className="truncate">
              <span className="block text-xs font-semibold text-white dark:text-white light:text-slate-900 truncate">
                {user?.full_name || "Super Admin"}
              </span>
              <span className="block text-[10px] text-zinc-400 dark:text-zinc-400 light:text-slate-500 font-mono truncate">
                @{user?.username || "admin"}
              </span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Direct Link to Reference Layout */}
        <a
          href="/demo"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-blue-400 font-mono transition"
        >
          <span>Reference Demo ↗</span>
          <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}
