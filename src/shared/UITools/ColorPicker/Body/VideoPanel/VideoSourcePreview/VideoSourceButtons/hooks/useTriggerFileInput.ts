import { RefObject } from 'react';

export const useTriggerFileInput = (inputRef: RefObject<HTMLInputElement | null>): TFunc => {
  return (): void => {
    inputRef.current?.click();
  };
};
