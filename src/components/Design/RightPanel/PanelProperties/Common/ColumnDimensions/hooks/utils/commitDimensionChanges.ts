// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TSceneNode, TSceneNodeChanges } from 'types/design/types';

// utils
import {
  TAutoLayoutSizingModeResetChanges,
  getAutoLayoutSizingModeResetChanges,
} from 'store/design/utils/autoLayout/getAutoLayoutSizingModeResetChanges';
import { clampAutoLayoutSize } from 'store/design/utils/autoLayout/clampAutoLayoutSize';
import { getDimensionChangeCropFills } from './getDimensionChangeCropFills';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

const getSizingModeChanges = (
  selectedNode: TSceneNode | undefined,
  width: number,
  height: number,
  dimensionChanges: { height: number; width: number },
): TAutoLayoutSizingModeResetChanges =>
  selectedNode
    ? getAutoLayoutSizingModeResetChanges(selectedNode, dimensionChanges.width !== width, dimensionChanges.height !== height)
    : {};

const getClampedDimensionChanges = (
  selectedNode: TSceneNode | undefined,
  dimensionChanges: { height: number; width: number },
): { height: number; width: number } => {
  if (selectedNode && isBoxSceneNode(selectedNode)) {
    return {
      height: clampAutoLayoutSize(dimensionChanges.height, selectedNode.minHeight, selectedNode.maxHeight),
      width: clampAutoLayoutSize(dimensionChanges.width, selectedNode.minWidth, selectedNode.maxWidth),
    };
  }

  return dimensionChanges;
};

const getDimensionUpdateChanges = (
  selectedNode: TSceneNode | undefined,
  width: number,
  height: number,
  dimensionChanges: { height: number; width: number },
): TSceneNodeChanges => {
  const clampedDimensionChanges = getClampedDimensionChanges(selectedNode, dimensionChanges);
  const sizingModeChanges = getSizingModeChanges(selectedNode, width, height, clampedDimensionChanges);
  const fills = getDimensionChangeCropFills(selectedNode, width, height, clampedDimensionChanges.width, clampedDimensionChanges.height);

  return fills ? { ...clampedDimensionChanges, ...sizingModeChanges, fills } : { ...clampedDimensionChanges, ...sizingModeChanges };
};

export const commitDimensionChanges = (
  dispatch: AppDispatch,
  id: string,
  selectedNode: TSceneNode | undefined,
  width: number,
  height: number,
  dimensionChanges: { height: number; width: number },
): void => {
  dispatch(updateNode({ changes: getDimensionUpdateChanges(selectedNode, width, height, dimensionChanges), id }));
};
