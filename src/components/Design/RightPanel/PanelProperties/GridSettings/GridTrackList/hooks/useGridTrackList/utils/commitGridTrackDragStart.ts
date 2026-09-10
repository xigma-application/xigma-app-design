import { PointerEvent as ReactPointerEvent } from 'react';

// hooks
import { TGridAxisControls } from '../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { resolveGridTrackDragIndices } from './resolveGridTrackDragIndices';

export const commitGridTrackDragStart = (
  controls: TGridAxisControls,
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  setSelection: (indices: number[]) => void,
  selectedIndices: number[],
  beginDrag: TFunc<[number[], number, ReactPointerEvent]>,
  index: number,
  event: ReactPointerEvent,
): void => {
  const dragIndices = resolveGridTrackDragIndices(controls, axis, coordinator, setSelection, selectedIndices, index);

  beginDrag(dragIndices, index, event);
};
