// hooks
import { useAppDispatch } from 'store';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { commitDimensionChanges } from './utils/commitDimensionChanges';
import { getLockedDimensionsChanges } from '../utils/getLockedDimensionsChanges';

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

    commitDimensionChanges(dispatch, id, selectedNode, width, height, dimensionChanges);
  };

  const commitHeight = (nextHeight: number): void => {
    const dimensionChanges = getLockedDimensionsChanges('height', nextHeight, width, height, locked);

    commitDimensionChanges(dispatch, id, selectedNode, width, height, dimensionChanges);
  };

  return { commitHeight, commitWidth };
};
