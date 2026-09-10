// hooks
import { TGridAxisControls } from '../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const resolveGridTrackDragIndices = (
  controls: TGridAxisControls,
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  setSelection: (indices: number[]) => void,
  selectedIndices: number[],
  index: number,
): number[] => {
  if (selectedIndices.includes(index)) {
    return selectedIndices;
  }

  const linkedIndices = controls.tracks[index]?.linkedIndices ?? [index];

  coordinator.onSelectionChange(axis, true);
  setSelection(linkedIndices);

  return linkedIndices;
};
