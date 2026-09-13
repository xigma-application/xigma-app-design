import { useRef } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { DEFAULT_VECTOR_PAINT_COLOR } from 'store/design/constants';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../AppearanceSection/types';
import { TPaint } from 'types/design/paint/types';
import { TUseFillSectionResult } from './types';

// utils
import { commitFills } from './utils/commitFills';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';
import { resolveFillDragIndices } from './utils/resolveFillDragIndices';
import { toggleFillVisibility } from './utils/toggleFillVisibility';
import { useClearFillSelectionOnOutsideClick } from './hooks/useClearFillSelectionOnOutsideClick/useClearFillSelectionOnOutsideClick';
import { useFillReorderDrag } from './hooks/useFillReorderDrag/useFillReorderDrag';
import { useFillSelection } from './hooks/useFillSelection/useFillSelection';

export const useFillSection = (): TUseFillSectionResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const fills = node?.fills ?? [];
  const nodeId = node?.id;
  const commit = (nextFills: TPaint[]): void => commitFills(dispatch, nodeId, nextFills);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { clearSelection, onSelectRow, selectedIndices, setSelection } = useFillSelection(fills.length);
  const { beginDrag, dragState, registerRow } = useFillReorderDrag(fills, commit, setSelection, containerRef);

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, clearSelection);

  return {
    containerRef,
    dropIndicatorOffset: dragState?.hasMoved ? dragState.dropOffset : null,
    fills,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    isRowSelected: (index) => selectedIndices.includes(index),
    nodeId,
    onAdd: (): void => commit([...fills, makeSolidPaint(DEFAULT_VECTOR_PAINT_COLOR)]),
    onChange: (index, paint): void => commit(fills.map((fill, fillIndex) => (fillIndex === index ? paint : fill))),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onRemove: (index): void => commit(fills.filter((_fill, fillIndex) => fillIndex !== index)),
    onSelectRow,
    onStartDrag: (index, event): void => beginDrag(resolveFillDragIndices(selectedIndices, setSelection, index), index, event),
    onToggleVisible: (index): void => commit(toggleFillVisibility(fills, index)),
    registerRow,
  };
};
