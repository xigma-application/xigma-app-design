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
import { buildDraggedBlockPositions } from './buildDraggedBlockPositions';
import { getNearestSlotOwnerId } from './getNearestSlotOwnerId';
import { resolveDraggedBlockOffsets } from 'components/Design/Canvas/utils/animateDraggedBlockOffset';
import { translateBy } from './translateBy';

export const getDraggedBlockGhostPositions = (
  previewRef: RefObject<TAutoLayoutReorderPreview | null>,
  selectedNodes: TSceneNode[],
  preview: TAutoLayoutReorderPreview,
  slots: Record<string, TPoint>,
  grabbedNode: TSceneNode,
  deltaX: number,
  deltaY: number,
): TDraggedGhostResult => {
  const grabbedGhost = translateBy(getRotatedNodeBounds(grabbedNode), deltaX, deltaY);
  const cursorSlotOwnerId = getNearestSlotOwnerId(slots, grabbedGhost);
  const cursorNearestSlot = slots[cursorSlotOwnerId];
  const grabbedHomeSlot = slots[grabbedNode.id];
  const targetOffsets = buildBlockMemberTargetOffsets(
    selectedNodes,
    slots,
    grabbedNode.id,
    cursorSlotOwnerId,
    cursorNearestSlot,
    grabbedHomeSlot,
  );
  const { offsets, tween } = resolveDraggedBlockOffsets(previewRef, preview, grabbedGhost, targetOffsets, performance.now());
  const positions = buildDraggedBlockPositions(selectedNodes, offsets, grabbedGhost, deltaX, deltaY);

  return { positions, tween };
};
