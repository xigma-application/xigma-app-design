// hooks
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';
import { TGridTrackSelectModifiers } from '../../useGridTrackSelection';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

export const commitGridTrackSelect = (
  coordinator: TGridTrackSelectionCoordinator,
  axis: TGridTrackAxis,
  selectRow: (index: number, modifiers: TGridTrackSelectModifiers) => void,
  index: number,
  modifiers: TGridTrackSelectModifiers,
): void => {
  coordinator.onSelectionChange(axis, true);
  selectRow(index, modifiers);
};
