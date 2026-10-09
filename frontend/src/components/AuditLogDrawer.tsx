"use client";

import React, { useState, useEffect } from "react";
import { AuditLog } from "@/types";
import { getAuditLogs } from "@/lib/api";
import {
  X,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  Radio,
} from "lucide-react";

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDrawer({ isOpen, onClose }: AuditLogDrawerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.user_name && log.user_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-200 dark:border-zinc-850 flex items-center justify-between bg-slate-50/80 dark:bg-black/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white">
              <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Terminal Audit Trail Feed</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Cryptographically recorded activity & toggle events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition active:scale-95 cursor-pointer"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900 transition active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-850 bg-slate-50/40 dark:bg-black/40">
          <input
            type="text"
            placeholder="Filter events by action, user, or details..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Logs List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-zinc-500 text-xs">
              No audit records found matching query.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "Asia/Kolkata",
              });

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-200">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      {dateStr} IST
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">{log.details}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500 pt-2 border-t border-slate-200/80 dark:border-zinc-800/60 font-mono">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {log.user_name || "System"}
                    </span>
                    <span
                      className={`uppercase text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        log.severity === "success"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : log.severity === "danger"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : log.severity === "warning"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
