"use client";

import React, { useEffect, useState } from "react";
import { AuditLog } from "@/types";
import { getAuditLogs } from "@/lib/api";
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Shield,
  MessageSquare,
  Send,
  ArrowRight,
  Activity,
  Radio,
} from "lucide-react";

interface TerminalActivityCardProps {
  onOpenAuditLogs: () => void;
  refreshTrigger?: number;
}

export function TerminalActivityCard({
  onOpenAuditLogs,
  refreshTrigger,
}: TerminalActivityCardProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs(5)
      .then((data) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ORDER_SIMULATE":
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      case "USER_CREATE":
        return <UserPlus className="w-3.5 h-3.5 text-blue-400" />;
      case "BROKER_VERIFY":
      case "BROKER_REAUTH":
        return <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />;
      case "LIVE_ORDERS_TOGGLE":
        return <Radio className="w-3.5 h-3.5 text-amber-400" />;
      case "TEST_ALERT":
        return <Send className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-zinc-950 p-5 flex flex-col justify-between">
      <div>
        <div className="border-b border-zinc-900 pb-3 mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Audit Activity</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live telemetry and administrative actions.
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-500 font-mono">
            FETCHING RECENT TELEMETRY...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No audit records registered yet.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-900">
            {logs.slice(0, 4).map((log) => (
              <li key={log.id} className="py-3 flex items-start gap-3">
                <span className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                  {getActionIcon(log.action)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-zinc-200 font-medium leading-snug line-clamp-1">
                    {log.details || log.action}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 font-mono flex items-center gap-2">
                    <span>{formatTimeAgo(log.created_at)}</span>
                    <span>•</span>
                    <span className="text-zinc-600 truncate max-w-[120px]">
                      {log.user_name || "System"}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-3 border-t border-zinc-900 mt-2">
        <button
          onClick={onOpenAuditLogs}
          className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>Open Full Audit Drawer</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
