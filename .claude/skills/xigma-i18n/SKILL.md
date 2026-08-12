---
name: xigma-i18n
description: How translations work in xigma — i18next + react-i18next, flat dot-key JSON, language detection order, and where to add a new string. Load before hardcoding user-facing text in a component, adding a new translation key, or touching translations/.
---

# xigma i18n

Ported from x-design's `translations/` shape (same libraries, same flat-key JSON convention);
language **detection** is deliberately different — see below.

## `translations/` layout

Follows [[xigma-module-structure]]:

```
translations/
  types.ts                 — TLanguage ('en' | 'pl')
  constants.ts              — AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY
  utils/getInitialLanguage.ts
  resources/
    en.json
    pl.json
  resources.ts              — combines both into i18next's `resources` shape
  initI18n.ts
  index.ts                  — barrel: exports constants.ts + initI18n.ts only
```

## Flat dot-key convention

Translation JSON is **flat**, not nested — the dot is part of the literal key string:

```json
{ "app.themeToggle.switchToDark": "Switch to dark theme" }
```

Not `{ "app": { "themeToggle": { "switchToDark": "..." } } }`. i18next resolves a full dotted key
directly before trying to split on `.`, so this works with zero extra config (no `keySeparator:
false` needed) — mirrors x-design's `translations/languages/en.json` exactly. Namespace prefix
usually matches the component/page (`app.*`, `home.*`, `notFound.*`, `routing.title.*`).

**A key must exist in both `en.json` and `pl.json`** — there's no per-language partial-resource
loading here (x-design's `initI18n` only loaded the active language's resource object; this app
bundles both up front since it's small, see `resources.ts`).

## Language detection — different from x-design on purpose

x-design detects language via IP geolocation (`https://ipapi.co/json/`, see its
`store/appInitializer/saga.ts`). xigma was explicitly asked for **system-language** detection
instead. `utils/getInitialLanguage.ts` resolution order:

1. `localStorage['language']` if it's one of `AVAILABLE_LANGUAGES`.
2. `navigator.language` (first two chars) if that's one of `AVAILABLE_LANGUAGES`.
3. `DEFAULT_LANGUAGE` (`'en'`) otherwise.

Same shape as [[xigma-theming]]'s `useTheme` (stored choice → system signal → hardcoded default)
— deliberately consistent with that hook.

## Wiring

`main.tsx` awaits `initI18n()` before the first `render()`, so there's no flash of raw translation
keys. Components call `const { t } = useTranslation();` from `react-i18next` and `t('some.key')` —
see `App.tsx`, `HomePage.tsx`, `NotFoundPage.tsx`, `core/Routing/components/Title/Title.tsx`.

## Tests

`src/test/setup.ts` calls `await initI18n(DEFAULT_LANGUAGE)` — **always pinned to English**, never
left to system detection. `getInitialLanguage()`'s real detection logic runs off `navigator.language`
which is environment-dependent (jsdom default vs. a real machine vs. CI); pinning avoids snapshots
and text-content assertions drifting based on who/where the tests run. `initI18n` accepts an optional
`language: TLanguage` argument for exactly this override — don't remove it.

## Adding a new translatable string

1. Add the key to **both** `resources/en.json` and `resources/pl.json`.
2. Use `t('namespace.key')` in the component — never hardcode the English string inline once i18n
   is wired into that component.
3. **The `pl.json` value must be actual Polish, not a copy of the English string.** `design.toolbar.tool.ellipse`/`.polygon`/`.star`
   shipped as `"Ellipse"`/`"Polygon"`/`"Star"` in `pl.json` — an untranslated placeholder that had
   already spread to a second key by copy-paste (`polygon` copying `ellipse`'s shortcut) before a
   third addition (`star`) repeated it again and the user caught it. Corrected to `"Elipsa"`/`"Wielokąt"`/`"Gwiazda"`.
   Existing untranslated-looking entries are not precedent to follow — check with the user (or a
   dictionary) instead of assuming an English word is acceptable Polish just because a neighboring
   key already does it, especially when adding a key by copying a sibling's shape (mirroring
   `[ToolName.polygon]` for a new `[ToolName.star]` entry, say) — copy the *structure*, not the
   *value*.
