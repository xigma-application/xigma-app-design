import { RefObject } from 'react';

// hooks
import { TGridAxisControls } from '../../../../../hooks/types';
import { TGridTrackSelectionCoordinator } from '../../../../../hooks/useGridTrackSelectionCoordinator';

// types
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';

// utils
import { getGridTrackRevisionSelection } from './getGridTrackRevisionSelection';
import { recordGridTrackRevisionSelection } from './recordGridTrackRevisionSelection';
import { resolveGridTrackRevisionSelection } from './resolveGridTrackRevisionSelection';

export const syncExternalGridTrackSelection = (
  axis: TGridTrackAxis,
  controls: TGridAxisControls,
  coordinator: TGridTrackSelectionCoordinator,
  isSelfChangeRef: RefObject<boolean>,
  previousRevisionRef: RefObject<unknown>,
  initialSelectedIndicesRef: RefObject<number[]>,
  selectionByRevisionRef: RefObject<WeakMap<object, number[]>>,
  selectedIndices: number[],
  setSelection: (indices: number[]) => void,
): void => {
  const { revision } = controls;

  if (previousRevisionRef.current === revision) {
    recordGridTrackRevisionSelection(selectionByRevisionRef, revision, selectedIndices);
  } else {
    const restored = getGridTrackRevisionSelection(selectionByRevisionRef, revision);
    const nextSelection = resolveGridTrackRevisionSelection(
      axis,
      coordinator,
      isSelfChangeRef,
      initialSelectedIndicesRef,
      selectedIndices,
      restored,
      setSelection,
    );

    isSelfChangeRef.current = false;
    previousRevisionRef.current = revision;
    recordGridTrackRevisionSelection(selectionByRevisionRef, revision, nextSelection);
  }
};
