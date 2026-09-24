import { useRef, useState } from 'react';

// hooks
import { useEffectBlendModePreview } from '../useEffectBlendModePreview/useEffectBlendModePreview';
import { useClearFillSelectionOnOutsideClick } from '../../../FillSection/hooks/useFillSection/hooks/useClearFillSelectionOnOutsideClick/useClearFillSelectionOnOutsideClick';
import { useItemsReorderDrag } from '../../../FillSection/hooks/useFillSection/hooks/useItemsReorderDrag/useItemsReorderDrag';
import { useOpenPickerIndex } from '../../../FillSection/hooks/useFillSection/hooks/useOpenPickerIndex/useOpenPickerIndex';

// others
import { NO_EFFECTS } from '../../constants';

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
import { closeOpenEffectPanel } from './utils/closeOpenEffectPanel';
import { commitNodesEffects } from './utils/commitNodesEffects';
import { getEffectsWithPatch } from './utils/getEffectsWithPatch';
import { getEffectsWithScrub } from './utils/getEffectsWithScrub';
import { getEffectsWithVisibility } from './utils/getEffectsWithVisibility';
import { getMixedEffectKeys } from './utils/getMixedEffectKeys';
import { getReorderedEffects } from './utils/getReorderedEffects';
import { getSharedEffectPanelLayout } from '../../EffectSettingsPanel/utils/getSharedEffectPanelLayout';
import { handleEffectAdd } from './utils/handleEffectAdd';
import { handleEffectOpenChange } from './utils/handleEffectOpenChange';
import { handleEffectRemove } from './utils/handleEffectRemove';
import { handleEffectStartDrag } from './utils/handleEffectStartDrag';
import { hasMatchingEffectTypes } from './utils/hasMatchingEffectTypes';

export const useEffectsSection = (): TUseEffectsSectionResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectSelectedNodes).filter(isAppearanceNode);
  const [node] = nodes;
  const isMixed = !hasMatchingEffectTypes(nodes);
  const effects = isMixed ? NO_EFFECTS : (node?.effects ?? NO_EFFECTS);
  const nodeIds = nodes.map((selected) => selected.id);
  const getEffectsAt = (index: number): TEffect[] => nodes.map((selected) => (selected.effects ?? NO_EFFECTS)[index]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const { onPickerOpenChange, openPickerIndex } = useOpenPickerIndex(node?.id, 'effects', null);
  const { onBlendModePreview } = useEffectBlendModePreview(nodeIds, openPickerIndex);
  const commit = (getEffects: TFunc<[TEffect[]], TEffect[]>): void => commitNodesEffects(dispatch, nodes, getEffects);
  const commitReorder = (reordered: TEffect[]): void => commit((nodeEffects) => getReorderedEffects(nodeEffects, effects, reordered));
  const { beginDrag, dragState, registerRow } = useItemsReorderDrag(effects, commitReorder, setSelectedIndices, containerRef);
  const isHidden = (index: number): boolean => getEffectsAt(index).every((effect) => effect.visible === false);
  const closeOpenPanel = (): void => closeOpenEffectPanel(openPickerIndex, onPickerOpenChange);

  useClearFillSelectionOnOutsideClick(containerRef, selectedIndices.length > 0, () => setSelectedIndices([]));

  return {
    containerRef,
    dropIndicatorOffset: dragState?.hasMoved ? dragState.dropOffset : null,
    effects,
    getLayout: (index) => getSharedEffectPanelLayout(getEffectsAt(index)),
    getMixedKeys: (index) => getMixedEffectKeys(getEffectsAt(index)),
    isHidden,
    isMixed,
    isRowDragging: (index) => (dragState?.sourceIndices ?? []).includes(index),
    isRowSelected: (index) => selectedIndices.includes(index),
    onAdd: (type): void => handleEffectAdd(type, isMixed, effects.length, commit, setSelectedIndices, onPickerOpenChange),
    onBlendModePreview,
    onChange: (index, patch): void => commit((nodeEffects) => getEffectsWithPatch(nodeEffects, index, () => patch)),
    onDragEnd: () => dispatch(endHistoryGesture()),
    onDragStart: () => dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT)),
    onFieldScrub: (index, field, min, value): void =>
      commit((nodeEffects) => getEffectsWithScrub(nodeEffects, index, effects[index], field, min, value)),
    onOpenChange: (index, isOpen): void => handleEffectOpenChange(index, isOpen, setSelectedIndices, onPickerOpenChange),
    onRemove: (index): void => handleEffectRemove(index, closeOpenPanel, setSelectedIndices, commit),
    onStartDrag: (index, event): void =>
      handleEffectStartDrag(index, event, closeOpenPanel, selectedIndices, setSelectedIndices, beginDrag),
    onToggleVisible: (index): void => commit((nodeEffects) => getEffectsWithVisibility(nodeEffects, index, isHidden(index))),
    openIndex: openPickerIndex,
    registerRow,
  };
};
