"use client";

import React, { useId } from "react";
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import { ArrowUpRight, MessageSquare, Send } from "lucide-react";

const ALERT_TREND_DATA = [
  { day: "Mon", whatsapp: 84, telegram: 96 },
  { day: "Tue", whatsapp: 110, telegram: 130 },
  { day: "Wed", whatsapp: 145, telegram: 160 },
  { day: "Thu", whatsapp: 160, telegram: 195 },
  { day: "Fri", whatsapp: 210, telegram: 240 },
  { day: "Sat", whatsapp: 65, telegram: 90 },
  { day: "Sun", whatsapp: 180, telegram: 220 },
];

export function AlertDistributionChart() {
  const glowId = useId().replace(/:/g, "");

  return (
    <div className="bg-white dark:bg-zinc-950 p-5 md:col-span-2 flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Alert Dispatch Distribution</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-sky-400 bg-blue-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full border border-blue-200 dark:border-sky-500/20">
              <ArrowUpRight className="w-3 h-3" />
              +19.2%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Real-time trade signals sent via WhatsApp & Telegram.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" /> WhatsApp
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-sky-400" /> Telegram
          </span>
        </div>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={ALERT_TREND_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-800" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="text-slate-500 dark:text-zinc-400 font-medium">{payload[0].payload.day}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        WhatsApp: {payload[0].value} alerts
                      </p>
                      {payload[1] && (
                        <p className="text-blue-600 dark:text-sky-400 font-mono flex items-center gap-1.5">
                          <Send className="w-3 h-3" />
                          Telegram: {payload[1].value} alerts
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="whatsapp"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
              filter={`url(#${glowId})`}
            />
            <Line
              type="monotone"
              dataKey="telegram"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500 pt-3 border-t border-slate-100 dark:border-zinc-900 mt-2">
        <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-sky-400" />
          Zero-delay broadcast webhooks
        </span>
        <span className="font-mono text-slate-600 dark:text-zinc-400">Total: 2,075 dispatches</span>
      </div>
    </div>
  );
}
