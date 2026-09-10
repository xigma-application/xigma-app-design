import { RefObject } from 'react';

// hooks
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

const notifyGridTrackSelectionIfNonEmpty = (axis: TGridTrackAxis, coordinator: TGridTrackSelectionCoordinator, indices: number[]): void => {
  if (indices.length > 0) {
    coordinator.onSelectionChange(axis, true);
  }
};

export const resolveGridTrackRevisionSelection = (
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  isSelfChangeRef: RefObject<boolean>,
  initialSelectedIndicesRef: RefObject<number[]>,
  selectedIndices: number[],
  restored: number[] | undefined,
  setSelection: (indices: number[]) => void,
): number[] => {
  switch (true) {
    case restored !== undefined:
      setSelection(restored);
      coordinator.onSelectionChange(axis, restored.length > 0);

      return restored;
    case !isSelfChangeRef.current:
      setSelection(initialSelectedIndicesRef.current);
      notifyGridTrackSelectionIfNonEmpty(axis, coordinator, initialSelectedIndicesRef.current);

      return initialSelectedIndicesRef.current;
    default:
      return selectedIndices;
  }
};
