import { useMemo, useRef, useState } from 'react';

// hooks
import { useClearFillSelectionOnOutsideClick } from '../../../FillSection/hooks/useFillSection/hooks/useClearFillSelectionOnOutsideClick/useClearFillSelectionOnOutsideClick';
import { useItemsReorderDrag } from '../../../FillSection/hooks/useFillSection/hooks/useItemsReorderDrag/useItemsReorderDrag';
import { useOpenPickerIndex } from '../../../FillSection/hooks/useFillSection/hooks/useOpenPickerIndex/useOpenPickerIndex';

// others
import { NO_LAYOUT_GUIDES } from '../../constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TLayoutGuide } from 'types/design/types';
import { TUseLayoutGuideSectionResult } from './types';

// utils
import { closeOpenItemPanel } from '../../../utils/closeOpenItemPanel';
import { commitLayoutGuides } from './utils/commitLayoutGuides';
import { getItemsWithPatch } from '../../../utils/getItemsWithPatch';
import { getLayoutGuidesWithScrub } from './utils/getLayoutGuidesWithScrub';
import { getLayoutGuidesWithVisibility } from './utils/getLayoutGuidesWithVisibility';
import { getMixedLayoutGuideKeys } from './utils/getMixedLayoutGuideKeys';
import { getReorderedItems } from '../../../utils/getReorderedItems';
import { handleItemRemove } from '../../../utils/handleItemRemove';
import { handleItemStartDrag } from '../../../utils/handleItemStartDrag';
import { handleLayoutGuideAdd } from './utils/handleLayoutGuideAdd';
import { hasMatchingItemTypes } from '../../../utils/hasMatchingItemTypes';
import { isFrameNode } from 'utils/canvas/signals/isFrameNode';
import { isLayoutGuideStretchedOnAny } from './utils/isLayoutGuideStretchedOnAny';

export const useLayoutGuideSection = (): TUseLayoutGuideSectionResult => {
  const dispatch = useAppDispatch();
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const nodes = useMemo(() => selectedNodes.filter(isFrameNode), [selectedNodes]);
  const [node] = nodes;
  const isMixed = !hasMatchingItemTypes(nodes.map((frame) => frame.layoutGuides ?? NO_LAYOUT_GUIDES));
  const guides = isMixed ? NO_LAYOUT_GUIDES : (node?.layoutGuides ?? NO_LAYOUT_GUIDES);
  const getGuidesAt = (index: number): TLayoutGuide[] => nodes.map((frame) => (frame.layoutGuides ?? NO_LAYOUT_GUIDES)[index]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const { onPickerOpenChange, openPickerIndex } = useOpenPickerIndex(node?.id, 'layoutGuides', null);
  const commit = (getGuides: TFunc<[TLayoutGuide[]], TLayoutGuide[]>): void => commitLayoutGuides(dispatch, nodes, getGuides);
  const commitReorder = (reordered: TLayoutGuide[]): void => commit((nodeGuides) => getReorderedItems(nodeGuides, guides, reordered));
  const { beginDrag, dragState, registerRow } = useItemsReorderDrag(guides, commitReorder, setSelectedIndices, containerRef);
  const isHidden = (index: number): boolean => getGuidesAt(index).every((guide) => guide.visible === false);
  const closeOpenPanel = (): void => closeOpenItemPanel(openPickerIndex, onPickerOpenChange);

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, () => setSelectedIndices([]));

  return {
    containerRef,
    dropIndicatorOffset: dragState?.hasMoved ? dragState.dropOffset : null,
    getMixedKeys: (index) => getMixedLayoutGuideKeys(getGuidesAt(index)),
    guides,
    isHidden,
    isMixed,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    isRowSelected: (index) => selectedIndices.includes(index),
    isStretchedOnAny: (index) => isLayoutGuideStretchedOnAny(getGuidesAt(index)),
    onAdd: (): void => handleLayoutGuideAdd(isMixed, guides.length, commit, onPickerOpenChange),
    onChange: (index, patch): void => commit((nodeGuides) => getItemsWithPatch(nodeGuides, index, () => patch)),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onFieldScrub: (index, field, min, value): void =>
      commit((nodeGuides) => getLayoutGuidesWithScrub(nodeGuides, index, guides[index], field, min, value)),
    onOpenChange: (index, isOpen): void => onPickerOpenChange(index, isOpen),
    onRemove: (index): void => handleItemRemove(index, closeOpenPanel, setSelectedIndices, commit),
    onSelectRow: (index): void => setSelectedIndices([index]),
    onStartDrag: (index, event): void => handleItemStartDrag(index, event, closeOpenPanel, selectedIndices, setSelectedIndices, beginDrag),
    onToggleVisible: (index): void => commit((nodeGuides) => getLayoutGuidesWithVisibility(nodeGuides, index, isHidden(index))),
    openIndex: openPickerIndex,
    registerRow,
  };
};
