import { useEffect } from 'react';

// store
import { selectGradientEditor } from 'store/design/selectors';
import { setGradientEditor } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

export const useSyncGradientEditor = (
  nodeId: string | undefined,
  paintIndex: number,
  isPickerOpen: boolean,
  isGradientTabActive: boolean,
  selectedStopIndex: number | null,
): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (nodeId && isPickerOpen && isGradientTabActive) {
      dispatch(setGradientEditor({ nodeId, paintIndex, selectedStopIndex }));
    }

    return (): void => {
      const current = selectGradientEditor(store.getState());

      if (current && current.nodeId === nodeId && current.paintIndex === paintIndex) {
        dispatch(setGradientEditor(null));
      }
    };
  }, [dispatch, isGradientTabActive, isPickerOpen, nodeId, paintIndex, selectedStopIndex]);
};
