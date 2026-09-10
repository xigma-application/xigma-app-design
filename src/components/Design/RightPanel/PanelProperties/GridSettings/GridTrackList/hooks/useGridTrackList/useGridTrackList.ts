import { PointerEvent as ReactPointerEvent, useEffect, useRef } from 'react';

// hooks
import { TGridAxisControls } from '../../../hooks/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackSelectModifiers, useGridTrackSelection } from '../useGridTrackSelection';
import { TGridTrackSelectionCoordinator } from '../../../hooks/useGridTrackSelectionCoordinator';
import { useGridTrackReorderDrag } from '../useGridTrackReorderDrag';

// types
import { SizingMode } from 'types/design/enums';

// utils
import { commitGridTrackAdd } from './utils/commitGridTrackAdd';
import { commitGridTrackDelete } from './utils/commitGridTrackDelete';
import { commitGridTrackModeChange } from './utils/commitGridTrackModeChange';
import { commitGridTrackReorder } from './utils/commitGridTrackReorder';
import { commitGridTrackSelect } from './utils/commitGridTrackSelect';
import { commitGridTrackValueChange } from './utils/commitGridTrackValueChange';
import { resolveGridTrackDragIndices } from './utils/resolveGridTrackDragIndices';
import { syncExternalGridTrackSelection } from './utils/syncExternalGridTrackSelection';
import { syncSuppressedGridTrackSelection } from './utils/syncSuppressedGridTrackSelection';

export type TUseGridTrackListResult = {
  beginDrag: TFunc<[number, ReactPointerEvent]>;
  dropIndicatorIndex: number | null;
  isRowDragging: (index: number) => boolean;
  onAdd: TFunc;
  onChangeMode: TFunc<[number, SizingMode]>;
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
      setSelection,
    );
  }, [axis, controls.revision, coordinator, setSelection]);

  const onSelectRow = (index: number, modifiers: TGridTrackSelectModifiers): void =>
    commitGridTrackSelect(coordinator, axis, selectRow, index, modifiers);

  const onAdd = (): void => commitGridTrackAdd(controls, isSelfChangeRef);

  const onChangeMode = (index: number, mode: SizingMode): void => commitGridTrackModeChange(controls, isSelfChangeRef, index, mode);

  const onChangeValue = (index: number, value: number): void => commitGridTrackValueChange(controls, isSelfChangeRef, index, value);

  const handleReorder = (sourceIndices: number[], insertionSlot: number): boolean =>
    commitGridTrackReorder(controls, axis, coordinator, isSelfChangeRef, setSelection, sourceIndices, insertionSlot);

  const { beginDrag, dragState, registerRow } = useGridTrackReorderDrag(trackCount, handleReorder);

  const beginRowDrag = (index: number, event: ReactPointerEvent): void => {
    const dragIndices = resolveGridTrackDragIndices(controls, axis, coordinator, setSelection, selectedIndices, index);

    beginDrag(dragIndices, event);
  };

  const onDeleteRow = (index: number): void =>
    commitGridTrackDelete(controls, axis, coordinator, isSelfChangeRef, clearSelection, selectedIndices, index);

  return {
    beginDrag: beginRowDrag,
    dropIndicatorIndex: dragState?.dropIndex ?? null,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    onAdd,
    onChangeMode,
    onChangeValue,
    onDeleteRow,
    onSelectRow,
    registerRow,
    selectedIndices,
  };
};
