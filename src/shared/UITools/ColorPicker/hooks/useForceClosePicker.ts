import { useEffect } from 'react';

export const useForceClosePicker = (forceCloseSignal: number | undefined, setIsOpen: TFunc<[boolean]>): void => {
  useEffect(() => {
    if (forceCloseSignal !== undefined) {
      setIsOpen(false);
    }
  }, [forceCloseSignal, setIsOpen]);
};
