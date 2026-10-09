"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { TrendingUp } from "lucide-react";

const ORDER_TREND_DATA = [
  { day: "Mon", orders: 124, latency: "142ms" },
  { day: "Tue", orders: 156, latency: "138ms" },
  { day: "Wed", orders: 198, latency: "145ms" },
  { day: "Thu", orders: 230, latency: "129ms" },
  { day: "Fri", orders: 312, latency: "135ms" },
  { day: "Sat", orders: 84, latency: "120ms" },
  { day: "Sun", orders: 275, latency: "131ms" },
];

function CustomGradientBar(props: any) {
  const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
  const gradientId = `gradient-bar-orders-${index}`;
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#047857" stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={`url(#${gradientId})`}
        className="transition-all duration-300 hover:opacity-80"
      />
    </g>
  );
}

export function OrderVolumeChart() {
  return (
    <div className="bg-white dark:bg-zinc-950 p-5 md:col-span-2 flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Live Order Routing Volume</span>
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              +24.8%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Daily order dispatches across broker gateways, last 7 days.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 block">
            Avg Latency: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">134ms</span>
          </span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-600">Zero-loss buffer</span>
        </div>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={ORDER_TREND_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <RechartsTooltip
              cursor={{ fill: "rgba(100, 116, 139, 0.08)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="text-slate-500 dark:text-zinc-400 font-medium">{data.day}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                        {data.orders} Orders Dispatched
                      </p>
                      <p className="text-slate-400 dark:text-zinc-500 text-[11px]">
                        API Execution Speed: {data.latency}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="orders" shape={<CustomGradientBar />} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500 pt-3 border-t border-slate-100 dark:border-zinc-900 mt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          Batch executions active
        </span>
        <span className="font-mono text-slate-600 dark:text-zinc-400">Total: 1,379 orders</span>
      </div>
    </div>
  );
}
