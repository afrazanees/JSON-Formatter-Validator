"use client";

import { useMemo, useState } from "react";
import { formatJson, minifyJson, validateJson } from "@/lib/jsonTools";
import ErrorBanner, { type ValidationStatus } from "@/components/ErrorBanner";

const SAMPLE = `{
  "name": "json-formatter",
  "version": 1,
  "tags": ["format", "validate", "minify"],
  "nested": { "ok": true, "count": 42 }
}`;

export default function Formatter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const validation = useMemo(() => validateJson(input), [input]);
  const isEmpty = input.trim() === "";

  const status: ValidationStatus = isEmpty
    ? "idle"
    : validation.valid
      ? "valid"
      : "invalid";

  function handleFormat() {
    if (!validation.valid) return;
    setInput(formatJson(input, 2));
  }

  function handleMinify() {
    if (!validation.valid) return;
    setInput(minifyJson(input));
  }

  async function handleCopy() {
    if (isEmpty) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. non-secure context); ignore.
    }
  }

  function handleClear() {
    setInput("");
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleFormat}
          disabled={!validation.valid}
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Format
        </button>
        <button
          type="button"
          onClick={handleMinify}
          disabled={!validation.valid}
          className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Minify
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={isEmpty}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isEmpty}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        placeholder={`Paste JSON here, e.g.\n\n${SAMPLE}`}
        className="h-[420px] w-full resize-y rounded-lg border border-slate-800 bg-slate-900/60 p-4 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
      />

      <ErrorBanner
        status={status}
        message={validation.valid ? undefined : validation.error}
        line={validation.valid ? undefined : validation.line}
        column={validation.valid ? undefined : validation.column}
      />
    </section>
  );
}
