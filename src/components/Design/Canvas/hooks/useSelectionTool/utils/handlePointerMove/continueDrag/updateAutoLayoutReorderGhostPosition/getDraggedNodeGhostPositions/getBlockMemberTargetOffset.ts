// types
import { TPoint } from 'types/canvas';

export const getBlockMemberTargetOffset = (
  nodeId: string,
  grabbedId: string | undefined,
  cursorSlotOwnerId: string,
  cursorNearestSlot: TPoint,
  grabbedHomeSlot: TPoint,
  memberSlot: TPoint,
): TPoint => {
  if (nodeId === grabbedId) {
    return { x: 0, y: 0 };
  }

  const assignedSlot = nodeId === cursorSlotOwnerId ? grabbedHomeSlot : memberSlot;
  return { x: assignedSlot.x - cursorNearestSlot.x, y: assignedSlot.y - cursorNearestSlot.y };
};
