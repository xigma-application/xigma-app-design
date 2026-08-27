---
name: xigma-icons
description: How SVG icons work in xigma — the Icon component now ships in @xigma/components, the data-svg-property recoloring mechanism, and where to add a new icon. Load before adding/changing an icon or when an icon isn't picking up the right color.
---

# xigma Icons

**The `Icon` component and its SVG registry moved to `@xigma/components`** (the `xigma-app-shared`
repo) in the `@xigma/*` migration. The old local `src/assets/svg/*.svg` + `src/assets/svg.ts`
barrel and `src/shared/UI/Icon/` were deleted.

## Using an icon in this app

```tsx
import { Icon } from '@xigma/components'; // or: from 'shared' (re-exports it)

<Icon name="Close" color="blue1" size={32} />
```

- `name: TIconProps['name']` — the union of icon names exported by `@xigma/components`. Import
  `TIconProps` from there when you need the type (e.g. `Record<ToolName, TIconProps['name']>` in
  `Toolbar/constants.ts`).
- `color?` (default `'neutral1'`) — one of the shared colour tokens (`blue1`, `neutral1`–`neutral5`,
  `onBlue1`); applied as `style={{ color }}` on the `<svg>` so `currentColor` picks it up.
- The package ships its compiled styles — `src/main.tsx` does `import '@xigma/components/index.css'`
  once. Without it, `Icon`/`Tooltip` render unstyled.

## The `data-svg-property` recolor mechanism (unchanged)

Recolorable elements in the SVG carry `data-svg-property="fill"` / `="stroke"` instead of a
hardcoded colour (`fill="white"` is just a placeholder for viewing the raw file). The recolor rule
now ships in `@xigma/scss`:

```scss
@use '@xigma/scss/mixins/svg-color';
.Thing { @include svg-color.svg-color(var(--color-blue-1)); }
```

`@xigma/components`'s own `Icon` already applies this against `currentColor`. A CSS
attribute-selector beats the element's presentation `fill="..."` in the cascade, so one asset
recolors per instance — no per-icon variants.

## Adding / changing an icon

Do it in **`xigma-app-shared`** (it has its own `xigma-icons` skill):

1. Add the `.svg` to `packages/components/src/Icon/svg/`, `data-svg-property` on the recolor targets.
2. Add its import + `Icons` entry in `packages/components/src/Icon/constants.ts` (alphabetical,
   PascalCase).
3. Commit + push, then in this repo run `npm run xigma:pull` (or `npm install`) to refresh
   `node_modules/@xigma/*`.
