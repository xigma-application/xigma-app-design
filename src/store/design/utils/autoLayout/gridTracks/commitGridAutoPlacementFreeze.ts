// store
import { AppDispatch } from 'store';
import { updateNode } from 'store/design/slice';

// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridAutoPlacementFreezeAnchors } from './getGridAutoPlacementFreezeAnchors';

export const commitGridAutoPlacementFreeze = (dispatch: AppDispatch, frame: TFrameNode, nodesById: Record<string, TSceneNode>): void => {
  getGridAutoPlacementFreezeAnchors(frame, nodesById).forEach(({ gridColumnAnchorIndex, gridRowAnchorIndex, id }) => {
    dispatch(updateNode({ changes: { gridColumnAnchorIndex, gridRowAnchorIndex }, id }));
  });
};
