import { RefObject, useEffect } from 'react';

export const useCommentDraftAutoFocus = (elementRef: RefObject<HTMLElement | null>, entering: boolean): void => {
  useEffect(() => {
    if (!entering) {
      elementRef.current?.focus();
    }
  }, [elementRef, entering]);
};
