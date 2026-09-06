import { RefObject } from 'react';

// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TDraggedGhostResult } from './types';
import { TSceneNode } from 'types/design/types';

// utils
import { buildCursorTrackedPositions } from './buildCursorTrackedPositions';
import { getDraggedBlockGhostPositions } from './getDraggedBlockGhostPositions';

export const getDraggedNodeGhostPositions = (
  previewRef: RefObject<TAutoLayoutReorderPreview | null>,
  selectedNodes: TSceneNode[],
  preview: TAutoLayoutReorderPreview,
  deltaX: number,
  deltaY: number,
): TDraggedGhostResult => {
  const slots = preview.draggedMemberSlots;
  const grabbedNode = slots ? selectedNodes.find((node) => node.id === preview.draggedGrabbedId) : undefined;

  if (slots && grabbedNode) {
    return getDraggedBlockGhostPositions(previewRef, selectedNodes, preview, slots, grabbedNode, deltaX, deltaY);
  }

  return { positions: buildCursorTrackedPositions(selectedNodes, deltaX, deltaY), tween: preview.draggedOffsetTween };
};
