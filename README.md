# xigma

React + TypeScript template, built with Vite and tested with Vitest.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm test` — run tests in watch mode
- `npm run test:run` — run tests once

## Structure

Modules are organized as flat, top-level folders under `src/`, imported by
bare name (e.g. `components/App/App`, `styles/index.scss`) rather than
relative paths — aliases are configured in `tsconfig.app.json` and resolved
natively by Vite. Following [x-design](../x-design)'s convention:

- `components/` — `ComponentName/ComponentName.tsx` + co-located
  `.module.scss` and `.spec.tsx`
- `pages/`, `hooks/`, `shared/`, `store/`, `utils/`, `constant/`, `core/`,
  `config/`, `assets/` — add as needed, following the same alias pattern
- `styles/` — global styles
- `types/` — ambient declarations and shared TS types
- `test/` — Vitest setup
