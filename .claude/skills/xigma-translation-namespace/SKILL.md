---
name: xigma-translation-namespace
description: The translationNameSpace chaining convention, mirrored from x-design — constants that hold user-facing text must hold translation KEYS, not literal strings, built from a namespace chain rooted at the top-level feature folder. Load before adding a constants.ts map of labels/text, or any constant whose values get rendered to the user.
---

# xigma Translation Namespace Convention

Any `constants.ts` map whose values are user-facing text (button labels, section titles, ...) must
hold **translation keys**, not literal strings — the literal string lives only in
`translations/resources/en.json` / `pl.json` ([[xigma-i18n]]), never hardcoded in a `constants.ts`
or inline in a component once i18n is wired into that area.

## `translationNameSpace`: one const per folder, chained via the parent

Mirrors x-design exactly (`shared/UITools/Popover/constants.ts`, `shared/UITools/Select/constants.ts`,
`components/PageBuilder/constants.ts`, `components/PageBuilder/PanelProperties/constants.ts`, ...):

- **Root** of a feature tree defines a literal namespace:
  ```ts
  // components/PageBuilder/constants.ts (x-design)
  export const translationNameSpace = 'pageBuilder';
  ```
- **Every nested folder** imports the parent's namespace (aliased to `parentNameSpace`) and appends
  its own segment:
  ```ts
  // components/PageBuilder/PanelProperties/constants.ts (x-design)
  import { translationNameSpace as parentNameSpace } from '../constants';

  export const translationNameSpace = `${parentNameSpace}.panelProperties`;
  ```
- Keys are built as `` `${translationNameSpace}.something` `` and passed straight to `t(...)`.

## Root lives at the top-level component/feature folder, not under `pages/`

x-design's actual page (`pages/PageBuilderPage/`) does **not** define a `translationNameSpace` —
its `constants.ts` only holds unrelated page-local values (`MOUSE_MODE_DISABLED`). The namespace
root is the component folder the page renders (`components/PageBuilder/`), since that's the real,
reusable feature root — the page is just a thin route wrapper around it ([[xigma-routing]]).

xigma mirrors this: `pages/DesignPage/` renders `components/Design/Canvas` and
`components/Design/Toolbar`, so the namespace root lives at `components/Design/constants.ts`:

```ts
// components/Design/constants.ts
export const translationNameSpace = 'design';
```

```ts
// components/Design/Toolbar/constants.ts
// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.toolbar`;

export const TOOL_LABEL: Record<ToolName, string> = {
  [ToolName.comment]: `${translationNameSpace}.tool.comment`,
  [ToolName.default]: `${translationNameSpace}.tool.default`,
  [ToolName.frame]: `${translationNameSpace}.tool.frame`,
};
```

Resulting keys (`design.toolbar.tool.comment`, ...) go in both `en.json` and `pl.json`. The
component consuming `TOOL_LABEL` calls `t(TOOL_LABEL[tool])` — never renders `TOOL_LABEL[tool]`
directly, since it's a key, not text.

## When to add a new `translationNameSpace`

Add one the first time a folder needs translated text of its own (a new constants map of
labels, a new section title, ...) — don't pre-create empty `constants.ts` files speculatively. Once
added, every folder nested underneath that needs its own translated strings derives from it via
`parentNameSpace`, growing the dotted chain one segment per folder level.

## Related

[[xigma-i18n]] — the flat dot-key JSON convention the resulting keys are added to, and the
`t()`/`useTranslation()` wiring.
[[xigma-module-structure]] — `constants.ts` already holds other runtime constants; namespace
constants live alongside them in the same file, not a separate one.
