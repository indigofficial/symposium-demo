---
  name: Steam-dark theme conventions
  description: How this app's theme is centrally controlled via CSS vars, useful for any future visual redesign requests.
  ---

  This app (symposium-demo) uses Tailwind v4 with `@theme inline` in `src/index.css` mapping `--radius-sm/md/lg/xl` from a single base `--radius` var, and font vars `--app-font-sans`/`--app-font-serif` referenced by `font-serif`/`font-sans` utility classes.

  **Why:** Because shadcn components and most pages reference the mapped theme classes (rounded-md/lg/xl, font-serif) rather than hardcoded values, a full visual redesign (palette, corner sharpness, typeface) can be done almost entirely by editing `:root`/`.dark` variables in `src/index.css`, without touching per-component files.

  **How to apply:** For future theme/aesthetic changes, first check `src/index.css` for the relevant CSS var before editing individual component files. Only touch individual files for things vars can't control: inline blur/glass classes (`backdrop-blur`, `bg-white/X`), hardcoded light-theme colors (`bg-gray-50`, `text-gray-900`) that don't reference theme tokens, and specific radius overrides like `rounded-full`/`rounded-2xl` written directly in JSX instead of via the theme scale.
  