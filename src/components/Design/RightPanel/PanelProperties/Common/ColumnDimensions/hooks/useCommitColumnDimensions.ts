// hooks
import { useAppDispatch } from 'store';

// store
import { updateNode } from 'store/design/slice';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { clampAutoLayoutSize } from 'store/design/utils/autoLayout/clampAutoLayoutSize';
import { getAutoLayoutSizingModeResetChanges } from 'store/design/utils/autoLayout/getAutoLayoutSizingModeResetChanges';
import { getLockedDimensionsChanges } from '../utils/getLockedDimensionsChanges';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export type TUseCommitColumnDimensionsResult = {
  commitHeight: TFunc<[number]>;
  commitWidth: TFunc<[number]>;
};

export const useCommitColumnDimensions = (
  id: string,
  selectedNode: TSceneNode | undefined,
  width: number,
  height: number,
  locked: boolean,
): TUseCommitColumnDimensionsResult => {
  const dispatch = useAppDispatch();

  const commitWidth = (nextWidth: number): void => {
    const dimensionChanges = getLockedDimensionsChanges('width', nextWidth, width, height, locked);

    if (selectedNode && isBoxSceneNode(selectedNode)) {
      dimensionChanges.width = clampAutoLayoutSize(dimensionChanges.width, selectedNode.minWidth, selectedNode.maxWidth);
      dimensionChanges.height = clampAutoLayoutSize(dimensionChanges.height, selectedNode.minHeight, selectedNode.maxHeight);
    }

    const sizingModeChanges = selectedNode
      ? getAutoLayoutSizingModeResetChanges(selectedNode, dimensionChanges.width !== width, dimensionChanges.height !== height)
      : {};

    dispatch(updateNode({ changes: { ...dimensionChanges, ...sizingModeChanges }, id }));
  };

  const commitHeight = (nextHeight: number): void => {
    const dimensionChanges = getLockedDimensionsChanges('height', nextHeight, width, height, locked);

    if (selectedNode && isBoxSceneNode(selectedNode)) {
      dimensionChanges.width = clampAutoLayoutSize(dimensionChanges.width, selectedNode.minWidth, selectedNode.maxWidth);
      dimensionChanges.height = clampAutoLayoutSize(dimensionChanges.height, selectedNode.minHeight, selectedNode.maxHeight);
    }

    const sizingModeChanges = selectedNode
      ? getAutoLayoutSizingModeResetChanges(selectedNode, dimensionChanges.width !== width, dimensionChanges.height !== height)
      : {};

    dispatch(updateNode({ changes: { ...dimensionChanges, ...sizingModeChanges }, id }));
  };

  return { commitHeight, commitWidth };
};
