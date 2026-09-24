// hooks
import { useAppDispatch, useAppSelector } from 'store';

// store
import { selectRevealedMinMax } from 'store/design/selectors';
import { setMinMaxRevealed, updateNode } from 'store/design/slice';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getBoundDisplayValue } from './utils/getBoundDisplayValue';
import { hasBoundOnEvery } from './utils/hasBoundOnEvery';
import { hasBoundOnSome } from './utils/hasBoundOnSome';
import { isExistingBoxSceneNode } from 'components/Design/Canvas/utils/isExistingBoxSceneNode';

export type TUseToggleColumnMinMaxResult = {
  hasMaxHeightValue: boolean;
  hasMaxWidthValue: boolean;
  hasMinHeightValue: boolean;
  hasMinWidthValue: boolean;
  maxHeightShown: boolean;
  maxHeightValue: number | string | undefined;
  maxWidthShown: boolean;
  maxWidthValue: number | string | undefined;
  minHeightShown: boolean;
  minHeightValue: number | string | undefined;
  minWidthShown: boolean;
  minWidthValue: number | string | undefined;
  onRemoveHeightBounds: TFunc;
  onRemoveWidthBounds: TFunc;
  onRevealMaxHeight: TFunc;
  onRevealMaxWidth: TFunc;
  onRevealMinHeight: TFunc;
  onRevealMinWidth: TFunc;
};

export const useToggleColumnMinMax = (nodes: TSceneNode[], mixedLabel: string): TUseToggleColumnMinMaxResult => {
  const dispatch = useAppDispatch();
  const revealed = useAppSelector(selectRevealedMinMax);
  const boxNodes = nodes.filter(isExistingBoxSceneNode);
  const minWidthValue = getBoundDisplayValue(boxNodes, 'minWidth', mixedLabel);
  const maxWidthValue = getBoundDisplayValue(boxNodes, 'maxWidth', mixedLabel);
  const minHeightValue = getBoundDisplayValue(boxNodes, 'minHeight', mixedLabel);
  const maxHeightValue = getBoundDisplayValue(boxNodes, 'maxHeight', mixedLabel);
  const minWidthShown = hasBoundOnSome(boxNodes, 'minWidth') || revealed.minWidth;
  const maxWidthShown = hasBoundOnSome(boxNodes, 'maxWidth') || revealed.maxWidth;
  const minHeightShown = hasBoundOnSome(boxNodes, 'minHeight') || revealed.minHeight;
  const maxHeightShown = hasBoundOnSome(boxNodes, 'maxHeight') || revealed.maxHeight;

  const onRevealMinWidth = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'minWidth', value: hasBoundOnSome(boxNodes, 'minWidth') || !revealed.minWidth }));
  };

  const onRevealMaxWidth = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: hasBoundOnSome(boxNodes, 'maxWidth') || !revealed.maxWidth }));
  };

  const onRevealMinHeight = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'minHeight', value: hasBoundOnSome(boxNodes, 'minHeight') || !revealed.minHeight }));
  };

  const onRevealMaxHeight = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'maxHeight', value: hasBoundOnSome(boxNodes, 'maxHeight') || !revealed.maxHeight }));
  };

  const onRemoveWidthBounds = (): void => {
    boxNodes.forEach((item) => dispatch(updateNode({ changes: { maxWidth: undefined, minWidth: undefined }, id: item.id })));
    dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: false }));
    dispatch(setMinMaxRevealed({ bound: 'minWidth', value: false }));
  };

  const onRemoveHeightBounds = (): void => {
    boxNodes.forEach((item) => dispatch(updateNode({ changes: { maxHeight: undefined, minHeight: undefined }, id: item.id })));
    dispatch(setMinMaxRevealed({ bound: 'maxHeight', value: false }));
    dispatch(setMinMaxRevealed({ bound: 'minHeight', value: false }));
  };

  return {
    hasMaxHeightValue: hasBoundOnEvery(boxNodes, 'maxHeight'),
    hasMaxWidthValue: hasBoundOnEvery(boxNodes, 'maxWidth'),
    hasMinHeightValue: hasBoundOnEvery(boxNodes, 'minHeight'),
    hasMinWidthValue: hasBoundOnEvery(boxNodes, 'minWidth'),
    maxHeightShown,
    maxHeightValue,
    maxWidthShown,
    maxWidthValue,
    minHeightShown,
    minHeightValue,
    minWidthShown,
    minWidthValue,
    onRemoveHeightBounds,
    onRemoveWidthBounds,
    onRevealMaxHeight,
    onRevealMaxWidth,
    onRevealMinHeight,
    onRevealMinWidth,
  };
};
