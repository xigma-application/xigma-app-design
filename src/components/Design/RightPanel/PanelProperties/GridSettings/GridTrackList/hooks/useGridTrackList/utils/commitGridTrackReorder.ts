import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const commitGridTrackReorder = (
  controls: TGridAxisControls,
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  isSelfChangeRef: RefObject<boolean>,
  setSelection: (indices: number[]) => void,
  sourceIndices: number[],
  insertionSlot: number,
): boolean => {
  const newIndices = controls.onReorder(sourceIndices, insertionSlot);

  if (newIndices !== null) {
    isSelfChangeRef.current = true;
    coordinator.onSelectionChange(axis, true);
    setSelection(newIndices);

    return true;
  }

  return false;
};
