import { useRef } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { DEFAULT_VECTOR_PAINT_COLOR } from 'store/design/constants';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectImageEditor, selectImageFillPickerFocus, selectSelectedNodes } from 'store/design/selectors';
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
import { useExitImageEditorOnPanelClick } from './hooks/useExitImageEditorOnPanelClick/useExitImageEditorOnPanelClick';
import { useFillReorderDrag } from './hooks/useFillReorderDrag/useFillReorderDrag';
import { useFillSelection } from './hooks/useFillSelection/useFillSelection';
import { useHandleClosePicker } from './hooks/useHandleClosePicker/useHandleClosePicker';
import { useHandleExitImageEditor } from './hooks/useHandleExitImageEditor/useHandleExitImageEditor';
import { useOpenPickerIndex } from './hooks/useOpenPickerIndex/useOpenPickerIndex';

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
  const imageFillPickerFocus = useAppSelector(selectImageFillPickerFocus);
  const initialOpenPickerIndex = imageFillPickerFocus && imageFillPickerFocus.nodeId === nodeId ? imageFillPickerFocus.paintIndex : null;
  const { onPickerOpenChange, openPickerIndex } = useOpenPickerIndex(nodeId, initialOpenPickerIndex);
  const isImageEditorActive = useAppSelector(selectImageEditor) !== null;
  const handleExitImageEditor = useHandleExitImageEditor();
  const handleClosePicker = useHandleClosePicker(openPickerIndex, onPickerOpenChange);

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, clearSelection);
  useExitImageEditorOnPanelClick(containerRef, isImageEditorActive, openPickerIndex !== null, handleExitImageEditor, handleClosePicker);

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
    onPickerOpenChange,
    onRemove: (index): void => commit(fills.filter((_fill, fillIndex) => fillIndex !== index)),
    onSelectRow,
    onStartDrag: (index, event): void => beginDrag(resolveFillDragIndices(selectedIndices, setSelection, index), index, event),
    onToggleVisible: (index): void => commit(toggleFillVisibility(fills, index)),
    openPickerIndex,
    registerRow,
  };
};
