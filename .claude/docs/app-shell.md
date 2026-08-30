# App shell — no client-side router

The app ships as a single-purpose SPA behind its own subdomain, so there's no multi-page/multi-route
concept to route between — `src/components/App/App.tsx` **is** the whole app, not a router picking
between screens. `react-router` was removed entirely (package, `src/core/Routing/` folder, and the
`src/pages/HomePage`/`src/pages/NotFoundPage`/`src/pages/DesignPage` folders it routed between —
`src/pages/` doesn't exist any more). `App.tsx` absorbed what `pages/DesignPage/DesignPage.tsx` used
to render directly: `CanvasRefsProvider` wrapping `LeftPanel`/`Canvas` (inside
`ClassNamesProvider`)/`RightPanel`/`Toolbar`.

- **`CanvasRefsProvider`** (the context assembling all of `TCanvasRefs` — see
  [[canvas-rendering-pipeline]]/[[design-store-architecture]]) moved from
  `pages/DesignPage/core/CanvasRefsProvider/` to `components/App/core/CanvasRefsProvider/`, same
  internal shape, just re-homed. Nine consumers elsewhere in `Canvas`/`Toolbar` import
  `useCanvasRefsContext` from the new path.
- **No path params any more** — everything that used to live in the route (`/design/:id`) or in
  React Router's `useSearchParams`/`useParams` now goes through plain `window.location.search`, read
  via a tiny shared `components/App/utils/getQueryParam.ts` (`new URLSearchParams(...).get(name)`).
  No live subscription to URL changes is needed: without client-side navigation, the query string can
  only change via a real page load, which already resets everything.
  - `?page=<id>` — which of the design's pages (§ in [[design-store-architecture]], the Figma-style
    multi-page state, not a routed "page") is active on load. Read once on mount by
    `components/App/hooks/useSyncActivePageFromUrl.ts` → `setActivePage` if the id resolves.
  - `?project=<id>` — read directly in `App.tsx`. **Not wired to anything yet** — there's no
    backend/persistence layer, so today it's just carried through to `useCopyPageLink.ts` (Pages
    panel's "Copy link to page", which builds `${origin}${pathname}?project=<id>&page=<id>`) and
    exposed as `data-project-id` on the root `.App` div for debugging. The intended integration point
    for a future project load is right where `App.tsx` reads it — swap the plain read for a fetch
    dispatching a `replaceDesignSnapshot` (or similar) once a backend exists.
- **e2e**: `DesignPage.ts`'s `goto(projectId)` navigates to `/?project=${projectId}` instead of
  `/design/${projectId}` — the id was never actually consumed by anything before (no
  persistence/backend keyed by it), so test isolation was always coming from the full page
  reload/fresh in-memory store on every `page.goto`, not from the id's value. Every existing e2e
  call site kept its string argument unchanged.
- **Dead on removal**: `HomePage`/`NotFoundPage` (the Vite starter-template boilerplate, unreachable
  without a router), `Title.tsx`'s per-route `document.title` switching (the static `<title>` in
  `index.html` is now the only title), the `routing.title.*`/`home.*`/`notFound.*` translation keys,
  and the `APP_NAME` constant (only consumer was `Title.tsx`). `app.module.scss`'s `.App__theme-toggle`
  rule was already orphaned before this change (no JSX referenced it — `HomePage` had its own,
  differently-scoped `__theme-toggle` class) and was removed too.

## Related

[[design-store-architecture]] — the `?page=` param's target (`setActivePage`), and per-page state
shape it's switching between.
[[canvas-rendering-pipeline]]/[[design-tool-architecture]] — what `CanvasRefsProvider`'s
`TCanvasRefs` feeds into, now assembled one level up under `components/App` instead of
`pages/DesignPage`.
