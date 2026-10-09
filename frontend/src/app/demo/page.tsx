"use client";

import React from "react";
import Link from "next/link";
import { EfferdDashboard2 } from "@/components/ui/efferd-dashboard-2";
import { ArrowLeft } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Mission Control</span>
          </Link>
          <span className="text-zinc-600">|</span>
          <span className="text-xs font-mono text-zinc-300">
            Reference Component: @efferd/components/efferd-dashboard-2
          </span>
        </div>
        <a
          href="https://21st.dev/@efferd/components/efferd-dashboard-2"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-sky-400 hover:underline font-mono"
        >
          21st.dev Source ↗
        </a>
      </div>
      <div className="max-w-7xl mx-auto py-8">
        <EfferdDashboard2 />
      </div>
    </div>
  );
}
