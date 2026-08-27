<div align="center">
  <img src="src/assets/images/xigma-logo.svg" width="360" height="104" alt="xigma logo" />

  <p><strong>Rebuilding Figma, 1:1, from scratch.</strong><br />
  Canvas-first editor engine, rendered on <strong>WebGL</strong> — not Canvas 2D, not DOM/SVG.</p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
    <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
    <img alt="WebGL" src="https://img.shields.io/badge/Renderer-WebGL2-990000" />
    <img alt="Vitest" src="https://img.shields.io/badge/Vitest-100%25%20coverage-6E9F18?logo=vitest&logoColor=white" />
    <img alt="Playwright" src="https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white" />
  </p>
</div>

---

## Table of contents

- [Table of contents](#table-of-contents)
- [What is this](#what-is-this)
- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Shared package (`@xigma/*`)](#shared-package-xigma)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Code quality gates](#code-quality-gates)
- [Roadmap](#roadmap)
- [Conventions \& AI-assisted workflow](#conventions--ai-assisted-workflow)

## What is this

xigma is an attempt to rebuild the Figma design-tool experience 1:1, one small, deliberate step at
a time. The whole scene — shapes, selection, handles, guides, text — is drawn on a single
`<canvas>`, exactly like the real thing, with one small exception: a tiny DOM overlay is mounted
only while a text box is actively being edited.

Rendering was decided on **WebGL2 from the very first commit**, skipping Canvas 2D as anything but
a brief starting point. The scene is expected to grow large, and migrating renderers mid-flight is
expensive — better to make that call once, early, than twice. A future C++/WASM core (the way real
Figma works) is a deliberately distant, out-of-scope idea for now; WebGL's GL calls make that path
easy to take later _if_ profiling ever actually demands it.

## Highlights

What's already real and working, not just scaffolded:

- **Drawing tools** — Select, Hand, Frame, Rectangle, Ellipse, Line, Polygon, Star, Media
  (image/video), Text — each with its own hit-testing, hover outline, and hover cursor
- **Selection system** — single/multi-select, marquee (intersect or fully-contain via Ctrl/Cmd),
  shift-click add/remove, group bounding-box drag, live hover highlighting
- **Pan & zoom** — scroll-to-pan, Ctrl/Cmd+scroll or pinch to zoom around the cursor, all node
  transforms computed on the GPU (per-vertex, not in JS)
- **Text rendering in WebGL** — a real MSDF (Multi-channel Signed Distance Field) glyph atlas, the
  same technique the real Figma uses, so text stays crisp from 25% to 25,600% zoom instead of
  blurring like a plain rasterized texture would
- **A toolbar and interaction model built to match Figma's own semantics** — tool dropdowns that
  remember your last-used variant, click-vs-drag disambiguation, collapse/expand of group
  selections — not just visual copies

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full, checkbox-by-checkbox history of what's done
and what's next (side panels, resize/rotate handles, undo/redo, groups, snapping, and more).

## Tech stack

| Layer                | Choice                                              |
| -------------------- | --------------------------------------------------- |
| UI framework         | React 19 + TypeScript                               |
| Bundler / dev server | Vite                                                |
| Rendering engine     | Raw WebGL2 (no engine/framework on top)             |
| State                | Redux Toolkit                                       |
| Routing              | React Router                                        |
| Styling              | CSS Modules (SCSS) + BEM                            |
| UI primitives        | Radix UI (dropdown, toggle group, popover, tooltip) |
| i18n                 | i18next / react-i18next                             |
| Unit testing         | Vitest + Testing Library (100% coverage gate)       |
| E2E testing          | Playwright                                          |

## Getting started

Requires Node.js 20+ and SSH access to the private
[`xigma-app-shared`](https://github.com/xigma-application/xigma-app-shared) repo (see the next
section).

```bash
npm install
npm run dev
```

Vite starts on `http://localhost:5173`. The editor itself lives at `/design/:id` (any id works,
e.g. `http://localhost:5173/design/my-file`) — the root route is just the Vite-starter home page.

## Shared package (`@xigma/*`)

`@xigma/components`, `@xigma/core`, and `@xigma/scss` (the `Icon` component + SVG registry, shared
theme tokens, cross-app helpers) are **not** on npm — they live in the separate private repo
[`xigma-application/xigma-app-shared`](https://github.com/xigma-application/xigma-app-shared) and
are pulled into `node_modules/@xigma/*` locally by [`scripts/xigma-pull.cjs`](scripts/xigma-pull.cjs).

What the script does (`xigma.json` is its config — `repo`, `branch`, and the list of `packages`):

1. shallow-clones `xigma-app-shared` at the configured branch into a temp dir,
2. runs `npm install` + `npm run build --workspaces` there,
3. copies each `packages/<name>` build output into `node_modules/@xigma/<name>`.

It runs automatically after every `npm install` (via the `postinstall` hook), so a normal install
is all you need. Requirements: `git` on the `PATH` and an SSH key authorized for the shared repo
(the `repo` URL in `xigma.json` is `git@github.com:…`).

Re-pull manually whenever the shared repo changes and you need the update here:

```bash
npm run xigma:pull
```

Because the packages are copied into `node_modules`, changes in `xigma-app-shared` must be pushed
to its branch first, then re-pulled here — there is no local symlink/workspace link.

## Scripts

| Command                                     | What it does                                        |
| ------------------------------------------- | --------------------------------------------------- |
| `npm run dev`                               | Start the dev server                                |
| `npm run build`                             | Type-check (`tsc -b`) and build for production      |
| `npm run preview`                           | Preview the production build                        |
| `npm test`                                  | Run unit tests in watch mode                        |
| `npm run test:run`                          | Run unit tests once                                 |
| `npm run test:coverage`                     | Run unit tests with the 100% coverage gate enforced |
| `npm run test:e2e`                          | Run the Playwright e2e suite (headless)             |
| `npm run test:e2e:ui`                       | Run e2e tests with Playwright's UI runner           |
| `npm run lint` / `lint:fix`                 | ESLint check / autofix                              |
| `npm run stylelint:check` / `stylelint:fix` | Stylelint check / autofix for `.scss`               |
| `npm run prettier:check` / `prettier:write` | Prettier check / autofix                            |
| `npm run generate:font-atlas`               | Regenerate the MSDF font atlas from the source TTF  |
| `npm run xigma:pull`                        | Re-pull the `@xigma/*` packages from `xigma-app-shared` |

## Project structure

Modules are organized as flat, top-level folders under `src/`, imported by bare name (e.g.
`components/Design/Canvas`, `store/design`) rather than relative paths — aliases are configured in
`tsconfig.app.json` and resolved natively by Vite.

- `components/` — `ComponentName/ComponentName.tsx` + co-located `.module.scss` and `.spec.tsx`.
  All editor UI lives under `components/Design/...` (`Canvas`, `Toolbar`)
- `store/` — Redux Toolkit slices, one feature folder per slice (`store/design`)
- `types/` — shared TS types and enums (`types/design`)
- `hooks/`, `shared/`, `utils/`, `constant/`, `core/`, `config/` — cross-cutting code, following
  the same alias pattern
- `assets/` — SVG icons (recolored at runtime via a `data-svg-property` convention + the shared
  `Icon` component) and font sources for the MSDF atlas
- `styles/` — global styles and theming (CSS custom properties, light/dark)
- `translations/` — i18next resource files
- `e2e/` — Playwright specs (`e2e/pages/design/...`), one file per tool/interaction
- `docs/` — `ROADMAP.md` (the source of truth for progress and what's next)

## Testing

Two independent layers:

- **Unit** (Vitest + Testing Library) — `npm run test:coverage` enforces **100%** branch/function/
  line/statement coverage (`vite.config.ts`, `coverage.thresholds`). This is a hard gate, not a
  soft target.
- **E2E** (Playwright) — `e2e/pages/design/*.spec.ts`, one spec per canvas tool/interaction
  (creating each shape type, hover, selection, hand-tool pan, line-endpoint dragging, …). The
  Playwright config auto-starts the dev server if it isn't already running.

## Code quality gates

ESLint, Stylelint (SCSS, BEM ordering), Prettier, and `tsc -b` are all expected to be clean before
a change is considered done — see the scripts above for the check/fix commands for each.

## Roadmap

[`docs/ROADMAP.md`](docs/ROADMAP.md) tracks progress stage by stage ("Etap 0" onward — canvas
fundamentals, toolbar, scene data model, drawing tools, selection, MSDF text — through to what's
still open: side panels, resize/rotate handles, undo/redo, groups & nested frames, snapping guides,
persistence, and UX polish). It's written as a running log, not a static spec — every checkbox
carries the "why," not just the "what."

## Conventions & AI-assisted workflow

This repo is developed with heavy use of Claude Code, and its conventions are captured as loadable
skills under [`.claude/skills/`](.claude/skills/) — one topic per file (icon pipeline, import
order, test structure, i18n, routing, store slice shape, and more). They're the actual source of
truth for "how we do X here," kept in sync with the code rather than left to go stale in a wiki.
