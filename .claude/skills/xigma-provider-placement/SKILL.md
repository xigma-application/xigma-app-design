---
name: xigma-provider-placement
description: Where a new React Context provider belongs — pages/<Page>/core/ vs components/<Feature>/core/ — decided by how many sibling component trees need to read it, mirrored from x-design. Load before adding a new createContext/Provider, or before threading a ref/value that a component's siblings also need.
---

# xigma Provider Placement

A Context provider's folder location is decided by **how many independent sibling trees consume
it**, not by which component happens to need it first.

## The rule

- **Needed by exactly one component's own subtree** (the provider only ever wraps that one
  component, nothing else) → `components/<Feature>/core/<Name>Provider/`. Example:
  `components/Design/core/ClassNamesProvider/` — mounted in `DesignPage.tsx` wrapping only
  `<Canvas />`, consumed only from inside `Canvas/`.
- **Needed by two or more sibling trees under the same page** (e.g. a page's canvas *and* its
  toolbar, mounted as siblings, not one nested in the other) → `pages/<Page>/core/<Name>Provider/`,
  mounted high enough in the page component to wrap every consumer. Example:
  `pages/DesignPage/core/CanvasRefsProvider/` — `Canvas.tsx` and `Toolbar/`'s hooks both read it,
  and neither is an ancestor of the other, so the provider has to live above both, at the page
  level, not folded into either one's own `components/Design/.../core/`.

Verified against x-design: `pages/PageBuilderPage/core/RefsProvider.tsx` holds refs consumed by
`components/PageBuilder/ViewBox/ViewBox.tsx`, `OverlayContainer.tsx`, `Elements/Element/*`, and
more — a dozen+ components scattered across the tree, not just one. x-design's own component-level
providers (scoped to one subtree) stay under that component's folder instead.

## Why this matters

Putting a multi-consumer provider under `components/<Feature>/core/` works fine right up until a
second, sibling tree also needs it — then either the provider silently gets duplicated (each side
creates its own instance, defeating the whole point of sharing state) or someone has to move the
whole folder later. Deciding placement by consumer count up front avoids the move.

## Worked example — `CanvasRefsProvider`

Originally added as `components/Design/core/CanvasRefsProvider/`, wrapping only `<Canvas />` (the
one place canvas refs — pen preview, drag state, hover state, all of `TCanvasRefs` — were read).
Then a `Toolbar/` component needed the *same* refs object (to clear the in-progress pen preview
when a toolbar click force-exits Vector Edit Mode mid-draw — see `vector-network.md` §45) —
`Toolbar/` is a sibling of `Canvas/` under `DesignPage.tsx`, not a descendant, so the provider had
to move up to `pages/DesignPage/core/CanvasRefsProvider/`, mounted in `DesignPage.tsx` wrapping the
whole `<main>` (both `<Canvas/>` and `<Toolbar/>` underneath it). `ClassNamesProvider` stayed put
under `components/Design/core/` — it's still only ever consumed inside `Canvas/`.

## File shape (same either location)

Mirrors this repo's own `ClassNamesProvider` shape, not x-design's flatter one:

```
<core>/<Name>Provider/
  context.ts              — createContext<TValue | null>(null)
  types.ts                — T<Name>ProviderProps (usually just PropsWithChildren)
  <Name>Provider.tsx       — builds the value (state, refs, whatever), renders Context.Provider
  hooks/
    use<Name>Context.ts    — useContext + throw if null ("use<Name>Context must be used within a <Name>Provider")
```

If the provider's value is a bag of stable `useRef`s (not `useState`), build them directly inside
`<Name>Provider.tsx` with `useRef`/`useMemo` — don't factor that into a separate hook first. A
ref-creating hook that's only ever called from one Provider component adds a layer with no
independent reason to exist; `CanvasRefsProvider.tsx` builds its 30+ refs and bundles them via
`useMemo(() => ({...}), [])` directly in the component body, and the folder still keeps a
standalone `createCanvasRefs.ts` (plain object, no hooks) alongside it — that one **is** worth
keeping separate, since tests construct a `TCanvasRefs` value without rendering React.

## Related

[[xigma-module-structure]] — the general types.ts/constants.ts/utils/ split this mirrors, one level
up (provider files instead of feature files). [[xigma-event-handlers-in-hooks]] — the same "don't
inline what has its own reason to be a named unit" instinct, applied to JSX handlers instead of
providers.
