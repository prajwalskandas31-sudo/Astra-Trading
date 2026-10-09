"use client";

import React from "react";
import { DashboardStats } from "@/types";
import {
  Users,
  Zap,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Radio,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  const total = stats.total_users || 0;
  const activePercent = total > 0 ? Math.round((stats.active_users / total) * 100) : 0;
  const livePercent = total > 0 ? Math.round((stats.live_orders_active / total) * 100) : 0;

  const cards = [
    {
      label: "Registered Users",
      value: stats.total_users.toString(),
      icon: <Users className="w-3.5 h-3.5" />,
      deltaText: `${stats.active_users} active (${activePercent}%)`,
      isPositive: stats.revoked_users === 0,
      subText: stats.revoked_users > 0 ? `${stats.revoked_users} revoked` : "100% operational",
      subTextColor: stats.revoked_users > 0 ? "text-rose-500 dark:text-rose-400" : "text-slate-400 dark:text-zinc-500",
      valueColor: "text-slate-900 dark:text-white",
    },
    {
      label: "Live Order Placement",
      value: stats.live_orders_active.toString(),
      icon: <Zap className="w-3.5 h-3.5" />,
      deltaText: `${livePercent}% armed`,
      isPositive: true,
      subText: `${total - stats.live_orders_active} safety locked (OFF)`,
      subTextColor: "text-slate-500 dark:text-zinc-400",
      valueColor: stats.live_orders_active > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-zinc-300",
    },
    {
      label: "Broker Integrations",
      value: stats.broker_connected.toString(),
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      deltaText: stats.broker_reauth === 0 ? "All verified" : `${stats.broker_reauth} re-auth needed`,
      isPositive: stats.broker_reauth === 0,
      subText: "Encrypted Fernet tokens",
      subTextColor: "text-teal-600 dark:text-teal-400",
      valueColor: "text-slate-900 dark:text-white",
    },
    {
      label: "Active Alert Feeds",
      value: (stats.whatsapp_alerts_active + stats.telegram_alerts_active).toString(),
      icon: <Radio className="w-3.5 h-3.5" />,
      deltaText: `${stats.whatsapp_alerts_active} WA • ${stats.telegram_alerts_active} TG`,
      isPositive: true,
      subText: "Independent broadcasts",
      subTextColor: "text-slate-400 dark:text-zinc-500",
      valueColor: "text-slate-900 dark:text-white",
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-normal text-xs tracking-wide text-slate-500 dark:text-zinc-400">
              {card.label}
            </span>
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800">
              {card.icon}
            </span>
          </div>

          <div className="my-3">
            <p
              className={cn(
                "font-semibold text-2xl lg:text-3xl tabular-nums tracking-tight font-mono",
                card.valueColor
              )}
            >
              {card.value}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-zinc-900">
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded text-[11px]",
                card.isPositive
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                  : "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
              )}
            >
              <ArrowUpRight className="w-3 h-3" />
              {card.deltaText}
            </span>
            <span className={cn("text-[11px] font-mono", card.subTextColor)}>
              {card.subText}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
