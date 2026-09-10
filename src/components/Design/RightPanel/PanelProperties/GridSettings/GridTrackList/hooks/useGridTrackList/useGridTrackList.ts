import { PointerEvent as ReactPointerEvent, useEffect, useRef } from 'react';

// hooks
import { TGridAxisControls } from '../../../hooks/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackSelectModifiers, useGridTrackSelection } from '../useGridTrackSelection';
import { TGridTrackSelectionCoordinator } from '../../../hooks/useGridTrackSelectionCoordinator';
import { useGridTrackReorderDrag } from './hooks/useGridTrackReorderDrag/useGridTrackReorderDrag';

// types
import { SizingMode } from 'types/design/enums';

// utils
import { commitGridTrackAdd } from './utils/commitGridTrackAdd';
import { commitGridTrackDelete } from './utils/commitGridTrackDelete';
import { commitGridTrackDragStart } from './utils/commitGridTrackDragStart';
import { commitGridTrackModeChange } from './utils/commitGridTrackModeChange';
import { commitGridTrackReorder } from './utils/commitGridTrackReorder';
import { commitGridTrackSelect } from './utils/commitGridTrackSelect';
import { commitGridTrackValueChange } from './utils/commitGridTrackValueChange';
import { syncExternalGridTrackSelection } from './utils/syncExternalGridTrackSelection/syncExternalGridTrackSelection';
import { syncSuppressedGridTrackSelection } from './utils/syncSuppressedGridTrackSelection';

export type TUseGridTrackListResult = {
  beginDrag: TFunc<[number, ReactPointerEvent]>;
  dropIndicatorIndex: number | null;
  isRowDragging: (index: number) => boolean;
  onAdd: TFunc;
  onChangeMode: (index: number, mode: SizingMode, value?: number) => void;
  onChangeValue: TFunc<[number, number]>;
  onDeleteRow: TFunc<[number]>;
  onSelectRow: TFunc<[number, TGridTrackSelectModifiers]>;
  registerRow: (index: number) => (element: HTMLElement | null) => void;
  selectedIndices: number[];
};

export const useGridTrackList = (
  controls: TGridAxisControls,
  axis: TGridTrackAxis,
  coordinator: TGridTrackSelectionCoordinator,
  initialSelectedIndices: number[] = [],
): TUseGridTrackListResult => {
  const trackCount = controls.tracks.length;
  const {
    clearSelection,
    onSelectRow: selectRow,
    selectedIndices,
    setSelection,
  } = useGridTrackSelection(trackCount, initialSelectedIndices);
  const isSuppressed = coordinator.isSuppressed(axis);
  const isSelfChangeRef = useRef(false);
  const initialSelectedIndicesRef = useRef(initialSelectedIndices);
  const previousRevisionRef = useRef(controls.revision);
  const selectionByRevisionRef = useRef(new WeakMap<object, number[]>());

  useEffect(() => {
    syncSuppressedGridTrackSelection(isSuppressed, clearSelection);
  }, [clearSelection, isSuppressed]);

  useEffect(() => {
    syncExternalGridTrackSelection(
      axis,
      controls,
      coordinator,
      isSelfChangeRef,
      previousRevisionRef,
      initialSelectedIndicesRef,
      selectionByRevisionRef,
      selectedIndices,
      setSelection,
    );
  }, [axis, controls.revision, coordinator, selectedIndices, setSelection]);

  const { beginDrag, dragState, registerRow } = useGridTrackReorderDrag(
    trackCount,
    (sourceIndices, insertionSlot, grabbedIndex, hasMoved) =>
      commitGridTrackReorder(
        controls,
        axis,
        coordinator,
        isSelfChangeRef,
        setSelection,
        sourceIndices,
        insertionSlot,
        grabbedIndex,
        hasMoved,
      ),
  );

  return {
    beginDrag: (index: number, event: ReactPointerEvent): void =>
      commitGridTrackDragStart(controls, axis, coordinator, setSelection, selectedIndices, beginDrag, index, event),
    dropIndicatorIndex: dragState?.hasMoved ? dragState.dropIndex : null,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    onAdd: (): void => commitGridTrackAdd(controls, isSelfChangeRef),
    onChangeMode: (index: number, mode: SizingMode, value?: number): void =>
      commitGridTrackModeChange(controls, isSelfChangeRef, index, mode, value),
    onChangeValue: (index: number, value: number): void => commitGridTrackValueChange(controls, isSelfChangeRef, index, value),
    onDeleteRow: (index: number): void =>
      commitGridTrackDelete(controls, axis, coordinator, isSelfChangeRef, clearSelection, selectedIndices, index),
    onSelectRow: (index: number, modifiers: TGridTrackSelectModifiers): void =>
      commitGridTrackSelect(coordinator, axis, selectRow, index, modifiers),
    registerRow,
    selectedIndices,
  };
};
