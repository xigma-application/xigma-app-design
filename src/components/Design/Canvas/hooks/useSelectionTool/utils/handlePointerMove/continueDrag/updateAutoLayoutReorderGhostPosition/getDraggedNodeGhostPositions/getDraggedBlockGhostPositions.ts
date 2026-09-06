import { RefObject } from 'react';

// store
import { getRotatedNodeBounds } from 'store/design/utils/getRotatedNodeBounds';

// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TDraggedGhostResult } from './types';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { buildBlockMemberTargetOffsets } from './buildBlockMemberTargetOffsets';
import { buildContiguousMemberOffsets } from './buildContiguousMemberOffsets';
import { buildDraggedBlockPositions } from './buildDraggedBlockPositions';
import { clampGhostToBox } from './clampGhostToBox';
import { getNearestSlotOwnerId } from './getNearestSlotOwnerId';
import { resolveDraggedBlockOffsets } from 'components/Design/Canvas/utils/animateDraggedBlockOffset';
import { translateBy } from './translateBy';

const getTargetOffsets = (
  selectedNodes: TSceneNode[],
  preview: TAutoLayoutReorderPreview,
  slots: Record<string, TPoint>,
  grabbedId: string,
  grabbedGhost: TPoint,
): Record<string, TPoint> => {
  if (preview.draggedContiguous) {
    return buildContiguousMemberOffsets(selectedNodes, slots, grabbedId);
  }

  const cursorSlotOwnerId = getNearestSlotOwnerId(slots, grabbedGhost);
  return buildBlockMemberTargetOffsets(selectedNodes, slots, grabbedId, cursorSlotOwnerId, slots[cursorSlotOwnerId], slots[grabbedId]);
};

export const getDraggedBlockGhostPositions = (
  previewRef: RefObject<TAutoLayoutReorderPreview | null>,
  selectedNodes: TSceneNode[],
  preview: TAutoLayoutReorderPreview,
  slots: Record<string, TPoint>,
  grabbedNode: TSceneNode,
  deltaX: number,
  deltaY: number,
): TDraggedGhostResult => {
  const grabbedBounds = getRotatedNodeBounds(grabbedNode);
  const grabbedGhost = clampGhostToBox(
    translateBy(grabbedBounds, deltaX, deltaY),
    preview.draggedClampBox,
    grabbedBounds.width,
    grabbedBounds.height,
    preview.draggedClampRotation,
    preview.draggedClampCenter,
  );
  const targetOffsets = getTargetOffsets(selectedNodes, preview, slots, grabbedNode.id, grabbedGhost);
  const { offsets, tween } = resolveDraggedBlockOffsets(previewRef, preview, grabbedGhost, targetOffsets, performance.now());
  const positions = buildDraggedBlockPositions(selectedNodes, offsets, grabbedGhost, deltaX, deltaY);

  return { positions, tween };
};
