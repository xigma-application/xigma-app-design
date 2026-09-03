import { KeyboardEvent as ReactKeyboardEvent } from 'react';

// types
import { KeyboardKeys } from 'types/enums';

const RESERVED_CTRL_KEYS: Set<string> = new Set([
  KeyboardKeys.plus,
  KeyboardKeys.minus,
  KeyboardKeys.numpadAdd,
  KeyboardKeys.numpadSubtract,
  KeyboardKeys.digit0,
  KeyboardKeys.a,
  KeyboardKeys.d,
  KeyboardKeys.f,
  KeyboardKeys.g,
  KeyboardKeys.s,
]);

export const handleLockBrowserEvents = (
  ctrlKey: boolean,
  event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>,
  secondaryKey: string,
): void => {
  if ((ctrlKey && RESERVED_CTRL_KEYS.has(secondaryKey)) || event.key === KeyboardKeys.alt) {
    event.preventDefault();
  }
};
