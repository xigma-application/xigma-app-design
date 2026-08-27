---
name: xigma-import-order
description: Import statement ordering convention for xigma, mirrored from x-design. Load before writing or reviewing the import block of any .ts/.tsx file — covers external-package ordering, the `// @xigma` shared-lib group, the `// category` comment groups, alphabetical group ordering, and default-vs-named import precedence.
---

# xigma Import Order

Convention reverse-engineered from x-design (verified across many files, e.g.
`src/components/PageBuilder/ViewBox/Elements/Element/Element.tsx`,
`src/shared/UI/Box/Box.tsx`, `src/core/ContextProvider/ContextProvider.tsx`).
Not lint-enforced there (a few files drift), but this is the intended shape —
apply it strictly in new/edited code.

## Structure

1. **External packages** (bare specifiers: `react`, `classnames`, `lodash`, ...) — no comment header.
2. Blank line.
3. **`// @xigma` group** — imports from our shared lib (`@xigma/components`, `@xigma/core`,
   `@xigma/scss`, `@xigma/utils`). Sits directly below the external block and **above every
   `// category` group** — see the `// @xigma` section below.
4. Blank line.
5. **`// <category>` groups** for internal imports (aliases + relative paths), each preceded by a
   blank line, **groups ordered alphabetically by their label**.

## Ordering within any single block (the external block, or one `// category` group)

1. Default-import statements first: `import X from '...'`.
2. Then named-import statements: `import { X } from '...'`.
3. Within each of those two buckets, sort alphabetically, case-insensitive, by the first imported
   binding's **local** name (the alias if `as`-renamed — not the module path).
4. Inside a single `{ ... }`, sort the named bindings alphabetically too.

The default/named split always wins over plain alphabetical order. From `Box.tsx`:

```tsx
import cx from 'classnames';
import { createElement, FC, HTMLAttributes, ReactNode, Ref } from 'react';
```

`cx` sorts first even though `createElement` (c-r) would beat `cx` (c-x) alphabetically — it's a
default import, so it wins the default/named split regardless.

## Category labels

Match the top-level `src/` alias folders as they get used: `assets`, `components`, `core`, `hooks`,
`store`, `styles`, `types`, `utils` — add `config`, `pages`, etc. once those folders exist and are
actually imported. Anything from `shared/` or `pages/` is filed under `// components` (they render
UI, same as a local component import).

This applies to **relative** paths too, not just the bare alias — a nested feature folder's own
`./types.ts` or `./utils/*` still gets `// types` / `// utils`, exactly like the top-level alias
would (see `renderRoute.tsx` importing `../types` under `// types`, or `Routing.tsx` importing
`./utils/renderRoute` under `// utils`). `./enums` also gets `// types` — confirmed in x-design's
`types/components/types.ts`, which imports `AlignmentHorizontal` from `./enums` under `// types`
(see [[xigma-module-structure]] for why `enums.ts` is its own file, separate from `types.ts` and
`constants.ts`). Only fall back to `// others` when the relative file's name doesn't match one of
these category labels at all (`./classNames`, `./constants`).

Groups sort alphabetically by their own label, e.g.:
`assets < components < core < hooks < others < store < styles < types < utils`. The one fixed
exception is `// @xigma`, which is always first regardless of what other labels are present.

## The `// @xigma` shared-lib group

`@xigma/*` (from **xigma-app-shared**: `@xigma/components`, `@xigma/core`, `@xigma/scss`,
`@xigma/utils`) lands in `node_modules` but is our own code, not third-party — so it gets its own
`// @xigma` header rather than being lumped into the external-packages block. That group goes
**immediately after the external block and before all the alphabetical `// category` groups**; it
is not sorted in among them.

```tsx
import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { Icon, Tooltip } from '@xigma/components';
import { TooltipProvider } from '@xigma/core';

// components
import Toolbar from './Toolbar';
```

Within the group the usual default-then-named + alphabetical rules apply. Barrels re-exporting from
the lib (`src/shared/index.ts`) put their `export … from '@xigma/…'` lines under the same
`// @xigma` header.

**Exception — side-effect stylesheet imports.** `import '@xigma/components/index.css'` stays under
`// styles` next to the other CSS imports (`@fontsource/*`, `./x.scss`), not under `// @xigma`.
SCSS `@use '@xigma/scss/…'` is outside this skill's scope (`.module.scss` files, not `.ts`).

## `// others`

Catch-all — **not** a dumping ground of last resort, it's a real, frequently-used category:

- Local co-located files with no bigger category: `./classNames`, `./constants`, `../constants`.
- The **global `constant/*` alias** — always goes here, never under a `// constant` header, e.g.
  `import { THEME } from 'constant/localStorageKeys';` (`ContextProvider.tsx`) and
  `import { cssVariables } from 'constant/cssVariables';` (`getCssVariable.ts`).

Sorted into the group sequence alphabetically by the literal word "others" (so: after `hooks`,
before `store`).

## Full worked example

```tsx
import { FC, memo, useRef } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// components
import ElementChildren from './ElementChildren';
import { Box } from 'shared';

// hooks
import { useElementEvents } from './hooks/useElementEvents';
import { useTheme } from 'hooks';

// others
import { className as classNameElement, classNames } from './classNames';
import { DATA_STATUS_ATTRIBUTE } from './constants';

// styles
import styles from './element.scss';

// types
import { ElementType, TElement } from 'types';
import { TElementChildren } from './types';

// utils
import { getBackground } from './utils/getBackground';
import { getLayout } from './utils/getLayout';
```

## Spec files

The module under test is imported like any other — under its own category header, not lumped with
external packages:

```tsx
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

// components
import App from './App';
```
