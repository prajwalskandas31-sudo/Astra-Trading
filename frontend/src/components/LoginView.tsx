"use client";

import React, { useState } from "react";
import { login } from "@/lib/api";
import { SuperAdmin } from "@/types";
import {
  Terminal,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Loader2,
  KeyRound,
  Radio,
  Sparkles,
} from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (admin: SuperAdmin) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFillDemo = () => {
    setUsername("admin");
    setPassword("Admin@123456");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(username.trim(), password);
      localStorage.setItem("astra_admin_token", res.access_token);
      localStorage.setItem("srini_admin_token", res.access_token);
      localStorage.setItem("astra_admin_user", JSON.stringify(res.user));
      localStorage.setItem("srini_admin_user", JSON.stringify(res.user));
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your Super Admin access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black relative overflow-hidden select-none font-sans text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[400px] h-[250px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Sleek Pill Badge (from reference) */}
        <div className="flex justify-center mb-6">
          <aside className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/70 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-medium text-zinc-300">
              GATEWAY V1.0 • ONLINE
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">FastAPI SSL</span>
          </aside>
        </div>

        {/* Hero Title with Gradient Text */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-blue-400 uppercase mb-2">
            <span>✦ ASTRA TRADING</span>
          </div>
          <h1
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
            style={{
              background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.7))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.03em",
            }}
          >
            Mission Control Terminal
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            Central sovereign terminal for multi-broker routing, live risk locks & automated alerts.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-7 shadow-2xl backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800/60 text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              REST API :8000
            </span>
            <span className="text-emerald-400 font-semibold text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Fernet AES-256
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="admin or admin@astratrading.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black border border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-400 text-white text-xs outline-none transition placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Admin Passkey
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Bcrypt Salted</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 text-white text-xs outline-none transition placeholder:text-zinc-600 font-mono"
                />
              </div>
            </div>

            {/* Gradient Reference Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-b from-white via-white/95 to-white/70 text-black hover:scale-[1.02] active:scale-[0.98] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-white/10 transition-all duration-150 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" /> Authenticating Session...
                </>
              ) : (
                <>
                  <span>Authenticate Terminal Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-mono transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autofill Super Admin Demo Credentials</span>
            </button>
            <p className="text-[10px] text-center text-zinc-500 mt-2.5 font-mono">
              Username: <span className="text-zinc-300">admin</span> • Passkey:{" "}
              <span className="text-zinc-300">Admin@123456</span>
            </p>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-6 text-center text-xs text-zinc-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Restricted Gateway: Authorized Super Administrator Access Only</span>
          </p>
          <p className="text-[11px] text-zinc-600">
            All user broker credentials & API keys are symmetrically encrypted with Fernet.
          </p>
        </div>
      </div>
    </div>
  );
}
