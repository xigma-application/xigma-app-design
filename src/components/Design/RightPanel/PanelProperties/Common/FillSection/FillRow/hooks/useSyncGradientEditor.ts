import { useEffect } from 'react';

// store
import { selectGradientEditor } from 'store/design/selectors';
import { setGradientEditor } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

// types
import { TGradientPanelState } from 'shared/UITools/ColorPicker/types';
import { TPaintProperty } from 'types/design/paint/types';

export const useSyncGradientEditor = (
  nodeId: string | undefined,
  paintIndex: number,
  property: TPaintProperty,
  isPickerOpen: boolean,
  { isGradientTabActive, selectedStopIndex }: TGradientPanelState,
): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (nodeId && isPickerOpen && isGradientTabActive) {
      dispatch(setGradientEditor({ nodeId, paintIndex, property, selectedStopIndex }));
    }

    return (): void => {
      const current = selectGradientEditor(store.getState());

      if (current && current.nodeId === nodeId && current.paintIndex === paintIndex && (current.property ?? 'fills') === property) {
        dispatch(setGradientEditor(null));
      }
    };
  }, [dispatch, isGradientTabActive, isPickerOpen, nodeId, paintIndex, property, selectedStopIndex]);
};
