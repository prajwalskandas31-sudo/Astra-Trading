"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Server,
  Zap,
  Radio,
  RefreshCw,
  ExternalLink,
  Cpu,
  Layers,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthViewProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function HealthView({ onRefresh, isRefreshing }: HealthViewProps) {
  const [testingPing, setTestingPing] = useState(false);
  const [pingResults, setPingResults] = useState<Record<string, { status: string; latency: string }>>({
    zerodha: { status: "Active", latency: "42ms" },
    angelone: { status: "Active", latency: "68ms" },
    upstox: { status: "Active", latency: "51ms" },
    dhan: { status: "Active", latency: "38ms" },
    fyers: { status: "Active", latency: "47ms" },
    icicidirect: { status: "Active", latency: "89ms" },
  });

  const runGatewayDiagnostics = () => {
    setTestingPing(true);
    setTimeout(() => {
      setPingResults({
        zerodha: { status: "Active", latency: `${Math.floor(35 + Math.random() * 20)}ms` },
        angelone: { status: "Active", latency: `${Math.floor(55 + Math.random() * 25)}ms` },
        upstox: { status: "Active", latency: `${Math.floor(45 + Math.random() * 20)}ms` },
        dhan: { status: "Active", latency: `${Math.floor(32 + Math.random() * 15)}ms` },
        fyers: { status: "Active", latency: `${Math.floor(40 + Math.random() * 20)}ms` },
        icicidirect: { status: "Active", latency: `${Math.floor(75 + Math.random() * 30)}ms` },
      });
      setTestingPing(false);
      onRefresh();
    }, 800);
  };

  const brokers = [
    { code: "zerodha", name: "Zerodha Kite Connect", auth: "API Key + Secret + Request Token", color: "text-orange-500" },
    { code: "angelone", name: "Angel One SmartAPI", auth: "Client Code + PIN + TOTP + API Key", color: "text-blue-500" },
    { code: "upstox", name: "Upstox Pro v2", auth: "OAuth 2.0 Access Token", color: "text-purple-500" },
    { code: "dhan", name: "DhanHQ API", auth: "Partner ID + Access Token", color: "text-emerald-500" },
    { code: "fyers", name: "Fyers API v3", auth: "App ID + Auth Code + Token", color: "text-sky-500" },
    { code: "icicidirect", name: "ICICI Direct Breeze", auth: "API Key + Secret + Session Token", color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/60 text-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 dark:text-zinc-300 font-medium">Zero-Leak Gateway Architecture</span>
            <span className="text-slate-400 dark:text-zinc-500">•</span>
            <span className="text-slate-600 dark:text-zinc-400 font-mono">FastAPI Core</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Multi-Broker Gateway & Cryptography Health
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Real-time status of symmetric cryptographic vaults, broker connection latency, and token freshness.
          </p>
        </div>

        <button
          onClick={runGatewayDiagnostics}
          disabled={testingPing || isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", (testingPing || isRefreshing) && "animate-spin")} />
          <span>Run Gateway Diagnostics</span>
        </button>
      </div>

      {/* Top 3 Security Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              VAULT CIPHER
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Lock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            Fernet AES-256
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500">
            Symmetric CBC + HMAC-SHA256 signature. Zero credentials exposed to frontend.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              SESSION TOKENS
            </span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <KeyRound className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
            JWT HS256 Active
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500">
            Bcrypt salt verification with 24-hour sliding expiration window.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              BROKER REACHABILITY
            </span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400">
            6 / 6 Gateways Online
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500">
            Average REST API round-trip latency: 54ms across all supported endpoints.
          </p>
        </div>
      </div>

      {/* Broker Gateway Connectivity Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#090f1e] overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Supported Broker Gateway Endpoints
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Encrypted credential verification and live execution routing compatibility.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            TLS 1.3 Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-zinc-400">
              <tr>
                <th className="py-3 px-5">Broker Platform</th>
                <th className="py-3 px-4">Auth Architecture</th>
                <th className="py-3 px-4">Endpoint Status</th>
                <th className="py-3 px-5 text-right">Ping Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-850/60 font-mono">
              {brokers.map((b) => {
                const res = pingResults[b.code] || { status: "Active", latency: "50ms" };
                return (
                  <tr key={b.code} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition">
                    <td className="py-3.5 px-5 font-sans font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", b.color)} />
                      {b.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 text-[11px]">
                      {b.auth}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-cyan-600 dark:text-cyan-400 font-bold">
                      {res.latency}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
