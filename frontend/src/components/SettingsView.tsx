"use client";

import React from "react";
import { SuperAdmin } from "@/types";
import {
  ShieldCheck,
  Moon,
  Sun,
  Lock,
  CheckCircle2,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  user: SuperAdmin | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onSetTheme: (theme: "dark" | "light") => void;
}

export function SettingsView({
  user,
  theme,
  onToggleTheme,
  onSetTheme,
}: SettingsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Terminal Settings & Security Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
          Configure display themes, audit encryption keys, review security policies, and manage Super Admin sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Theme Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Theme Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-900">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Sun className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Appearance & Display Theme
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Switch between Elite Royal Dark Mode and Imperial Platinum Light Mode.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase font-semibold">
                {theme} Mode Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Theme Option */}
              <button
                type="button"
                onClick={() => onSetTheme("dark")}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer relative",
                  theme === "dark"
                    ? "border-blue-500 bg-blue-500/10 dark:bg-blue-950/20 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Royal Obsidian Dark</span>
                  </div>
                  {theme === "dark" && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mb-3">
                  Deep midnight obsidian canvas with hairline sapphire grid lines and jewel emerald indicators. Ideal for high-density trading.
                </p>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
                  <div className="w-3 h-3 rounded-full bg-[#060911] border border-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono ml-auto">Obsidian / Cobalt</span>
                </div>
              </button>

              {/* Light Theme Option */}
              <button
                type="button"
                onClick={() => onSetTheme("light")}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer relative",
                  theme === "light"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/80"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Imperial Platinum Light
                    </span>
                  </div>
                  {theme === "light" && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mb-3">
                  Crisp pearl platinum surfaces with royal sapphire typography, slate boundaries, and high daylight contrast.
                </p>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
                  <div className="w-3 h-3 rounded-full bg-[#f8fafc] border border-slate-300" />
                  <div className="w-3 h-3 rounded-full bg-[#2563eb]" />
                  <div className="w-3 h-3 rounded-full bg-[#059669]" />
                  <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono ml-auto">
                    Platinum / Sapphire
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Cryptography & Zero-Leak Security Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-900">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Symmetric Encryption & Vault Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Compliance standards implemented in Astra Trading.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono uppercase">Vault Encryption</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block">
                  Fernet AES-256
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Symmetric CBC + HMAC-SHA256 authenticated cipher.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono uppercase">Frontend Exposure</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero UI Leak
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Raw API secrets are never returned in JSON to DOM.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono uppercase">Admin Auth</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 block">
                  Bcrypt + JWT HS256
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Salted multi-round hashing with 24h rotating token.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Super Admin Profile Details */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-900">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Lock className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Super Admin Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Active authentication session.
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 dark:text-zinc-500 text-[11px] block">FULL NAME</span>
                <span className="text-slate-900 dark:text-white font-sans font-semibold">
                  {user?.full_name || "Astra Trading Super Admin"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-500 text-[11px] block">USERNAME</span>
                <span className="text-blue-600 dark:text-blue-400">@{user?.username || "admin"}</span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-500 text-[11px] block">ADMIN EMAIL</span>
                <span className="text-slate-700 dark:text-zinc-300">
                  {user?.email || "admin@astratrading.com"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 dark:text-zinc-500 text-[11px] block">TERMINAL ROLE</span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  SUPER_ADMIN_ROOT
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 text-[11px] text-slate-500 dark:text-zinc-500">
              Session is actively authenticated with bearer token header.
            </div>
          </div>

          {/* Quick Notification Feeds Status */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Independent Dispatches</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              WhatsApp and Telegram alerts operate independently. Each user can have one or both toggled with isolated dispatches.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-300 font-mono flex items-center justify-between">
              <span>Alert Queue:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">HEALTHY (0 latency)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
