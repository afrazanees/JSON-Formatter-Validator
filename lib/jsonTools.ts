// Browser-only JSON helpers: parse, validate, format, and minify.
// No backend involved — everything here runs against the native JSON engine.

export type ValidationResult =
  | { valid: true; data: unknown }
  | {
      valid: false;
      error: string;
      line?: number;
      column?: number;
      position?: number;
    };

/**
 * Validate a JSON string. On failure, returns a human-friendly error message
 * and, when it can be determined, the 1-based line/column of the problem.
 */
export function validateJson(input: string): ValidationResult {
  if (input.trim() === "") {
    return { valid: false, error: "Input is empty." };
  }

  try {
    const data = JSON.parse(input);
    return { valid: true, data };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const position = extractPosition(raw);

    if (position !== undefined) {
      const { line, column } = lineColumnFromPosition(input, position);
      return { valid: false, error: cleanMessage(raw), line, column, position };
    }

    return { valid: false, error: cleanMessage(raw) };
  }
}

/** Pretty-print JSON with the given indentation (defaults to 2 spaces). */
export function formatJson(input: string, indent = 2): string {
  return JSON.stringify(JSON.parse(input), null, indent);
}

/** Collapse JSON to a single line with no extra whitespace. */
export function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input));
}

/** Tidy a raw JSON.parse error for display:
 *  - drop the trailing "(line X column Y)" hint (we present that separately),
 *  - collapse the newlines V8 embeds in its snippet so the message stays on
 *    one readable line. */
function cleanMessage(message: string): string {
  return message
    .replace(/\s*\(line \d+ column \d+\)\.?$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pull the character offset out of a JSON.parse error message, if present. */
function extractPosition(message: string): number | undefined {
  const match = message.match(/position (\d+)/i);
  return match ? Number(match[1]) : undefined;
}

/** Convert a 0-based character offset into a 1-based line and column. */
function lineColumnFromPosition(
  text: string,
  position: number
): { line: number; column: number } {
  let line = 1;
  let column = 1;

  const limit = Math.min(position, text.length);
  for (let i = 0; i < limit; i++) {
    if (text[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return { line, column };
}
