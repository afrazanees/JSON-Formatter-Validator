# JSON Formatter & Validator

Paste JSON to format, validate, and minify it. A diff mode compares two JSON inputs and highlights what changed. Runs entirely in your browser — no backend.

## Features
- Pretty-print (2-space indent) and minify JSON
- Live validation with clear error messages, including the line and column of the problem when available
- Diff mode: compare two JSON inputs with added/removed lines highlighted and numbered
- Copy and clear actions on both tabs

## Tech
Next.js (App Router), TypeScript, Tailwind CSS, and the `diff` library for the compare view.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 in your browser.

## Production build
```bash
npm run build
npm run start
```

## Project structure
```
app/
  page.tsx          # tabs: Format | Diff
  layout.tsx
  globals.css
components/
  Formatter.tsx     # single-input format/validate/minify
  DiffView.tsx      # two-input compare
  ErrorBanner.tsx   # validation messages
lib/
  jsonTools.ts      # parse, format, minify, validate
  diff.ts           # diff wrapper
```
