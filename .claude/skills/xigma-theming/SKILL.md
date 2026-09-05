---
name: xigma-theming
description: How color theming and dark/light mode work in xigma — CSS custom properties (the theme map now ships in @xigma/scss), the local colors token map, and the useTheme hook. Load before adding a new color token, touching @xigma/scss's theme, constant/colors.ts, or hooks/useTheme, or building anything that needs to read/react to the current theme.
---

# xigma Theming

Single source of truth for color, one mechanism for both SCSS and TSX — no compile-time
light/dark class variants (that's what x-design does; deliberately not mirrored here, see
`xigma-import-order`'s sibling skills for what *was* mirrored). Instead: **CSS custom properties**
that both worlds read from the same names.

## `@xigma/scss`'s `_theme.scss` — the only place with real hex values

Lives in the **`xigma-app-shared`** repo (`packages/scss/src/_theme.scss`), pulled into
`node_modules/@xigma/scss`. This app loads it once via `src/styles/index.scss`
(`@use '@xigma/scss/theme'`; `@use '@xigma/scss/variables'` for the non-colour tokens). Editing the
palette means editing the shared repo + `npm run xigma:pull`.

A Sass map per theme + a mixin that emits `--color-*` custom properties:

```scss
$themes: (
  dark: (neutral-1: #ffffff, neutral-2: #b3b3b3, neutral-3: #444444, neutral-4: #2c2c2c, neutral-5: #1e1e1e, blue-1: #0d99ff),
  light: (neutral-1: #1e1e1e, neutral-2: #6e6e6e, neutral-3: #e6e6e6, neutral-4: #ffffff, neutral-5: #f5f5f5, blue-1: #0d99ff),
);
```

Applied four times, by design:
1. `:root { @include theme-variables(dark); }` — dark is the default (matches the reference: Figma's
   own dark UI, see project memory of the original ask).
2. `@media (prefers-color-scheme: light) { :root { ... } }` — auto light when the OS prefers it and
   no explicit choice has been made.
3. `:root[data-theme='dark'] { ... }` / `:root[data-theme='light'] { ... }` — explicit override.
   `[data-theme]` has higher CSS specificity than a bare `:root`, so it **always wins** over the
   media query regardless of source order — no `!important` needed.

Naming scale: `neutral-1` (lightest/text) → `neutral-5` (darkest/deepest background), plus accent
colors like `blue-1`. Same numbering direction as x-design's `THEME_COLORS`.

## `src/constant/colors.ts` — the same tokens, usable in TSX

```ts
export const colors = {
  neutral1: 'var(--color-neutral-1)',
  blue1: 'var(--color-blue-1)',
  // ...
} as const;
```

Each value is the CSS `var()` string, not a resolved hex — so `colors.neutral2` used in an inline
`style` prop is *exactly* the same token as `var(--color-neutral-2)` in a `.module.scss` file, and
both react to theme changes automatically with no re-render needed. There is no codegen step
(unlike x-design's `generateThemeColors.js`), so a **new** colour token has to be added by hand in
three places, kept in sync: the hex in `@xigma/scss`'s `_theme.scss` (shared repo), the `var()`
reference in this repo's `constant/colors.ts`, and `@xigma/components`'s own `src/colors.ts` (which
types `Icon`'s `color` prop). `@xigma/components` re-exports its `colors` map — a component could
import that instead of the local `constant/colors.ts`, but HomePage still uses the local one.

## `useTheme` — reading/switching the theme in React

```ts
import { useTheme } from 'hooks'; // re-exports @xigma/hooks

const { theme, setTheme, toggleTheme } = useTheme();
```

Lives in the **`xigma-app-shared`** repo (`packages/hooks/src/useTheme`), pulled into
`node_modules/@xigma/hooks` the same way as `@xigma/scss`. `src/hooks/index.ts` re-exports it
(`export * from '@xigma/hooks';`) so call sites still just `import { useTheme } from 'hooks'` — no
local copy exists anymore. `STORAGE_KEY` is exported from the same package for tests that need to
seed `localStorage` directly (see `ThemeMenu.spec.tsx`, `useSelectTheme.spec.tsx`).

Resolution order on first read: `localStorage['theme']` → `prefers-color-scheme` media query →
`'dark'` (or just `'dark'` outright when there's no `window`, e.g. server-side rendering in a
consumer like xigma-app-website — this app is a browser-only SPA so that branch never fires here).
On every change it writes `document.documentElement.dataset.theme` (which is what the `[data-theme]`
CSS rules above key off) and persists to `localStorage`.

Editing the hook itself means editing the shared repo + `npm run xigma:pull`, same as `@xigma/scss`.

## Adding a new color-consuming component

Never write a hex value or hardcode `'light'`/`'dark'` logic in a component. Use `var(--color-*)` in
`.module.scss`, or `colors.xxx` from `constant/colors` for inline/prop usage — see
[[xigma-component-structure]].
