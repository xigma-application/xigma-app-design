import { useRef, useState } from 'react';

// hooks
import { useEffectBlendModePreview } from '../useEffectBlendModePreview/useEffectBlendModePreview';
import { useClearFillSelectionOnOutsideClick } from '../../../FillSection/hooks/useFillSection/hooks/useClearFillSelectionOnOutsideClick/useClearFillSelectionOnOutsideClick';
import { useItemsReorderDrag } from '../../../FillSection/hooks/useFillSection/hooks/useItemsReorderDrag/useItemsReorderDrag';
import { useOpenPickerIndex } from '../../../FillSection/hooks/useFillSection/hooks/useOpenPickerIndex/useOpenPickerIndex';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { isAppearanceNode } from '../../../AppearanceSection/types';
import { TEffect } from 'types/design/types';
import { TUseEffectsSectionResult } from './types';

// utils
import { commitEffects } from './utils/commitEffects';
import { createEffect } from 'utils/design/effects/createEffect';
import { resolveFillDragIndices } from '../../../FillSection/hooks/useFillSection/utils/resolveFillDragIndices';
import { toggleEffectVisibility } from 'utils/design/effects/toggleEffectVisibility';

const NO_EFFECTS: TEffect[] = [];

export const useEffectsSection = (): TUseEffectsSectionResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const effects = node?.effects ?? NO_EFFECTS;
  const nodeId = node?.id;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const { onPickerOpenChange, openPickerIndex } = useOpenPickerIndex(nodeId, 'effects', null);
  const { onBlendModePreview } = useEffectBlendModePreview(nodeId, openPickerIndex);
  const commit = (nextEffects: TEffect[]): void => commitEffects(dispatch, nodeId, nextEffects);
  const { beginDrag, dragState, registerRow } = useItemsReorderDrag(effects, commit, setSelectedIndices, containerRef);

  const closeOpenPanel = (): void => {
    if (openPickerIndex !== null) {
      onPickerOpenChange(openPickerIndex, false);
    }
  };

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, () => setSelectedIndices([]));

  return {
    containerRef,
    dropIndicatorOffset: dragState?.hasMoved ? dragState.dropOffset : null,
    effects,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    isRowSelected: (index) => selectedIndices.includes(index),
    onAdd: (type): void => {
      commit([...effects, createEffect(type)]);
      setSelectedIndices([effects.length]);
      onPickerOpenChange(effects.length, true);
    },
    onBlendModePreview,
    onChange: (index, effect): void => commit(effects.map((current, currentIndex) => (currentIndex === index ? effect : current))),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onOpenChange: (index, isOpen): void => {
      if (isOpen) {
        setSelectedIndices([index]);
      }

      onPickerOpenChange(index, isOpen);
    },
    onRemove: (index): void => {
      closeOpenPanel();
      setSelectedIndices([]);
      commit(effects.filter((_effect, effectIndex) => effectIndex !== index));
    },
    onStartDrag: (index, event): void => {
      closeOpenPanel();
      beginDrag(resolveFillDragIndices(selectedIndices, setSelectedIndices, index), index, event);
    },
    onToggleVisible: (index): void => commit(toggleEffectVisibility(effects, index)),
    openIndex: openPickerIndex,
    registerRow,
  };
};
