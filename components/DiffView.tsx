"use client";

import { useMemo, useState } from "react";
import { diffText, type DiffLine } from "@/lib/diff";
import { formatJson, validateJson } from "@/lib/jsonTools";
import ErrorBanner, { type ValidationStatus } from "@/components/ErrorBanner";

/** Format a side when it's valid JSON so the diff reflects structure rather
 *  than whitespace noise; otherwise fall back to the raw text. */
function prepare(text: string): { content: string; valid: boolean } {
  const v = validateJson(text);
  if (v.valid) {
    return { content: formatJson(text, 2), valid: true };
  }
  return { content: text, valid: false };
}

function statusFor(text: string): ValidationStatus {
  if (text.trim() === "") return "idle";
  return validateJson(text).valid ? "valid" : "invalid";
}

export default function DiffView() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [copied, setCopied] = useState(false);

  const bothEmpty = left.trim() === "" && right.trim() === "";

  const result = useMemo(() => {
    const l = prepare(left);
    const r = prepare(right);
    return {
      diff: diffText(l.content, r.content),
      eitherInvalid: !l.valid || !r.valid,
    };
  }, [left, right]);

  const hasChanges = result.diff.added > 0 || result.diff.removed > 0;

  async function handleCopy() {
    if (result.diff.lines.length === 0) return;
    const text = result.diff.lines
      .map((line) => {
        const prefix =
          line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  ";
        return prefix + line.text;
      })
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard failures.
    }
  }

  function handleClear() {
    setLeft("");
    setRight("");
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-emerald-400">+{result.diff.added} added</span>
          <span className="text-rose-400">-{result.diff.removed} removed</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={bothEmpty}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy diff"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={bothEmpty}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Left
          </label>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
            placeholder="Paste the original JSON…"
            className="h-56 w-full resize-y rounded-lg border border-slate-800 bg-slate-900/60 p-3 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
          <ErrorBanner status={statusFor(left)} label="Left" {...errorProps(left)} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Right
          </label>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
            placeholder="Paste the JSON to compare…"
            className="h-56 w-full resize-y rounded-lg border border-slate-800 bg-slate-900/60 p-3 font-mono text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
          <ErrorBanner
            status={statusFor(right)}
            label="Right"
            {...errorProps(right)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">Difference</h2>
          {result.eitherInvalid && !bothEmpty ? (
            <span className="text-xs text-amber-400">
              Comparing raw text (one side isn&apos;t valid JSON)
            </span>
          ) : null}
        </div>
        <DiffOutput
          lines={result.diff.lines}
          bothEmpty={bothEmpty}
          hasChanges={hasChanges}
        />
      </div>
    </section>
  );
}

function errorProps(text: string) {
  const v = validateJson(text);
  if (v.valid) return {};
  return { message: v.error, line: v.line, column: v.column };
}

function DiffOutput({
  lines,
  bothEmpty,
  hasChanges,
}: {
  lines: DiffLine[];
  bothEmpty: boolean;
  hasChanges: boolean;
}) {
  if (bothEmpty) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-500">
        Paste JSON into both inputs to see the differences.
      </div>
    );
  }

  if (!hasChanges) {
    return (
      <div className="rounded-lg border border-emerald-900 bg-emerald-950/30 p-6 text-center text-sm text-emerald-300">
        No differences — the two inputs match.
      </div>
    );
  }

  return (
    <div className="scroll-area max-h-[480px] overflow-auto rounded-lg border border-slate-800 bg-slate-900/60 font-mono text-sm">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, index) => (
            <DiffRow key={index} line={line} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DiffRow({ line }: { line: DiffLine }) {
  const rowClass =
    line.type === "added"
      ? "bg-emerald-950/40"
      : line.type === "removed"
        ? "bg-rose-950/40"
        : "";

  const textClass =
    line.type === "added"
      ? "text-emerald-200"
      : line.type === "removed"
        ? "text-rose-200"
        : "text-slate-300";

  const marker =
    line.type === "added" ? "+" : line.type === "removed" ? "-" : "";

  return (
    <tr className={rowClass}>
      <td className="select-none border-r border-slate-800 px-2 py-0.5 text-right align-top text-xs text-slate-600">
        {line.leftNumber ?? ""}
      </td>
      <td className="select-none border-r border-slate-800 px-2 py-0.5 text-right align-top text-xs text-slate-600">
        {line.rightNumber ?? ""}
      </td>
      <td
        className={`select-none px-2 py-0.5 text-center align-top ${textClass}`}
      >
        {marker}
      </td>
      <td
        className={`w-full whitespace-pre-wrap break-all px-2 py-0.5 align-top ${textClass}`}
      >
        {line.text === "" ? " " : line.text}
      </td>
    </tr>
  );
}
