"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SuperAdmin, User, DashboardStats } from "@/types";
import { getMe, getUsers, getDashboardStats } from "@/lib/api";
import { Sidebar, NavTab } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { StatsCards } from "@/components/StatsCards";
import { OrderVolumeChart } from "@/components/OrderVolumeChart";
import { AlertDistributionChart } from "@/components/AlertDistributionChart";
import { GatewayHealthCard } from "@/components/GatewayHealthCard";
import { TerminalActivityCard } from "@/components/TerminalActivityCard";
import { UserManagementTable } from "@/components/UserManagementTable";
import { TelemetryView } from "@/components/TelemetryView";
import { SimulatorView } from "@/components/SimulatorView";
import { HealthView } from "@/components/HealthView";
import { SettingsView } from "@/components/SettingsView";
import { AddUserModal } from "@/components/AddUserModal";
import { EditUserModal } from "@/components/EditUserModal";
import { OrderSimulationModal } from "@/components/OrderSimulationModal";
import { AuditLogDrawer } from "@/components/AuditLogDrawer";
import { LoginView } from "@/components/LoginView";
import { Loader2, AlertCircle, ExternalLink, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<SuperAdmin | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>("overview");

  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // App Data
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  // Modals & Drawers
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [simulatingUser, setSimulatingUser] = useState<User | null>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("astra_terminal_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleSetTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    localStorage.setItem("astra_terminal_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    handleSetTheme(next);
  };

  // Check login state on initial load
  useEffect(() => {
    const token =
      localStorage.getItem("astra_admin_token") || localStorage.getItem("srini_admin_token");
    if (!token) {
      setAuthChecked(true);
      return;
    }

    getMe()
      .then((admin) => {
        setCurrentUser(admin);
      })
      .catch(() => {
        localStorage.removeItem("astra_admin_token");
        localStorage.removeItem("srini_admin_token");
        localStorage.removeItem("astra_admin_user");
        localStorage.removeItem("srini_admin_user");
        setCurrentUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });

    const handleExpired = () => {
      setCurrentUser(null);
    };
    window.addEventListener("auth-expired", handleExpired);
    return () => window.removeEventListener("auth-expired", handleExpired);
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoadingData(true);
    setGlobalError("");

    try {
      const [fetchedUsers, fetchedStats] = await Promise.all([
        getUsers(),
        getDashboardStats(),
      ]);
      setUsers(fetchedUsers);
      setStats(fetchedStats);
      setRefreshCount((prev) => prev + 1);
    } catch (err: any) {
      setGlobalError(err.message || "Failed to load terminal data.");
    } finally {
      setLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  const handleLogout = () => {
    localStorage.removeItem("astra_admin_token");
    localStorage.removeItem("srini_admin_token");
    localStorage.removeItem("astra_admin_user");
    localStorage.removeItem("srini_admin_user");
    setCurrentUser(null);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-zinc-400 font-mono text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span>INITIALIZING ASTRA TRADING TERMINAL...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={(admin) => setCurrentUser(admin)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060911] text-slate-900 dark:text-zinc-100 flex font-sans selection:bg-blue-500/30 selection:text-white transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentTab={activeTab}
          onTabChange={(t) => setActiveTab(t)}
          user={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          userCount={users.length}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-64 bg-white dark:bg-[#070b15] h-full shadow-2xl">
            <Sidebar
              currentTab={activeTab}
              onTabChange={(t) => {
                setActiveTab(t);
                setMobileSidebarOpen(false);
              }}
              user={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              userCount={users.length}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          onRefresh={loadData}
          isRefreshing={loadingData}
          onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {globalError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{globalError}</span>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW / MISSION CONTROL */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Hero Banner with Status Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/60 text-xs mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-700 dark:text-zinc-300 font-medium">
                      Multi-Broker Gateway Active
                    </span>
                    <span className="text-slate-400 dark:text-zinc-600">•</span>
                    <span className="text-slate-600 dark:text-zinc-400 font-mono">
                      Fernet Zero-Leak Vault
                    </span>
                  </div>

                  <h1
                    className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    Astra Mission Control
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    Central sovereign terminal orchestrating broker API accounts, live order routing safety toggles, and independent WhatsApp & Telegram trade alert dispatches.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveTab("users")}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Manage Accounts</span>
                    <span className="text-[10px] bg-blue-700/60 px-1.5 py-0.5 rounded font-mono">
                      {users.length}
                    </span>
                  </button>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800 text-xs font-mono transition"
                  >
                    <span>Reference Demo</span>
                    <ExternalLink className="w-3 h-3 text-sky-500" />
                  </Link>
                </div>
              </div>

              {/* 1px Hairline Border Grid System (efferd-dashboard-2 style) */}
              <div className="grid grid-cols-1 gap-px bg-slate-200 dark:bg-[#162033] p-px md:grid-cols-2 lg:grid-cols-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#162033] shadow-2xl">
                {/* Row 1: 4 Dense KPI Cards */}
                <StatsCards stats={stats} />

                {/* Row 2: Live Order Routing Volume (col-span-2) & Alert Distribution (col-span-2) */}
                <OrderVolumeChart />
                <AlertDistributionChart />

                {/* Row 3: Gateway Health (col-span-2) & Real-time Activity Feed (col-span-2) */}
                <div className="md:col-span-2 bg-white dark:bg-[#090f1e] flex flex-col">
                  <GatewayHealthCard onRefresh={loadData} isRefreshing={loadingData} />
                </div>
                <div className="md:col-span-2 bg-white dark:bg-[#090f1e] flex flex-col">
                  <TerminalActivityCard
                    onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
                    refreshTrigger={refreshCount}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER & BROKER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span>User & Broker Management Gateway</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono font-bold">
                      {users.length} Registered
                    </span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
                    Manage client accounts, live order routing safety locks, encrypted broker credentials, and independent alerts.
                  </p>
                </div>
              </div>

              <UserManagementTable
                users={users}
                onRefresh={loadData}
                onOpenAddUser={() => setIsAddUserOpen(true)}
                onSimulateOrder={(user) => setSimulatingUser(user)}
                onEditUser={(user) => setEditingUser(user)}
              />
            </div>
          )}

          {/* TAB 3: ORDER ROUTING TESTBENCH */}
          {activeTab === "simulator" && (
            <div className="animate-in fade-in duration-200">
              <SimulatorView users={users} onOrderExecuted={loadData} />
            </div>
          )}

          {/* TAB 4: AUDIT TELEMETRY */}
          {activeTab === "telemetry" && (
            <div className="animate-in fade-in duration-200">
              <TelemetryView />
            </div>
          )}

          {/* TAB 5: GATEWAY CRYPTOGRAPHY & HEALTH */}
          {activeTab === "health" && (
            <div className="animate-in fade-in duration-200">
              <HealthView onRefresh={loadData} isRefreshing={loadingData} />
            </div>
          )}

          {/* TAB 6: SETTINGS & THEME */}
          {activeTab === "settings" && (
            <div className="animate-in fade-in duration-200">
              <SettingsView
                user={currentUser}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onSetTheme={handleSetTheme}
              />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-zinc-900 bg-slate-50 dark:bg-[#060911] py-6 text-center text-xs text-slate-500 dark:text-zinc-500 font-mono transition-colors">
          Astra Trading Super Admin Mission Control • Powered by Python FastAPI & Next.js • Protected by Encrypted Gateway
        </footer>
      </div>

      {/* Modals & Drawers */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserCreated={loadData}
      />

      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={loadData}
      />

      <OrderSimulationModal
        isOpen={!!simulatingUser}
        onClose={() => setSimulatingUser(null)}
        selectedUser={simulatingUser}
        allUsers={users}
        onOrderExecuted={loadData}
      />

      <AuditLogDrawer
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
      />
    </div>
  );
}
