import { PointerEvent as ReactPointerEvent, useMemo, useRef, useState } from 'react';

// hooks
import { TGridAxisControls } from '../../../hooks/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackSelectModifiers } from '../useGridTrackSelection';
import { TGridTrackSelectionCoordinator } from '../../../hooks/useGridTrackSelectionCoordinator';
import { useAppDispatch, useAppSelector } from 'store';
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
import { commitGridTrackSelectionChange } from './utils/commitGridTrackSelectionChange';
import { commitGridTrackSelectionClear } from './utils/commitGridTrackSelectionClear';
import { commitGridTrackValueChange } from './utils/commitGridTrackValueChange';
import { getGridTrackRawIndices } from './utils/getGridTrackRawIndices';
import { selectPanelGridTrackSelection } from 'store/design/selectors';

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
  frameId: string | null,
  initialSelectedIndices: number[] = [],
): TUseGridTrackListResult => {
  const dispatch = useAppDispatch();
  const trackCount = controls.tracks.length;
  const panelSelection = useAppSelector(selectPanelGridTrackSelection);
  const isSuppressed = coordinator.isSuppressed(axis);
  const [localIndices, setLocalIndices] = useState<number[]>(initialSelectedIndices);
  const anchorRef = useRef<number | null>(null);
  const isSelfChangeRef = useRef(false);
  const rawIndices = getGridTrackRawIndices(panelSelection, axis, frameId, isSuppressed, localIndices);
  const selectedIndices = useMemo(() => rawIndices.filter((index) => index < trackCount), [rawIndices, trackCount]);
  const { beginDrag, dragState, registerRow } = useGridTrackReorderDrag(
    trackCount,
    (sourceIndices, insertionSlot, grabbedIndex, hasMoved) =>
      commitGridTrackReorder(controls, axis, coordinator, isSelfChangeRef, publish, sourceIndices, insertionSlot, grabbedIndex, hasMoved),
  );

  const publish = (indices: number[]): void => commitGridTrackSelectionChange(dispatch, axis, frameId, setLocalIndices, indices);

  return {
    beginDrag: (index: number, event: ReactPointerEvent): void =>
      commitGridTrackDragStart(controls, axis, coordinator, publish, selectedIndices, beginDrag, index, event),
    dropIndicatorIndex: dragState?.hasMoved ? dragState.dropIndex : null,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    onAdd: (): void => commitGridTrackAdd(controls, isSelfChangeRef),
    onChangeMode: (index: number, mode: SizingMode, value?: number): void =>
      commitGridTrackModeChange(controls, isSelfChangeRef, selectedIndices, index, mode, value),
    onChangeValue: (index: number, value: number): void =>
      commitGridTrackValueChange(controls, isSelfChangeRef, selectedIndices, index, value),
    onDeleteRow: (index: number): void =>
      commitGridTrackDelete(
        controls,
        axis,
        coordinator,
        isSelfChangeRef,
        (): void => commitGridTrackSelectionClear(anchorRef, publish),
        selectedIndices,
        index,
      ),
    onSelectRow: (index: number, modifiers: TGridTrackSelectModifiers): void =>
      commitGridTrackSelect(axis, coordinator, anchorRef, publish, selectedIndices, index, modifiers),
    registerRow,
    selectedIndices,
  };
};
