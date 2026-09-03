import { RefObject } from 'react';

export const useLogoMenuCloseAutoFocus = (shouldSkipCloseAutoFocusRef: RefObject<boolean>): ((event: Event) => void) => {
  return (event: Event) => {
    if (shouldSkipCloseAutoFocusRef.current) {
      event.preventDefault();
      shouldSkipCloseAutoFocusRef.current = false;
    }
  };
};
