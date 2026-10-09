"use client";

import React, { useState } from "react";
import { BrokerStatus, User } from "@/types";
import {
  toggleLiveOrders,
  toggleWhatsApp,
  toggleTelegram,
  toggleUserAccess,
  reauthorizeBroker,
  sendTestAlert,
  deleteUser,
} from "@/lib/api";
import {
  Search,
  Filter,
  Zap,
  MessageSquare,
  Send,
  Shield,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  MoreVertical,
  PlayCircle,
  Trash2,
  Edit,
  Phone,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Plus,
} from "lucide-react";

interface UserManagementTableProps {
  users: User[];
  onRefresh: () => void;
  onOpenAddUser: () => void;
  onSimulateOrder: (user: User) => void;
  onEditUser: (user: User) => void;
}

export function UserManagementTable({
  users,
  onRefresh,
  onOpenAddUser,
  onSimulateOrder,
  onEditUser,
}: UserManagementTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orderFilter, setOrderFilter] = useState<string>("ALL");
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Row action loading states
  const [loadingRowId, setLoadingRowId] = useState<number | null>(null);
  const [alertFeedback, setAlertFeedback] = useState<{ id: number; message: string } | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleToggleOrders = async (user: User) => {
    if (!user.is_active && !user.live_orders_enabled) {
      alert("Cannot enable Live Order Placement: User access is currently Revoked. Restore access first.");
      return;
    }
    if (user.broker_status !== "Connected" && !user.live_orders_enabled) {
      alert(`Cannot enable Live Order Placement: Broker status is "${user.broker_status}". Broker must be Connected.`);
      return;
    }

    setLoadingRowId(user.id);
    try {
      await toggleLiveOrders(user.id, !user.live_orders_enabled);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to toggle live orders.");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleToggleWhatsApp = async (user: User) => {
    setLoadingRowId(user.id);
    try {
      await toggleWhatsApp(user.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to toggle WhatsApp alerts.");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleToggleTelegram = async (user: User) => {
    setLoadingRowId(user.id);
    try {
      await toggleTelegram(user.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to toggle Telegram alerts.");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleToggleAccess = async (user: User) => {
    const confirmMsg = user.is_active
      ? `Revoke access for ${user.name}? This will immediately STOP all live order placement.`
      : `Restore active access for ${user.name}?`;
    
    if (!window.confirm(confirmMsg)) return;

    setLoadingRowId(user.id);
    try {
      await toggleUserAccess(user.id, !user.is_active);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to change user access.");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleReauthorize = async (user: User) => {
    setLoadingRowId(user.id);
    try {
      await reauthorizeBroker(user.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to reauthorize broker.");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleTestAlert = async (user: User, channel: "whatsapp" | "telegram") => {
    setLoadingRowId(user.id);
    try {
      const res = await sendTestAlert(user.id, channel);
      setAlertFeedback({ id: user.id, message: res.message });
      setTimeout(() => setAlertFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to send test alert.");
    } finally {
      setLoadingRowId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Permanently delete ${user.name} and purge broker credentials?`)) return;

    setLoadingRowId(user.id);
    try {
      await deleteUser(user.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setLoadingRowId(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.phone_number.toLowerCase().includes(q) ||
        u.broker_name.toLowerCase().includes(q) ||
        u.broker_client_id.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (statusFilter !== "ALL") {
      if (statusFilter === "Connected" && u.broker_status !== "Connected") return false;
      if (statusFilter === "Requires Reauthorization" && u.broker_status !== "Requires Reauthorization") return false;
      if (statusFilter === "Disconnected" && u.broker_status !== "Disconnected") return false;
      if (statusFilter === "REVOKED" && u.is_active) return false;
    }

    if (orderFilter !== "ALL") {
      if (orderFilter === "ENABLED" && !u.live_orders_enabled) return false;
      if (orderFilter === "DISABLED" && u.live_orders_enabled) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Control & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 shadow-sm backdrop-blur-md">
        <div className="flex flex-1 items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search name, phone, broker, or client ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Broker Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 transition"
          >
            <option value="ALL">All Broker Statuses</option>
            <option value="Connected">Connected Only</option>
            <option value="Requires Reauthorization">Requires Reauthorization</option>
            <option value="Disconnected">Disconnected</option>
            <option value="REVOKED">Revoked Access</option>
          </select>

          {/* Live Order Filter */}
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 hidden md:block transition"
          >
            <option value="ALL">All Order Modes</option>
            <option value="ENABLED">Live Orders ON</option>
            <option value="DISABLED">Live Orders OFF</option>
          </select>
        </div>

        {/* Add User CTA */}
        <button
          onClick={onOpenAddUser}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Global alert feedback banner */}
      {alertFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-zinc-900 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{alertFeedback.message}</span>
          </div>
          <button
            onClick={() => setAlertFeedback(null)}
            className="text-slate-400 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-black/80 text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-zinc-800 select-none">
              <tr>
                <th className="py-3.5 px-4 font-mono text-[11px]">User Details</th>
                <th className="py-3.5 px-4 font-mono text-[11px]">Broker Account</th>
                <th className="py-3.5 px-4 text-center font-mono text-[11px]">Broker Status</th>
                <th className="py-3.5 px-4 text-center font-mono text-[11px]">Live Order Placement</th>
                <th className="py-3.5 px-4 text-center font-mono text-[11px]">WhatsApp Alerts</th>
                <th className="py-3.5 px-4 text-center font-mono text-[11px]">Telegram Alerts</th>
                <th className="py-3.5 px-4 text-center font-mono text-[11px]">Account Access</th>
                <th className="py-3.5 px-4 text-right font-mono text-[11px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-zinc-500">
                    <p className="text-sm font-medium">No users match the selected filters.</p>
                    <p className="text-xs text-zinc-600 mt-1">Try resetting search or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isLoading = loadingRowId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition duration-150 ${
                        !user.is_active ? "opacity-60 bg-rose-50 dark:bg-rose-950/10" : ""
                      }`}
                    >
                      {/* 1. User Name & Phone */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                            {user.name}
                            {!user.is_active && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-semibold font-mono">
                                REVOKED
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                            <span>{user.phone_number}</span>
                            <button
                              onClick={() => copyToClipboard(user.phone_number)}
                              title="Copy Phone"
                              className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 ml-0.5 cursor-pointer"
                            >
                              {copiedPhone === user.phone_number ? (
                                <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          {user.notes && (
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 max-w-xs truncate">
                              {user.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Broker Account Info */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">{user.broker_name}</span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            ID: <span className="text-emerald-600 dark:text-emerald-400 font-medium">{user.broker_client_id}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate max-w-[190px]" title={user.broker_auth_message || ""}>
                            {user.broker_auth_message || "Awaiting credentials"}
                          </span>
                        </div>
                      </td>

                      {/* 3. Broker Connection Status */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          {user.broker_status === "Connected" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Connected
                            </span>
                          )}

                          {user.broker_status === "Requires Reauthorization" && (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                                <AlertTriangle className="w-3 h-3" />
                                Requires Reauth
                              </span>
                              <button
                                onClick={() => handleReauthorize(user)}
                                disabled={isLoading}
                                className="text-[10px] text-amber-300 hover:text-white underline cursor-pointer"
                              >
                                Reauthorize Now
                              </button>
                            </div>
                          )}

                          {user.broker_status === "Disconnected" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 font-mono">
                              <XCircle className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                              Disconnected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Live Order Placement Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleOrders(user)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              user.live_orders_enabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-slate-300 dark:bg-zinc-800"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                user.live_orders_enabled ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span
                            className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                              user.live_orders_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"
                            }`}
                          >
                            {user.live_orders_enabled ? "LIVE ON" : "STOPPED"}
                          </span>
                        </div>
                      </td>

                      {/* 5. WhatsApp Alerts Toggle */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleWhatsApp(user)}
                            disabled={isLoading}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              user.whatsapp_alerts_enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-800"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                user.whatsapp_alerts_enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          {user.whatsapp_alerts_enabled && (
                            <button
                              onClick={() => handleTestAlert(user, "whatsapp")}
                              disabled={isLoading}
                              className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                              Test Alert
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 6. Telegram Alerts Toggle */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleTelegram(user)}
                            disabled={isLoading}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              user.telegram_alerts_enabled ? "bg-sky-500" : "bg-slate-300 dark:bg-zinc-800"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                user.telegram_alerts_enabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          {user.telegram_alerts_enabled && (
                            <button
                              onClick={() => handleTestAlert(user, "telegram")}
                              disabled={isLoading}
                              className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                            >
                              Test Alert
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 7. User Access: Active / Revoked */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleAccess(user)}
                            disabled={isLoading}
                            className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition border cursor-pointer active:scale-95 ${
                              user.is_active
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                            }`}
                          >
                            {user.is_active ? "Active" : "Revoked"}
                          </button>
                        </div>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Order Placement */}
                          <button
                            onClick={() => onSimulateOrder(user)}
                            title="Test Live Order Placement Rule"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer"
                          >
                            <PlayCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </button>

                          {/* Edit User & Credentials */}
                          <button
                            onClick={() => onEditUser(user)}
                            title="Edit User & Broker Settings"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 transition active:scale-95 cursor-pointer"
                          >
                            <Edit className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => handleDelete(user)}
                            title="Delete User"
                            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-900 transition active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
