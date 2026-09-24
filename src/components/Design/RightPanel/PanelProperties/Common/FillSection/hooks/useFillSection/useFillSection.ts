import { useRef } from 'react';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectAppearanceNodes, selectImageEditor, selectImageFillPickerFocus } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// others
import { MULTI_SELECTION_DISABLED_FILL_MODES } from '../../constants';

// types
import { isAppearanceNode } from '../../../AppearanceSection/types';
import { TPaint, TPaintProperty } from 'types/design/paint/types';
import { TUseFillSectionResult } from './types';

// utils
import { commitFills } from './utils/commitFills';
import { getFillTargets } from './utils/getFillTargets';
import { hasMixedPaints } from './utils/hasMixedPaints';
import { getDefaultPaintColor } from './utils/getDefaultPaintColor';
import { getInitialOpenPickerIndex } from './utils/getInitialOpenPickerIndex';
import { getNodePaints } from 'utils/design/paint/getNodePaints';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';
import { resolveFillDragIndices } from './utils/resolveFillDragIndices';
import { toggleFillVisibility } from './utils/toggleFillVisibility';
import { useClearFillSelectionOnOutsideClick } from './hooks/useClearFillSelectionOnOutsideClick/useClearFillSelectionOnOutsideClick';
import { useExitImageEditorOnPanelClick } from './hooks/useExitImageEditorOnPanelClick/useExitImageEditorOnPanelClick';
import { useItemsReorderDrag } from './hooks/useItemsReorderDrag/useItemsReorderDrag';
import { useFillSelection } from './hooks/useFillSelection/useFillSelection';
import { useHandleClosePicker } from './hooks/useHandleClosePicker/useHandleClosePicker';
import { useHandleExitImageEditor } from './hooks/useHandleExitImageEditor/useHandleExitImageEditor';
import { useOpenPickerIndex } from './hooks/useOpenPickerIndex/useOpenPickerIndex';

export const useFillSection = (property: TPaintProperty = 'fills'): TUseFillSectionResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isAppearanceNode);
  const [node] = nodes;
  const isMultiSelection = nodes.length > 1;
  const isMixed = hasMixedPaints(nodes, property);
  const fills = node && !isMixed ? getNodePaints(node, property) : [];
  const panelNodeId = node?.id;
  const nodeId = isMultiSelection ? undefined : panelNodeId;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { clearSelection, onSelectRow, selectedIndices, setSelection } = useFillSelection(fills.length, property);
  const imageFillPickerFocus = useAppSelector(selectImageFillPickerFocus);
  const initialIndex = getInitialOpenPickerIndex(property, imageFillPickerFocus, nodeId);
  const { onPickerOpenChange, openPickerIndex } = useOpenPickerIndex(panelNodeId, property, initialIndex);
  const imageEditor = useAppSelector(selectImageEditor);
  const isImageEditorActive = imageEditor !== null && (imageEditor.property ?? 'fills') === property;
  const handleExitImageEditor = useHandleExitImageEditor();
  const handleClosePicker = useHandleClosePicker(openPickerIndex, onPickerOpenChange);
  const commit = (nextFills: TPaint[]): void => commitFills(dispatch, getFillTargets(nodes), nextFills, property);
  const { beginDrag, dragState, registerRow } = useItemsReorderDrag(fills, commit, setSelection, containerRef);

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, clearSelection);
  useExitImageEditorOnPanelClick(containerRef, isImageEditorActive, openPickerIndex !== null, handleExitImageEditor, handleClosePicker);

  return {
    containerRef,
    disabledFillModes: isMultiSelection ? MULTI_SELECTION_DISABLED_FILL_MODES : undefined,
    dropIndicatorOffset: dragState?.hasMoved ? dragState.dropOffset : null,
    fills,
    isMixed,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    isRowSelected: (index) => selectedIndices.includes(index),
    nodeId,
    nodeIds: nodes.map((selected) => selected.id),
    onAdd: (): void => {
      commit([...fills, makeSolidPaint(getDefaultPaintColor(property))]);
      onPickerOpenChange(fills.length, true);
    },
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
