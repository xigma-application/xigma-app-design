---
name: xigma-classnames
description: How to merge a CSS-module base class with an optional caller-supplied className in xigma — use `cx` from the `classnames` package, never hand-rolled `.filter(Boolean).join(' ')`, and default the prop to `''`. Load before adding a `className` (or similarly-named override) prop to any shared/UI component.
---

# xigma className Merging

## Use `cx` from `classnames`, not a hand-rolled join

Whenever a component needs to merge its own CSS-module class with an optional class passed in by
the caller, use `cx` (the default export of the `classnames` package — `import cx from
'classnames';`), never a manual array/filter/join:

Avoid:

```tsx
<div className={[styles.PopoverItem, className].filter(Boolean).join(' ')} />
```

Prefer:

```tsx
import cx from 'classnames';

<div className={cx(styles.PopoverItem, className)} />
```

`classnames` is a project dependency (`package.json`'s `dependencies`, not `devDependencies` —
it's used at runtime in component code, not a build-time tool). It was added to xigma
specifically to match x-design, which uses it throughout `shared/UI/*` (`Button.tsx`,
`Checkbox.tsx`, `Chip.tsx`, `Tooltip.tsx`, `Typography.tsx`, `Icon.tsx`, ...) for exactly this
merge. Confirmed with a matching version pin (`^2.5.1`) rather than picking a fresh major.

## Default the prop to `''`, not `undefined`

xigma's own convention (a deliberate divergence from x-design, which leaves the prop
`optional` with no default and relies on `cx`'s own falsy-filtering): give the prop an explicit
empty-string default.

```tsx
export type TPopoverItemProps = {
  className?: string;
  // ...
};

export const PopoverItem: FC<TPopoverItemProps> = ({ className = '', /* ... */ }) => (
  <div className={cx(styles.PopoverItem, className)} /* ... */ />
);
```

`cx()` already ignores falsy arguments (`undefined`, `''`, `null`, `false`), so this default isn't
load-bearing for correctness — it's a readability/consistency choice for this codebase. Apply it to
every className-shaped override prop on a component, not just the primary root `className` — see
`PopoverItem.tsx`'s `shortcutClassName = ''`, which merges onto a specific sub-element
(`cx(styles.PopoverItem__shortcut, shortcutClassName)`) the same way the root `className` merges
onto the root element.

## Worked example

`shared/UITools/Popover/PopoverItem/PopoverItem.tsx` accepts both a root `className` and a
sub-element `shortcutClassName`, letting a consumer (e.g. `Design/Toolbar/.../ToolDropdown.tsx`)
reach in and style specific instances from its own `.module.scss` without the shared component
needing to know anything about that consumer's styling — see [[xigma-scss-bem]] for how the
consumer then reinforces its override selector's specificity against the shared component's own
base rules.

## Related

[[xigma-component-structure]] — the general shape of a component file this pattern lives inside.
[[xigma-scss-bem]] — BEM nesting for the `.module.scss` side of the same components.
[[xigma-import-order]] — `cx` is a default import from an external package, so it's grouped and
ordered like the worked example there (`import cx from 'classnames';` sorts before other default
imports whose local name starts later alphabetically, e.g. before `import * as PopoverPrimitive
from '@radix-ui/react-popover';`).
