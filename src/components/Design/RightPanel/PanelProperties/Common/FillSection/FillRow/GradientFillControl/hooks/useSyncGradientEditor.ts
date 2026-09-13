import { useEffect } from 'react';

// store
import { setGradientEditor } from 'store/design/slice';
import { useAppDispatch } from 'store';

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
    } else {
      dispatch(setGradientEditor(null));
    }

    return (): void => {
      dispatch(setGradientEditor(null));
    };
  }, [dispatch, isGradientTabActive, isPickerOpen, nodeId, paintIndex, selectedStopIndex]);
};
