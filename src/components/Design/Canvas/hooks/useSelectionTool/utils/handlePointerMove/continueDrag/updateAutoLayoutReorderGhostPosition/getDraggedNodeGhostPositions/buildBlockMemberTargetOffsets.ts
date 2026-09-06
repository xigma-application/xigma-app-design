// types
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getBlockMemberTargetOffset } from './getBlockMemberTargetOffset';

export const buildBlockMemberTargetOffsets = (
  selectedNodes: TSceneNode[],
  slots: Record<string, TPoint>,
  grabbedId: string,
  cursorSlotOwnerId: string,
  cursorNearestSlot: TPoint,
  grabbedHomeSlot: TPoint,
): Record<string, TPoint> =>
  selectedNodes
    .filter((node) => slots[node.id] !== undefined)
    .reduce<Record<string, TPoint>>((offsets, node) => {
      offsets[node.id] = getBlockMemberTargetOffset(
        node.id,
        grabbedId,
        cursorSlotOwnerId,
        cursorNearestSlot,
        grabbedHomeSlot,
        slots[node.id],
      );

      return offsets;
    }, {});
