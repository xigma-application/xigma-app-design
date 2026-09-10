// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridTrackAxis, TGridTrackChild } from './types';

// utils
import { getGridPlacementInputs } from '../getGridPlacementInputs';

export const getGridTrackChildren = (frame: TFrameNode, nodesById: Record<string, TSceneNode>, axis: TGridTrackAxis): TGridTrackChild[] => {
  if (frame.gridAutoPlacement === false) {
    return getGridPlacementInputs(frame.childIds, nodesById).map((input) => {
      const anchorIndex = axis === 'column' ? input.gridColumnAnchorIndex : input.gridRowAnchorIndex;
      const span = axis === 'column' ? input.gridColumnSpan : input.gridRowSpan;

      return { anchorIndex, id: input.id, span: Math.max(Math.round(span ?? 1), 1) };
    });
  }

  return [];
};
