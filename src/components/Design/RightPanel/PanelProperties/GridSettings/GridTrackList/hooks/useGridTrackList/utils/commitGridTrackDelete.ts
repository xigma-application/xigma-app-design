import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const commitGridTrackDelete = (
  controls: TGridAxisControls,
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  isSelfChangeRef: RefObject<boolean>,
  clearSelection: () => void,
  selectedIndices: number[],
  index: number,
): void => {
  controls.onDelete(selectedIndices.includes(index) ? selectedIndices : [index]);
  isSelfChangeRef.current = true;
  clearSelection();
  coordinator.onSelectionChange(axis, false);
};
