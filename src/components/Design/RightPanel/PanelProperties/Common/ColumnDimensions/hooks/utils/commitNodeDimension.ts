// store
import { AppDispatch } from 'store';

// types
import { TBoxSceneNode } from 'types/design/types';

// utils
import { commitDimensionChanges } from './commitDimensionChanges';
import { getLockedDimensionsChanges } from '../../utils/getLockedDimensionsChanges';

export const commitNodeDimension = (dispatch: AppDispatch, node: TBoxSceneNode, axis: 'height' | 'width', value: number): void =>
  commitDimensionChanges(
    dispatch,
    node.id,
    node,
    node.width,
    node.height,
    getLockedDimensionsChanges(axis, value, node.width, node.height, node.lockedAspectRatio ?? false),
  );
