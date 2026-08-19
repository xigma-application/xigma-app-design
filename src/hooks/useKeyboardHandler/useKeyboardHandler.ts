import { KeyboardEvent as ReactKeyboardEvent, useEffect } from 'react';

// types
import { KeyboardKeys } from 'types/enums';
import { TKeysMap } from './types';

// utils
import { handleLockBrowserEvents } from './utils/handleLockBrowserEvents';
import { triggerActions } from './utils/triggerActions';

export type TUseKeyboardHandler = {
  onKeyDown: TFunc<[KeyboardEvent | ReactKeyboardEvent<HTMLElement>]>;
};

const isPrimaryKey = (key: string): boolean => [KeyboardKeys.alt, KeyboardKeys.control, KeyboardKeys.shift].includes(key as KeyboardKeys);

export const useKeyboardHandler = (
  attachListener: boolean,
  dependencies: Array<any>,
  keysMap: TKeysMap,
  id?: string,
  lockBrowserEvents?: boolean,
  stopPropagation?: boolean,
): TUseKeyboardHandler => {
  const handleKeyDown = (event: KeyboardEvent | ReactKeyboardEvent<HTMLElement> | Event): void => {
    if (stopPropagation) {
      (event as Event).stopPropagation();
    }

    const maybeKeyboardEvent = event as KeyboardEvent | ReactKeyboardEvent<HTMLElement>;

    if ('key' in maybeKeyboardEvent) {
      if (isPrimaryKey(maybeKeyboardEvent.key)) {
        if (lockBrowserEvents) {
          handleLockBrowserEvents(maybeKeyboardEvent.ctrlKey, maybeKeyboardEvent, maybeKeyboardEvent.key);
        }
      } else {
        triggerActions(maybeKeyboardEvent, keysMap, lockBrowserEvents);
      }
    }
  };

  const updateEventHandler = (
    callback: (event: KeyboardEvent | ReactKeyboardEvent<HTMLElement> | Event) => void,
    key: 'addEventListener' | 'removeEventListener',
    type: keyof WindowEventMap,
  ): void => {
    if (id) {
      document.getElementById(id)?.[key](type, callback as EventListener);
    } else {
      window[key](type, callback as EventListener);
    }
  };

  useEffect(() => {
    if (attachListener) {
      updateEventHandler(handleKeyDown, 'addEventListener', 'keydown');
    }

    return (): void => {
      updateEventHandler(handleKeyDown, 'removeEventListener', 'keydown');
    };
  }, [id, ...dependencies]);

  return {
    onKeyDown: handleKeyDown,
  };
};
