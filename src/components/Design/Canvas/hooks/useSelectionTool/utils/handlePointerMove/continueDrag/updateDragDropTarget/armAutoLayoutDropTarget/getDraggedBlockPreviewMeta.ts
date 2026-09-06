// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TDraftRect, TPoint } from 'types/canvas';

export const getDraggedBlockPreviewMeta = (
  orderedMovedIds: string[],
  grabbedNodeId: string | null,
  memberSlots: TPoint[],
  clampBox: TDraftRect,
  clampCenter: TPoint,
  clampRotation: number,
  contiguous: boolean,
): Pick<
  TAutoLayoutReorderPreview,
  'draggedClampBox' | 'draggedClampCenter' | 'draggedClampRotation' | 'draggedContiguous' | 'draggedGrabbedId' | 'draggedMemberSlots'
> => {
  const grabbedIndexInBlock = Math.max(0, orderedMovedIds.indexOf(grabbedNodeId ?? ''));
  const draggedMemberSlots = orderedMovedIds.reduce<Record<string, TPoint>>((slots, id, memberIndex) => {
    slots[id] = memberSlots[memberIndex];

    return slots;
  }, {});

  return {
    draggedClampBox: clampBox,
    draggedClampCenter: clampCenter,
    draggedClampRotation: clampRotation,
    draggedContiguous: contiguous,
    draggedGrabbedId: orderedMovedIds[grabbedIndexInBlock],
    draggedMemberSlots,
  };
};
