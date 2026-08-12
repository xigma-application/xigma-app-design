---
name: xigma-icons
description: How SVG icons work in xigma — the vite-plugin-svgr pipeline, the data-svg-property recoloring mechanism, and the Icon component. Load before adding a new icon to assets/svg, touching shared/UI/Icon, or when an icon isn't picking up the right color.
---

# xigma Icons

Ported from x-design's `assets/svg` + `shared/UI/Icon`, adapted to Vite (x-design used
`@svgr/webpack`).

## The `data-svg-property` mechanism (the whole point)

Icon source files (`src/assets/svg/*.svg`, copied verbatim from x-design — 84 of them) mark the
elements that should be recolorable with `data-svg-property="fill"` or `="stroke"`, instead of a
hardcoded color:

```svg
<path d="..." data-svg-property="fill" fill="white"/>
```

`fill="white"` is just a placeholder so the raw SVG still looks right if opened directly — it gets
overridden at runtime. `shared/UI/Icon/Icon.module.scss` targets that attribute:

```scss
:global([data-svg-property='fill']) { fill: currentColor; }
:global([data-svg-property='stroke']) { stroke: currentColor; }
```

A CSS attribute-selector rule beats an element's own `fill="..."` presentation attribute in the
cascade, so one SVG asset can be recolored per-instance via `currentColor` — no per-icon variants,
no JS prop-drilling into internal `<path>` elements.

## Build pipeline: `vite-plugin-svgr`

Configured in `vite.config.ts`:

```ts
svgr({ svgrOptions: { titleProp: true, ref: true } })
```

SVGO is **off by default** in this plugin (unlike `@svgr/webpack`, which needed an explicit
`svgo: false` — see the plugin's own README) — so `data-svg-property` and other custom attributes
survive untouched with zero extra config.

Import syntax uses the `?react` suffix (this plugin's current convention, not x-design's bare-path
`{ ReactComponent as X }` style — that named-export form is deprecated upstream):

```ts
import Logo from './svg/logo.svg?react';
```

Ambient types come from the plugin itself — `/// <reference types="vite-plugin-svgr/client" />` in
`src/types/vite-env.d.ts`, not a hand-written `module.d.ts` like x-design has.

## `assets/svg.ts` — the `Icons` barrel

One `import X from './svg/name.svg?react'` + barrel-object entry per icon, generated once from
x-design's own `assets/svg.ts` via a `sed` transform (see the icons-porting conversation) — same
PascalCase names as x-design (`Logo`, `Close`, `ChevronDown`, ...). All 84 are imported eagerly, so
the whole set ships in the bundle regardless of which icons a page actually renders — same tradeoff
x-design makes, not something introduced here.

## `shared/UI/Icon/Icon.tsx`

```tsx
<Icon name="Logo" color="blue1" size={32} />
```

- `name: keyof typeof Icons` — type-checked against the barrel, typos are compile errors.
- `color?: keyof typeof colors` (default `'neutral1'`) — one of [[xigma-theming]]'s tokens, applied
  by setting `style={{ color: colors[color] }}` on the root `<svg>` so `currentColor` picks it up.
- `SVG = useMemo(() => Icons[name], [name])` — kept even though a plain `Icons[name]` lookup is
  already referentially stable (object property access on a static object never changes reference);
  this mirrors x-design's own `Icon.tsx` verbatim rather than diverging for a no-op simplification.

## Adding a new icon

1. Export the SVG from Figma/design with `data-svg-property="fill"`/`"stroke"` on the elements that
   should recolor (or add the attribute by hand).
2. Drop the file in `src/assets/svg/`.
3. Add its import + barrel entry to `src/assets/svg.ts`, alphabetically, matching the existing
   PascalCase naming.
