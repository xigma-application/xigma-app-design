import { useLayoutEffect, useRef } from 'react';

// store
import { setGridSettingsPanelOpen } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useCloseGridSettingsPanelOnReselect = (hasSelection: boolean, isGridSettingsPanelOpen: boolean): void => {
  const dispatch = useAppDispatch();
  const hadSelectionRef = useRef(hasSelection);

  useLayoutEffect(() => {
    if (hasSelection && !hadSelectionRef.current && isGridSettingsPanelOpen) {
      dispatch(setGridSettingsPanelOpen(false));
    }

    hadSelectionRef.current = hasSelection;
  }, [dispatch, hasSelection, isGridSettingsPanelOpen]);
};
