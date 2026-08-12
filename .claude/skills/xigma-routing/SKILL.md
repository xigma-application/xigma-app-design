---
name: xigma-routing
description: How routing works in xigma — react-router v8, the named route registry, the guard/ProtectedRoute mechanism, and per-route document titles. Load before adding a new route or page, touching anything under core/Routing, or implementing route protection (auth-style redirects).
---

# xigma Routing

Modernized port of trading-bot-app's `core/Routing` (which used React Router v5-era APIs). Same
concerns kept — named routes, composable guards, a `ProtectedRoute` wrapper, a `Title` sync, a
`RouteTransitionLoader` — rebuilt on `react-router` v8 (v7+ merged `react-router-dom` into the
single `react-router` package; that's the only import you need).

## `core/Routing/` layout

Follows [[xigma-module-structure]]:

```
core/Routing/
  Routing.tsx                       — assembles the router, top-level export
  types.ts                          — TGuard, TAppRouteData, TComponent
  constants/
    routes.ts                        — RouteName enum + ROUTES map
    appRoutesData.ts                 — APP_ROUTES_DATA: one entry per route
  utils/
    getRouteByName.ts
    renderRoute.tsx
  components/
    RootLayout/                     — Suspense + Title + <Outlet/>
    ProtectedRoute/                 — evaluates guards, renders fallback or children
    Title/                          — syncs document.title per route
    RouteTransitionLoader/          — Suspense fallback (ready for lazy-loaded pages)
```

## The named-route registry

Never hardcode a path string in a component. Add the route to both:

```ts
// constants/routes.ts
export enum RouteName { home = 'home' }
export const ROUTES: Record<RouteName, string> = { [RouteName.home]: '/' };
```

Then reference it via `getRouteByName(RouteName.home)`, never `'/'` directly.

## Adding a new route

1. Add the name to `RouteName` + its path to `ROUTES` (`constants/routes.ts`).
2. Add the translation key(s) for its title to `translations/resources/en.json` and `pl.json` (see
   [[xigma-i18n]]) — e.g. `"routing.title.about": "About"`.
3. Add an entry to `APP_ROUTES_DATA` (`constants/appRoutesData.ts`):
   ```ts
   { Component: AboutPage, name: RouteName.about, titleKey: 'routing.title.about' }
   ```
4. Build the page under `pages/AboutPage/` per [[xigma-component-structure]].

`renderRoute` turns each entry into a `<Route element={<ProtectedRoute guards={guards}><Component/></ProtectedRoute>} path={...} />` — this is why `ProtectedRoute` renders `children`/fallback rather than a
`<Route>` itself (unlike x-design's RR5-era version): in RR6+/7 a `<Route>` must live directly in the
router's route tree, so the guard-checking wrapper has to sit *inside* `element`, not wrap the
`<Route>` from outside.

## Guards — the protection mechanism

```ts
type TGuard = {
  guardCheck: () => boolean;
  renderFallback: () => ReactNode;
};
```

`ProtectedRoute` finds the first guard whose `guardCheck()` returns `false` and renders its
`renderFallback()` (typically `<Navigate to="..." />`) instead of `children`. Guards compose — a
route's `guards` array can have several, checked in order. **No guards are currently wired to any
real route** — there's no auth/store yet to check against. The mechanism is fully built and tested
(`components/ProtectedRoute/ProtectedRoute.spec.tsx`) so it's ready the moment there's real state to
guard on; don't invent a fake guard against nonexistent state.

`guardCheck` can call hooks internally (e.g. a future `useSelector`) — it's invoked synchronously
during `ProtectedRoute`'s render, so hook-call-order rules apply: keep the guards array's length and
order stable across renders for a given route.

## `Title` — per-route document title

Looks up the current pathname in `APP_ROUTES_DATA`, translates its `titleKey` via `useTranslation()`
(see [[xigma-i18n]]), and sets `document.title = \`${title} - ${APP_NAME}\`` in a `useEffect`
keyed on `pathname`. Unmatched paths (the `*` catch-all → `NotFoundPage`) fall back to the
`'routing.title.notFound'` key.

## `RootLayout`

The layout route wrapping every page: `<Suspense fallback={<RouteTransitionLoader/>}><Title/><Outlet/></Suspense>`.
This is a structural adaptation RR6+/7 requires — x-design's old `Routing.tsx` could just wrap
`<Suspense>` directly around `<Switch>` in one component; the data-router API needs it expressed as
an actual layout route with `<Outlet/>` instead.
