import { RefObject } from 'react';

// store
import { setActionsPanelOpen } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useLogoMenuActionsClick = (shouldSkipCloseAutoFocusRef: RefObject<boolean>): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    shouldSkipCloseAutoFocusRef.current = true;
    dispatch(setActionsPanelOpen(true));
  };
};
