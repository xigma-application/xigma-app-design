// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const getDraggedBlockPreviewMeta = (
  orderedMovedIds: string[],
  grabbedNodeId: string | null,
  memberSlots: TPoint[],
): Pick<TAutoLayoutReorderPreview, 'draggedGrabbedId' | 'draggedMemberSlots'> => {
  const grabbedIndexInBlock = Math.max(0, orderedMovedIds.indexOf(grabbedNodeId ?? ''));
  const draggedMemberSlots = orderedMovedIds.reduce<Record<string, TPoint>>((slots, id, memberIndex) => {
    slots[id] = memberSlots[memberIndex];

    return slots;
  }, {});

  return { draggedGrabbedId: orderedMovedIds[grabbedIndexInBlock], draggedMemberSlots };
};
