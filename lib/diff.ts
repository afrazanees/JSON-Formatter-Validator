// Thin wrapper around the `diff` library that turns a line-based diff into a
// flat list of rows we can render with left/right line numbers and colors.

import { diffLines, type Change } from "diff";

export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  text: string;
  /** 1-based line number on the left input, or null for added lines. */
  leftNumber: number | null;
  /** 1-based line number on the right input, or null for removed lines. */
  rightNumber: number | null;
}

export interface DiffResult {
  lines: DiffLine[];
  added: number;
  removed: number;
}

/** Compare two blocks of text line by line. */
export function diffText(left: string, right: string): DiffResult {
  const changes: Change[] = diffLines(left, right);
  const lines: DiffLine[] = [];

  let leftNumber = 1;
  let rightNumber = 1;
  let added = 0;
  let removed = 0;

  for (const change of changes) {
    const type: DiffLineType = change.added
      ? "added"
      : change.removed
        ? "removed"
        : "unchanged";

    for (const text of splitLines(change.value)) {
      if (type === "added") {
        lines.push({ type, text, leftNumber: null, rightNumber: rightNumber++ });
        added++;
      } else if (type === "removed") {
        lines.push({ type, text, leftNumber: leftNumber++, rightNumber: null });
        removed++;
      } else {
        lines.push({
          type,
          text,
          leftNumber: leftNumber++,
          rightNumber: rightNumber++,
        });
      }
    }
  }

  return { lines, added, removed };
}

/** Split a diff chunk into individual lines, dropping the trailing newline's
 *  phantom empty entry so blank rows aren't invented. */
function splitLines(value: string): string[] {
  const parts = value.split("\n");
  if (parts.length > 0 && parts[parts.length - 1] === "") {
    parts.pop();
  }
  return parts;
}
