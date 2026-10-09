"use client";

import React, { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import { getAuditLogs } from "@/lib/api";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Terminal,
  RefreshCw,
  ExternalLink,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TelemetryView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(200);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.user_name && log.user_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ORDER_SIMULATE":
        return {
          label: "Order Simulation",
          color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          icon: Terminal,
        };
      case "LIVE_ORDERS_TOGGLE":
        return {
          label: "Safety Toggle",
          color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          icon: ShieldCheck,
        };
      case "BROKER_VERIFY":
        return {
          label: "Broker Auth",
          color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "USER_CREATE":
        return {
          label: "Account Provision",
          color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
          icon: Activity,
        };
      case "TEST_ALERT":
        return {
          label: "Alert Broadcast",
          color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: AlertTriangle,
        };
      default:
        return {
          label: action,
          color: "bg-slate-500/10 text-slate-600 dark:text-zinc-400 border-slate-500/20",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/60 text-xs mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-700 dark:text-zinc-300 font-medium">Real-Time Event Stream</span>
            <span className="text-slate-400 dark:text-zinc-500">•</span>
            <span className="text-slate-600 dark:text-zinc-400 font-mono">SQLite Audit Trail</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Audit Telemetry & Administrative Activity
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Immutable system logs tracing order routing, security toggles, credential updates, and test broadcasts.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 text-xs font-medium transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-blue-500")} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#090f1e] border border-slate-200 dark:border-zinc-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Filter by action, user name, details, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#060911] border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Actions</option>
            <option value="ORDER_SIMULATE">Order Simulations</option>
            <option value="LIVE_ORDERS_TOGGLE">Live Order Toggles</option>
            <option value="BROKER_VERIFY">Broker Verifications</option>
            <option value="USER_CREATE">User Creations</option>
            <option value="TEST_ALERT">Test Alerts</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-500 dark:text-zinc-500 self-center">
          {filteredLogs.length} Records Found
        </span>
      </div>

      {/* Log Feed Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#090f1e] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-5">Details</th>
                <th className="py-3 px-4 text-right">Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-850/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-zinc-500">
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
                      className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-5 text-slate-500 dark:text-zinc-400 whitespace-nowrap text-[11px]">
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
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {log.user_name || "System"}
                      </td>
                      <td className="py-3.5 px-5 font-sans text-slate-700 dark:text-zinc-300 max-w-md truncate">
                        {log.details || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400 dark:text-zinc-500 text-[11px]">
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
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Audit Log #{selectedLog.id}</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-900">
                <span className="text-slate-500 dark:text-zinc-500">Action:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-900">
                <span className="text-slate-500 dark:text-zinc-500">User:</span>
                <span className="text-slate-900 dark:text-white">{selectedLog.user_name || "System"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-900">
                <span className="text-slate-500 dark:text-zinc-500">Timestamp:</span>
                <span className="text-slate-700 dark:text-zinc-300">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-900">
                <span className="text-slate-500 dark:text-zinc-500">IP Address:</span>
                <span className="text-slate-700 dark:text-zinc-300">{(selectedLog as any).ip_address || "127.0.0.1"}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-500 dark:text-zinc-500 block mb-1">Details:</span>
                <p className="font-sans text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 leading-relaxed">
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
