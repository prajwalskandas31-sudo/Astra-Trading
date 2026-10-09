"use client";

import React, { useState } from "react";
import { User, OrderSimulateResponse } from "@/types";
import { simulateOrder } from "@/lib/api";
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Lock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Loader2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimulatorViewProps {
  users: User[];
  onOrderExecuted: () => void;
}

export function SimulatorView({ users, onOrderExecuted }: SimulatorViewProps) {
  const [selectedUserId, setSelectedUserId] = useState<number>(users[0]?.id || 0);
  const [symbol, setSymbol] = useState("NIFTY 24500 CE");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState(50);
  const [orderType, setOrderType] = useState("MARKET");
  const [limitPrice, setLimitPrice] = useState(148.5);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderSimulateResponse | null>(null);
  const [error, setError] = useState("");

  const activeUser = users.find((u) => u.id === Number(selectedUserId)) || users[0];

  const handleExecute = async () => {
    if (!activeUser) {
      setError("Please select a valid user account.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await simulateOrder({
        user_id: activeUser.id,
        symbol: symbol.trim(),
        quantity: Number(quantity),
        side,
        order_type: orderType,
        price: orderType === "LIMIT" ? Number(limitPrice) : undefined,
      });
      setResult(res);
      onOrderExecuted();
    } catch (err: any) {
      setError(err.message || "Failed to dispatch order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs mb-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="text-zinc-300 font-medium">Order Routing Sandbox</span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400 font-mono">Live Interlock Guard</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white dark:text-white light:text-slate-900">
          Order Execution & Routing Testbench
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-slate-600 mt-1">
          Safely dispatch simulated or live orders through configured broker accounts. Validates safety locks, authorization states, and decrypted API tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Parameters Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-950 dark:bg-[#090f1e] light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 shadow-xl space-y-5">
            <h3 className="font-semibold text-sm text-white dark:text-white light:text-slate-900 pb-3 border-b border-zinc-900 dark:border-zinc-900 light:border-slate-100 flex items-center justify-between">
              <span>Order Configuration</span>
              <span className="text-xs text-zinc-500 font-mono">Terminal v1.0</span>
            </h3>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Target User Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Select User Account
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black dark:bg-[#060911] light:bg-slate-50 border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-white dark:text-white light:text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.broker_name} ({u.broker_client_id}) • {u.live_orders_enabled ? "LIVE ARMED" : "LOCKED"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Symbol & Quick Tickers */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Trading Symbol / Contract
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. NIFTY 24500 CE, RELIANCE, BANKNIFTY"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black dark:bg-[#060911] light:bg-slate-50 border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-white dark:text-white light:text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {["NIFTY 24500 CE", "BANKNIFTY 52000 PE", "RELIANCE", "HDFCBANK"].map((tick) => (
                    <button
                      key={tick}
                      type="button"
                      onClick={() => setSymbol(tick)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-zinc-300 border border-zinc-800 transition cursor-pointer"
                    >
                      {tick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Side & Quantity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Side Toggle */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Order Side
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide("BUY")}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer",
                        side === "BUY"
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                          : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                      )}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("SELL")}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer",
                        side === "SELL"
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                          : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                      )}
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      SELL / SHORT
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Quantity / Lots
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black dark:bg-[#060911] light:bg-slate-50 border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-white dark:text-white light:text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Order Type & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black dark:bg-[#060911] light:bg-slate-50 border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-white dark:text-white light:text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="MARKET">MARKET</option>
                    <option value="LIMIT">LIMIT</option>
                  </select>
                </div>

                {orderType === "LIMIT" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Limit Price (₹)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black dark:bg-[#060911] light:bg-slate-50 border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-white dark:text-white light:text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecute}
                disabled={loading}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-xl cursor-pointer",
                  side === "BUY"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20"
                    : "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/20"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Routing to Broker Gateway...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Dispatch {side} Order for {activeUser?.name || "User"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Account Status & Response Telemetry */}
        <div className="space-y-6">
          {/* Active User Guard Card */}
          {activeUser && (
            <div className="p-6 rounded-2xl bg-zinc-950 dark:bg-[#090f1e] light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Target Account State
                </span>
                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    activeUser.live_orders_enabled
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  )}
                >
                  {activeUser.live_orders_enabled ? "LIVE ARMED" : "SAFETY LOCKED (OFF)"}
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 text-[11px] block">CLIENT NAME</span>
                  <span className="text-white dark:text-white light:text-slate-900 font-sans font-semibold">
                    {activeUser.name}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">BROKER GATEWAY</span>
                  <span className="text-blue-400">
                    {activeUser.broker_name} ({activeUser.broker_client_id})
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">BROKER STATUS</span>
                  <span
                    className={cn(
                      "font-semibold",
                      activeUser.broker_status === "Connected"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    )}
                  >
                    {activeUser.broker_status}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[11px] block">ALERT COVERAGE</span>
                  <span className="text-zinc-300">
                    WA: {activeUser.whatsapp_alerts_enabled ? "ON" : "OFF"} • TG: {activeUser.telegram_alerts_enabled ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Execution Telemetry Result */}
          {result && (
            <div className="p-6 rounded-2xl bg-zinc-950 dark:bg-[#090f1e] light:bg-white border border-emerald-500/30 shadow-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 pb-2 border-b border-zinc-900">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-bold text-xs">ORDER DISPATCHED SUCCESSFULLY</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Order ID:</span>
                  <span className="text-white">{result.order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Execution Mode:</span>
                  <span className="text-emerald-400 font-bold">{result.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Latency:</span>
                  <span className="text-cyan-400">{result.execution_speed_ms}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Avg Price:</span>
                  <span className="text-zinc-200">₹{result.executed_price}</span>
                </div>
                <div className="pt-2 border-t border-zinc-900 text-zinc-400 text-[11px]">
                  {result.message}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
