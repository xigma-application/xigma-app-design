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
  hasMaxHeight: boolean;
  hasMaxWidth: boolean;
  hasMinHeight: boolean;
  hasMinWidth: boolean;
  toggleMaxHeight: TFunc;
  toggleMaxWidth: TFunc;
  toggleMinHeight: TFunc;
  toggleMinWidth: TFunc;
};

export const useToggleColumnMinMax = (id: string, node: TSceneNode | undefined): TUseToggleColumnMinMaxResult => {
  const dispatch = useAppDispatch();
  const revealed = useAppSelector(selectRevealedMinMax);
  const hasMinWidth = Boolean(node && isBoxSceneNode(node) && node.minWidth !== undefined) || revealed.minWidth;
  const hasMaxWidth = Boolean(node && isBoxSceneNode(node) && node.maxWidth !== undefined) || revealed.maxWidth;
  const hasMinHeight = Boolean(node && isBoxSceneNode(node) && node.minHeight !== undefined) || revealed.minHeight;
  const hasMaxHeight = Boolean(node && isBoxSceneNode(node) && node.maxHeight !== undefined) || revealed.maxHeight;

  const toggleMinWidth = (): void => {
    if (hasMinWidth) {
      dispatch(updateNode({ changes: { minWidth: undefined }, id }));
    }

    dispatch(setMinMaxRevealed({ bound: 'minWidth', value: !hasMinWidth }));
  };

  const toggleMaxWidth = (): void => {
    if (hasMaxWidth) {
      dispatch(updateNode({ changes: { maxWidth: undefined }, id }));
    }

    dispatch(setMinMaxRevealed({ bound: 'maxWidth', value: !hasMaxWidth }));
  };

  const toggleMinHeight = (): void => {
    if (hasMinHeight) {
      dispatch(updateNode({ changes: { minHeight: undefined }, id }));
    }

    dispatch(setMinMaxRevealed({ bound: 'minHeight', value: !hasMinHeight }));
  };

  const toggleMaxHeight = (): void => {
    if (hasMaxHeight) {
      dispatch(updateNode({ changes: { maxHeight: undefined }, id }));
    }

    dispatch(setMinMaxRevealed({ bound: 'maxHeight', value: !hasMaxHeight }));
  };

  return { hasMaxHeight, hasMaxWidth, hasMinHeight, hasMinWidth, toggleMaxHeight, toggleMaxWidth, toggleMinHeight, toggleMinWidth };
};
