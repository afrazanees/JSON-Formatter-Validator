// Presentational validation banner: green when valid, red with details when
// invalid, and nothing at all when the input is empty/idle.

export type ValidationStatus = "idle" | "valid" | "invalid";

interface ErrorBannerProps {
  status: ValidationStatus;
  message?: string;
  line?: number;
  column?: number;
  /** Optional label so the Diff tab can say which side is invalid. */
  label?: string;
}

export default function ErrorBanner({
  status,
  message,
  line,
  column,
  label,
}: ErrorBannerProps) {
  if (status === "idle") {
    return null;
  }

  if (status === "valid") {
    return (
      <div
        role="status"
        className="flex items-center gap-2 rounded-md border border-emerald-800 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-300"
      >
        <span aria-hidden>✓</span>
        <span>{label ? `${label}: valid JSON` : "Valid JSON"}</span>
      </div>
    );
  }

  const hasPosition = typeof line === "number" && typeof column === "number";

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-rose-800 bg-rose-950/50 px-3 py-2 text-sm text-rose-300"
    >
      <span aria-hidden className="mt-0.5">
        ⚠
      </span>
      <div>
        <span className="font-medium">
          {label ? `${label}: invalid JSON` : "Invalid JSON"}
        </span>
        {message ? <span> — {message}</span> : null}
        {hasPosition ? (
          <span className="text-rose-400/90">
            {" "}
            (line {line}, column {column})
          </span>
        ) : null}
      </div>
    </div>
  );
}
