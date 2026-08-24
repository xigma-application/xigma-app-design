import { KeyboardEvent as ReactKeyboardEvent } from 'react';

// types
import { KeyboardKeys } from 'types/enums';

export const handleLockBrowserEvents = (
  ctrlKey: boolean,
  event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>,
  secondaryKey: string,
): void => {
  if (
    (ctrlKey &&
      (secondaryKey === KeyboardKeys['+'] ||
        secondaryKey === KeyboardKeys['-'] ||
        secondaryKey === KeyboardKeys.a ||
        secondaryKey === KeyboardKeys.d ||
        secondaryKey === KeyboardKeys.f ||
        secondaryKey === KeyboardKeys.r ||
        secondaryKey === KeyboardKeys.s)) ||
    event.key === KeyboardKeys.alt
  ) {
    event.preventDefault();
  }
};
