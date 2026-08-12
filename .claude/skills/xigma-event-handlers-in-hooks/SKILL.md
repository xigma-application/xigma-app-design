---
name: xigma-event-handlers-in-hooks
description: JSX event handlers (onClick, onInput, onKeyDown, onBlur, ...) in xigma components must be extracted into their own hook under the component's hooks/ folder, not defined inline in the component body. Load before adding a new event handler function to a component, or wiring a new on* prop in JSX.
---

# xigma Event Handlers Live in Hooks

A component's own file should stay declarative — JSX plus the hook calls that feed it. Event
handler *logic* (what happens on input/blur/keydown/...) does not belong in the component body,
even when it looks small enough to inline.

## Rule

Every `on*` handler passed to JSX is its own hook: `use<WhatItDoes>`, one per file, under the
component's `hooks/` folder. The hook returns the handler function directly — same shape whether
the handler needs store access or not.

Avoid — handlers defined straight in the component body:

```tsx
const TextEditOverlay: FC = () => {
  const dispatch = useAppDispatch();

  const handleInput = (event: FormEvent<HTMLDivElement>): void => {
    dispatch(updateTextEditContent(event.currentTarget.innerText));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    event.stopPropagation();
  };

  return <div onInput={handleInput} onKeyDown={handleKeyDown} />;
};
```

Prefer — each handler is its own hook, the component just wires them up:

```tsx
// hooks/useTextEditInput.ts
export const useTextEditInput = (): ((event: FormEvent<HTMLDivElement>) => void) => {
  const dispatch = useAppDispatch();

  return (event: FormEvent<HTMLDivElement>): void => {
    dispatch(updateTextEditContent(event.currentTarget.innerText));
  };
};

// hooks/useBlockShortcutPropagation.ts
export const useBlockShortcutPropagation = (): ((event: KeyboardEvent<HTMLDivElement>) => void) => {
  return (event: KeyboardEvent<HTMLDivElement>): void => {
    event.stopPropagation();
  };
};
```

```tsx
const TextEditOverlay: FC = () => {
  const handleInput = useTextEditInput();
  const handleKeyDown = useBlockShortcutPropagation();

  return <div onInput={handleInput} onKeyDown={handleKeyDown} />;
};
```

See `components/Design/Canvas/components/TextEditOverlay/hooks/` — `useCommitTextEdit.ts` (the
original handler-as-hook in this component, takes a param and reads `useAppSelector`/
`useAppDispatch`), `useTextEditInput.ts`, and `useBlockShortcutPropagation.ts` (needs no store
access at all, but is still its own hook, not an inline function).

## Why

- Keeps the component body pure JSX + hook wiring — reading what a component renders never
  requires reading handler logic mixed into the same function.
- Each handler becomes independently unit-testable via `renderHook`, without mounting the whole
  component — see `hooks/test/useTextEditInput.spec.tsx` /
  `hooks/test/useBlockShortcutPropagation.spec.tsx` for the pattern (dispatch a fake event into
  `result.current`, assert on store state or the mocked event method).
- Applies **regardless of whether the handler needs store/props/refs** — `useBlockShortcutPropagation`
  takes no arguments and reads nothing, but it's still extracted, for consistency: a reader scanning
  a component's hook calls sees every behavior it wires up in one place, not split between hook
  calls and inline functions.

## Related

[[xigma-function-style]] — named functions over inline closures inside effects/callbacks; this
skill is the same instinct applied one level up, to the handler itself becoming its own hook.
[[xigma-module-structure]] — `hooks/` as a subfolder once a component has more than a trivial
single concern; each handler-hook is one file, named after what it does (`use<Verb>`).
