"use client";

import React, { useId } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Activity,
  FileText,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Sample Reference Data ---
const STATS_DATA = [
  { label: "Active users", value: "847", delta: 3.1, isPositive: true },
  { label: "Revenue", value: "$18,290", delta: 12.4, isPositive: true },
  { label: "Conversion Rate", value: "3.28%", delta: -0.4, isPositive: false },
  { label: "New signups", value: "142", delta: 8.7, isPositive: true },
];

const REVENUE_DATA = [
  { day: "Mon", sales: 3200 },
  { day: "Tue", sales: 3001 },
  { day: "Wed", sales: 3780 },
  { day: "Thu", sales: 4100 },
  { day: "Fri", sales: 4520 },
  { day: "Sat", sales: 4004 },
  { day: "Sun", sales: 5340 },
];

const CHANNEL_DATA = [
  { date: "Mon", online: 240, retail: 120 },
  { date: "Tue", online: 300, retail: 140 },
  { date: "Wed", online: 280, retail: 170 },
  { date: "Thu", online: 420, retail: 190 },
  { date: "Fri", online: 490, retail: 210 },
  { date: "Sat", online: 580, retail: 260 },
  { date: "Sun", online: 650, retail: 310 },
];

const INVOICES_DATA = [
  { id: "1048", customer: "Apex Capital LLC", amount: "$4,250.00", status: "Paid" },
  { id: "1047", customer: "Nexus Algo Fund", amount: "$12,800.00", status: "Paid" },
  { id: "1046", customer: "Quantum Trades", amount: "$3,120.00", status: "Pending" },
  { id: "1045", customer: "Horizon Securities", amount: "$9,450.00", status: "Paid" },
  { id: "1044", customer: "Vanguard Quant", amount: "$6,720.00", status: "Paid" },
];

const ACTIVITY_DATA = [
  {
    title: "Invoice #1048 marked paid",
    time: "About 2 hours ago",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  },
  {
    title: "Jordan joined the team",
    time: "This morning",
    icon: <UserPlus className="w-4 h-4 text-blue-400" />,
  },
  {
    title: "Weekly summary exported",
    time: "Yesterday",
    icon: <FileText className="w-4 h-4 text-zinc-400" />,
  },
  {
    title: "Dashboard v2 shipped to prod",
    time: "2 days ago",
    icon: <Zap className="w-4 h-4 text-amber-400" />,
  },
];

// --- Custom Gradient Bar Shape for NetRevenueChart ---
function CustomGradientBar(props: any) {
  const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
  const gradientId = `gradient-bar-sales-${index}`;
  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#0284c7" stopOpacity={0.3} />
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

export function EfferdDashboard2() {
  const glowId = useId().replace(/:/g, "");

  return (
    <div className="w-full bg-zinc-950 text-white font-sans antialiased p-4 sm:p-6 lg:p-8">
      {/* 1px Border Grid System */}
      <div className="grid grid-cols-1 gap-px bg-zinc-800 p-px md:grid-cols-2 lg:grid-cols-4 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl">
        
        {/* ROW 1: 4 Dense KPI Cards (DashboardStats) */}
        {STATS_DATA.map((item) => (
          <div
            key={item.label}
            className="bg-zinc-950 p-5 flex flex-col justify-between hover:bg-zinc-900/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-normal text-xs tracking-wide text-zinc-400">
                {item.label}
              </span>
              <span className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
                <Activity className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="my-3">
              <p className="font-semibold text-2xl lg:text-3xl tabular-nums tracking-tight text-white font-mono">
                {item.value}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded",
                  item.isPositive
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-rose-400 bg-rose-500/10"
                )}
              >
                {item.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {item.delta > 0 ? `+${item.delta}%` : `${item.delta}%`}
              </span>
              <span className="text-zinc-500 text-[11px]">vs last week</span>
            </div>
          </div>
        ))}

        {/* ROW 2 - LEFT: Net Revenue Chart (md:col-span-2) */}
        <div className="bg-zinc-950 p-5 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">Net revenue</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-3 h-3" />
                  +12.4%
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Daily net sales, last 7 days.
              </p>
            </div>
            <div className="text-xs text-zinc-500 font-mono">
              Avg: $4,050/day
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                />
                <RechartsTooltip
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-lg text-xs">
                          <p className="text-zinc-400">{payload[0].payload.day}</p>
                          <p className="text-sky-400 font-mono font-bold">
                            ${Number(payload[0].value).toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" shape={<CustomGradientBar />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 2 - RIGHT: Channel Sales Chart with Glow Effect (md:col-span-2) */}
        <div className="bg-zinc-950 p-5 md:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">Channel sales</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  <ArrowUpRight className="w-3 h-3" />
                  +18.9%
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Daily sales count by channel, last 7 days.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Online
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Retail
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CHANNEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid stroke="#27272a" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-900 border border-zinc-700 p-2.5 rounded shadow-lg text-xs space-y-1">
                          <p className="text-zinc-400 font-medium">{payload[0].payload.date}</p>
                          <p className="text-cyan-400 font-mono">
                            Online: {payload[0].value} orders
                          </p>
                          {payload[1] && (
                            <p className="text-indigo-400 font-mono">
                              Retail: {payload[1].value} orders
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
                  dataKey="online"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={false}
                  filter={`url(#${glowId})`}
                />
                <Line
                  type="monotone"
                  dataKey="retail"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 3 - LEFT: Recent Invoices Table (md:col-span-2) */}
        <div className="bg-zinc-950 md:col-span-2 flex flex-col justify-between">
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-white">Recent invoices</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Open amounts and payment status.
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              5 of 48 total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800/80 bg-zinc-900/30 text-zinc-400 font-medium">
                <tr>
                  <th className="py-2.5 px-5">Customer</th>
                  <th className="py-2.5 px-4">Invoice</th>
                  <th className="py-2.5 px-5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {INVOICES_DATA.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-5 font-sans font-medium text-white">
                      {inv.customer}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      #{inv.id}
                    </td>
                    <td className="py-3 px-5 text-right font-semibold text-emerald-400">
                      {inv.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-zinc-800/80 flex items-center justify-center bg-zinc-900/20">
            <button className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-3 rounded hover:bg-zinc-800">
              <span>View All Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ROW 3 - MIDDLE: Billing Health (1 column) */}
        <div className="bg-zinc-950 p-5 flex flex-col justify-between border-t md:border-t-0 border-zinc-800">
          <div>
            <div className="border-b border-zinc-800 pb-3 mb-4">
              <h3 className="font-semibold text-sm text-white">Billing health</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Nothing urgent needs your attention.
              </p>
            </div>

            <div className="flex flex-col items-center text-center py-6 px-3 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                You're caught up.
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                Balances and payouts look fine. Zero overdue invoices in this snapshot.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80">
            <button className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer">
              <span>Review open balances</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* ROW 3 - RIGHT: Activity Feed (DashboardActivity) (1 column) */}
        <div className="bg-zinc-950 p-5 flex flex-col justify-between border-t md:border-t-0 border-zinc-800">
          <div>
            <div className="border-b border-zinc-800 pb-3 mb-3">
              <h3 className="font-semibold text-sm text-white">Activity</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Latest updates in your workspace.
              </p>
            </div>

            <ul className="flex flex-col divide-y divide-zinc-800/60">
              {ACTIVITY_DATA.map((act, i) => (
                <li key={i} className="py-3 flex items-start gap-3">
                  <span className="p-1.5 rounded bg-zinc-900 border border-zinc-800 mt-0.5 shrink-0">
                    {act.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-200 font-medium leading-snug line-clamp-1">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                      {act.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-zinc-800/80">
            <button className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer">
              <span>View full audit log</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
export default EfferdDashboard2;
