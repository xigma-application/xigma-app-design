import { RefObject, useRef } from 'react';

// utils
import { getTrackNumberPortionLength } from '../utils/getTrackNumberPortionLength';

export const useSelectTrackNumberPortion = (): {
  inputRef: RefObject<HTMLInputElement | null>;
  selectNumberPortion: TFunc;
} => {
  const inputRef = useRef<HTMLInputElement>(null);

  const selectNumberPortion = (): void => {
    const input = inputRef.current;

    if (input) {
      input.setSelectionRange(0, getTrackNumberPortionLength(input.value));
    }
  };

  return { inputRef, selectNumberPortion };
};
