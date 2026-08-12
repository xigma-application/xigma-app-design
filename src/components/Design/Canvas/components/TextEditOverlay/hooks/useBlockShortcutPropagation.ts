import { KeyboardEvent } from 'react';

export const useBlockShortcutPropagation = (): ((event: KeyboardEvent<HTMLDivElement>) => void) => {
  return (event: KeyboardEvent<HTMLDivElement>): void => {
    event.stopPropagation();
  };
};
