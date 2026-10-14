/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Brand ─────────────────────────────────────────────
        brand:       '#006948',   // primary green CTA
        'brand-dim': '#10b981',   // lighter success / revenue green

        // ── Light-mode surfaces ────────────────────────────────
        surface:     '#ffffff',   // cards, nav bars, drawers
        background:  '#f1f5f9',   // page / screen background
        subtle:      '#f8fafc',   // drawer header, sub-panels

        // ── Borders ────────────────────────────────────────────
        border:      '#e2e8f0',   // all dividers and outlines
        'border-md': '#cbd5e1',   // slightly darker border

        // ── Semantic text ──────────────────────────────────────
        ink:         '#0f172a',   // primary text (headings, values)
        secondary:   '#475569',   // body / description text
        muted:       '#64748b',   // labels, sub-labels
        faint:       '#94a3b8',   // section headers, placeholders

        // ── Input ──────────────────────────────────────────────
        input:       '#f1f5f9',   // text input background

        // ── Status badge colours ───────────────────────────────
        'status-confirmed':   '#3b82f6',
        'status-dispatching': '#8b5cf6',
        'status-delivered':   '#10b981',
        'status-cancelled':   '#ef4444',
        'status-pending':     '#f59e0b',
      },
    },
  },
  plugins: [],
};
