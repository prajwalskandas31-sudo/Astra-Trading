"use client";

import React, { useState, useEffect } from "react";
import { User } from "@/types";
import { updateUser } from "@/lib/api";
import {
  X,
  Edit,
  Save,
  Loader2,
  ShieldCheck,
  Zap,
  MessageSquare,
  Send,
  KeyRound,
} from "lucide-react";

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [totpPin, setTotpPin] = useState("");
  const [liveOrdersEnabled, setLiveOrdersEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone_number);
      setNotes(user.notes || "");
      setLiveOrdersEnabled(user.live_orders_enabled);
      setWhatsappEnabled(user.whatsapp_alerts_enabled);
      setTelegramEnabled(user.telegram_alerts_enabled);
      setTelegramChatId(user.telegram_chat_id || "");
      setIsActive(user.is_active);
      setApiKey("");
      setApiSecret("");
      setAuthToken("");
      setTotpPin("");
      setError("");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await updateUser(user.id, {
        name: name.trim(),
        phone_number: phone.trim(),
        notes: notes.trim() || undefined,
        live_orders_enabled: liveOrdersEnabled,
        whatsapp_alerts_enabled: whatsappEnabled,
        telegram_alerts_enabled: telegramEnabled,
        telegram_chat_id: telegramChatId.trim() || undefined,
        is_active: isActive,
        broker_api_key: apiKey.trim() || undefined,
        broker_api_secret: apiSecret.trim() || undefined,
        broker_auth_token: authToken.trim() || undefined,
        broker_totp_pin: totpPin.trim() || undefined,
      });

      onUserUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-7 py-5 border-b border-zinc-850 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
              <Edit className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Manage User Settings</h2>
              <p className="text-xs text-zinc-400">{user.name} • {user.broker_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-7 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs outline-none focus:border-zinc-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs outline-none focus:border-zinc-500 font-mono transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
              Internal Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 text-white text-xs outline-none focus:border-zinc-500 transition"
            />
          </div>

          {/* Broker Info & Optional Credential Update */}
          <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Broker:</span>
              <span className="font-semibold text-white">{user.broker_name} (ID: {user.broker_client_id})</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Connection Status:</span>
              <span className="font-mono text-emerald-400 font-semibold">{user.broker_status}</span>
            </div>

            <div className="pt-2 border-t border-zinc-850 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Update Credentials (Leave blank to keep current)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="New API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-zinc-500 transition"
                />
                <input
                  type="password"
                  placeholder="New API Secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-zinc-500 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="password"
                  placeholder="New Auth Token"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-zinc-500 transition"
                />
                <input
                  type="password"
                  placeholder="New TOTP PIN"
                  value={totpPin}
                  onChange={(e) => setTotpPin(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-zinc-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-1">
            {/* Live Orders Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/80 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">Live Order Placement</span>
              </div>
              <button
                type="button"
                onClick={() => setLiveOrdersEnabled(!liveOrdersEnabled)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  liveOrdersEnabled ? "bg-emerald-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    liveOrdersEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* WhatsApp Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/80 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white">WhatsApp Alerts</span>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  whatsappEnabled ? "bg-emerald-500" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    whatsappEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Telegram Toggle */}
            <div className="p-3.5 rounded-2xl bg-black/80 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-white">Telegram Alerts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTelegramEnabled(!telegramEnabled)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    telegramEnabled ? "bg-sky-500" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      telegramEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              {telegramEnabled && (
                <input
                  type="text"
                  placeholder="Telegram chat handle (e.g. @username)"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-zinc-500 transition"
                />
              )}
            </div>

            {/* Account Access Active / Revoked */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/80 border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-white block">User Account Access</span>
                <span className="text-[10px] text-zinc-500">
                  {isActive ? "Access active" : "Access revoked (Live orders stopped)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-3.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer active:scale-95 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                {isActive ? "ACTIVE" : "REVOKED"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-b from-white via-white/95 to-white/70 text-black hover:scale-[1.02] active:scale-[0.98] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-white/10 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
