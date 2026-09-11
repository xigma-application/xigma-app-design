// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridTrackAxis } from './types';

// utils
import { getGridTrackChildren } from './getGridTrackChildren';
import { getGridTrackLinkedIndices } from './getGridTrackLinkedIndices';

export const resolveGridTrackAffordanceDragIndices = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
  axis: TGridTrackAxis,
  trackCount: number,
  selectedIndices: number[],
  index: number,
): number[] => {
  if (selectedIndices.includes(index)) {
    return selectedIndices;
  }

  const linkedIndices = getGridTrackLinkedIndices(getGridTrackChildren(frame, nodesById, axis), trackCount);
  return linkedIndices[index] ?? [index];
};
