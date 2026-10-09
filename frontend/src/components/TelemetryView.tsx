"use client";

import React, { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import { getAuditLogs } from "@/lib/api";
import {
  FileText,
  Search,
  RefreshCw,
  Zap,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Send,
  Activity,
  Shield,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TelemetryView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs(100)
      .then((data) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ORDER_SIMULATE":
        return { label: "ORDER_SIM", icon: Zap, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case "USER_CREATE":
        return { label: "USER_CREATE", icon: UserPlus, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
      case "LIVE_ORDERS_TOGGLE":
        return { label: "LIVE_TOGGLE", icon: Radio, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "BROKER_VERIFY":
      case "BROKER_REAUTH":
        return { label: "BROKER_AUTH", icon: CheckCircle2, color: "text-teal-400 bg-teal-500/10 border-teal-500/20" };
      case "TEST_ALERT":
        return { label: "TEST_ALERT", icon: Send, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
      default:
        return { label: action, icon: Activity, color: "text-zinc-400 bg-zinc-800 border-zinc-700" };
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        (log.details || "").toLowerCase().includes(q) ||
        (log.user_name || "").toLowerCase().includes(q) ||
        (log.action || "").toLowerCase().includes(q) ||
        (log.ip_address || "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (actionFilter !== "ALL" && log.action !== actionFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-zinc-300 font-medium">Real-Time Event Stream</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400 font-mono">SQLite Audit Trail</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white dark:text-white light:text-slate-900">
            Audit Telemetry & Administrative Activity
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-400 light:text-slate-600 mt-1">
            Immutable system logs tracing order routing, security toggles, credential updates, and test broadcasts.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-blue-400")} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-zinc-950 dark:bg-[#090f1e] light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-slate-200 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by action, user name, details, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-black dark:bg-[#060911] light:bg-slate-50 border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-white dark:text-white light:text-slate-900 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-black dark:bg-[#060911] light:bg-slate-50 border border-zinc-800 dark:border-zinc-800 light:border-slate-300 text-zinc-300 dark:text-zinc-300 light:text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions</option>
            <option value="ORDER_SIMULATE">Order Simulations</option>
            <option value="LIVE_ORDERS_TOGGLE">Live Order Toggles</option>
            <option value="BROKER_VERIFY">Broker Verifications</option>
            <option value="USER_CREATE">User Creations</option>
            <option value="TEST_ALERT">Test Alerts</option>
          </select>
        </div>

        <span className="text-xs font-mono text-zinc-500 self-center">
          {filteredLogs.length} Records Found
        </span>
      </div>

      {/* Log Feed Table */}
      <div className="rounded-2xl border border-zinc-800 dark:border-zinc-800 light:border-slate-200 bg-zinc-950 dark:bg-[#090f1e] light:bg-white overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 dark:border-zinc-800 light:border-slate-200 bg-zinc-900/40 dark:bg-zinc-900/40 light:bg-slate-50 text-zinc-400 dark:text-zinc-400 light:text-slate-600 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-5">Details</th>
                <th className="py-3 px-4 text-right">Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60 dark:divide-zinc-850/60 light:divide-slate-200 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No telemetry records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-zinc-900/40 dark:hover:bg-zinc-900/40 light:hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-5 text-zinc-400 whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-tight",
                            badge.color
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-medium text-white dark:text-white light:text-slate-900 whitespace-nowrap">
                        {log.user_name || "System"}
                      </td>
                      <td className="py-3.5 px-5 font-sans text-zinc-300 dark:text-zinc-300 light:text-slate-700 max-w-md truncate">
                        {log.details || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-zinc-500 text-[11px]">
                        {(log as any).ip_address || "127.0.0.1"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Audit Log #{selectedLog.id}</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">Action:</span>
                <span className="text-blue-400 font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">User:</span>
                <span className="text-white">{selectedLog.user_name || "System"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">Timestamp:</span>
                <span className="text-zinc-300">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-900">
                <span className="text-zinc-500">IP Address:</span>
                <span className="text-zinc-300">{(selectedLog as any).ip_address || "127.0.0.1"}</span>
              </div>
              <div className="py-2">
                <span className="text-zinc-500 block mb-1">Details:</span>
                <p className="font-sans text-zinc-200 bg-zinc-900 p-3 rounded-xl border border-zinc-800 leading-relaxed">
                  {selectedLog.details}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
