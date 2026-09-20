import { useRef, useState } from 'react';

// hooks
import { useClearFillSelectionOnOutsideClick } from '../../../FillSection/hooks/useFillSection/hooks/useClearFillSelectionOnOutsideClick/useClearFillSelectionOnOutsideClick';
import { useItemsReorderDrag } from '../../../FillSection/hooks/useFillSection/hooks/useItemsReorderDrag/useItemsReorderDrag';
import { useOpenPickerIndex } from '../../../FillSection/hooks/useFillSection/hooks/useOpenPickerIndex/useOpenPickerIndex';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutGuideType, NodeType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';
import { TUseLayoutGuideSectionResult } from './types';

// utils
import { commitLayoutGuides } from './utils/commitLayoutGuides';
import { createLayoutGuide } from 'utils/design/layoutGuides/createLayoutGuide';
import { resolveFillDragIndices } from '../../../FillSection/hooks/useFillSection/utils/resolveFillDragIndices';
import { toggleLayoutGuideVisibility } from 'utils/design/layoutGuides/toggleLayoutGuideVisibility';

const NO_GUIDES: TLayoutGuide[] = [];

export const useLayoutGuideSection = (): TUseLayoutGuideSectionResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const guides = node?.layoutGuides ?? NO_GUIDES;
  const nodeId = node?.id;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const { onPickerOpenChange, openPickerIndex } = useOpenPickerIndex(nodeId, 'layoutGuides', null);
  const commit = (nextGuides: TLayoutGuide[]): void => commitLayoutGuides(dispatch, nodeId, nextGuides);
  const { beginDrag, dragState, registerRow } = useItemsReorderDrag(guides, commit, setSelectedIndices, containerRef);

  const closeOpenPanel = (): void => {
    if (openPickerIndex !== null) {
      onPickerOpenChange(openPickerIndex, false);
    }
  };

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, () => setSelectedIndices([]));

  return {
    containerRef,
    dropIndicatorOffset: dragState?.hasMoved ? dragState.dropOffset : null,
    guides,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    isRowSelected: (index) => selectedIndices.includes(index),
    onAdd: (): void => {
      commit([...guides, createLayoutGuide(LayoutGuideType.grid)]);
      onPickerOpenChange(guides.length, true);
    },
    onChange: (index, guide): void => commit(guides.map((current, currentIndex) => (currentIndex === index ? guide : current))),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onOpenChange: (index, isOpen): void => onPickerOpenChange(index, isOpen),
    onRemove: (index): void => {
      closeOpenPanel();
      setSelectedIndices([]);
      commit(guides.filter((_guide, guideIndex) => guideIndex !== index));
    },
    onSelectRow: (index): void => setSelectedIndices([index]),
    onStartDrag: (index, event): void => {
      closeOpenPanel();
      beginDrag(resolveFillDragIndices(selectedIndices, setSelectedIndices, index), index, event);
    },
    onToggleVisible: (index): void => commit(toggleLayoutGuideVisibility(guides, index)),
    openIndex: openPickerIndex,
    registerRow,
  };
};
