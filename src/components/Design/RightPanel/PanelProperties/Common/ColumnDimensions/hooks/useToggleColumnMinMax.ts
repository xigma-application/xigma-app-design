// hooks
import { useAppDispatch, useAppSelector } from 'store';

// store
import { selectRevealedMinMax } from 'store/design/selectors';
import { setMinMaxRevealed, updateNode } from 'store/design/slice';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TUseToggleColumnMinMaxResult = {
  hasMaxHeightValue: boolean;
  hasMaxWidthValue: boolean;
  hasMinHeightValue: boolean;
  hasMinWidthValue: boolean;
  maxHeightShown: boolean;
  maxHeightValue: number | undefined;
  maxWidthShown: boolean;
  maxWidthValue: number | undefined;
  minHeightShown: boolean;
  minHeightValue: number | undefined;
  minWidthShown: boolean;
  minWidthValue: number | undefined;
  onRemoveHeightBounds: TFunc;
  onRemoveWidthBounds: TFunc;
  onRevealMaxHeight: TFunc;
  onRevealMaxWidth: TFunc;
  onRevealMinHeight: TFunc;
  onRevealMinWidth: TFunc;
};

export const useToggleColumnMinMax = (id: string, node: TSceneNode | undefined): TUseToggleColumnMinMaxResult => {
  const dispatch = useAppDispatch();
  const revealed = useAppSelector(selectRevealedMinMax);
  const boxNode = node && isBoxSceneNode(node) ? node : undefined;
  const minWidthValue = boxNode?.minWidth;
  const maxWidthValue = boxNode?.maxWidth;
  const minHeightValue = boxNode?.minHeight;
  const maxHeightValue = boxNode?.maxHeight;

  const minWidthShown = minWidthValue !== undefined || revealed.minWidth;
  const maxWidthShown = maxWidthValue !== undefined || revealed.maxWidth;
  const minHeightShown = minHeightValue !== undefined || revealed.minHeight;
  const maxHeightShown = maxHeightValue !== undefined || revealed.maxHeight;

  const onRevealMinWidth = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'minWidth', value: minWidthValue !== undefined || !revealed.minWidth }));
  };

  const onRevealMaxWidth = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: maxWidthValue !== undefined || !revealed.maxWidth }));
  };

  const onRevealMinHeight = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'minHeight', value: minHeightValue !== undefined || !revealed.minHeight }));
  };

  const onRevealMaxHeight = (): void => {
    dispatch(setMinMaxRevealed({ bound: 'maxHeight', value: maxHeightValue !== undefined || !revealed.maxHeight }));
  };

  const onRemoveWidthBounds = (): void => {
    dispatch(updateNode({ changes: { maxWidth: undefined, minWidth: undefined }, id }));
    dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: false }));
    dispatch(setMinMaxRevealed({ bound: 'minWidth', value: false }));
  };

  const onRemoveHeightBounds = (): void => {
    dispatch(updateNode({ changes: { maxHeight: undefined, minHeight: undefined }, id }));
    dispatch(setMinMaxRevealed({ bound: 'maxHeight', value: false }));
    dispatch(setMinMaxRevealed({ bound: 'minHeight', value: false }));
  };

  return {
    hasMaxHeightValue: maxHeightValue !== undefined,
    hasMaxWidthValue: maxWidthValue !== undefined,
    hasMinHeightValue: minHeightValue !== undefined,
    hasMinWidthValue: minWidthValue !== undefined,
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
