// store
import { getAutoLayoutRotatedPositions } from 'store/design/utils/autoLayout/getAutoLayoutRotatedPositions';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';

// types
import { TAutoLayoutReorderPreview } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

type TDraggedBlockMeta = Pick<
  TAutoLayoutReorderPreview,
  'draggedClampBox' | 'draggedContiguous' | 'draggedGrabbedId' | 'draggedMemberSlots'
>;

const getDraggedSizesById = (orderedMovedIds: string[], draggedSizes: TAutoLayoutChildSize[]): Record<string, TAutoLayoutChildSize> =>
  orderedMovedIds.reduce<Record<string, TAutoLayoutChildSize>>((byId, id, index) => {
    byId[id] = draggedSizes[index];

    return byId;
  }, {});

export const getAutoLayoutWorldDraggedBlock = (
  draggedBlock: TDraggedBlockMeta | undefined,
  orderedMovedIds: string[],
  draggedSizes: TAutoLayoutChildSize[],
  frameCenter: TPoint,
  frameRotation: number,
): TDraggedBlockMeta | undefined => {
  if (!draggedBlock?.draggedMemberSlots) {
    return draggedBlock;
  }

  return {
    ...draggedBlock,
    draggedMemberSlots: getAutoLayoutRotatedPositions(
      draggedBlock.draggedMemberSlots,
      getDraggedSizesById(orderedMovedIds, draggedSizes),
      frameCenter,
      frameRotation,
    ),
  };
};
