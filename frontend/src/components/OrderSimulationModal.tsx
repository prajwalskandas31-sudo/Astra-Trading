"use client";

import React, { useState } from "react";
import { OrderSimulateResponse, User } from "@/types";
import { simulateOrder } from "@/lib/api";
import {
  X,
  PlayCircle,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface OrderSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  allUsers: User[];
  onOrderExecuted: () => void;
}

export function OrderSimulationModal({
  isOpen,
  onClose,
  selectedUser,
  allUsers,
  onOrderExecuted,
}: OrderSimulationModalProps) {
  const [userId, setUserId] = useState<number>(selectedUser?.id || allUsers[0]?.id || 0);
  const [symbol, setSymbol] = useState("NIFTY 24500 CE");
  const [quantity, setQuantity] = useState(50);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [price, setPrice] = useState("185.50");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderSimulateResponse | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentUser = allUsers.find((u) => u.id === userId) || selectedUser;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await simulateOrder({
        user_id: userId,
        symbol: symbol.trim(),
        quantity: Number(quantity),
        side,
        price: price ? parseFloat(price) : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-200 dark:border-zinc-850 flex items-center justify-between bg-slate-50/80 dark:bg-black/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white">
              <Zap className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Live Order Routing Simulator</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Verifies toggle enforcement & broker routing rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSimulate} className="p-7 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* User selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Select User Account
            </label>
            <select
              value={userId}
              onChange={(e) => {
                setUserId(Number(e.target.value));
                setResult(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 outline-none transition cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.broker_name}) — Live Orders: {u.live_orders_enabled ? "ON" : "OFF"}
                </option>
              ))}
            </select>
          </div>

          {/* User Live Status Inspector */}
          {currentUser && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/70 border border-slate-200 dark:border-zinc-800 text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400 font-sans">Live Order Placement:</span>
                <span
                  className={`font-bold ${
                    currentUser.live_orders_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {currentUser.live_orders_enabled ? "ENABLED (ON)" : "DISABLED (OFF)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400 font-sans">Broker Gateway:</span>
                <span className="text-slate-800 dark:text-zinc-200">
                  {currentUser.broker_name} ({currentUser.broker_status})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-zinc-400 font-sans">Account Access:</span>
                <span className={currentUser.is_active ? "text-emerald-600 dark:text-emerald-400 font-sans font-semibold" : "text-rose-600 dark:text-rose-400 font-sans font-semibold"}>
                  {currentUser.is_active ? "Active" : "Revoked"}
                </span>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Contract / Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Side
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-black p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSide("BUY")}
                  className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                    side === "BUY" ? "bg-white text-slate-900 shadow-sm dark:bg-white dark:text-black" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setSide("SELL")}
                  className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer transition ${
                    side === "SELL" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Quantity (Units/Lots)
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white text-xs focus:border-blue-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Verifying Safety Locks...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-white" /> Dispatch Test Order Through Gateway
              </>
            )}
          </button>
        </form>

        {/* Results Banner */}
        {result && (
          <div className="px-7 pb-7 pt-1 animate-in fade-in">
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                result.allowed
                  ? "bg-emerald-50 dark:bg-zinc-900 border-emerald-500/40 text-emerald-800 dark:text-emerald-200"
                  : "bg-rose-50 dark:bg-zinc-900 border-rose-500/40 text-rose-800 dark:text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {result.allowed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>ORDER PERMITTED & EXECUTED LIVE</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span>ORDER BLOCKED BY TERMINAL SAFETY LOCK</span>
                  </>
                )}
              </div>

              <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300">{result.reason}</p>

              {result.allowed && result.details?.order_id && (
                <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                  <span>Broker Order ID: {result.details.order_id}</span>
                  <span>Exec Price: ₹{result.details.price}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
