"use client";

import { useState } from "react";
import Formatter from "@/components/Formatter";
import DiffView from "@/components/DiffView";

type Tab = "format" | "diff";

export default function Page() {
  const [tab, setTab] = useState<Tab>("format");

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          JSON Formatter &amp; Validator
        </h1>
        <p className="text-sm text-slate-400">
          Format, validate, and minify JSON, or diff two inputs — all in your
          browser.
        </p>
      </header>

      <nav className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
        <TabButton
          active={tab === "format"}
          onClick={() => setTab("format")}
        >
          Format
        </TabButton>
        <TabButton active={tab === "diff"} onClick={() => setTab("diff")}>
          Diff
        </TabButton>
      </nav>

      {tab === "format" ? <Formatter /> : <DiffView />}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-slate-700 text-white shadow"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
