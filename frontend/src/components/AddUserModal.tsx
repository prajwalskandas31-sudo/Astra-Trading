"use client";

import React, { useState, useEffect } from "react";
import { BrokerInfo, BrokerVerifyResponse } from "@/types";
import { getSupportedBrokers, verifyBroker, createUser } from "@/lib/api";
import {
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  MessageSquare,
  Send,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Check,
} from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export function AddUserModal({ isOpen, onClose, onUserCreated }: AddUserModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [brokers, setBrokers] = useState<BrokerInfo[]>([]);
  const [loadingBrokers, setLoadingBrokers] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [notes, setNotes] = useState("");

  const [brokerCode, setBrokerCode] = useState("zerodha");
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [totpPin, setTotpPin] = useState("");

  // Live order placement must default to FALSE
  const [liveOrdersEnabled, setLiveOrdersEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");

  // Verification State
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<BrokerVerifyResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoadingBrokers(true);
      getSupportedBrokers()
        .then((res) => {
          setBrokers(res);
          if (res.length > 0 && !brokerCode) {
            setBrokerCode(res[0].code);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingBrokers(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestBrokerConnection = async () => {
    if (!clientId.trim()) {
      setErrorMessage("Please enter the user's Client ID before testing connection.");
      return;
    }
    setErrorMessage("");
    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyBroker({
        broker_code: brokerCode,
        client_id: clientId.trim(),
        api_key: apiKey.trim() || undefined,
        api_secret: apiSecret.trim() || undefined,
        auth_token: authToken.trim() || undefined,
        totp_pin: totpPin.trim() || undefined,
      });
      setVerificationResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify broker connection.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      await createUser({
        name: name.trim(),
        phone_number: phone.trim(),
        broker_code: brokerCode,
        broker_client_id: clientId.trim().toUpperCase(),
        broker_api_key: apiKey.trim() || undefined,
        broker_api_secret: apiSecret.trim() || undefined,
        broker_auth_token: authToken.trim() || undefined,
        broker_totp_pin: totpPin.trim() || undefined,
        live_orders_enabled: liveOrdersEnabled,
        whatsapp_alerts_enabled: whatsappEnabled,
        telegram_alerts_enabled: telegramEnabled,
        telegram_chat_id: telegramChatId.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onUserCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Could not create user account.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBroker = brokers.find((b) => b.code === brokerCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-zinc-850 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Onboard User & Broker Account</h2>
              <p className="text-xs text-zinc-400">Step {step} of 3 • Super Admin Setup Flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header (Pill Styled) */}
        <div className="grid grid-cols-3 border-b border-zinc-850 text-xs font-medium bg-black/40">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
              step === 1
                ? "bg-zinc-900 text-white font-semibold border-b-2 border-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">
              1
            </span>
            Profile
          </button>
          <button
            type="button"
            onClick={() => name && phone && setStep(2)}
            disabled={!name || !phone}
            className={`py-3 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
              step === 2
                ? "bg-zinc-900 text-white font-semibold border-b-2 border-white"
                : "text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">
              2
            </span>
            Broker Setup
          </button>
          <button
            type="button"
            onClick={() => name && phone && clientId && setStep(3)}
            disabled={!name || !phone || !clientId}
            className={`py-3 text-center transition flex items-center justify-center gap-2 cursor-pointer ${
              step === 3
                ? "bg-zinc-900 text-white font-semibold border-b-2 border-white"
                : "text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-mono">
              3
            </span>
            Trading & Alerts
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: USER DETAILS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  User Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none placeholder:text-zinc-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Phone Number (For WhatsApp / Verification) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none placeholder:text-zinc-600 font-mono transition"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Format with country code: +91 98765 43210. Used for automated trade notification broadcasts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Strategy / Client Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. High net worth intraday options trader. Max lot size 10."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none placeholder:text-zinc-600 transition"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Newly onboarded users do not receive Terminal credentials. They only receive configured WhatsApp/Telegram trade alerts as per Super Admin configuration.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: BROKER SETUP */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Select User's Broker <span className="text-rose-400">*</span>
                </label>
                {loadingBrokers ? (
                  <div className="flex items-center gap-2 text-xs text-zinc-400 py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Loading supported brokers...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {brokers.map((broker) => {
                      const isSelected = brokerCode === broker.code;
                      return (
                        <button
                          key={broker.code}
                          type="button"
                          onClick={() => {
                            setBrokerCode(broker.code);
                            setVerificationResult(null);
                          }}
                          className={`p-3 rounded-2xl border text-left text-xs transition cursor-pointer ${
                            isSelected
                              ? "bg-zinc-900 border-white text-white shadow-md shadow-white/5"
                              : "bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                          }`}
                        >
                          <div className="font-semibold text-zinc-100 text-xs mb-1">
                            {broker.name}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">{broker.auth_type}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedBroker && (
                  <div className="mt-3 text-xs text-zinc-400 bg-black/60 p-3 rounded-2xl border border-zinc-800">
                    <p className="font-medium text-zinc-200">{selectedBroker.description}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Policy: {selectedBroker.reauth_policy}</p>
                  </div>
                )}
              </div>

              {/* Broker Credentials Fields */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                    Broker Client ID / User ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AB1234 or ZR9021"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none uppercase font-mono transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      API Key / App Key
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none font-mono transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      API Secret / Token
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none font-mono transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      Auth Token / JWT (If applicable)
                    </label>
                    <input
                      type="password"
                      placeholder="Bearer token or enctoken"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none font-mono transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      TOTP Key / 2FA PIN
                    </label>
                    <input
                      type="password"
                      placeholder="6-digit TOTP secret"
                      value={totpPin}
                      onChange={(e) => setTotpPin(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 text-white text-sm outline-none font-mono transition"
                    />
                  </div>
                </div>

                {/* Handshake & Verification Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTestBrokerConnection}
                    disabled={verifying || !clientId.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 hover:text-white border border-zinc-800 font-medium text-xs flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Verifying handshake with {selectedBroker?.name || "broker"}...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Test & Verify Broker Connection Handshake</span>
                      </>
                    )}
                  </button>

                  {verificationResult && (
                    <div
                      className={`mt-2.5 p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                        verificationResult.success
                          ? "bg-zinc-900 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-900 border-amber-500/40 text-amber-300"
                      }`}
                    >
                      {verificationResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold">{verificationResult.message}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          Status: <span className="font-mono">{verificationResult.status}</span> • Handshake Latency:{" "}
                          <span className="font-mono">{verificationResult.latency_ms}ms</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-zinc-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>
                      Zero-Exposure Guarantee: Credentials are encrypted using Fernet symmetric encryption and never shown in cleartext.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TRADING & ALERTS */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Live Order Placement Toggle - Default OFF explicitly */}
              <div className="p-4 rounded-2xl bg-black/80 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        liveOrdersEnabled
                          ? "bg-zinc-900 border-emerald-500/40 text-emerald-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        Live Order Placement
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase font-mono ${
                            liveOrdersEnabled
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                          }`}
                        >
                          {liveOrdersEnabled ? "ENABLED" : "DISABLED (DEFAULT)"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 max-w-md">
                        {liveOrdersEnabled
                          ? "LIVE ORDERS ACTIVE: Algorithmic orders will be placed immediately into this user's live broker account."
                          : "SAFE MODE (Recommended): Live order placement is completely stopped for this user until explicitly enabled."}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setLiveOrdersEnabled(!liveOrdersEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      liveOrdersEnabled ? "bg-emerald-500 shadow-md shadow-emerald-500/30" : "bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        liveOrdersEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Alerts Configuration */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Notification Alerts Configuration
                </h3>

                {/* WhatsApp Toggle */}
                <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-zinc-900 text-emerald-400 border border-zinc-800">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-200">WhatsApp Alerts</div>
                      <div className="text-[11px] text-zinc-400">
                        Sends trade signals and execution updates to {phone || "user's phone"}
                      </div>
                    </div>
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
                <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-zinc-900 text-sky-400 border border-zinc-800">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200">Telegram Alerts</div>
                        <div className="text-[11px] text-zinc-400">
                          Dispatches automated signals to Telegram group or bot chat
                        </div>
                      </div>
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
                    <div className="pt-2 border-t border-zinc-800">
                      <input
                        type="text"
                        placeholder="Telegram Handle or Chat ID (e.g. @trader_suresh or 98218291)"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-zinc-500 transition"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-1 font-mono">
                <div className="text-[11px] font-sans font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Onboarding Summary
                </div>
                <div>User: <span className="text-white font-semibold">{name}</span> ({phone})</div>
                <div>Broker: <span className="text-emerald-400">{selectedBroker?.name}</span> • ID: <span className="text-white">{clientId.toUpperCase()}</span></div>
                <div>Live Orders: <span className={liveOrdersEnabled ? "text-emerald-400 font-bold" : "text-amber-400"}>{liveOrdersEnabled ? "ACTIVE" : "DISABLED"}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 border-t border-zinc-850 flex items-center justify-between bg-black/60">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  if (!name.trim() || !phone.trim()) {
                    setErrorMessage("Please enter both User Name and Phone Number.");
                    return;
                  }
                  setErrorMessage("");
                  setStep(2);
                } else if (step === 2) {
                  if (!clientId.trim()) {
                    setErrorMessage("Please enter the user's Client ID.");
                    return;
                  }
                  setErrorMessage("");
                  setStep(3);
                }
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-b from-white via-white/95 to-white/70 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-white/10 cursor-pointer"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-b from-white via-white/95 to-white/70 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-white/15 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" /> Saving User...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-black" /> Save & Complete Onboarding
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
