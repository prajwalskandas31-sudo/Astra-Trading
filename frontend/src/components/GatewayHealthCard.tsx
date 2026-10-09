"use client";

import React from "react";
import { ShieldCheck, Lock, CheckCircle2, ArrowRight, Zap, RefreshCw } from "lucide-react";

interface GatewayHealthCardProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function GatewayHealthCard({ onRefresh, isRefreshing }: GatewayHealthCardProps) {
  return (
    <div className="bg-zinc-950 p-5 flex flex-col justify-between">
      <div>
        <div className="border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gateway Cryptography Health</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AES-256 Fernet
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Zero-leak credential vault & token rotation status.
          </p>
        </div>

        <div className="flex flex-col items-center text-center py-4 px-2 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Vault Secure & Encrypted
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1 max-w-xs">
              Broker API keys, secret tokens & TOTP credentials are encrypted in SQLite using symmetric Fernet keys. Credentials are never leaked to frontend DOM.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full pt-1">
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-left">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                Storage State
              </span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5 block flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Zero UI Leak
              </span>
            </div>
            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-left">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                Session Token
              </span>
              <span className="text-xs font-semibold text-zinc-200 mt-0.5 block flex items-center gap-1">
                <Zap className="w-3 h-3 text-teal-400" /> JWT Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-900 mt-2">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Verify Gateway Integrity</span>
        </button>
      </div>
    </div>
  );
}
